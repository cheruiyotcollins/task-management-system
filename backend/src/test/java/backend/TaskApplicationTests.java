package backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

//TODO: To research on how to have this annotation intact and not cause the error,
// where the test's application.yml is failing to be incorporated well in to the system.
@SpringBootTest
@TestPropertySource(properties = {
		"app.jwt.secret=${APP_JWT_SECRET}",
		"app.jwt.token-validity=${APP_JWT_TOKEN_VALIDITY}",
		"app.jwt.refresh-token-validity=${APP_JWT_REFRESH_TOKEN_VALIDITY}"
})
class TaskApplicationTests {

	@Test
	void contextLoads() {
	}

}
