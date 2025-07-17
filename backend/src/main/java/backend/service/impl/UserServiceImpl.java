package backend.service.impl;

import backend.config.AppProperties;
import backend.enums.RoleName;
import backend.exception.DuplicateContactException;
import backend.exception.DuplicateEmailException;
import backend.exception.DuplicateUsernameException;
import backend.exception.ResourceNotFoundException;
import backend.mapper.ResponseDtoMapper;
import backend.mapper.UserMapper;
import backend.security.JwtTokenProvider;
import backend.security.UserPrincipal;
import backend.service.UserService;
import backend.service.utils.PhoneNumberEditor;
import backend.dto.*;

import backend.model.*;
import backend.repository.*;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.Principal;
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

    @Autowired
    ResponseDtoMapper responseDtoSetter;

    @Autowired
    UserMapper userMapper;

    @Value("${password.length}")
    private String length;

    @Transactional(readOnly = true)
    @Override
    public void validateUniqueUser(SignUpRequestDto signUpRequestDto) {
        List<User> conflicts = userRepository.findConflictingUsers(
                signUpRequestDto.getEmail(),
                signUpRequestDto.getUsername(),
                signUpRequestDto.getContact()
        );

        if (!conflicts.isEmpty()) {
            User conflict = conflicts.getFirst();
            if (conflict.getEmail().equalsIgnoreCase(signUpRequestDto.getEmail())) {
                throw new DuplicateEmailException("Email '" + signUpRequestDto.getEmail() + "' is already registered!");
            } else if (conflict.getUsername().equalsIgnoreCase(signUpRequestDto.getUsername())){
                throw new DuplicateUsernameException("Username '" + signUpRequestDto.getUsername() + "' is already taken!");
            } else {
                throw new DuplicateContactException("Contact '" + signUpRequestDto.getContact() + "' is already used!");
            }
        }
    }

    @Transactional
    public ResponseEntity<ResponseDto> register(SignUpRequestDto signUpRequestDto, MultipartFile profileImage) {
        validateUniqueUser(signUpRequestDto);

        String imagePath = null;
        if (profileImage != null && !profileImage.isEmpty()) {
            try {
                String fileName = UUID.randomUUID() + "_" + profileImage.getOriginalFilename();
                Path uploadPath = Paths.get("uploads/profile-pictures");
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(profileImage.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                imagePath = "profile-pictures/" + fileName;
            } catch (IOException e) {
                log.error("Image upload failed", e);
                return responseDtoSetter.responseDtoSetter(HttpStatus.INTERNAL_SERVER_ERROR, "Image upload failed.");
            }
        }

        String hashedPassword = passwordEncoder.encode(signUpRequestDto.getPassword());

        boolean isAdmin = signUpRequestDto.getRole() != null &&
                signUpRequestDto.getRole().equalsIgnoreCase("ROLE_ADMIN");

        User.UserBuilder userBuilder = User.builder()
                .email(signUpRequestDto.getEmail())
                .password(hashedPassword)
                .fullName(signUpRequestDto.getFullName())
                .username(signUpRequestDto.getEmail())
                .contact(PhoneNumberEditor.resolveNumber(signUpRequestDto.getContact()))
                .gender(signUpRequestDto.getGender())
                .profileImagePath(imagePath);

        User userToRegister;

        if (isAdmin) {
            userToRegister = userBuilder
                    .firstLogin(true)
                    .build();

            Role adminRole = roleRepository.findByName(RoleName.valueOf("ROLE_ADMIN"))
                    .orElseThrow(() -> new RuntimeException("Admin role not found!"));
            userToRegister.setRoles(Set.of(adminRole));
        } else {
            userToRegister = userBuilder
                    .firstLogin(false)
                    .build();

            Role userRole = roleRepository.findByName(RoleName.valueOf("ROLE_USER"))
                    .orElseThrow(() -> new RuntimeException("User role not found!"));
            userToRegister.setRoles(Set.of(userRole));
        }

        userRepository.save(userToRegister);

        log.info("Registered user: {}", userToRegister);

        return new ResponseEntity<>(
                ResponseDto.builder()
                        .status(HttpStatus.OK)
                        .payload(signUpRequestDto)
                        .description("User registered successfully.")
                        .build(),
                HttpStatus.OK
        );
    }

    @Override
    public LoginResponseDto login(LoginDto loginDto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();

        boolean firstLogin = user.getFirstLogin();

        String generateAccessToken = jwtTokenProvider.generateAccessToken(authentication, user.getUsername());
        String generateRefreshToken = jwtTokenProvider.generateRefreshToken(authentication, user.getUsername());
        String profileImageFileName = user.getProfileImagePath();
        String fullProfileImageUrl = null;
        if (profileImageFileName != null && !profileImageFileName.isEmpty()) {
            fullProfileImageUrl = appProperties.getBaseUrl() + "/profile-pictures/" + profileImageFileName;
        }
        CurrentUserDto currentUserDto = (toCurrentUserDto(user,fullProfileImageUrl));
        return new LoginResponseDto(generateAccessToken, generateRefreshToken, firstLogin,currentUserDto);
    }

    @Override
    public LoginResponseDto refreshToken(HttpServletRequest request, Authentication authentication) {
        String token = request.getHeader("Authorization");
        if (token == null) {
            return LoginResponseDto.builder()
                    .status(HttpStatus.NOT_FOUND)
                    .message("No refresh token found!")
                    .build();
        } else {
            token = token.substring("Bearer ".length());
            if (token == null) {
                return LoginResponseDto.builder()
                        .status(HttpStatus.CONFLICT)
                        .message("Token is empty")
                        .build();
            } else {
                try {
                    CustomUser userDetails = jwtTokenProvider.getUser(token);

                    User user = userRepository.findByEmail(userDetails.getUsername())
                            .orElseThrow(RuntimeException::new);

                    Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();
                    for (Role role : user.getRoles()) {
                        authorities.add(new SimpleGrantedAuthority(role.toString()));
                    }

                    org.springframework.security.core.userdetails.User user1 = new org.springframework.security.core.userdetails.User(
                            user.getEmail(),
                            user.getPassword(),
                            true,
                            true,
                            true,
                            true,
                            authorities
                    );

                    return LoginResponseDto.builder()
                            .status(HttpStatus.OK)
                            .accessToken(jwtTokenProvider.generateAccessToken(authentication, user.getUsername()))
                            .refreshToken(jwtTokenProvider.generateRefreshToken(authentication, user.getUsername()))
                            .roles(user.getRoles())
                            .object(user)
                            .build();
                } catch(Exception e) {
                    return LoginResponseDto.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .message(e.getMessage())
                            .build();
                }
            }
        }
    }

    @Override
    public ResponseEntity<ResponseDto> addRole(AddRoleRequestDto addRoleRequestDto) {
        Role role = new Role();
        role.setName(RoleName.fromString(addRoleRequestDto.name()));

        roleRepository.save(role);

        ResponseDto response = ResponseDto.builder()
                .status(HttpStatus.OK)
                .description("Role added successfully.")
                .build();

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<ResponseDto> findUserById(long userId) {
        try {
            Optional<User> userOptional = userRepository.findById(userId);

            if (userOptional.isPresent()) {
                User user= userOptional.get();
                UserDto userDto= userMapper.toDto(user);
                String profileImageFileName = user.getProfileImagePath();
                String fullProfileImageUrl = null;
                if (profileImageFileName != null && !profileImageFileName.isEmpty()) {
                    fullProfileImageUrl = appProperties.getBaseUrl() + "/profile-pictures/" + profileImageFileName;
                }
                userDto.setProfileImagePath(fullProfileImageUrl);

                return responseDtoSetter.responseDtoSetter(HttpStatus.OK, "User info", userDto);
            } else {
                return responseDtoSetter.responseDtoSetter(HttpStatus.NOT_FOUND, "User Not Found");
            }
        } catch (Exception e) {
            return responseDtoSetter.responseDtoSetter(HttpStatus.BAD_REQUEST, "An error occurred while retrieving user info");
        }
    }

    @Override
    public ResponseEntity<ResponseDto> getAllUsers(Pageable pageable, String searchQuery) {
        Specification<User> spec = (root, query, cb) -> {
            if (searchQuery == null || searchQuery.trim().isEmpty()) {
                return cb.conjunction();
            }

            String searchTerm = "%" + searchQuery.toLowerCase() + "%";
            String roleSearchTerm = "%" + searchQuery.toUpperCase() + "%";

            Join<User, Role> rolesJoin = root.join("roles", JoinType.LEFT);

            assert query != null;
            query.distinct(true);

            return cb.or(
                    cb.like(cb.lower(root.get("fullName")), searchTerm),
                    cb.like(cb.lower(root.get("email")), searchTerm),
                    cb.like(root.get("contact"), "%" + searchQuery + "%"),
                    cb.like(cb.upper(root.get("gender")), searchTerm),
                    cb.or(
                            cb.like(cb.upper(rolesJoin.get("name")), roleSearchTerm),
                            cb.like(
                                    cb.function("REPLACE", String.class,
                                            cb.upper(rolesJoin.get("name")),
                                            cb.literal("ROLE_"),
                                            cb.literal("")
                                    ),
                                    roleSearchTerm
                            )
                    )
            );
        };

        Page<User> usersPage = userRepository.findAll(spec, pageable);

        List<UserDto> userDtos = usersPage.getContent()
                .stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());

        ResponseDto responseDto = ResponseDto.builder()
                .status(HttpStatus.OK)
                .description(searchQuery != null && !searchQuery.trim().isEmpty()
                        ? "Users matching search criteria"
                        : "List of all users")
                .payload(userDtos)
                .totalPages(usersPage.getTotalPages())
                .totalElements(usersPage.getTotalElements())
                .currentPage(usersPage.getNumber())
                .pageSize(usersPage.getSize())
                .build();

        return ResponseEntity.ok(responseDto);
    }

    @Override
    public ResponseEntity<ResponseDto> deleteById(long id) {
        try {
            userRepository.deleteById(id);
            return responseDtoSetter.responseDtoSetter(HttpStatus.ACCEPTED,"User deleted successfully");
        } catch(Exception e) {
            return responseDtoSetter.responseDtoSetter(HttpStatus.BAD_REQUEST,"User with that id not found");
        }
    }

    @Override
    public ResponseEntity<ResponseDto> getCurrentUser(String email) {
        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User with email " + email + "not found"));
            String profileImageFileName = user.getProfileImagePath();
            String fullProfileImageUrl = null;
            if (profileImageFileName != null && !profileImageFileName.isEmpty()) {
                fullProfileImageUrl = appProperties.getBaseUrl() + "/profile-pictures/" + profileImageFileName;
            }
            CurrentUserDto currentUserDto = (toCurrentUserDto(user,fullProfileImageUrl));
            return responseDtoSetter.responseDtoSetter(HttpStatus.OK,"Current User logged in", currentUserDto);
        } catch (ResourceNotFoundException ex) {
            return responseDtoSetter.responseDtoSetter(HttpStatus.NOT_FOUND, ex.getMessage());
        } catch (Exception ex) {
            return responseDtoSetter.responseDtoSetter(HttpStatus.INTERNAL_SERVER_ERROR,"An error occurred while fetching the user details");
        }
    }

    private CurrentUserDto toCurrentUserDto(User user, String fullProfileImageUrl) {
        return CurrentUserDto.builder()
                .name(user.getFullName())
                .gender(user.getGender())
                .contact(user.getContact())
                .email(user.getEmail())
                .profileImagePath(fullProfileImageUrl)
                .role(user.getRoles()
                        .stream()
                        .map(role -> role.getName().getRoleName())
                        .collect(Collectors.joining(", ")))
                .build();
    }

    @Override
    public ResponseEntity<ResponseDto> updatePassword(String newPassword, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setFirstLogin(false);
        userRepository.save(user);
        return responseDtoSetter.responseDtoSetter(HttpStatus.OK,"Password updated successfully.");
    }

    @Override
    public ResponseEntity<ResponseDto> forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        String verificationCode = String.format("%06d", new Random().nextInt(999999));

        user.setResetCode(verificationCode);
        user.setResetCodeExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        String subject = "Password Reset Request";
        String message = "Your password reset code is " + verificationCode + ". This code expires in 15 minutes.";


        return responseDtoSetter.responseDtoSetter(HttpStatus.OK,"Password reset code sent to email.");
    }

    @Override
    public ResponseEntity<ResponseDto> resetPassword(String email, String resetCode, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (!user.getResetCode().equals(resetCode) || LocalDateTime.now().isAfter(user.getResetCodeExpiry())) {
            return responseDtoSetter.responseDtoSetter(HttpStatus.BAD_REQUEST,"Invalid or expired reset code.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetCode(null);
        user.setResetCodeExpiry(null);
        userRepository.save(user);

        return responseDtoSetter.responseDtoSetter(HttpStatus.OK,"Password has been successfully reset.");
    }

    @Override
    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            throw new IllegalStateException("No authenticated user found");
        }

        String username = authentication.getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }

    @Override
    public ResponseEntity<?> updateUser(Long userId, SignUpRequestDto signUpRequestDto) {
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            if (signUpRequestDto.getGender() != null && !signUpRequestDto.getGender().isEmpty()) {
                user.setGender(signUpRequestDto.getGender());
            }
            if (signUpRequestDto.getContact() != null && !signUpRequestDto.getContact().isEmpty()) {
                user.setContact(signUpRequestDto.getContact());
            }
            if (signUpRequestDto.getFullName() != null && !signUpRequestDto.getFullName().isEmpty()) {
                user.setFullName(signUpRequestDto.getFullName());
            }

            if (signUpRequestDto.getRole() != null && !signUpRequestDto.getRole().isEmpty()) {
                try {
                    RoleName newRoleName = RoleName.valueOf(signUpRequestDto.getRole().toUpperCase());

                    Optional<Role> roleOptional = roleRepository.findByName(newRoleName);

                    if (roleOptional.isPresent()) {
                        Role roleToAssign = roleOptional.get();
                        Set<Role> updatedRoles = new HashSet<>();
                        updatedRoles.add(roleToAssign);
                        user.setRoles(updatedRoles);
                    } else {
                        return responseDtoSetter.responseDtoSetter(
                                HttpStatus.BAD_REQUEST,
                                "Provided role name '" + signUpRequestDto.getRole() + "' is not valid or does not exist."
                        );
                    }
                } catch (IllegalArgumentException e) {
                    return responseDtoSetter.responseDtoSetter(
                            HttpStatus.BAD_REQUEST,
                            "Invalid role name format: " + signUpRequestDto.getRole()
                    );
                }
            }

            userRepository.save(user);
            return responseDtoSetter.responseDtoSetter(HttpStatus.OK, "User Info Updated Successfully.");
        }

        return responseDtoSetter.responseDtoSetter(HttpStatus.BAD_REQUEST, "User with provided Id not found.");
    }

    @Override
    public ResponseEntity<ResponseDto> fetchroles() {
        List<Role> roles= roleRepository.findAll();
        return responseDtoSetter.responseDtoSetter(HttpStatus.OK,"list of all roles",roles);
    }
}