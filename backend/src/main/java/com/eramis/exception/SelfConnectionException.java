package com.eramis.exception;

/**
 * Excepción lanzada cuando un usuario intenta crear una conexión consigo mismo.
 *
 * <p>Genera un HTTP 400 Bad Request.</p>
 */
public class SelfConnectionException extends RuntimeException {

    public SelfConnectionException(String message) {
        super(message);
    }
}
