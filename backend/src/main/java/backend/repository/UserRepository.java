package backend.repository;

import backend.enums.RoleName;
import backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User>{

    Optional<User> findByEmail(String email);

//    @EntityGraph(attributePaths = "roles")
//    Optional<User> findByUsernameOrEmail(String username, String email);

    Optional<User> findByUsername(String username);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.email = :email OR u.username = :username")
    List<User> findConflictingUsers(
            @Param("email") String email,
            @Param("username") String username,
            @Param("contact") String contact
    );

    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.name = :roleName")
    int countByRoleName(@Param("roleName") RoleName roleName);

}