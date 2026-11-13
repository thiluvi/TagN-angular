package com.tagn.backend.dto.request;

import com.tagn.backend.domain.enums.Specialty;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record AppointmentRequest(
        @NotNull @Future LocalDateTime scheduledAt,
        @NotNull Specialty specialty,
        String notes
) {}
