package com.tagn.backend.controller;

import com.tagn.backend.domain.entity.User;
import com.tagn.backend.dto.request.AppointmentRequest;
import com.tagn.backend.dto.request.UpdateStatusRequest;
import com.tagn.backend.dto.response.AppointmentResponse;
import com.tagn.backend.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping
    public List<AppointmentResponse> allAppointments() {
        return appointmentService.listAll();
    }

    @PutMapping("/{id}/status")
    public AppointmentResponse updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateStatusRequest request
    ) {
        return appointmentService.updateStatus(id, request);
    }
}
