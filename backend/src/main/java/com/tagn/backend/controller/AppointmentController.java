package com.tagn.backend.controller;

import com.tagn.backend.domain.entity.User;
import com.tagn.backend.dto.request.AppointmentRequest;
import com.tagn.backend.dto.request.UpdateImagesRequest;
import com.tagn.backend.dto.request.UpdateNotesRequest;
import com.tagn.backend.dto.request.UpdateStatusRequest;
import com.tagn.backend.dto.response.AppointmentResponse;
import com.tagn.backend.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AppointmentResponse create(
            @Valid @RequestBody AppointmentRequest request,
            @AuthenticationPrincipal User user
    ) {
        return appointmentService.create(request, user);
    }

    @GetMapping("/me")
    public List<AppointmentResponse> myAppointments(@AuthenticationPrincipal User user) {
        return appointmentService.listForUser(user.getId());
    }

    @GetMapping("/occupied")
    public List<String> occupiedSlots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return appointmentService.getOccupiedSlots(date);
    }

    @GetMapping
    public List<AppointmentResponse> allAppointments(@AuthenticationPrincipal User user) {
        return appointmentService.listAll(user);
    }

    @PutMapping("/{id}/status")
    public AppointmentResponse updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateStatusRequest request,
            @AuthenticationPrincipal User user
    ) {
        return appointmentService.updateStatus(id, request, user);
    }

    @GetMapping("/{id}")
    public AppointmentResponse getById(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user
    ) {
        return appointmentService.getById(id, user);
    }

    @PutMapping("/{id}/notes")
    public AppointmentResponse updateNotes(
            @PathVariable UUID id,
            @RequestBody UpdateNotesRequest request,
            @AuthenticationPrincipal User user
    ) {
        return appointmentService.updateNotes(id, request, user);
    }

    @PutMapping("/{id}/images")
    public AppointmentResponse updateImages(
            @PathVariable UUID id,
            @RequestBody UpdateImagesRequest request,
            @AuthenticationPrincipal User user
    ) {
        return appointmentService.updateImages(id, request, user);
    }
}
