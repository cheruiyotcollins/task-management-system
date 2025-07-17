package backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import org.springframework.http.HttpStatus;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResponseDto {
    private HttpStatus status;
    private String description;
    private Object payload;

    // Pagination-specific fields
    private Integer totalPages;
    private Long totalElements;
    private Integer currentPage;
    private Integer pageSize;

    // Generic method to retrieve payload as a specific type
    public <T> T getPayloadAs(Class<T> type) {
        if (type.isInstance(payload)) {
            return type.cast(payload);
        }
        return null;
    }
}
