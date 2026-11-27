package com.tagn.backend.dto.response;

import com.tagn.backend.domain.entity.Appointment;
import com.tagn.backend.domain.enums.AppointmentStatus;
import com.tagn.backend.domain.enums.Specialty;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record AppointmentResponse(
        UUID id,
        UUID userId,
        String userName,
        LocalDateTime scheduledAt,
        Specialty specialty,
        AppointmentStatus status,
        String notes,
        List<String> images,
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
                a.getImages() != null ? List.copyOf(a.getImages()) : List.of(),
                a.getCreatedAt()
        );
    }
}
