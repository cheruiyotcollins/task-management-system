package backend.config;

import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.retry.RetryConfig;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.client.*;
import org.springframework.web.client.*;

import java.io.IOException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class AppConfig {

    private static final Logger logger = LoggerFactory.getLogger(AppConfig.class);

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate(clientHttpRequestFactory());

        List<ClientHttpRequestInterceptor> interceptors = new ArrayList<>();
        interceptors.add(new LoggingAndRetryInterceptor());
        restTemplate.setInterceptors(interceptors);

        restTemplate.setErrorHandler(new CustomResponseErrorHandler());

        return restTemplate;
    }

    private ClientHttpRequestFactory clientHttpRequestFactory() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000); // ms
        factory.setReadTimeout(120000);   // ms
        return factory;
    }

    public static class LoggingAndRetryInterceptor implements ClientHttpRequestInterceptor {

        private static final Retry retry = Retry.of("myRetry", RetryConfig.custom()
                .maxAttempts(3)
                .waitDuration(Duration.ofMillis(500))
                .build());

        @NotNull
        @Override
        public ClientHttpResponse intercept(@NotNull HttpRequest request, @NotNull byte[] body,
                                            @NotNull ClientHttpRequestExecution execution) throws IOException {
            int attempt = 0;

            while (true) {
                try {
                    logger.info("Attempt {}: {} {}", attempt + 1, request.getMethod(), request.getURI());
                    logger.debug("Headers: {}", request.getHeaders());
                    if (body.length > 0) {
                        logger.debug("Body: {}", new String(body));
                    }

                    ClientHttpResponse response = retry.executeCallable(() -> {
                        try {
                            return execution.execute(request, body);
                        } catch (IOException e) {
                            throw new RuntimeException(e);
                        }
                    });

                    logger.info("Response Status: {}", response.getStatusCode());
                    return response;
                } catch (IOException ex) {
                    attempt++;
                    logger.warn("Request failed on attempt {}: {}", attempt, ex.getMessage());

                    if (attempt >= 3) {
                        throw new IOException("Maximum retry attempts reached", ex);
                    }
                } catch (Exception ex) {
                    attempt++;
                    logger.warn("Retry failed on attempt {}: {}", attempt, ex.getMessage());

                    if (attempt >= 3) {
                        throw new IOException("Maximum retry attempts reached", ex);
                    }
                }
            }
        }

    }

    public static class CustomResponseErrorHandler extends DefaultResponseErrorHandler {

        @Override
        public void handleError(ClientHttpResponse response) throws IOException {
            HttpStatusCode statusCode = response.getStatusCode();
            HttpStatus status = HttpStatus.resolve(statusCode.value());

            logger.error("RestTemplate error: {} {}", status.value(), status.getReasonPhrase());

            if (status.is5xxServerError()) {
                throw new RestClientException("Server error: " + status);
            } else if (status.is4xxClientError()) {
                throw new RestClientException("Client error: " + status);
            }

            super.handleError(response);
        }

    }
}
