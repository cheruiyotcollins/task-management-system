package backend.config;

import backend.enums.RoleName;
import backend.model.Role;
import backend.model.User;
import backend.repository.RoleRepository;
import backend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class AdminConfig implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminConfig(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        log.info("Checking if an admin user exists");

        boolean noAdminsExist = userRepository.countByRole_Name(RoleName.ADMIN) == 0;

        if (noAdminsExist) {
            // Check if the ROLE_ADMIN role exists
            Role adminRole = roleRepository.findByName(RoleName.ADMIN).orElse(null);
            if (adminRole == null) {
                log.error("ROLE_ADMIN does not exist in the database. Please insert it manually.");
                return;  // Exit early if the role is not found
            }
            User user = new User();
            user.setRole(adminRole);
            user.setFullName("Admin");
            user.setEmail("admin@gmail.com");
            user.setUsername("admin@gmail.com");
            user.setPassword(passwordEncoder.encode("password"));
            userRepository.save(user);
            log.info("Admin user created with first login flag set to true.");
        }
    }
}
