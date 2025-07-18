package backend.service;

import backend.dto.*;
import backend.model.User;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

public interface UserService {
    JWTAuthResponseDto login(LoginDto loginDto);
    ResponseEntity<ResponseDto> register(SignUpRequestDto signUpRequestDto);
    ResponseEntity<ResponseDto> getAllUsers(String searchQuery);

    ResponseEntity<ResponseDto> getCurrentUser(String email);

}