package backend.controller;

import backend.dto.*;
import backend.model.Role;
import backend.model.User;
import backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
@RequestMapping(value = "/api/users")
public class UserController {
    @Autowired
    UserService userService;

    @Operation(summary = "List All Users", parameters = {
            @Parameter(name = "search", description = "Search term to filter users by full name, email, or role", required = false)
    })
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Returned list of users",
                    content = {@Content(mediaType = "application/json", schema = @Schema(implementation = Object.class))}),
            @ApiResponse(responseCode = "401", description = "Unauthorized user", content = @Content),
            @ApiResponse(responseCode = "404", description = "No users found", content = @Content),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content)
    })
    @GetMapping
    public ResponseEntity<ResponseDto> getAllUsers(
            @RequestParam(value = "search", required = false) String searchQuery) {
        return userService.getAllUsers(searchQuery);
    }



}
