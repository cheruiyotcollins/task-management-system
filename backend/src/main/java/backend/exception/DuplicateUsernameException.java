package backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when attempting to register/update a username that already exists.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateUsernameException extends RuntimeException {

    public DuplicateUsernameException(String username) {
        super("Username '" + username + "' is already taken");
    }

    // Optional: For exception chaining.
    public DuplicateUsernameException(String username, Throwable cause) {
        super("Username '" + username + "' is already taken", cause);
    }
}