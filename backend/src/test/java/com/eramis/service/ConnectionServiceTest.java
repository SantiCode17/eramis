package com.eramis.service;

import com.eramis.dto.ConnectionResponse;
import com.eramis.entity.Connection;
import com.eramis.entity.User;
import com.eramis.exception.ConnectionNotFoundException;
import com.eramis.exception.DuplicateConnectionException;
import com.eramis.exception.SelfConnectionException;
import com.eramis.exception.UnauthorizedOperationException;
import com.eramis.repository.ConnectionRepository;
import com.eramis.repository.ConversationRepository;
import com.eramis.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios para {@link ConnectionService}.
 * Verifica el envío de solicitudes de conexión, la detección de duplicados,
 * la aceptación por parte del receptor y la restricción de autorización.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ConnectionService — Tests unitarios")
class ConnectionServiceTest {

    @Mock private ConnectionRepository connectionRepository;
    @Mock private ConversationRepository conversationRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private ConnectionService connectionService;

    private User requester;
    private User receiver;

    /**
     * Inicializa los usuarios de prueba antes de cada test.
     */
    @BeforeEach
    void setUp() {
        requester = User.builder()
            .id(1L).email("requester@erasmus.eu")
            .firstName("Carlos").lastName("López")
            .passwordHash("hash").build();

        receiver = User.builder()
            .id(2L).email("receiver@erasmus.eu")
            .firstName("María").lastName("García")
            .passwordHash("hash").build();
    }

    /**
     * Verifica que enviar una solicitud válida crea una conexión con estado PENDING.
     */
    @Test
    @DisplayName("sendConnectionRequest con datos válidos devuelve conexión PENDING")
    void sendConnectionRequest_withValidData_returnsPendingConnection() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(receiver));
        when(connectionRepository.findConnectionBetweenUsers(1L, 2L)).thenReturn(Optional.empty());

        Connection savedConnection = Connection.builder()
            .id(1L).requester(requester).receiver(receiver)
            .status(Connection.Status.PENDING).build();
        when(connectionRepository.save(any(Connection.class))).thenReturn(savedConnection);

        ConnectionResponse response = connectionService.sendConnectionRequest(requester, 2L);

        assertThat(response.getStatus()).isEqualTo("PENDING");
        assertThat(response.getRequesterId()).isEqualTo(1L);
        assertThat(response.getReceiverId()).isEqualTo(2L);
        verify(connectionRepository).save(any(Connection.class));
    }

    /**
     * Verifica que enviar solicitud duplicada lanza DuplicateConnectionException.
     */
    @Test
    @DisplayName("sendConnectionRequest con solicitud duplicada lanza DuplicateConnectionException")
    void sendConnectionRequest_withDuplicateRequest_throwsException() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(receiver));

        Connection existingConnection = Connection.builder()
            .id(99L).requester(requester).receiver(receiver)
            .status(Connection.Status.PENDING).build();
        when(connectionRepository.findConnectionBetweenUsers(1L, 2L))
            .thenReturn(Optional.of(existingConnection));

        assertThatThrownBy(() -> connectionService.sendConnectionRequest(requester, 2L))
            .isInstanceOf(DuplicateConnectionException.class);

        verify(connectionRepository, never()).save(any());
    }

    /**
     * Verifica que aceptar una conexión cambia el estado a ACCEPTED y crea una conversación.
     */
    @Test
    @DisplayName("acceptConnection cambia estado a ACCEPTED y crea conversación")
    void acceptConnection_byReceiver_returnsAcceptedAndCreatesConversation() {
        Connection pendingConnection = Connection.builder()
            .id(1L).requester(requester).receiver(receiver)
            .status(Connection.Status.PENDING).build();

        when(connectionRepository.findById(1L)).thenReturn(Optional.of(pendingConnection));
        when(connectionRepository.save(any(Connection.class))).thenAnswer(invocation -> {
            Connection c = invocation.getArgument(0);
            return c;
        });
        when(conversationRepository.findByUsers(1L, 2L)).thenReturn(Optional.empty());

        // El receiver (id=2) acepta la conexión
        ConnectionResponse response = connectionService.acceptConnection(receiver, 1L);

        assertThat(response.getStatus()).isEqualTo("ACCEPTED");
        verify(conversationRepository).save(any());
    }

    /**
     * Verifica que el requester no puede aceptar su propia solicitud (solo el receiver).
     */
    @Test
    @DisplayName("acceptConnection por requester lanza UnauthorizedOperationException")
    void acceptConnection_byRequester_throwsUnauthorizedException() {
        Connection pendingConnection = Connection.builder()
            .id(1L).requester(requester).receiver(receiver)
            .status(Connection.Status.PENDING).build();

        when(connectionRepository.findById(1L)).thenReturn(Optional.of(pendingConnection));

        // El requester (id=1) intenta aceptar → no es el receiver
        assertThatThrownBy(() -> connectionService.acceptConnection(requester, 1L))
            .isInstanceOf(UnauthorizedOperationException.class);

        verify(connectionRepository, never()).save(any());
    }

    /**
     * Verifica que enviar solicitud a uno mismo lanza SelfConnectionException.
     */
    @Test
    @DisplayName("sendConnectionRequest a sí mismo lanza SelfConnectionException")
    void sendConnectionRequest_toSelf_throwsException() {
        assertThatThrownBy(() -> connectionService.sendConnectionRequest(requester, 1L))
            .isInstanceOf(SelfConnectionException.class);

        verify(connectionRepository, never()).save(any());
    }

    /**
     * Verifica que aceptar una conexión inexistente lanza ConnectionNotFoundException.
     */
    @Test
    @DisplayName("acceptConnection con ID inexistente lanza ConnectionNotFoundException")
    void acceptConnection_withNonExistentId_throwsException() {
        when(connectionRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> connectionService.acceptConnection(receiver, 999L))
            .isInstanceOf(ConnectionNotFoundException.class);
    }
}
