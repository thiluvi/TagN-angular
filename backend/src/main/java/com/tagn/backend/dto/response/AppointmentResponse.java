package com.tagn.backend.dto.response;

import com.tagn.backend.domain.entity.Appointment;
import com.tagn.backend.domain.enums.AppointmentStatus;
import com.tagn.backend.domain.enums.Specialty;

import java.time.LocalDateTime;
import java.util.UUID;

public record AppointmentResponse(
        UUID id,
        UUID userId,
        String userName,
        LocalDateTime scheduledAt,
        Specialty specialty,
        AppointmentStatus status,
        String notes,
        LocalDateTime createdAt
) {
    public static AppointmentResponse from(Appointment a) {
        return new AppointmentResponse(
                a.getId(),
                a.getUser().getId(),
                a.getUser().getName(),
                a.getScheduledAt(),
                a.getSpecialty(),
                a.getStatus(),
                a.getNotes(),
                a.getCreatedAt()
        );
    }
}
