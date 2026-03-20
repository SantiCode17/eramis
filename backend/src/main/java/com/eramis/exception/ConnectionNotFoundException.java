package com.eramis.exception;

/**
 * Excepción lanzada cuando no se encuentra una conexión por su ID.
 */
public class ConnectionNotFoundException extends RuntimeException {

    public ConnectionNotFoundException(Long id) {
        super("Conexión no encontrada: " + id);
    }
}
