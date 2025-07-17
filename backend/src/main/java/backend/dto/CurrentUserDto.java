package backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CurrentUserDto {
    private String name;
    private String email;
    private String role;
    private String gender;
    private String contact;
    private String profileImagePath;

}
