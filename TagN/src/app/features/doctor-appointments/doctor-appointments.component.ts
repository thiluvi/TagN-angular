import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import {
  Appointment,
  AppointmentService,
  AppointmentStatus,
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

type ActionType = 'CONFIRM' | 'CANCEL' | 'COMPLETE';

interface PendingActionModal {
  appointment: Appointment;
  type: ActionType;
  step: 'confirm' | 'note' | 'images';
}

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-appointments.component.html',
  styleUrl: './doctor-appointments.component.scss',
})
export class DoctorAppointmentsComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly router = inject(Router);

  protected readonly appointments = signal<Appointment[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // Filtros
  protected readonly searchQuery = signal('');
  protected readonly periodFilter = signal<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  protected readonly startDate = signal('');
  protected readonly endDate = signal('');
  protected readonly specialtyFilter = signal<'' | SpecialtyType>('');
  protected readonly statusFilter = signal<'' | AppointmentStatus>('');

  // Paginação
  protected readonly pageSize = 5;
  protected readonly upcomingPage = signal(1);
  protected readonly historyPage = signal(1);

  // Overlays
  protected readonly actionModal = signal<PendingActionModal | null>(null);
  protected readonly actionNote = signal('');
  protected readonly pendingFinalNote = signal<string | undefined>(undefined);
  protected readonly actionImages = signal<string[]>([]);
  protected readonly modalError = signal<string | null>(null);
  protected readonly selectedDetail = signal<Appointment | null>(null);

  protected readonly specialtyOptions: readonly { value: SpecialtyType; label: string }[] = [
    { value: 'HARMONIZACAO', label: 'Harmonização Facial' },
    { value: 'CLAREAMENTO', label: 'Clareamento' },
    { value: 'ODONTOLOGIA', label: 'Odontologia' },
    { value: 'PREENCHIMENTO_LABIAL', label: 'Preenchimento Labial' },
    { value: 'BOTOX', label: 'Botox' },
    { value: 'BICHECTOMIA', label: 'Bichectomia' },
  ];

  private readonly filteredAppointments = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const period = this.periodFilter();
    const spec = this.specialtyFilter();
    const status = this.statusFilter();
    const now = new Date();

    return this.appointments().filter((apt) => {
      if (query) {
        const code = this.formatCode(apt).toLowerCase();
        const name = apt.userName.toLowerCase();
        if (!name.includes(query) && !code.includes(query)) return false;
      }

      if (spec && apt.specialty !== spec) return false;
      if (status && apt.status !== status) return false;

      if (period !== 'all') {
        const d = new Date(apt.scheduledAt);
        if (period === 'today') {
          if (d.toDateString() !== now.toDateString()) return false;
        } else if (period === 'week') {
          const end = new Date(now);
          end.setDate(now.getDate() + 7);
          if (d < now || d > end) return false;
        } else if (period === 'month') {
          if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
        } else if (period === 'custom') {
          const from = this.startDate();
          const to = this.endDate();
          if (from) {
            const start = new Date(`${from}T00:00:00`);
            if (d < start) return false;
          }
          if (to) {
            const end = new Date(`${to}T23:59:59.999`);
            if (d > end) return false;
          }
        }
      }

      return true;
    });
  });

  protected readonly totalCount = computed(() => this.filteredAppointments().length);

  protected readonly upcomingAppointments = computed(() => {
    const now = new Date();
    return this.filteredAppointments()
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
    return this.filteredAppointments()
      .filter(
        (apt) =>
          apt.status === 'CANCELLED' ||
          apt.status === 'COMPLETED' ||
          new Date(apt.scheduledAt) < now
      )
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  });

  // KPIs
  protected readonly upcomingConfirmedCount = computed(
    () => this.upcomingAppointments().filter((a) => a.status === 'CONFIRMED').length
  );
  protected readonly upcomingPendingCount = computed(
    () => this.upcomingAppointments().filter((a) => a.status === 'PENDING').length
  );
  protected readonly historyCompletedCount = computed(
    () =>
      this.historyAppointments().filter(
        (a) => a.status === 'COMPLETED' || a.status === 'CONFIRMED'
      ).length
  );
  protected readonly historyCancelledCount = computed(
    () => this.historyAppointments().filter((a) => a.status === 'CANCELLED').length
  );

  // Paginated slices
  protected readonly pagedUpcoming = computed(() => {
    const list = this.upcomingAppointments();
    const start = (this.upcomingPage() - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });

  protected readonly upcomingTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.upcomingAppointments().length / this.pageSize))
  );

  protected readonly pagedHistory = computed(() => {
    const list = this.historyAppointments();
    const start = (this.historyPage() - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });

  protected readonly historyTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.historyAppointments().length / this.pageSize))
  );

  ngOnInit(): void {
    if (this.authService.isDoctor()) {
      this.loadAppointments();
    } else {
      this.isLoading.set(false);
    }
  }

  protected loadAppointments(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.appointmentService.getAllAppointments().subscribe({
      next: (list) => {
        this.appointments.set(list);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Não foi possível carregar os agendamentos.');
      },
    });
  }

  protected clearFilters(): void {
    this.searchQuery.set('');
    this.periodFilter.set('all');
    this.startDate.set('');
    this.endDate.set('');
    this.specialtyFilter.set('');
    this.statusFilter.set('');
    this.upcomingPage.set(1);
    this.historyPage.set(1);
  }

  // ── Fluxo de Ações com Overlays ───────────────────────────────
  protected startAction(apt: Appointment, type: ActionType): void {
    this.actionNote.set('');
    this.pendingFinalNote.set(undefined);
    this.actionImages.set([]);
    this.modalError.set(null);
    this.actionModal.set({ appointment: apt, type, step: 'confirm' });
  }

  protected closeActionModal(): void {
    if (this.isSubmitting()) return;
    this.actionModal.set(null);
    this.actionNote.set('');
    this.pendingFinalNote.set(undefined);
    this.actionImages.set([]);
    this.modalError.set(null);
  }

  protected confirmFirstStep(): void {
    const modal = this.actionModal();
    if (!modal || this.isSubmitting()) return;

    // Avança para o overlay perguntando se deseja adicionar nota (CONFIRM, CANCEL e COMPLETE)
    this.actionModal.set({ ...modal, step: 'note' });
  }

  protected submitWithNote(includeNote: boolean): void {
    const modal = this.actionModal();
    if (!modal || this.isSubmitting()) return;

    const note = includeNote ? this.actionNote().trim() || undefined : undefined;

    if (modal.type === 'COMPLETE') {
      this.pendingFinalNote.set(note);
      this.actionModal.set({ ...modal, step: 'images' });
      return;
    }

    const statusMap: Record<ActionType, AppointmentStatus> = {
      CONFIRM: 'CONFIRMED',
      CANCEL: 'CANCELLED',
      COMPLETE: 'COMPLETED',
    };
    const targetStatus = statusMap[modal.type];

    this.executeStatusUpdate(modal.appointment.id, targetStatus, note);
  }

  protected onActionImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    Array.from(input.files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      this.compressImage(file, (dataUrl) => {
        this.actionImages.update((imgs) => [...imgs, dataUrl]);
      });
    });
    input.value = '';
  }

  private compressImage(file: File, onDone: (dataUrl: string) => void): void {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') return;

      const img = new Image();
      img.onload = () => {
        const maxDim = 1280;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          onDone(result);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        onDone(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => onDone(result);
      img.src = result;
    };
    reader.readAsDataURL(file);
  }

  protected removeActionImage(index: number): void {
    this.actionImages.update((imgs) => imgs.filter((_, i) => i !== index));
  }

  protected submitWithImages(includeImages: boolean): void {
    const modal = this.actionModal();
    if (!modal || this.isSubmitting()) return;

    const images = includeImages ? this.actionImages() : undefined;
    this.executeStatusUpdate(
      modal.appointment.id,
      'COMPLETED',
      this.pendingFinalNote(),
      images && images.length > 0 ? images : undefined
    );
  }

  private executeStatusUpdate(
    id: string,
    status: AppointmentStatus,
    notes?: string,
    images?: string[]
  ): void {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.modalError.set(null);

    this.appointmentService.updateStatus(id, status, notes, images).subscribe({
      next: (updated) => {
        this.appointments.update((list) =>
          list.map((item) => (item.id === updated.id ? updated : item))
        );
        this.isSubmitting.set(false);
        this.actionModal.set(null);
        this.actionNote.set('');
        this.pendingFinalNote.set(undefined);
        this.actionImages.set([]);
        this.modalError.set(null);
      },
      error: (err: { error?: { detail?: string; message?: string } }) => {
        this.isSubmitting.set(false);
        const msg =
          err.error?.detail ??
          err.error?.message ??
          'Não foi possível atualizar o status do agendamento.';
        this.modalError.set(msg);
        this.errorMessage.set(msg);
      },
    });
  }

  // ── Detalhes ──────────────────────────────────────────────────
  protected openDetails(apt: Appointment): void {
    void this.router.navigate(['/consulta', apt.id]);
  }

  protected closeDetails(): void {
    this.selectedDetail.set(null);
  }

  // ── Paginação helpers ─────────────────────────────────────────
  protected setUpcomingPage(page: number): void {
    if (page >= 1 && page <= this.upcomingTotalPages()) {
      this.upcomingPage.set(page);
    }
  }

  protected setHistoryPage(page: number): void {
    if (page >= 1 && page <= this.historyTotalPages()) {
      this.historyPage.set(page);
    }
  }

  // ── Formatação ────────────────────────────────────────────────
  protected pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  protected formatCode(apt: Appointment): string {
    const year = new Date(apt.scheduledAt).getFullYear();
    const short = apt.id.replace(/-/g, '').slice(0, 4).toUpperCase();
    return `AG-${year}-${short}`;
  }

  protected formatDateShort(iso: string): string {
    const d = new Date(iso);
    return `${this.pad(d.getDate())}/${this.pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  }

  protected formatWeekday(iso: string): string {
    return WEEKDAYS[new Date(iso).getDay()];
  }

  protected formatTime(iso: string): string {
    const d = new Date(iso);
    return `${this.pad(d.getHours())}:${this.pad(d.getMinutes())}`;
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
