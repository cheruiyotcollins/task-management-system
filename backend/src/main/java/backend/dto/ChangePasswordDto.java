package backend.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class ChangePasswordDto {
    private String oldPassword;
    @NotBlank(message = "New password must not be blank")
    private String newPassword;
}
