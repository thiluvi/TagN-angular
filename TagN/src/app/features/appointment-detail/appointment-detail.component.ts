import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './appointment-detail.component.html',
  styleUrl: './appointment-detail.component.scss',
})
export class AppointmentDetailComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly appointment = signal<Appointment | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  // Edição de notas (Admin em CONFIRMED, COMPLETED ou CANCELLED)
  protected readonly isEditingNotes = signal(false);
  protected readonly notesDraft = signal('');
  protected readonly isSavingNotes = signal(false);

  // Edição de fotos (Admin em COMPLETED)
  protected readonly isEditingImages = signal(false);
  protected readonly imagesDraft = signal<string[]>([]);
  protected readonly isSavingImages = signal(false);

  // Lightbox de visualização
  protected readonly previewImage = signal<string | null>(null);

  protected readonly backRoute = computed(() =>
    this.authService.isAdmin() ? '/agendamentos' : '/meus-agendamentos'
  );

  protected readonly canEditNotes = computed(() => {
    const apt = this.appointment();
    if (!apt || !this.authService.isAdmin()) return false;
    return apt.status === 'CONFIRMED' || apt.status === 'COMPLETED' || apt.status === 'CANCELLED';
  });

  protected readonly canEditImages = computed(() => {
    const apt = this.appointment();
    if (!apt || !this.authService.isAdmin()) return false;
    return apt.status === 'COMPLETED';
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.isLoading.set(false);
      this.errorMessage.set('Agendamento não encontrado.');
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.isLoading.set(false);
      this.authService.openAuthModal('login', `/consulta/${id}`);
      return;
    }

    this.loadAppointment(id);
  }

  private loadAppointment(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.appointmentService.getById(id).subscribe({
      next: (apt) => {
        this.appointment.set(apt);
        this.isLoading.set(false);
      },
      error: (err: { error?: { detail?: string } }) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.detail ?? 'Não foi possível carregar os detalhes da consulta.'
        );
      },
    });
  }

  // ── Edição de Notas ───────────────────────────────────────────
  protected startEditNotes(): void {
    const apt = this.appointment();
    if (!apt) return;
    this.notesDraft.set(apt.notes ?? '');
    this.isEditingNotes.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  protected cancelEditNotes(): void {
    if (this.isSavingNotes()) return;
    this.isEditingNotes.set(false);
  }

  protected saveNotes(): void {
    const apt = this.appointment();
    if (!apt || this.isSavingNotes()) return;

    this.isSavingNotes.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.appointmentService.updateNotes(apt.id, this.notesDraft()).subscribe({
      next: (updated) => {
        this.appointment.set(updated);
        this.isSavingNotes.set(false);
        this.isEditingNotes.set(false);
        this.successMessage.set('Notas atualizadas com sucesso.');
      },
      error: (err: { error?: { detail?: string } }) => {
        this.isSavingNotes.set(false);
        this.errorMessage.set(err.error?.detail ?? 'Não foi possível salvar as notas.');
      },
    });
  }

  // ── Edição de Fotos ───────────────────────────────────────────
  protected startEditImages(): void {
    const apt = this.appointment();
    if (!apt) return;
    this.imagesDraft.set([...(apt.images ?? [])]);
    this.isEditingImages.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  protected cancelEditImages(): void {
    if (this.isSavingImages()) return;
    this.isEditingImages.set(false);
  }

  protected onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    Array.from(input.files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      this.compressImage(file, (dataUrl) => {
        this.imagesDraft.update((imgs) => [...imgs, dataUrl]);
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

  protected removeDraftImage(index: number): void {
    this.imagesDraft.update((imgs) => imgs.filter((_, i) => i !== index));
  }

  protected saveImages(): void {
    const apt = this.appointment();
    if (!apt || this.isSavingImages()) return;

    this.isSavingImages.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.appointmentService.updateImages(apt.id, this.imagesDraft()).subscribe({
      next: (updated) => {
        this.appointment.set(updated);
        this.isSavingImages.set(false);
        this.isEditingImages.set(false);
        this.successMessage.set('Fotos atualizadas com sucesso.');
      },
      error: (err: { error?: { detail?: string } }) => {
        this.isSavingImages.set(false);
        this.errorMessage.set(err.error?.detail ?? 'Não foi possível salvar as fotos.');
      },
    });
  }

  protected openPreview(img: string): void {
    this.previewImage.set(img);
  }

  protected closePreview(): void {
    this.previewImage.set(null);
  }

  protected goBack(): void {
    void this.router.navigate([this.backRoute()]);
  }

  // ── Formatação ────────────────────────────────────────────────
  protected formatCode(apt: Appointment): string {
    const year = new Date(apt.scheduledAt).getFullYear();
    const short = apt.id.replace(/-/g, '').slice(0, 4).toUpperCase();
    return `AG-${year}-${short}`;
  }

  protected formatFullDateTime(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS_FULL[d.getMonth()]} de ${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  protected formatCreatedAt(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} às ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  protected formatSpecialty(specialty: SpecialtyType): string {
    return SPECIALTY_LABELS[specialty] ?? specialty;
  }

  protected formatStatusLabel(apt: Appointment): string {
    if (apt.status === 'CANCELLED') return 'Cancelado';
    if (apt.status === 'COMPLETED') return 'Realizado';
    if (apt.status === 'CONFIRMED') return 'Confirmado';
    return 'Aguardando confirmação';
  }
}
