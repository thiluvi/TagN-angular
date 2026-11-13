package com.tagn.backend.dto.response;

import com.tagn.backend.domain.entity.User;
import com.tagn.backend.domain.enums.Role;

import java.time.LocalDate;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String name,
        String email,
        String phone,
        String cpf,
        LocalDate birthDate,
        Role role
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getCpf(),
                user.getBirthDate(),
                user.getRole()
        );
    }
}
