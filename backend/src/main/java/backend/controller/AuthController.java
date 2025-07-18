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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
@RestController
@RequestMapping(value = "/api/auth")
@Slf4j
public class AuthController {
    @Autowired
    UserService userService;

    @Operation(summary = "New User Registration")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "User Created Successfully",
                    content = {@Content(mediaType = "application/json", schema = @Schema(implementation = User.class))}),
            @ApiResponse(responseCode = "401", description = "Unauthorized user", content = @Content),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content)})
    @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ResponseDto> register(@RequestBody SignUpRequestDto signUpRequestDto) {
        return userService.register(signUpRequestDto);
    }

    @Operation(summary = "User sign in")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User Logged In Successfully",
                    content = {@Content(mediaType = "application/json",schema = @Schema(implementation = User.class))}),
            @ApiResponse(responseCode = "401",description = "Unauthorized user",content = @Content),
            @ApiResponse(responseCode = "404",description = "User not found",content = @Content),
            @ApiResponse(responseCode = "400",description = "Bad Request",content = @Content)})
    @PostMapping(value = "/login")
    public ResponseEntity<JWTAuthResponseDto> login(@RequestBody LoginDto loginDto) {

        JWTAuthResponseDto jwtAuthResponseDto = userService.login(loginDto);
        return ResponseEntity.ok(jwtAuthResponseDto);
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
}
