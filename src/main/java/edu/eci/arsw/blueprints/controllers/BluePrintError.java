package edu.eci.arsw.blueprints.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

public class BluePrintError extends RuntimeException {
    public BluePrintError(String message) {
        super(message);
    }
}

