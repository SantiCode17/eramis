package com.eramis.exception;

/**
 * Excepción lanzada cuando ya existe una conexión entre dos usuarios
 * (independientemente de su estado).
 *
 * <p>Genera un HTTP 409 Conflict.</p>
 */
public class DuplicateConnectionException extends RuntimeException {

    public DuplicateConnectionException(String message) {
        super(message);
    }
}
