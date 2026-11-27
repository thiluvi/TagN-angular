import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import {
  Appointment,
  AppointmentService,
  SpecialtyType,
} from '../../core/services/appointment.service';

const SPECIALTY_LABELS: Record<SpecialtyType, string> = {
  HARMONIZACAO: 'Harmonização Facial',
  CLAREAMENTO: 'Clareamento',
  ODONTOLOGIA: 'Odontologia',
  PREENCHIMENTO_LABIAL: 'Preenchimento Labial',
  BOTOX: 'Botox',
  BICHECTOMIA: 'Bichectomia',
};

const WEEKDAYS = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

const MONTHS_FULL = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

const MONTHS_SHORT = [
  'JAN',
  'FEV',
  'MAR',
  'ABR',
  'MAI',
  'JUN',
  'JUL',
  'AGO',
  'SET',
  'OUT',
  'NOV',
  'DEZ',
];

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-appointments.component.html',
  styleUrl: './my-appointments.component.scss',
})
export class MyAppointmentsComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly router = inject(Router);

  protected readonly appointments = signal<Appointment[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly activeTab = signal<'proximos' | 'historico'>('proximos');
  protected readonly selectedDetail = signal<Appointment | null>(null);
  protected readonly rescheduleTarget = signal<Appointment | null>(null);
  protected readonly cancelTarget = signal<Appointment | null>(null);
  protected readonly cancellingId = signal<string | null>(null);

  protected readonly upcomingAppointments = computed(() => {
    const now = new Date();
    return this.appointments()
      .filter(
        (apt) =>
          apt.status !== 'CANCELLED' &&
          apt.status !== 'COMPLETED' &&
          new Date(apt.scheduledAt) >= now
      )
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  });

  protected readonly historyAppointments = computed(() => {
    const now = new Date();
    return this.appointments()
      .filter(
        (apt) =>
          apt.status === 'CANCELLED' ||
          apt.status === 'COMPLETED' ||
          new Date(apt.scheduledAt) < now
      )
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  });

  protected readonly confirmedCount = computed(
    () => this.upcomingAppointments().filter((apt) => apt.status === 'CONFIRMED').length
  );

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.loadAppointments();
    } else {
      this.isLoading.set(false);
    }
  }

  protected loadAppointments(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.appointmentService.getMyAppointments().subscribe({
      next: (list) => {
        this.appointments.set(list);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Não foi possível carregar seus agendamentos no momento.');
      },
    });
  }

  protected setTab(tab: 'proximos' | 'historico'): void {
    this.activeTab.set(tab);
  }

  protected openDetails(apt: Appointment): void {
    this.selectedDetail.set(apt);
  }

  protected closeDetails(): void {
    this.selectedDetail.set(null);
  }

  protected openCancelConfirm(apt: Appointment): void {
    if (this.cancellingId()) return;
    this.cancelTarget.set(apt);
  }

  protected closeCancelConfirm(): void {
    if (this.cancellingId()) return;
    this.cancelTarget.set(null);
  }

  protected confirmCancel(): void {
    const target = this.cancelTarget();
    if (!target) return;
    this.cancelAppointment(target);
  }

  protected cancelAppointment(apt: Appointment): void {
    if (this.cancellingId()) return;
    this.cancellingId.set(apt.id);
    this.errorMessage.set(null);

    this.appointmentService.cancel(apt.id).subscribe({
      next: (updated) => {
        this.appointments.update((list) =>
          list.map((item) => (item.id === updated.id ? updated : item))
        );
        this.cancellingId.set(null);
        this.cancelTarget.set(null);
        if (this.selectedDetail()?.id === updated.id) {
          this.selectedDetail.set(updated);
        }
      },
      error: () => {
        this.cancellingId.set(null);
        this.cancelTarget.set(null);
        this.errorMessage.set('Não foi possível cancelar o agendamento. Tente novamente.');
      },
    });
  }

  protected openAuthModal(): void {
    this.authService.openAuthModal('login', '/meus-agendamentos');
  }

  protected goToNewAppointment(): void {
    void this.router.navigate(['/agendamento']);
  }

  protected openRescheduleConfirm(apt: Appointment): void {
    this.rescheduleTarget.set(apt);
  }

  protected closeRescheduleConfirm(): void {
    this.rescheduleTarget.set(null);
  }

  protected confirmReschedule(): void {
    const target = this.rescheduleTarget();
    if (!target) return;
    this.rescheduleTarget.set(null);
    void this.router.navigate(['/agendamento'], {
      queryParams: { rescheduleId: target.id },
    });
  }

  protected padCount(count: number): string {
    return String(count).padStart(2, '0');
  }

  protected formatDayNumber(iso: string): string {
    const d = new Date(iso);
    return String(d.getDate()).padStart(2, '0');
  }

  protected formatMonthYearShort(iso: string): string {
    const d = new Date(iso);
    return `${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
  }

  protected formatFullDateTime(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS_FULL[d.getMonth()]} de ${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  protected formatShortDate(iso: string): string {
    const d = new Date(iso);
    return `${d.getDate()} de ${MONTHS_FULL[d.getMonth()]} de ${d.getFullYear()}`;
  }

  protected formatWeekdayTime(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${WEEKDAYS[d.getDay()]} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  protected formatSpecialty(specialty: SpecialtyType): string {
    return SPECIALTY_LABELS[specialty] ?? specialty;
  }

  protected formatStatusLabel(apt: Appointment, isHistory = false): string {
    if (apt.status === 'CANCELLED') return 'Cancelado';
    if (apt.status === 'COMPLETED' || (isHistory && apt.status === 'CONFIRMED')) return 'Realizado';
    if (apt.status === 'CONFIRMED') return 'Confirmado';
    return 'Aguardando confirmação';
  }
}
