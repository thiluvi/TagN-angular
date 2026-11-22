package com.tagn.backend.service;

import com.tagn.backend.domain.entity.Appointment;
import com.tagn.backend.domain.entity.User;
import com.tagn.backend.dto.request.AppointmentRequest;
import com.tagn.backend.dto.request.UpdateStatusRequest;
import com.tagn.backend.dto.response.AppointmentResponse;
import com.tagn.backend.exception.NotFoundException;
import com.tagn.backend.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    @Transactional
    public AppointmentResponse create(AppointmentRequest request, User user) {
        Appointment appointment = Appointment.builder()
                .user(user)
                .scheduledAt(request.scheduledAt())
                .specialty(request.specialty())
                .notes(request.notes())
                .build();
        return AppointmentResponse.from(appointmentRepository.save(appointment));
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> listForUser(UUID userId) {
        return appointmentRepository.findByUserId(userId)
                .stream()
                .map(AppointmentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> listAll() {
        return appointmentRepository.findAll()
                .stream()
                .map(AppointmentResponse::from)
                .toList();
    }

    @Transactional
    public AppointmentResponse updateStatus(UUID id, UpdateStatusRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Agendamento não encontrado."));
        appointment.setStatus(request.status());
        return AppointmentResponse.from(appointmentRepository.save(appointment));
    }
}
