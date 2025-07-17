package backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JWTAuthResponseDto {
    private String accessToken;
    private  String refreshToken;
    private String tokenType = "Bearer";
    private CurrentUserDto currentUser;
}