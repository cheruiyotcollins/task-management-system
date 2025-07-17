package backend.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.NaturalId;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = {
                "username"
        }),
        @UniqueConstraint(columnNames = {
                "email"
        })
})
@Data
@ToString(exclude = {"roles"})
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @NotBlank
    @Size(max = 40)
    private String fullName;

    @NotBlank
    @Size(max = 40)
    private String username;

    @NotBlank
    @Size(max = 13)
    private String contact;

    @NaturalId
    @NotBlank
    @Size(max = 40)
    @Email
    private String email;

    @NotBlank
    private String gender;

    @NotBlank
    @Size(max = 100)
    private String password;

    private boolean otp;

    private String generatedOtp;

    private Instant otpExpiry;

    private String publicId;

    private String profileImagePath;

    private boolean cloud;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @JsonManagedReference("user-roles")
    private Set<Role> roles = new HashSet<>();

    @Column(nullable = false)
    private Boolean firstLogin = true;

    private String resetCode;

    private LocalDateTime resetCodeExpiry;
    private Instant joinedAt;
    private Instant lastUpdated;
    private Instant lastActive;

    public boolean hasRole(String roleName) {
        return roles != null && roles.stream()
                .anyMatch(role -> role.getName().equals(roleName));
    }
}