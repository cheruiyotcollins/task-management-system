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

    ResponseEntity<ResponseDto> register(SignUpRequestDto signUpRequestDto, MultipartFile profileImage);

    @Transactional(readOnly = true)
    void validateUniqueUser(SignUpRequestDto signUpRequestDto);

    LoginResponseDto login(LoginDto loginDto);

    LoginResponseDto refreshToken(HttpServletRequest request, Authentication authentication);

    ResponseEntity<ResponseDto> addRole(AddRoleRequestDto addRoleRequestDto);

    ResponseEntity<ResponseDto> findUserById(long userId);

    ResponseEntity<ResponseDto> getAllUsers(Pageable pageable, String searchQuery);

    ResponseEntity<ResponseDto> deleteById(long id);

    ResponseEntity<ResponseDto> getCurrentUser(String email);

    ResponseEntity<ResponseDto> updatePassword(String newPassword, Principal principal);

    ResponseEntity<ResponseDto> forgotPassword(String email);

    ResponseEntity<ResponseDto> resetPassword(String email, String resetCode, String newPassword);

    User getCurrentAuthenticatedUser();

    ResponseEntity<?> updateUser(Long userId, SignUpRequestDto signUpRequestDto);

    ResponseEntity<ResponseDto> fetchroles();
}