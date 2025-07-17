package backend.service.utils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class UserName {
    public static String getUsername(){
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
