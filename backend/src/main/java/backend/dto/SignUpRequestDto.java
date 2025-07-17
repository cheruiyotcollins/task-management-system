package backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SignUpRequestDto {

    @NotBlank
    @Size(min = 4, max = 40)
    private String fullName;

    @NotBlank
    @Size(max = 40)
    @Email
    private String email;

    @NotBlank
    @Size(max =20 )
    private String username;

    @NotBlank
    @Size(max = 13)
    private String contact;

    @NotBlank
    @Size(min = 6, max = 20)
    private String password;

    private String gender;

    private String role;

    private String who;

}
