import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <section class="auth-section">
      <div class="auth-card">
        <header class="auth-header">
          <h1 class="auth-title">Crie sua conta</h1>
          <p class="auth-subtitle">Cadastre-se para gerenciar suas consultas e receber orientações personalizadas.</p>
        </header>

        @if (errorMessage()) {
          <div class="alert-error" role="alert">
            {{ errorMessage() }}
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form" novalidate>
          <div class="form-group">
            <label for="reg-name" class="form-label">Nome completo</label>
            <input
              id="reg-name"
              type="text"
              formControlName="name"
              placeholder="Seu nome completo"
              class="form-input"
              autocomplete="name">
          </div>

          <div class="form-group">
            <label for="reg-email" class="form-label">E-mail</label>
            <input
              id="reg-email"
              type="email"
              formControlName="email"
              placeholder="seuemail@exemplo.com"
              class="form-input"
              autocomplete="email">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="reg-phone" class="form-label">Celular</label>
              <input
                id="reg-phone"
                type="tel"
                formControlName="phone"
                placeholder="(11) 90000-0000"
                class="form-input"
                autocomplete="tel">
            </div>

            <div class="form-group">
              <label for="reg-cpf" class="form-label">CPF</label>
              <input
                id="reg-cpf"
                type="text"
                formControlName="cpf"
                placeholder="000.000.000-00"
                class="form-input">
            </div>
          </div>

          <div class="form-group">
            <label for="reg-birthDate" class="form-label">Data de Nasc.</label>
            <input
              id="reg-birthDate"
              type="date"
              formControlName="birthDate"
              class="form-input">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="reg-password" class="form-label">Senha</label>
              <input
                id="reg-password"
                type="password"
                formControlName="password"
                placeholder="Mínimo 6 dígitos"
                class="form-input"
                autocomplete="new-password">
            </div>

            <div class="form-group">
              <label for="reg-confirmPassword" class="form-label">Confirme a senha</label>
              <input
                id="reg-confirmPassword"
                type="password"
                formControlName="confirmPassword"
                placeholder="Repita sua senha"
                class="form-input"
                autocomplete="new-password">
            </div>
          </div>

          <button type="submit" class="btn-submit" [disabled]="isLoading() || form.invalid">
            @if (isLoading()) {
              Cadastrando...
            } @else {
              Criar conta
            }
          </button>

          <div class="auth-footer-links">
            <span class="auth-text">Já possui uma conta?</span>
            <a routerLink="/login" class="auth-link">Acesse sua conta</a>
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
      max-width: 520px;
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: $spacing-sm;

      @media (max-width: 576px) {
        grid-template-columns: 1fr;
      }
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
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = new FormGroup({
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

  protected onSubmit(): void {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();

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
          void this.router.navigateByUrl('/agendamento');
        },
        error: (err: { error?: { detail?: string; message?: string } }) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            err.error?.detail ?? err.error?.message ?? 'Não foi possível concluir o cadastro.'
          );
        },
      });
  }
}
