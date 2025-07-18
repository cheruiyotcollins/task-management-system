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


    @Query("SELECT u FROM User u WHERE u.email = :email OR u.username = :username")
    List<User> findConflictingUsers(
            @Param("email") String email,
            @Param("username") String username,
            @Param("contact") String contact
    );

    int countByRole_Name(RoleName roleName);

}