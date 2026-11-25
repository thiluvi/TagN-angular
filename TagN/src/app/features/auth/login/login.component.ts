import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CustomValidators } from '../../../core/validators/custom-validators';

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

        @if (successMessage()) {
          <div class="alert-success" role="alert">
            <span class="alert-icon">✓</span>
            <span>{{ successMessage() }}</span>
          </div>
        }

        @if (errorMessage()) {
          <div class="alert-error" role="alert">
            <span class="alert-icon">!</span>
            <span>{{ errorMessage() }}</span>
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
              [class.form-input--error]="isFieldInvalid('email')"
              autocomplete="email">
            @if (isFieldInvalid('email')) {
              <span class="field-error">{{ getFieldError('email') }}</span>
            }
          </div>

          <div class="form-group">
            <label for="login-password" class="form-label">Senha</label>
            <input
              id="login-password"
              type="password"
              formControlName="password"
              placeholder="Sua senha (mínimo 6 dígitos)"
              class="form-input"
              [class.form-input--error]="isFieldInvalid('password')"
              autocomplete="current-password">
            @if (isFieldInvalid('password')) {
              <span class="field-error">{{ getFieldError('password') }}</span>
            }
          </div>

          <button type="submit" class="btn-submit" [disabled]="isLoading()">
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

      &--error {
        border-color: #c62828 !important;
        background-color: rgba(160, 48, 48, 0.04);
      }
    }

    .field-error {
      font-size: 11px;
      color: #c62828;
      padding-left: 2px;
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

    .alert-success, .alert-error {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      padding: $spacing-sm $spacing-md;
      border-radius: $border-radius-sm;
      font-size: $font-size-caption;
      line-height: $line-height-body-sm;

      .alert-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        border-radius: $border-radius-pill;
        font-weight: bold;
        flex-shrink: 0;
      }
    }

    .alert-success {
      background-color: rgba(76, 128, 86, 0.12);
      border: $border-width solid #2e7d32;
      border-left: 4px solid #2e7d32;
      color: #1b5e20;

      .alert-icon {
        background-color: #2e7d32;
        color: #fff;
        font-size: 10px;
      }
    }

    .alert-error {
      background-color: rgba(160, 48, 48, 0.08);
      border: $border-width solid #c62828;
      border-left: 4px solid #c62828;
      color: #8c2828;

      .alert-icon {
        background-color: #c62828;
        color: #fff;
        font-size: 11px;
      }
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
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, CustomValidators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  ngOnInit(): void {
    const registered = this.route.snapshot.queryParamMap.get('registered');
    const emailParam = this.route.snapshot.queryParamMap.get('email');
    if (registered === 'true') {
      this.successMessage.set('Conta criada com sucesso! Faça seu login para continuar.');
      if (emailParam) {
        this.form.patchValue({ email: emailParam });
      }
    }
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  protected getFieldError(fieldName: string): string | null {
    const control = this.form.get(fieldName);
    if (!control || !control.errors || !(control.dirty || control.touched)) {
      return null;
    }

    if (control.errors['required']) return 'Campo obrigatório';
    if (control.errors['emailInvalid']) return control.errors['emailInvalid'] as string;
    if (control.errors['minlength']) return 'Senha deve ter no mínimo 6 dígitos';
    return 'Valor inválido';
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Por favor, preencha seu e-mail e senha corretamente.');
      return;
    }

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
