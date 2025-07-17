package backend.controller;

import backend.dto.*;
import backend.model.Role;
import backend.model.User;
import backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.jaxb.SpringDataJaxb;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping(value = "/api/v1/users/auth")
@Slf4j
public class UserController {
    @Autowired
    UserService userService;

    @Operation(summary = "New User Registration")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "User Created Successfully",
                    content = {@Content(mediaType = "application/json", schema = @Schema(implementation = User.class))}),
            @ApiResponse(responseCode = "401", description = "Unauthorized user", content = @Content),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content)})
    @PostMapping(value = "/signup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResponseDto> register(
            @RequestPart("user") SignUpRequestDto signUpRequestDto,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage
    ) {
        return userService.register(signUpRequestDto, profileImage);
    }

    @Operation(summary = "User sign in")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User Logged In Successfully",
                    content = {@Content(mediaType = "application/json",schema = @Schema(implementation = User.class))}),
            @ApiResponse(responseCode = "401",description = "Unauthorized user",content = @Content),
            @ApiResponse(responseCode = "404",description = "User not found",content = @Content),
            @ApiResponse(responseCode = "400",description = "Bad Request",content = @Content)})
    @PostMapping(value = "/signin")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
        LoginResponseDto loginResponseDto = userService.login(loginDto);

        // If not the first login, return the JWT token in the response
        JWTAuthResponseDto jwtAuthResponseDto = new JWTAuthResponseDto();

        jwtAuthResponseDto.setAccessToken(loginResponseDto.getAccessToken());

        jwtAuthResponseDto.setRefreshToken(loginResponseDto.getRefreshToken());

        jwtAuthResponseDto.setCurrentUser(loginResponseDto.getCurrentUser());

        if (loginResponseDto.isFirstLogin()) {
            return new ResponseEntity<>(
                    LoginResponseDto.builder()
                            .status(HttpStatus.OK)
                            .message("First login detected. Please change your password.")
                            .accessToken(loginResponseDto.getAccessToken())
                            .refreshToken(loginResponseDto.getRefreshToken())
                            .firstLogin(true)
                            .currentUser(loginResponseDto.getCurrentUser())
                            .build(),
                    HttpStatus.OK
            );
        }
        return ResponseEntity.ok(jwtAuthResponseDto);
    }

    @GetMapping("/allow/refresh")
    public LoginResponseDto refreshToken(HttpServletRequest request, Authentication authentication){
        return userService.refreshToken(request, authentication);
    }

    @Operation(summary = "Update User Info")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User Information Updated Successfully",
                    content = {@Content(mediaType = "application/json", schema = @Schema(implementation = User.class))}),
            @ApiResponse(responseCode = "401", description = "Unauthorized user", content = @Content),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content)
    })
    @PutMapping(value = "/{userId}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long userId,
            @RequestBody SignUpRequestDto signUpRequestDto
    ) {
        return userService.updateUser(userId, signUpRequestDto);
    }

    @Operation(summary = "Retrieve User by ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "302", description = "User found",
                    content = {@Content(mediaType = "application/json",schema = @Schema(implementation = User.class))}),
            @ApiResponse(responseCode = "401",description = "Unauthorized user",content = @Content),
            @ApiResponse(responseCode = "404",description = "User not found",content = @Content),
            @ApiResponse(responseCode = "400",description = "Bad Request",content = @Content)})
    @GetMapping("/{userId}")
    public ResponseEntity<ResponseDto> findUserById(@PathVariable long userId){
        return userService.findUserById(userId);

    }

    @Operation(summary = "List All Users")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Returned list of users",
                    content = {@Content(mediaType = "application/json", schema = @Schema(implementation = SpringDataJaxb.PageDto.class))}),
            @ApiResponse(responseCode = "401", description = "Unauthorized user", content = @Content),
            @ApiResponse(responseCode = "404", description = "No users found", content = @Content),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content)})
    @GetMapping
    public ResponseEntity<ResponseDto> getAllUsers(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sort", defaultValue = "fullName,asc") String sort,
            @RequestParam(value = "search", required = false) String searchQuery) {

        // Parse sort parameters
        String[] sortParams = sort.split(",");
        String sortBy = sortParams[0];
        Sort.Direction sortDirection = Sort.Direction.ASC;

        if (sortParams.length > 1) {
            sortDirection = sortParams[1].equalsIgnoreCase("desc")
                    ? Sort.Direction.DESC
                    : Sort.Direction.ASC;
        }
        // Validate sort fields to prevent SQL injection
        List<String> validSortFields = Arrays.asList("fullName", "email", "gender", "contact");
        if (!validSortFields.contains(sortBy)) {
            sortBy = "fullName"; // Default sort field if invalid
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        return userService.getAllUsers(pageable, searchQuery);
    }

    @Operation(summary = "Delete User By Id")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User Deleted Successfully",
                    content = {@Content(mediaType = "application/json",schema = @Schema(implementation = User.class))}),
            @ApiResponse(responseCode = "401",description = "Unauthorized user",content = @Content),
            @ApiResponse(responseCode = "404",description = "User not found",content = @Content),
            @ApiResponse(responseCode = "400",description = "Bad Request",content = @Content)})
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDto> deleteById(@PathVariable long id){
        return userService.deleteById(id);

    }

    @Operation(summary = "Create New Role")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Role Created Successfully",
                    content = {@Content(mediaType = "application/json",schema = @Schema(implementation = Role.class))}),
            @ApiResponse(responseCode = "401",description = "Unauthorized user",content = @Content),
            @ApiResponse(responseCode = "404",description = "Role not found",content = @Content),
            @ApiResponse(responseCode = "400",description = "Bad Request",content = @Content)})
    @PostMapping("/new/role")
    public ResponseEntity<?> addRole(@RequestBody AddRoleRequestDto addRoleRequestDto){
        return userService.addRole(addRoleRequestDto);
    }
    @GetMapping("/roles")
    public ResponseEntity<ResponseDto> fetchRoles(){
        return userService.fetchroles();
    }

    @Operation(summary = "Find Current User")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Role Created Successfully",
                    content = {@Content(mediaType = "application/json",schema = @Schema(implementation = Role.class))}),
            @ApiResponse(responseCode = "401",description = "Unauthorized user",content = @Content),
            @ApiResponse(responseCode = "404",description = "Role not found",content = @Content),
            @ApiResponse(responseCode = "400",description = "Bad Request",content = @Content)})
    @GetMapping("/current")
    public ResponseEntity<?> getCurrentUser( Authentication authentication){

        return userService.getCurrentUser(authentication.getName());
    }

    @PutMapping("/update-password")
    public ResponseEntity<?> updatePassword(@RequestBody @Valid ChangePasswordDto changePasswordDto, Principal principal) {
        return userService.updatePassword(changePasswordDto.getNewPassword(),principal);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        return userService.forgotPassword(email);
    }

    @PutMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String email,
                                           @RequestParam String resetCode,
                                           @RequestParam String newPassword) {
        return userService.resetPassword(email, resetCode, newPassword);
    }

}
