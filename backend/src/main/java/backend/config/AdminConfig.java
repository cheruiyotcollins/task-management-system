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
                return;
            }

            User adminUser = new User();
            adminUser.setRole(adminRole);
            adminUser.setFullName("Admin");
            adminUser.setEmail("admin@gmail.com");
            adminUser.setUsername("admin@gmail.com");
            adminUser.setPassword(passwordEncoder.encode("password"));
            userRepository.save(adminUser);
            log.info("Admin user created with email: admin@gmail.com");
        }

        log.info("Checking if a regular user exists");

        boolean noUsersExist = userRepository.countByRole_Name(RoleName.USER) == 0;

        if (noUsersExist) {
            // Check if the ROLE_USER role exists
            Role userRole = roleRepository.findByName(RoleName.USER).orElse(null);
            if (userRole == null) {
                log.error("ROLE_USER does not exist in the database. Please insert it manually.");
                return;
            }

            User regularUser = new User();
            regularUser.setRole(userRole);
            regularUser.setFullName("Test User");
            regularUser.setEmail("user@gmail.com");
            regularUser.setUsername("user@gmail.com");
            regularUser.setPassword(passwordEncoder.encode("password"));
            userRepository.save(regularUser);
            log.info("Regular user created with email: user@gmail.com");
        }
    }
}
