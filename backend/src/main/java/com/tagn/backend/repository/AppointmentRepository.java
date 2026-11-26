package com.tagn.backend.repository;

import com.tagn.backend.domain.entity.Appointment;
import com.tagn.backend.domain.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    List<Appointment> findByUserId(UUID userId);

    List<Appointment> findByScheduledAtGreaterThanEqualAndScheduledAtLessThanAndStatusIn(
            LocalDateTime start,
            LocalDateTime end,
            Collection<AppointmentStatus> statuses
    );

    boolean existsByScheduledAtAndStatusIn(
            LocalDateTime scheduledAt,
            Collection<AppointmentStatus> statuses
    );
}
