package backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChangePasswordDto {
    private String oldPassword;
    @NotBlank(message = "New password must not be blank")
    private String newPassword;
}
