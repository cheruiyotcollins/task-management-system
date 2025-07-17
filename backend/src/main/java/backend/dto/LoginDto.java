package backend.dto;

import jakarta.validation.constraints.Email;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginDto {

    @Email(message = "Invalid email format.")
    private String email;

    private String password;
}