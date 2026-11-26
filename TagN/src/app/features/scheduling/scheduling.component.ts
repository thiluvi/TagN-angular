import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Appointment, AppointmentService, SpecialtyType } from '../../core/services/appointment.service';

type Specialty = SpecialtyType;

interface SpecialtyOption {
  value: Specialty;
  label: string;
}

interface TimeSlot {
  time: string;   // "HH:MM"
  period: 'manha' | 'tarde';
}

@Component({
  selector: 'app-scheduling',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './scheduling.component.html',
  styleUrl: './scheduling.component.scss',
})
export class SchedulingComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly router = inject(Router);

  // ── estado da UI ──────────────────────────────────────────────
  protected readonly isLoading   = signal(false);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly errorMessage   = signal<string | null>(null);

  // ── seleções do usuário ───────────────────────────────────────
  protected selectedSpecialties = signal<Specialty[]>([]);
  protected selectedDate        = signal<Date | null>(null);
  protected selectedSlot        = signal<TimeSlot | null>(null);
  protected occupiedSlots       = signal<string[]>([]);

  // ── calendário ────────────────────────────────────────────────
  protected calendarYear  = signal(new Date().getFullYear());
  protected calendarMonth = signal(new Date().getMonth()); // 0-based

  protected readonly today = new Date();

  protected readonly calendarDays = computed<(Date | null)[]>(() => {
    const year  = this.calendarYear();
    const month = this.calendarMonth();
    const first = new Date(year, month, 1).getDay(); // 0 = Dom
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = Array(first).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(year, month, d));
    }
    // fill trailing
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  });

  protected readonly monthLabel = computed(() => {
    const names = [
      'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
      'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
    ];
    return `${names[this.calendarMonth()]} ${this.calendarYear()}`;
  });

  protected readonly dayLabel = computed(() => {
    const d = this.selectedDate();
    if (!d) return '';
    const days = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
    const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    return `${days[d.getDay()]}`;
  });

  protected readonly dayNumber = computed(() => {
    const d = this.selectedDate();
    if (!d) return '';
    const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    return `${d.getDate()} de ${months[d.getMonth()]}`;
  });

  // ── especialidades ────────────────────────────────────────────
  protected readonly specialties: readonly SpecialtyOption[] = [
    { value: 'HARMONIZACAO', label: 'Harmonização Facial' },
    { value: 'CLAREAMENTO', label: 'Clareamento' },
    { value: 'ODONTOLOGIA', label: 'Odontologia' },
    { value: 'PREENCHIMENTO_LABIAL', label: 'Preenchimento Labial' },
    { value: 'BOTOX', label: 'Botox' },
    { value: 'BICHECTOMIA', label: 'Bichectomia' },
  ];

  // ── horários disponíveis ──────────────────────────────────────
  protected readonly morningSlots: TimeSlot[] = [
    { time: '09:00', period: 'manha' },
    { time: '09:30', period: 'manha' },
    { time: '10:00', period: 'manha' },
    { time: '10:30', period: 'manha' },
  ];

  protected readonly afternoonSlots: TimeSlot[] = [
    { time: '14:00', period: 'tarde' },
    { time: '14:30', period: 'tarde' },
    { time: '15:00', period: 'tarde' },
    { time: '15:30', period: 'tarde' },
  ];

  // ── resumo da escolha ─────────────────────────────────────────
  protected readonly summaryReady = computed(() =>
    this.selectedSpecialties().length > 0 && !!this.selectedDate() && !!this.selectedSlot()
  );

  protected readonly summaryText = computed(() => {
    const d    = this.selectedDate();
    const slot = this.selectedSlot();
    if (!d || !slot) return '';
    const days = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
    const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    return `${days[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()} · ${slot.time}`;
  });

  protected readonly specialtyLabel = computed(() => {
    const selected = this.selectedSpecialties();
    return selected
      .map((val) => this.specialties.find((s) => s.value === val)?.label ?? val)
      .join(', ');
  });

  // ── lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    // seleciona amanhã por padrão e carrega horários ocupados
    const start = new Date();
    start.setDate(start.getDate() + 1);
    this.selectedDate.set(start);
    this.calendarYear.set(start.getFullYear());
    this.calendarMonth.set(start.getMonth());
    this.loadOccupiedSlots(start);
  }

  // ── ações de calendário ───────────────────────────────────────
  protected prevMonth(): void {
    const m = this.calendarMonth();
    if (m === 0) {
      this.calendarMonth.set(11);
      this.calendarYear.update(y => y - 1);
    } else {
      this.calendarMonth.update(m => m - 1);
    }
  }

  protected nextMonth(): void {
    const m = this.calendarMonth();
    if (m === 11) {
      this.calendarMonth.set(0);
      this.calendarYear.update(y => y + 1);
    } else {
      this.calendarMonth.update(m => m + 1);
    }
  }

  protected selectDay(day: Date | null): void {
    if (!day || this.isPast(day)) return;
    this.selectedDate.set(day);
    this.selectedSlot.set(null);
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.loadOccupiedSlots(day);
  }

  private loadOccupiedSlots(date: Date): void {
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateIso = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

    this.appointmentService.getOccupiedSlots(dateIso).subscribe({
      next: (slots) => {
        this.occupiedSlots.set(slots);
        const currentSlot = this.selectedSlot();
        if (currentSlot && slots.includes(currentSlot.time)) {
          this.selectedSlot.set(null);
        }
      },
      error: () => {
        this.occupiedSlots.set([]);
      },
    });
  }

  protected isPast(day: Date): boolean {
    const t = new Date(this.today);
    t.setHours(0, 0, 0, 0);
    const d = new Date(day);
    d.setHours(0, 0, 0, 0);
    return d <= t;
  }

  protected isToday(day: Date): boolean {
    return day.toDateString() === this.today.toDateString();
  }

  protected isSelected(day: Date | null): boolean {
    if (!day) return false;
    const sel = this.selectedDate();
    return !!sel && sel.toDateString() === day.toDateString();
  }

  protected isSameMonth(day: Date | null): boolean {
    if (!day) return false;
    return day.getMonth() === this.calendarMonth();
  }

  // ── ações de especialidade e horário ─────────────────────────
  protected toggleSpecialty(value: Specialty): void {
    this.selectedSpecialties.update((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  protected isSpecialtySelected(value: Specialty): boolean {
    return this.selectedSpecialties().includes(value);
  }

  protected selectSlot(slot: TimeSlot): void {
    if (this.isSlotUnavailable(slot)) return;
    this.selectedSlot.set(slot);
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  protected isSlotSelected(slot: TimeSlot): boolean {
    const s = this.selectedSlot();
    return !!s && s.time === slot.time;
  }

  protected isSlotUnavailable(slot: TimeSlot): boolean {
    return this.occupiedSlots().includes(slot.time);
  }

  // ── submissão ─────────────────────────────────────────────────
  protected submit(): void {
    const specialties = this.selectedSpecialties();
    const date        = this.selectedDate();
    const slot        = this.selectedSlot();
    if (specialties.length === 0 || !date || !slot || this.isLoading()) return;

    const [h, m] = slot.time.split(':');
    const dt = new Date(date);
    dt.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);

    // ISO local sem timezone shift
    const pad = (n: number) => String(n).padStart(2, '0');
    const scheduledAt =
      `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}` +
      `T${pad(dt.getHours())}:${pad(dt.getMinutes())}:00`;

    const notes =
      specialties.length > 1
        ? `Especialidades selecionadas: ${this.specialtyLabel()}`
        : undefined;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.appointmentService
      .create({ scheduledAt, specialty: specialties[0], notes })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.selectedSlot.set(null);
          void this.router.navigate(['/meus-agendamentos']);
        },
        error: (err: { error?: { detail?: string } }) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            err.error?.detail ?? 'Não foi possível agendar. Tente outro horário.'
          );
        },
      });
  }

  protected openAuthModal(): void {
    this.authService.openAuthModal('login', '/agendamento');
  }
}
