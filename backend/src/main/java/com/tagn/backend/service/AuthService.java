package com.tagn.backend.service;

import com.tagn.backend.domain.entity.PasswordResetCode;
import com.tagn.backend.domain.entity.User;
import com.tagn.backend.domain.enums.Role;
import com.tagn.backend.dto.request.ForgotPasswordRequest;
import com.tagn.backend.dto.request.LoginRequest;
import com.tagn.backend.dto.request.RegisterRequest;
import com.tagn.backend.dto.request.ResetPasswordRequest;
import com.tagn.backend.dto.response.AuthResponse;
import com.tagn.backend.dto.response.UserResponse;
import com.tagn.backend.exception.ConflictException;
import com.tagn.backend.exception.NotFoundException;
import com.tagn.backend.repository.PasswordResetCodeRepository;
import com.tagn.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetCodeRepository passwordResetCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.birthDate().isAfter(LocalDate.now().minusYears(18))) {
            throw new IllegalArgumentException("É necessário ter pelo menos 18 anos para se cadastrar.");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("E-mail já cadastrado.");
        }
        if (userRepository.existsByCpf(request.cpf())) {
            throw new ConflictException("CPF já cadastrado.");
        }

        Role role = "dramarcela@gmail.com".equalsIgnoreCase(request.email().trim())
                ? Role.ADMIN
                : Role.PATIENT;

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .phone(request.phone())
                .cpf(request.cpf())
                .birthDate(request.birthDate())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(role)
                .build();

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);
        return new AuthResponse(token, UserResponse.from(savedUser));
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        User user = userRepository.findByEmail(request.email()).orElseThrow();
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, UserResponse.from(user));
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.email()).ifPresent(user -> {
            // Gera código numérico de 6 dígitos (100000 - 999999)
            String code = String.valueOf(100000 + secureRandom.nextInt(900000));

            PasswordResetCode resetCode = PasswordResetCode.builder()
                    .user(user)
                    .code(code)
                    .expiresAt(LocalDateTime.now().plusMinutes(15))
                    .build();

            passwordResetCodeRepository.save(resetCode);

            // Dispara o e-mail via Resend
            emailService.sendPasswordResetCode(user.getEmail(), user.getName(), code);
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));

        PasswordResetCode resetCode = passwordResetCodeRepository
                .findTopByUserAndCodeAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                        user, request.code(), LocalDateTime.now()
                )
                .orElseThrow(() -> new ConflictException("Código inválido ou expirado."));

        // Atualiza a senha
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        // Marca o código como utilizado
        resetCode.setUsed(true);
        passwordResetCodeRepository.save(resetCode);

        log.info("✅ Senha redefinida com sucesso para o usuário: {}", user.getEmail());
    }
}