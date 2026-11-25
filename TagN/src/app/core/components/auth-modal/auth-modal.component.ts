import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CustomValidators } from '../../validators/custom-validators';

@Component({
  selector: 'app-auth-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.scss',
})
export class AuthModalComponent {
  protected readonly authService = inject(AuthService);

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly recoveryEmail = signal<string>('');

  protected readonly loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, CustomValidators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  protected readonly registerForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, CustomValidators.email],
    }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, CustomValidators.phone],
    }),
    cpf: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, CustomValidators.cpf],
    }),
    birthDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, CustomValidators.birthDate],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, CustomValidators.matchValues('password')],
    }),
  });

  protected readonly forgotPasswordForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, CustomValidators.email],
    }),
  });

  protected readonly resetPasswordForm = new FormGroup({
    code: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, CustomValidators.resetCode],
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
    this.registerForm.controls.password.valueChanges.subscribe(() => {
      this.registerForm.controls.confirmPassword.updateValueAndValidity();
    });

    this.resetPasswordForm.controls.newPassword.valueChanges.subscribe(() => {
      this.resetPasswordForm.controls.confirmNewPassword.updateValueAndValidity();
    });
  }

  protected switchMode(mode: 'login' | 'register' | 'forgot-password' | 'reset-password'): void {
    this.errorMessage.set(null);
    this.authService.setModalMode(mode);
  }

  protected close(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.authService.closeAuthModal();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  protected onCpfInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = CustomValidators.formatCpf(input.value);
    this.registerForm.controls.cpf.setValue(formatted, { emitEvent: false });
  }

  protected onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = CustomValidators.formatPhone(input.value);
    this.registerForm.controls.phone.setValue(formatted, { emitEvent: false });
  }

  protected onCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const clean = input.value.replace(/\D/g, '').slice(0, 6);
    this.resetPasswordForm.controls.code.setValue(clean, { emitEvent: false });
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
    if (control.errors['emailInvalid']) return control.errors['emailInvalid'] as string;
    if (control.errors['cpfInvalid']) return control.errors['cpfInvalid'] as string;
    if (control.errors['phoneInvalid']) return control.errors['phoneInvalid'] as string;
    if (control.errors['birthDateInvalid']) return control.errors['birthDateInvalid'] as string;
    if (control.errors['codeInvalid']) return control.errors['codeInvalid'] as string;
    if (control.errors['minlength']) {
      const min = control.errors['minlength'].requiredLength;
      return `Mínimo de ${min} caracteres`;
    }
    if (control.errors['mismatch']) return 'As senhas não coincidem';

    return 'Valor inválido';
  }

  protected onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage.set('Por favor, preencha seu e-mail e senha corretamente.');
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(email, password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.loginForm.reset();
        this.errorMessage.set(null);
        this.successMessage.set(null);
      },
      error: (err: { error?: { detail?: string; message?: string } }) => {
        this.isLoading.set(false);
        const msg = err.error?.detail ?? err.error?.message ?? 'E-mail ou senha incorretos.';
        this.errorMessage.set(msg);
      },
    });
  }

  protected onRegisterSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.errorMessage.set('Por favor, verifique os campos destacados em vermelho.');
      return;
    }

    const raw = this.registerForm.getRawValue();

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService
      .register({
        name: raw.name.trim(),
        email: raw.email.trim(),
        phone: raw.phone.trim(),
        cpf: raw.cpf.trim(),
        birthDate: raw.birthDate,
        password: raw.password,
        confirmPassword: raw.confirmPassword,
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          const registeredEmail = raw.email.trim();
          this.registerForm.reset();
          this.errorMessage.set(null);
          this.successMessage.set('Conta criada com sucesso! Faça seu login para continuar.');

          this.loginForm.patchValue({ email: registeredEmail });
          this.authService.setModalMode('login');
        },
        error: (err: { error?: { detail?: string; message?: string } }) => {
          this.isLoading.set(false);
          const msg =
            err.error?.detail ??
            err.error?.message ??
            'Não foi possível concluir o cadastro. Verifique os dados informados.';
          this.errorMessage.set(msg);
        },
      });
  }

  protected onForgotPasswordSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      this.errorMessage.set('Por favor, informe um e-mail válido.');
      return;
    }

    const email = this.forgotPasswordForm.controls.email.value.trim();
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.authService.forgotPassword(email).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.recoveryEmail.set(email);
        this.errorMessage.set(null);
        this.successMessage.set(
          res.message ?? 'Código enviado! Verifique sua caixa de entrada e spam.'
        );
        this.resetPasswordForm.reset();
        this.authService.setModalMode('reset-password');
      },
      error: () => {
        this.isLoading.set(false);
        // Mesmo em caso de falha genérica, avança por segurança ou exibe mensagem
        this.recoveryEmail.set(email);
        this.authService.setModalMode('reset-password');
      },
    });
  }

  protected onResetPasswordSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      this.errorMessage.set('Por favor, preencha o código de 6 dígitos e sua nova senha.');
      return;
    }

    const email = this.recoveryEmail() || this.forgotPasswordForm.controls.email.value.trim();
    const { code, newPassword } = this.resetPasswordForm.getRawValue();

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.resetPassword(email, code.trim(), newPassword).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.resetPasswordForm.reset();
        this.forgotPasswordForm.reset();
        this.errorMessage.set(null);
        this.successMessage.set(res.message ?? 'Senha redefinida com sucesso! Faça seu login.');

        this.loginForm.patchValue({ email });
        this.authService.setModalMode('login');
      },
      error: (err: { error?: { detail?: string; message?: string } }) => {
        this.isLoading.set(false);
        const msg =
          err.error?.detail ??
          err.error?.message ??
          'Código inválido ou expirado. Tente novamente.';
        this.errorMessage.set(msg);
      },
    });
  }
}
