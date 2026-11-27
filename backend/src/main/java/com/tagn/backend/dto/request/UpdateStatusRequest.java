package com.tagn.backend.dto.request;

import com.tagn.backend.domain.enums.AppointmentStatus;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record UpdateStatusRequest(
        @NotNull AppointmentStatus status,
        String notes,
        List<String> images
) {}
