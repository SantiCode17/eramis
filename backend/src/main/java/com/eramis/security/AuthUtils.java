package com.eramis.security;

import com.eramis.entity.User;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Utilidad para obtener el usuario autenticado desde el contexto de seguridad.
 *
 * <p>Se usa en controladores y servicios que necesitan acceder al usuario
 * actual sin inyectar {@code @AuthenticationPrincipal} directamente.</p>
 */
@Component
public class AuthUtils {

    /**
     * Obtiene la entidad {@link User} del usuario autenticado en la petición actual.
     *
     * @return usuario autenticado
     */
    public User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    /**
     * Obtiene el ID del usuario autenticado.
     *
     * @return ID del usuario actual
     */
    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
}
