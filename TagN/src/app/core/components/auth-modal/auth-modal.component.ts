import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.scss',
})
export class AuthModalComponent {
  protected readonly authService = inject(AuthService);

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isLoading = signal(false);

  protected readonly loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
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
      validators: [Validators.required, Validators.email],
    }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    cpf: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    birthDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected switchMode(mode: 'login' | 'register'): void {
    this.errorMessage.set(null);
    this.authService.setModalMode(mode);
  }

  protected close(): void {
    this.errorMessage.set(null);
    this.authService.closeAuthModal();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  protected onLoginSubmit(): void {
    if (this.loginForm.invalid) {
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
      },
      error: (err: { error?: { detail?: string; message?: string } }) => {
        this.isLoading.set(false);
        const msg = err.error?.detail ?? err.error?.message ?? 'Credenciais inválidas. Tente novamente.';
        this.errorMessage.set(msg);
      },
    });
  }

  protected onRegisterSubmit(): void {
    if (this.registerForm.invalid) {
      this.errorMessage.set('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const raw = this.registerForm.getRawValue();

    if (raw.password !== raw.confirmPassword) {
      this.errorMessage.set('A senha e a confirmação de senha não coincidem.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService
      .register({
        name: raw.name,
        email: raw.email,
        phone: raw.phone,
        cpf: raw.cpf,
        birthDate: raw.birthDate,
        password: raw.password,
        confirmPassword: raw.confirmPassword,
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.registerForm.reset();
          this.errorMessage.set(null);
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
}
