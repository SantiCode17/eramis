package com.eramis.exception;

/**
 * Excepción lanzada cuando no se encuentra un usuario por ID o email.
 */
public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException(String message) {
        super(message);
    }
}
