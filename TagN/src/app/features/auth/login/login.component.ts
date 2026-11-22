import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <section class="auth-section">
      <div class="auth-card">
        <header class="auth-header">
          <h1 class="auth-title">Acesse sua conta</h1>
          <p class="auth-subtitle">Informe suas credenciais para visualizar seus agendamentos e histórico.</p>
        </header>

        @if (errorMessage()) {
          <div class="alert-error" role="alert">
            {{ errorMessage() }}
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form" novalidate>
          <div class="form-group">
            <label for="login-email" class="form-label">E-mail</label>
            <input
              id="login-email"
              type="email"
              formControlName="email"
              placeholder="seuemail@exemplo.com"
              class="form-input"
              autocomplete="email">
          </div>

          <div class="form-group">
            <label for="login-password" class="form-label">Senha</label>
            <input
              id="login-password"
              type="password"
              formControlName="password"
              placeholder="Sua senha"
              class="form-input"
              autocomplete="current-password">
          </div>

          <button type="submit" class="btn-submit" [disabled]="isLoading() || form.invalid">
            @if (isLoading()) {
              Entrando...
            } @else {
              Entrar
            }
          </button>

          <div class="auth-footer-links">
            <span class="auth-text">Ainda não tem cadastro?</span>
            <a routerLink="/cadastro" class="auth-link">Crie sua conta</a>
          </div>
        </form>
      </div>
    </section>
  `,
  styles: `
    @use 'styles/variables' as *;

    .auth-section {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: $spacing-3xl $spacing-lg;
      min-height: 60vh;
    }

    .auth-card {
      width: 100%;
      max-width: 480px;
      padding: $spacing-36;
      background-color: $color-bg-primary;
      border: $border-width solid $color-border-primary;
      border-radius: $border-radius-sm;
      display: flex;
      flex-direction: column;
      gap: $spacing-lg;
    }

    .auth-header {
      display: flex;
      flex-direction: column;
      gap: $spacing-sm;
    }

    .auth-title {
      font-family: $font-family-serif;
      font-size: $font-size-h2;
      color: $color-text-primary;
      margin: 0;
    }

    .auth-subtitle {
      font-family: $font-family-sans;
      font-size: $font-size-body-sm;
      color: $color-text-secondary;
      line-height: $line-height-body-sm;
      margin: 0;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: $spacing-md;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: $spacing-xs;
    }

    .form-label {
      font-family: $font-family-sans;
      font-size: $font-size-caption;
      font-weight: $font-weight-medium;
      color: $color-text-primary;
      text-transform: uppercase;
      letter-spacing: $letter-spacing-caps;
    }

    .form-input {
      width: 100%;
      padding: $spacing-sm $spacing-md;
      font-family: $font-family-sans;
      font-size: $font-size-body-sm;
      color: $color-text-primary;
      background-color: $color-bg-secondary;
      border: $border-width solid $color-border-primary;
      border-radius: $border-radius-sm;
      outline: none;
      box-sizing: border-box;

      &:focus {
        border-color: $color-brand-primary;
        background-color: $color-bg-primary;
      }
    }

    .btn-submit {
      width: 100%;
      padding: $spacing-md;
      margin-top: $spacing-xs;
      background-color: $color-brand-primary;
      color: $color-text-light;
      border: none;
      border-radius: $border-radius-sm;
      font-family: $font-family-sans;
      font-size: $font-size-body-sm;
      font-weight: $font-weight-medium;
      cursor: pointer;
      transition: background-color 0.2s ease;

      &:hover:not(:disabled) {
        background-color: $color-brand-dark;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .alert-error {
      padding: $spacing-sm $spacing-md;
      background-color: rgba(160, 48, 48, 0.08);
      border: $border-width solid rgba(160, 48, 48, 0.3);
      border-radius: $border-radius-sm;
      font-size: $font-size-caption;
      color: #8c2828;
    }

    .auth-footer-links {
      display: flex;
      gap: $spacing-xs;
      font-size: $font-size-caption;
      justify-content: center;
      margin-top: $spacing-xs;
    }

    .auth-text {
      color: $color-text-secondary;
    }

    .auth-link {
      color: $color-brand-primary;
      text-decoration: underline;

      &:hover {
        color: $color-brand-dark;
      }
    }
  `,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  protected onSubmit(): void {
    if (this.form.invalid) return;

    const { email, password } = this.form.getRawValue();
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(email, password).subscribe({
      next: () => {
        this.isLoading.set(false);
        void this.router.navigateByUrl('/agendamento');
      },
      error: (err: { error?: { detail?: string; message?: string } }) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.detail ?? err.error?.message ?? 'Credenciais inválidas.');
      },
    });
  }
}
