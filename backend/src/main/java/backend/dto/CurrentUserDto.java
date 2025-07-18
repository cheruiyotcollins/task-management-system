package backend.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CurrentUserDto {
    private String name;
    private String username;
    private String email;
    private String role;
    private LocalDateTime createdAt;

}
