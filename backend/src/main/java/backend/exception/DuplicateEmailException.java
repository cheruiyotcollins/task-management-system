package backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Custom exception thrown when an email already exists in the system.
 */
@ResponseStatus(HttpStatus.CONFLICT) // Automatically returns HTTP 409 Conflict
public class DuplicateEmailException extends RuntimeException {

    public DuplicateEmailException(String message) {
        super(message);
    }

    // Optional: Constructor with cause (for exception chaining)
    public DuplicateEmailException(String message, Throwable cause) {
        super(message, cause);
    }
}