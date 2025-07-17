package backend.mapper;

import backend.dto.UserDto;
import backend.enums.RoleName;
import backend.model.Role;
import backend.model.User;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-07-17T11:41:05+0000",
    comments = "version: 1.6.1, compiler: javac, environment: Java 21.0.3 (Ubuntu)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserDto toDto(User user) {
        if ( user == null ) {
            return null;
        }

        UserDto userDto = new UserDto();

        if ( user.getUserId() != null ) {
            userDto.setUserId( user.getUserId() );
        }
        userDto.setEmail( user.getEmail() );
        userDto.setUsername( user.getUsername() );
        userDto.setRoles( roleSetToRoleNameSet( user.getRoles() ) );
        userDto.setFullName( user.getFullName() );
        userDto.setContact( user.getContact() );
        userDto.setGender( user.getGender() );
        userDto.setProfileImagePath( user.getProfileImagePath() );
        if ( user.getFirstLogin() != null ) {
            userDto.setFirstLogin( user.getFirstLogin() );
        }

        return userDto;
    }

    @Override
    public User toEntity(UserDto userDto) {
        if ( userDto == null ) {
            return null;
        }

        User.UserBuilder user = User.builder();

        user.userId( userDto.getUserId() );
        user.fullName( userDto.getFullName() );
        user.username( userDto.getUsername() );
        user.contact( userDto.getContact() );
        user.email( userDto.getEmail() );
        user.gender( userDto.getGender() );
        user.profileImagePath( userDto.getProfileImagePath() );
        user.roles( roleNameSetToRoleSet( userDto.getRoles() ) );
        user.firstLogin( userDto.isFirstLogin() );

        return user.build();
    }

    @Override
    public List<UserDto> toDtoList(List<User> users) {
        if ( users == null ) {
            return null;
        }

        List<UserDto> list = new ArrayList<UserDto>( users.size() );
        for ( User user : users ) {
            list.add( toDto( user ) );
        }

        return list;
    }

    @Override
    public List<User> toEntityList(List<UserDto> userDtos) {
        if ( userDtos == null ) {
            return null;
        }

        List<User> list = new ArrayList<User>( userDtos.size() );
        for ( UserDto userDto : userDtos ) {
            list.add( toEntity( userDto ) );
        }

        return list;
    }

    protected Set<RoleName> roleSetToRoleNameSet(Set<Role> set) {
        if ( set == null ) {
            return null;
        }

        Set<RoleName> set1 = LinkedHashSet.newLinkedHashSet( set.size() );
        for ( Role role : set ) {
            set1.add( map( role ) );
        }

        return set1;
    }

    protected Set<Role> roleNameSetToRoleSet(Set<RoleName> set) {
        if ( set == null ) {
            return null;
        }

        Set<Role> set1 = LinkedHashSet.newLinkedHashSet( set.size() );
        for ( RoleName roleName : set ) {
            set1.add( map( roleName ) );
        }

        return set1;
    }
}
