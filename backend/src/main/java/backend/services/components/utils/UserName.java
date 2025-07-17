package backend.services.components.utils;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class UserName {
    public static String getUsername(){
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
