import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CustomValidators } from '../../core/validators/custom-validators';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent implements OnInit {
  protected readonly authService = inject(AuthService);

  protected readonly activeTab = signal<'dados' | 'seguranca'>('dados');

  protected readonly isSavingPhone = signal(false);
  protected readonly phoneSuccess = signal<string | null>(null);
  protected readonly phoneError = signal<string | null>(null);

  protected readonly isSavingPassword = signal(false);
  protected readonly passwordSuccess = signal<string | null>(null);
  protected readonly passwordError = signal<string | null>(null);

  protected readonly phoneForm = new FormGroup({
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, CustomValidators.phone],
    }),
  });

  protected readonly passwordForm = new FormGroup({
    currentPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    newPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
    confirmNewPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, CustomValidators.matchValues('newPassword')],
    }),
  });

  constructor() {
    this.passwordForm.controls.newPassword.valueChanges.subscribe(() => {
      this.passwordForm.controls.confirmNewPassword.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user?.phone) {
      this.phoneForm.patchValue({ phone: CustomValidators.formatPhone(user.phone) });
    }

    if (this.authService.isAuthenticated()) {
      this.authService.fetchProfile().subscribe({
        next: (freshUser) => {
          if (freshUser.phone) {
            this.phoneForm.patchValue({ phone: CustomValidators.formatPhone(freshUser.phone) });
          }
        },
        error: () => {
          // Mantém os dados locais caso o servidor esteja indisponível
        },
      });
    }
  }

  protected setTab(tab: 'dados' | 'seguranca'): void {
    this.activeTab.set(tab);
  }

  protected onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = CustomValidators.formatPhone(input.value);
    this.phoneForm.controls.phone.setValue(formatted, { emitEvent: false });
  }

  protected onPhoneSubmit(): void {
    if (this.phoneForm.invalid) {
      this.phoneForm.markAllAsTouched();
      this.phoneError.set('Informe um número de telefone válido com DDD.');
      return;
    }

    const phone = this.phoneForm.controls.phone.value.trim();
    this.isSavingPhone.set(true);
    this.phoneError.set(null);
    this.phoneSuccess.set(null);

    this.authService.updatePhone(phone).subscribe({
      next: () => {
        this.isSavingPhone.set(false);
        this.phoneSuccess.set('Número de telefone atualizado com sucesso.');
      },
      error: (err: { error?: { detail?: string; message?: string } }) => {
        this.isSavingPhone.set(false);
        this.phoneError.set(
          err.error?.detail ?? err.error?.message ?? 'Não foi possível atualizar o telefone.'
        );
      },
    });
  }

  protected onPasswordSubmit(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      this.passwordError.set('Verifique os campos de senha antes de continuar.');
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    this.isSavingPassword.set(true);
    this.passwordError.set(null);
    this.passwordSuccess.set(null);

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: (res) => {
        this.isSavingPassword.set(false);
        this.passwordForm.reset();
        this.passwordSuccess.set(res.message ?? 'Senha alterada com sucesso.');
      },
      error: (err: { error?: { detail?: string; message?: string } }) => {
        this.isSavingPassword.set(false);
        this.passwordError.set(
          err.error?.detail ?? err.error?.message ?? 'Senha atual incorreta ou erro ao atualizar.'
        );
      },
    });
  }

  protected isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const control = form.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  protected getFieldError(form: FormGroup, fieldName: string): string | null {
    const control = form.get(fieldName);
    if (!control || !control.errors || !(control.dirty || control.touched)) {
      return null;
    }
    if (control.errors['required']) return 'Campo obrigatório';
    if (control.errors['phoneInvalid']) return control.errors['phoneInvalid'] as string;
    if (control.errors['minlength']) {
      const min = control.errors['minlength'].requiredLength;
      return `Mínimo de ${min} caracteres`;
    }
    if (control.errors['mismatch']) return 'As senhas não coincidem';
    return 'Valor inválido';
  }

  protected formatBirthDate(iso?: string): string {
    if (!iso) return 'Não informado';
    const [year, month, day] = iso.split('-');
    if (!year || !month || !day) return iso;
    return `${day}/${month}/${year}`;
  }

  protected formatCpfDisplay(cpf?: string): string {
    if (!cpf) return 'Não informado';
    return CustomValidators.formatCpf(cpf);
  }

  protected openAuthModal(): void {
    this.authService.openAuthModal('login', '/conta');
  }
}
