package com.eramis.service;

import com.eramis.dto.ConnectionResponse;
import com.eramis.dto.InterestResponse;
import com.eramis.dto.UserSummaryResponse;
import com.eramis.entity.Connection;
import com.eramis.entity.Conversation;
import com.eramis.entity.User;
import com.eramis.exception.ConnectionNotFoundException;
import com.eramis.exception.DuplicateConnectionException;
import com.eramis.exception.SelfConnectionException;
import com.eramis.exception.UnauthorizedOperationException;
import com.eramis.exception.UserNotFoundException;
import com.eramis.repository.ConnectionRepository;
import com.eramis.repository.ConversationRepository;
import com.eramis.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio de gestión de conexiones (solicitudes de amistad) entre usuarios.
 *
 * <p>Gestiona el ciclo de vida completo de una conexión:
 * envío de solicitud → aceptación/rechazo → creación automática de conversación.</p>
 *
 * <p>Al aceptar una conexión, se crea automáticamente una {@link Conversation}
 * entre los dos usuarios para habilitar el chat.</p>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ConnectionService {

    private final ConnectionRepository connectionRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    /**
     * Envía una solicitud de conexión a otro usuario.
     *
     * @param requester  usuario que envía la solicitud
     * @param receiverId ID del usuario receptor
     * @return respuesta con los datos de la conexión creada
     * @throws SelfConnectionException      si intenta conectarse consigo mismo
     * @throws UserNotFoundException        si el receptor no existe
     * @throws DuplicateConnectionException si ya existe una conexión entre ambos
     */
    @Transactional
    public ConnectionResponse sendConnectionRequest(User requester, Long receiverId) {
        if (requester.getId().equals(receiverId)) {
            throw new SelfConnectionException("No puedes enviar una solicitud de conexión a ti mismo");
        }

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado: " + receiverId));

        // Verificar que no exista una conexión en ninguna dirección
        connectionRepository.findConnectionBetweenUsers(requester.getId(), receiverId)
                .ifPresent(c -> {
                    throw new DuplicateConnectionException(
                            "Ya existe una conexión entre los usuarios " + requester.getId() + " y " + receiverId);
                });

        Connection connection = Connection.builder()
                .requester(requester)
                .receiver(receiver)
                .build();

        Connection saved = connectionRepository.save(connection);
        log.info("Solicitud de conexión creada: {} → {}", requester.getEmail(), receiver.getEmail());

        return mapToResponse(saved);
    }

    /**
     * Acepta una solicitud de conexión pendiente. Solo el receptor puede aceptar.
     *
     * <p>Al aceptar, se crea automáticamente una {@link Conversation} entre ambos usuarios
     * con la convención user1_id &lt; user2_id.</p>
     *
     * @param currentUser  usuario autenticado (debe ser el receptor)
     * @param connectionId ID de la conexión a aceptar
     * @return respuesta con la conexión actualizada
     * @throws ConnectionNotFoundException     si la conexión no existe
     * @throws UnauthorizedOperationException  si no es el receptor
     */
    @Transactional
    public ConnectionResponse acceptConnection(User currentUser, Long connectionId) {
        Connection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new ConnectionNotFoundException("Conexión no encontrada: " + connectionId));

        verifyReceiver(currentUser, connection);

        connection.setStatus(Connection.Status.ACCEPTED);
        Connection saved = connectionRepository.save(connection);

        // Crear la conversación automáticamente al aceptar
        createConversation(connection.getRequester(), connection.getReceiver());

        log.info("Conexión aceptada: {} ↔ {}",
                connection.getRequester().getEmail(), connection.getReceiver().getEmail());

        return mapToResponse(saved);
    }

    /**
     * Rechaza una solicitud de conexión pendiente. Solo el receptor puede rechazar.
     *
     * @param currentUser  usuario autenticado (debe ser el receptor)
     * @param connectionId ID de la conexión a rechazar
     * @return respuesta con la conexión actualizada
     * @throws ConnectionNotFoundException     si la conexión no existe
     * @throws UnauthorizedOperationException  si no es el receptor
     */
    @Transactional
    public ConnectionResponse rejectConnection(User currentUser, Long connectionId) {
        Connection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new ConnectionNotFoundException("Conexión no encontrada: " + connectionId));

        verifyReceiver(currentUser, connection);

        connection.setStatus(Connection.Status.REJECTED);
        Connection saved = connectionRepository.save(connection);

        log.info("Conexión rechazada: {} → {}",
                connection.getRequester().getEmail(), connection.getReceiver().getEmail());

        return mapToResponse(saved);
    }

    /**
     * Obtiene las conexiones aceptadas (matches) del usuario autenticado.
     *
     * @param currentUser usuario autenticado
     * @return lista de resúmenes de los usuarios conectados
     */
    @Transactional(readOnly = true)
    public List<UserSummaryResponse> getMyConnections(User currentUser) {
        List<Connection> accepted = connectionRepository.findAcceptedConnections(currentUser.getId());
        List<UserSummaryResponse> result = new ArrayList<>();

        for (Connection connection : accepted) {
            User other = connection.getRequester().getId().equals(currentUser.getId())
                    ? connection.getReceiver()
                    : connection.getRequester();
            result.add(mapUserToSummary(other));
        }

        return result;
    }

    /**
     * Obtiene las solicitudes de conexión pendientes recibidas por el usuario.
     *
     * @param currentUser usuario autenticado
     * @return lista de conexiones pendientes
     */
    @Transactional(readOnly = true)
    public List<ConnectionResponse> getPendingConnections(User currentUser) {
        return connectionRepository.findPendingConnectionsForUser(currentUser.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Verifica que el usuario actual sea el receptor de la conexión.
     *
     * @param currentUser usuario autenticado
     * @param connection  conexión a verificar
     * @throws UnauthorizedOperationException si no es el receptor
     */
    private void verifyReceiver(User currentUser, Connection connection) {
        if (!connection.getReceiver().getId().equals(currentUser.getId())) {
            throw new UnauthorizedOperationException(
                    "Solo el receptor puede aceptar o rechazar una solicitud de conexión");
        }
    }

    /**
     * Crea una conversación entre dos usuarios con la convención user1_id &lt; user2_id.
     * Si ya existe, no crea una nueva.
     */
    private void createConversation(User user1, User user2) {
        // Garantizar convención user1_id < user2_id
        User first = user1.getId() < user2.getId() ? user1 : user2;
        User second = user1.getId() < user2.getId() ? user2 : user1;

        // Verificar si ya existe
        if (conversationRepository.findByUsers(first.getId(), second.getId()).isPresent()) {
            log.debug("La conversación ya existe entre {} y {}", first.getId(), second.getId());
            return;
        }

        Conversation conversation = Conversation.builder()
                .user1(first)
                .user2(second)
                .build();

        conversationRepository.save(conversation);
        log.info("Conversación creada entre {} y {}", first.getEmail(), second.getEmail());
    }

    /**
     * Mapea una entidad {@link Connection} a {@link ConnectionResponse}.
     */
    private ConnectionResponse mapToResponse(Connection connection) {
        return ConnectionResponse.builder()
                .id(connection.getId())
                .requesterId(connection.getRequester().getId())
                .receiverId(connection.getReceiver().getId())
                .status(connection.getStatus().name())
                .createdAt(connection.getCreatedAt())
                .build();
    }

    /**
     * Mapea una entidad {@link User} a {@link UserSummaryResponse} para la lista de matches.
     */
    private UserSummaryResponse mapUserToSummary(User user) {
        List<InterestResponse> interests = user.getInterests() != null
                ? user.getInterests().stream()
                    .map(i -> InterestResponse.builder()
                            .id(i.getId())
                            .name(i.getName())
                            .icon(i.getIcon())
                            .build())
                    .collect(Collectors.toList())
                : List.of();

        return UserSummaryResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .profilePhoto(user.getProfilePhoto())
                .homeCountry(user.getHomeCountry())
                .universityName(user.getUniversity() != null ? user.getUniversity().getName() : null)
                .interests(interests)
                .build();
    }
}
