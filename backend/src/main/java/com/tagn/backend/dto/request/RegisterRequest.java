package com.tagn.backend.dto.request;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record RegisterRequest(
        @NotBlank String name,
        @NotBlank @Email String email,
        @NotBlank String phone,
        @NotBlank String cpf,
        @NotNull LocalDate birthDate,
        @NotBlank @Size(min = 6) String password
) {}
