package com.eramis.exception;

/**
 * Excepción lanzada cuando no se encuentra una conexión por su ID.
 *
 * <p>Genera un HTTP 404 Not Found.</p>
 */
public class ConnectionNotFoundException extends RuntimeException {

    public ConnectionNotFoundException(Long id) {
        super("Conexión no encontrada: " + id);
    }

    public ConnectionNotFoundException(String message) {
        super(message);
    }
}
