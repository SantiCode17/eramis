package com.eramis.exception;

/**
 * Excepción lanzada cuando las credenciales de login son incorrectas.
 */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("Credenciales inválidas");
    }
}
