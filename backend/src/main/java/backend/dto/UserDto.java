package backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import backend.enums.RoleName;
import backend.model.Role;
import backend.model.User;
import lombok.*;

import java.util.Set;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDto {
    private long userId;
    private String email;
    private String username;
    private Set<RoleName> roles;
    private String fullName;
    private String contact;
    private String gender;
    private String profileImagePath;
    private boolean firstLogin;

    public UserDto(User user) {
        this.email = user.getEmail();
        this.username = user.getUsername();
        this.roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
    }
}
