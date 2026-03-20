package com.eramis.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración de Swagger/OpenAPI para documentación interactiva de la API.
 *
 * <p>Define la información general del proyecto, el esquema de seguridad JWT Bearer
 * y expone la UI en {@code /swagger-ui/index.html}.</p>
 */
@Configuration
public class SwaggerConfig {

    /**
     * Bean de configuración de OpenAPI con información del proyecto y esquema JWT.
     */
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("EraMis API")
                        .description("Backend API para la aplicación EraMis — Connecting Erasmus Students")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Santiago Sánchez March")
                                .email("santiago@eramis.app")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}
