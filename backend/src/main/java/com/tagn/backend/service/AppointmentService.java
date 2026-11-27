package com.tagn.backend.service;

import com.tagn.backend.domain.entity.Appointment;
import com.tagn.backend.domain.entity.User;
import com.tagn.backend.domain.enums.AppointmentStatus;
import com.tagn.backend.domain.enums.Role;
import com.tagn.backend.dto.request.AppointmentRequest;
import com.tagn.backend.dto.request.UpdateImagesRequest;
import com.tagn.backend.dto.request.UpdateNotesRequest;
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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AppointmentService {

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
        if (actor == null || actor.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Acesso restrito a administradores.");
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

        boolean isAdmin = actor != null && actor.getRole() == Role.ADMIN;
        boolean isOwnerCancelling = actor != null
                && appointment.getUser().getId().equals(actor.getId())
                && request.status() == AppointmentStatus.CANCELLED;

        if (!isAdmin && !isOwnerCancelling) {
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

        if (isAdmin && request.images() != null && !request.images().isEmpty()) {
            if (appointment.getImages() == null) {
                appointment.setImages(new ArrayList<>(request.images()));
            } else {
                appointment.getImages().clear();
                appointment.getImages().addAll(request.images());
            }
        }

        return AppointmentResponse.from(appointmentRepository.save(appointment));
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getById(UUID id, User actor) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Agendamento não encontrado."));

        boolean isAdmin = actor != null && actor.getRole() == Role.ADMIN;
        boolean isOwner = actor != null && appointment.getUser().getId().equals(actor.getId());

        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException("Você não tem permissão para visualizar este agendamento.");
        }

        return AppointmentResponse.from(appointment);
    }

    @Transactional
    public AppointmentResponse updateNotes(UUID id, UpdateNotesRequest request, User actor) {
        if (actor == null || actor.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Acesso restrito a administradores.");
        }

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Agendamento não encontrado."));

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED
                && appointment.getStatus() != AppointmentStatus.COMPLETED
                && appointment.getStatus() != AppointmentStatus.CANCELLED) {
            throw new IllegalArgumentException("Notas só podem ser editadas em consultas confirmadas, finalizadas ou canceladas.");
        }

        String normalized = request.notes() != null ? request.notes().trim() : null;
        appointment.setNotes(normalized != null && !normalized.isEmpty() ? normalized : null);

        return AppointmentResponse.from(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentResponse updateImages(UUID id, UpdateImagesRequest request, User actor) {
        if (actor == null || actor.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Acesso restrito a administradores.");
        }

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Agendamento não encontrado."));

        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
            throw new IllegalArgumentException("Fotos só podem ser alteradas em consultas finalizadas.");
        }

        List<String> updatedImages = request.images() != null
                ? request.images()
                : List.of();
        if (appointment.getImages() == null) {
            appointment.setImages(new ArrayList<>(updatedImages));
        } else {
            appointment.getImages().clear();
            appointment.getImages().addAll(updatedImages);
        }

        return AppointmentResponse.from(appointmentRepository.save(appointment));
    }
}
