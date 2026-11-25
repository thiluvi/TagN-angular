package com.tagn.backend.controller;

import com.tagn.backend.dto.request.ForgotPasswordRequest;
import com.tagn.backend.dto.request.LoginRequest;
import com.tagn.backend.dto.request.RegisterRequest;
import com.tagn.backend.dto.request.ResetPasswordRequest;
import com.tagn.backend.dto.response.AuthResponse;
import com.tagn.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return Map.of("message", "Se o e-mail estiver cadastrado, você receberá um código de recuperação em instantes.");
    }

    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return Map.of("message", "Senha redefinida com sucesso. Faça login com a nova senha.");
    }
}
