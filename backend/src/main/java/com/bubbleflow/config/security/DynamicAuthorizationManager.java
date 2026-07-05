package com.bubbleflow.config.security;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;

import java.util.Collection;
import java.util.function.Supplier;

@Component
@RequiredArgsConstructor
@Slf4j
public class DynamicAuthorizationManager implements AuthorizationManager<RequestAuthorizationContext> {

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Override
    public AuthorizationDecision check(Supplier<Authentication> authentication, RequestAuthorizationContext context) {
        Authentication auth = authentication.get();
        if (auth == null || !auth.isAuthenticated()) {
            return new AuthorizationDecision(false);
        }

        HttpServletRequest request = context.getRequest();
        String method = request.getMethod();
        String path = request.getRequestURI();

        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();

        boolean hasAllAccess = authorities.stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") 
                            || a.getAuthority().equals("ROLE_TYPE_ALL"));
        if (hasAllAccess) {
            return new AuthorizationDecision(true);
        }

        for (GrantedAuthority authority : authorities) {
            String authorityString = authority.getAuthority();
            if (authorityString.contains(":")) {
                int colonIndex = authorityString.indexOf(":");
                String pMethod = authorityString.substring(0, colonIndex);
                String pPattern = authorityString.substring(colonIndex + 1);

                if (method.equalsIgnoreCase(pMethod) && pathMatcher.match(pPattern, path)) {
                    log.debug("[DynamicAuth] Allowed request {} {} matching permission {}", method, path, authorityString);
                    return new AuthorizationDecision(true);
                }
            }
        }

        log.warn("[DynamicAuth] Denied request {} {}", method, path);
        return new AuthorizationDecision(false);
    }
}
