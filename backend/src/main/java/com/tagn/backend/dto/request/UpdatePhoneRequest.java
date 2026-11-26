package com.tagn.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public record UpdatePhoneRequest(
        @NotBlank(message = "Telefone é obrigatório.") String phone
) {}
