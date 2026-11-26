package com.tagn.backend.controller;

import com.tagn.backend.domain.entity.User;
import com.tagn.backend.dto.request.ChangePasswordRequest;
import com.tagn.backend.dto.request.UpdatePhoneRequest;
import com.tagn.backend.dto.response.UserResponse;
import com.tagn.backend.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal User user) {
        return UserResponse.from(user);
    }

    @PutMapping("/me/phone")
    public UserResponse updatePhone(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdatePhoneRequest request
    ) {
        user.setPhone(request.phone().trim());
        return UserResponse.from(userRepository.save(user));
    }

    @PutMapping("/me/password")
    public Map<String, String> changePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Senha atual incorreta.");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        return Map.of("message", "Senha alterada com sucesso.");
    }
}
