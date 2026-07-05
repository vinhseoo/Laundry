package com.bubbleflow.config.security;

import com.bubbleflow.entity.*;
import com.bubbleflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class
CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PermissionRepository permissionRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new UsernameNotFoundException("User is inactive: " + email);
        }

        List<UserRole> userRoles = userRoleRepository.findByUserId(user.getId());
        List<Role> roles = userRoles.stream()
                .map(UserRole::getRole)
                .filter(Role::getIsActive)
                .toList();

        List<GrantedAuthority> authorities = new ArrayList<>();

        for (Role role : roles) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName().toUpperCase()));
        }

        boolean hasAllTypeRole = roles.stream()
                .anyMatch(r -> r.getType() == RoleType.ALL || r.getName().equalsIgnoreCase("ADMIN"));

        if (hasAllTypeRole) {
            authorities.add(new SimpleGrantedAuthority("ROLE_TYPE_ALL"));

            List<Permission> allPermissions = permissionRepository.findAll();
            for (Permission perm : allPermissions) {
                authorities.add(new SimpleGrantedAuthority(perm.getName()));
            }
        } else {
            List<Long> roleIds = roles.stream().map(Role::getId).toList();
            if (!roleIds.isEmpty()) {
                List<RolePermission> rolePermissions = rolePermissionRepository.findByRoleIdIn(roleIds);
                Set<String> permissionNames = rolePermissions.stream()
                        .map(RolePermission::getPermission)
                        .map(Permission::getName)
                        .collect(Collectors.toSet());

                for (String name : permissionNames) {
                    authorities.add(new SimpleGrantedAuthority(name));
                }
            }
        }

        LoggerFactory.getLogger(CustomUserDetailsService.class).info(
            "User {} loaded with roles: {} and authorities: {}", 
            email, 
            roles.stream().map(Role::getName).toList(), 
            authorities.stream().map(GrantedAuthority::getAuthority).toList()
        );

        return new CustomUserDetails(user, authorities);
    }
}
