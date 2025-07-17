package backend.dto;

import lombok.Builder;
import lombok.Data;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;

@Data
@Builder
public class CustomUser {
    private String username;
    private Collection<SimpleGrantedAuthority> grantedAuthorities;
}