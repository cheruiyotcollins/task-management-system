package backend.service.impl;

import backend.config.AppProperties;
import backend.dto.*;
import backend.model.Role;
import backend.model.User;
import backend.repository.RoleRepository;
import backend.repository.UserRepository;
import backend.exception.DuplicateContactException;
import backend.exception.DuplicateEmailException;
import backend.exception.DuplicateUsernameException;
import backend.exception.ResourceNotFoundException;
import backend.mapper.UserMapper;
import backend.security.JwtTokenProvider;
import backend.security.UserPrincipal;
import backend.service.UserService;
import backend.mapper.ResponseDtoMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import backend.enums.RoleName;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AppProperties appProperties;
    private final ResponseDtoMapper responseDtoSetter;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)

    private void validateUniqueUser(SignUpRequestDto signUpRequestDto) {
        List<User> conflicts = userRepository.findConflictingUsers(
                signUpRequestDto.getEmail(),
                signUpRequestDto.getUsername(),
                signUpRequestDto.getContact()
        );

        if (!conflicts.isEmpty()) {
            User conflict = conflicts.getFirst();
            if (conflict.getEmail().equalsIgnoreCase(signUpRequestDto.getEmail())) {
                throw new DuplicateEmailException("Email '" + signUpRequestDto.getEmail() + "' is already registered!");
            } else if (conflict.getUsername().equalsIgnoreCase(signUpRequestDto.getUsername())) {
                throw new DuplicateUsernameException("Username '" + signUpRequestDto.getUsername() + "' is already taken!");
            } else {
                throw new DuplicateContactException("Contact '" + signUpRequestDto.getContact() + "' is already used!");
            }
        }
    }

    @Transactional
    public ResponseEntity<ResponseDto> register(SignUpRequestDto signUpRequestDto) {
        validateUniqueUser(signUpRequestDto);

        String hashedPassword = passwordEncoder.encode(signUpRequestDto.getPassword());

        User userToRegister = User.builder()
                .email(signUpRequestDto.getEmail())
                .username(signUpRequestDto.getUsername())
                .fullName(signUpRequestDto.getFullName())
                .password(hashedPassword)
                .createdAt(LocalDateTime.now())
                .build();

        Role userRole = roleRepository.findByName(RoleName.USER)
                .orElseThrow(() -> new ResourceNotFoundException("Default USER role not found"));
        userToRegister.setRole(userRole);

        userRepository.save(userToRegister);

        return ResponseEntity.ok(
                ResponseDto.builder()
                        .status(HttpStatus.OK)
                        .description("User registered successfully")
                        .payload(signUpRequestDto)
                        .build()
        );
    }


    @Override
    public JWTAuthResponseDto login(LoginDto loginDto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();

        String generateAccessToken = jwtTokenProvider.generateAccessToken(authentication, user.getUsername());

        CurrentUserDto currentUserDto = toCurrentUserDto(user);
        LoginResponseDto loginResponseDto= new LoginResponseDto(generateAccessToken,currentUserDto);
        JWTAuthResponseDto jwtAuthResponseDto= new JWTAuthResponseDto();
        jwtAuthResponseDto.setAccessToken(loginResponseDto.getAccessToken());
        jwtAuthResponseDto.setCurrentUser(loginResponseDto.getCurrentUser());
        return jwtAuthResponseDto;
    }

    @Override
    public ResponseEntity<ResponseDto> getAllUsers(String searchQuery) {
        Specification<User> spec = (root, query, cb) -> {
            if (searchQuery == null || searchQuery.trim().isEmpty()) {
                return cb.conjunction();
            }

            String searchTerm = "%" + searchQuery.toLowerCase() + "%";
            String roleSearchTerm = "%" + searchQuery.toUpperCase() + "%";

            query.distinct(true);

            return cb.or(
                    cb.like(cb.lower(root.get("fullName")), searchTerm),
                    cb.like(cb.lower(root.get("email")), searchTerm),
                    cb.like(cb.upper(root.get("role").get("name")), roleSearchTerm)
            );
        };

        List<User> users = userRepository.findAll(spec);
        List<UserDto> userDtos = users.stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());

        ResponseDto responseDto = ResponseDto.builder()
                .status(HttpStatus.OK)
                .description((searchQuery != null && !searchQuery.trim().isEmpty())
                        ? "Users matching search criteria"
                        : "List of all users")
                .payload(userDtos)
                .build();

        return ResponseEntity.ok(responseDto);
    }

    @Override
    public ResponseEntity<ResponseDto> getCurrentUser(String email) {
        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User with email " + email + " not found"));

            CurrentUserDto currentUserDto = toCurrentUserDto(user);
            return responseDtoSetter.responseDtoSetter(HttpStatus.OK, "Current user retrieved", currentUserDto);

        } catch (ResourceNotFoundException ex) {
            return responseDtoSetter.responseDtoSetter(HttpStatus.NOT_FOUND, ex.getMessage());

        } catch (Exception ex) {
            log.error("Unexpected error retrieving current user", ex);
            return responseDtoSetter.responseDtoSetter(HttpStatus.INTERNAL_SERVER_ERROR, "An error occurred while fetching user details");
        }
    }

    private CurrentUserDto toCurrentUserDto(User user) {
        return CurrentUserDto.builder()
                .name(user.getFullName())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().getName().name() : null)
                .createdAt(user.getCreatedAt())
                .build();
    }
}





