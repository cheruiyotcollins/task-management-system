package backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import backend.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.util.Collection;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponseDto {
    private String accessToken;
    private Role role;
    private Object object;
    private HttpStatus status;
    private String message;
    private CurrentUserDto currentUser;


    public LoginResponseDto(String accessToken,  CurrentUserDto currentUser) {

        this.accessToken=accessToken;
        ;
        this.currentUser= currentUser;
    }
}