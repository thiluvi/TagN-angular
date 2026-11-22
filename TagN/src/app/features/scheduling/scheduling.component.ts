import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Appointment, AppointmentService } from '../../core/services/appointment.service';

@Component({
  selector: 'app-scheduling',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './scheduling.component.html',
  styleUrl: './scheduling.component.scss',
})
export class SchedulingComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly appointmentService = inject(AppointmentService);

  protected readonly appointments = signal<Appointment[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly minDate: string = this.getTomorrowIsoDate();

  protected readonly form = new FormGroup({
    specialty: new FormControl<'ODONTOLOGIA' | 'HARMONIZACAO'>('ODONTOLOGIA', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    date: new FormControl(this.minDate, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    time: new FormControl('14:00', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    notes: new FormControl(''),
  });

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.loadAppointments();
    }
  }

  protected loadAppointments(): void {
    this.appointmentService.getMyAppointments().subscribe({
      next: (list: Appointment[]) => {
        this.appointments.set(list);
      },
      error: () => {
        // Silently keep current list
      },
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const scheduledAt = `${raw.date}T${raw.time}:00`;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.appointmentService
      .create({
        scheduledAt,
        specialty: raw.specialty,
        notes: raw.notes || undefined,
      })
      .subscribe({
        next: (apt: Appointment) => {
          this.isLoading.set(false);
          this.successMessage.set('Agendamento solicitado com sucesso! A equipe entrará em contato para confirmar.');
          this.appointments.update((current) => [apt, ...current]);
          this.form.patchValue({ notes: '' });
        },
        error: (err: { error?: { detail?: string } }) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.detail ?? 'Não foi possível agendar. Tente outro horário.');
        },
      });
  }

  protected formatStatus(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'CONFIRMED':
        return 'Confirmado';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  }

  private getTomorrowIsoDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }
}
