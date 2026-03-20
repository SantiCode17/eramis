package com.eramis.websocket;

import com.eramis.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Configuración del broker de mensajes WebSocket con protocolo STOMP.
 *
 * <p>Los clientes se conectan al endpoint {@code /ws} usando SockJS como fallback
 * de transporte. El prefijo {@code /app} enruta mensajes a los {@code @MessageMapping}.
 * El prefijo {@code /topic} enruta mensajes al broker de suscripciones.</p>
 *
 * <p>La autenticación JWT se valida en el handshake CONNECT mediante un
 * {@link ChannelInterceptor} que extrae el token del header Authorization.</p>
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    /**
     * Registra el endpoint STOMP con SockJS como fallback para navegadores
     * que no soporten WebSocket nativo.
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    /**
     * Configura el broker de mensajes con prefijos de destino.
     *
     * <ul>
     *   <li>{@code /app} — mensajes dirigidos a métodos {@code @MessageMapping}</li>
     *   <li>{@code /topic} — broker para suscripciones broadcast</li>
     *   <li>{@code /user} — mensajes punto a punto (usuario específico)</li>
     * </ul>
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");
        registry.enableSimpleBroker("/topic");
        registry.setUserDestinationPrefix("/user");
    }

    /**
     * Intercepta mensajes entrantes para validar el token JWT en el frame CONNECT.
     *
     * <p>Extrae el header {@code Authorization: Bearer <token>}, valida el token
     * con {@link JwtUtil} y establece el {@link UsernamePasswordAuthenticationToken}
     * como principal de la sesión WebSocket.</p>
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(
                        message, StompHeaderAccessor.class);

                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");

                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        try {
                            String email = jwtUtil.extractUsername(token);
                            var userDetails = userDetailsService.loadUserByUsername(email);
                            if (jwtUtil.validateToken(token, userDetails)) {
                                var auth = new UsernamePasswordAuthenticationToken(
                                        userDetails, null, userDetails.getAuthorities());
                                accessor.setUser(auth);
                                log.info("Conexión WebSocket autenticada: {}", email);
                            }
                        } catch (Exception e) {
                            log.warn("Token JWT inválido en WebSocket: {}", e.getMessage());
                        }
                    }
                }
                return message;
            }
        });
    }
}
