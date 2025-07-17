package backend.dto;

import lombok.*;

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
