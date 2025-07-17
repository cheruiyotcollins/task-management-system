package backend.config;


import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class RoleConfig implements CommandLineRunner {

    private final RoleRepository roleRepository;

    public RoleConfig(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) {
        log.info("Checking if roles exist, and adding them if they don't");



        if(roleRepository.findByName(RoleName.ROLE_ADMIN).isEmpty()) {
            Role role = new Role();
            role.setName(RoleName.ROLE_ADMIN);
            roleRepository.save(role);
        }

        if(roleRepository.findByName(RoleName.ROLE_CUSTOMER).isEmpty()) {
            Role role = new Role();
            role.setName(RoleName.ROLE_CUSTOMER);
            roleRepository.save(role);
        }
    }
}