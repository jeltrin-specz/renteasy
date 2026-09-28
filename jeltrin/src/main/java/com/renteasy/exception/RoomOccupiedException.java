package com.renteasy.exception;

public class RoomOccupiedException extends RuntimeException {
    public RoomOccupiedException(String message) {
        super(message);
    }
}
