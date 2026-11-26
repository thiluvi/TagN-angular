package com.tagn.backend.service;

import com.tagn.backend.domain.entity.Appointment;
import com.tagn.backend.domain.entity.User;
import com.tagn.backend.domain.enums.AppointmentStatus;
import com.tagn.backend.dto.request.AppointmentRequest;
import com.tagn.backend.dto.request.UpdateStatusRequest;
import com.tagn.backend.dto.response.AppointmentResponse;
import com.tagn.backend.exception.ConflictException;
import com.tagn.backend.exception.NotFoundException;
import com.tagn.backend.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private static final String DOCTOR_EMAIL = "dramarcela@gmail.com";
    private static final List<AppointmentStatus> OCCUPIED_STATUSES =
            List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED);
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final AppointmentRepository appointmentRepository;

    @Transactional
    public AppointmentResponse create(AppointmentRequest request, User user) {
        if (appointmentRepository.existsByScheduledAtAndStatusIn(request.scheduledAt(), OCCUPIED_STATUSES)) {
            throw new ConflictException("Este horário já está reservado. Escolha outro horário.");
        }

        Appointment appointment = Appointment.builder()
                .user(user)
                .scheduledAt(request.scheduledAt())
                .specialty(request.specialty())
                .notes(request.notes())
                .build();
        return AppointmentResponse.from(appointmentRepository.save(appointment));
    }

    @Transactional(readOnly = true)
    public List<String> getOccupiedSlots(LocalDate date) {
        return appointmentRepository
                .findByScheduledAtGreaterThanEqualAndScheduledAtLessThanAndStatusIn(
                        date.atStartOfDay(),
                        date.plusDays(1).atStartOfDay(),
                        OCCUPIED_STATUSES
                )
                .stream()
                .map(apt -> apt.getScheduledAt().format(TIME_FORMATTER))
                .distinct()
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> listForUser(UUID userId) {
        return appointmentRepository.findByUserId(userId)
                .stream()
                .map(AppointmentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> listAll(User actor) {
        if (actor == null || !DOCTOR_EMAIL.equalsIgnoreCase(actor.getEmail())) {
            throw new AccessDeniedException("Acesso restrito à Dra. Marcela.");
        }
        return appointmentRepository.findAll()
                .stream()
                .map(AppointmentResponse::from)
                .toList();
    }

    @Transactional
    public AppointmentResponse updateStatus(UUID id, UpdateStatusRequest request, User actor) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Agendamento não encontrado."));

        boolean isDoctor = actor != null && DOCTOR_EMAIL.equalsIgnoreCase(actor.getEmail());
        boolean isOwnerCancelling = actor != null
                && appointment.getUser().getId().equals(actor.getId())
                && request.status() == AppointmentStatus.CANCELLED;

        if (!isDoctor && !isOwnerCancelling) {
            throw new AccessDeniedException("Você não tem permissão para alterar este agendamento.");
        }

        appointment.setStatus(request.status());

        if (request.notes() != null && !request.notes().isBlank()) {
            String newNote = request.notes().trim();
            String existing = appointment.getNotes();
            appointment.setNotes(
                    (existing != null && !existing.isBlank())
                            ? existing + "\n" + newNote
                            : newNote
            );
        }

        return AppointmentResponse.from(appointmentRepository.save(appointment));
    }
}
