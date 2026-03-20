package com.eramis.exception;

/**
 * Excepción lanzada cuando un usuario intenta realizar una operación
 * sobre un recurso que no le pertenece.
 */
public class UnauthorizedOperationException extends RuntimeException {

    public UnauthorizedOperationException(String message) {
        super(message);
    }
}
