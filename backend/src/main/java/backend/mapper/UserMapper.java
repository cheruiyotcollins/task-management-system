package backend.mapper;

import backend.dto.UserDto;
import backend.enums.RoleName;
import backend.model.Role;
import backend.model.User;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserDto toDto(User user);

    User toEntity(UserDto userDto);

    List<UserDto> toDtoList(List<User> users);

    List<User> toEntityList(List<UserDto> userDtos);

    // Custom mapping method for Role -> RoleName.
    default RoleName map(Role role) {
        return role.getName();
    }

    // Custom mapping method for RoleName -> Role.
    default Role map(RoleName roleName) {
        Role role = new Role();
        role.setName(roleName);
        return role;
    }
}

