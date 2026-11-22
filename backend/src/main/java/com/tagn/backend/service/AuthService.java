package com.tagn.backend.service;

import com.tagn.backend.domain.entity.User;
import com.tagn.backend.dto.request.LoginRequest;
import com.tagn.backend.dto.request.RegisterRequest;
import com.tagn.backend.dto.response.AuthResponse;
import com.tagn.backend.dto.response.UserResponse;
import com.tagn.backend.exception.ConflictException;
import com.tagn.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("E-mail já cadastrado.");
        }
        if (userRepository.existsByCpf(request.cpf())) {
            throw new ConflictException("CPF já cadastrado.");
        }

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .phone(request.phone())
                .cpf(request.cpf())
                .birthDate(request.birthDate())
                .passwordHash(passwordEncoder.encode(request.password()))
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
}
