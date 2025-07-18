package backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import backend.enums.RoleName;
import backend.model.Role;
import backend.model.User;
import lombok.*;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDto {
    private long id;
    private String email;
    private String username;
    private RoleName role;
    private String fullName;
    private LocalDateTime createdAt;

    public UserDto(User user) {
        this.email = user.getEmail();
        this.username = user.getUsername();
        this.role = user.getRole().getName();
        this.createdAt= user.getCreatedAt();
    }
}
