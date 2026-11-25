import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CustomValidators } from '../../../core/validators/custom-validators';

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
            <label for="reg-name" class="form-label">Nome completo</label>
            <input
              id="reg-name"
              type="text"
              formControlName="name"
              placeholder="Seu nome completo"
              class="form-input"
              [class.form-input--error]="isFieldInvalid('name')"
              autocomplete="name">
            @if (isFieldInvalid('name')) {
              <span class="field-error">{{ getFieldError('name') }}</span>
            }
          </div>

          <div class="form-group">
            <label for="reg-email" class="form-label">E-mail</label>
            <input
              id="reg-email"
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

          <div class="form-row">
            <div class="form-group">
              <label for="reg-phone" class="form-label">Celular</label>
              <input
                id="reg-phone"
                type="tel"
                formControlName="phone"
                placeholder="(11) 90000-0000"
                class="form-input"
                (input)="onPhoneInput($event)"
                [class.form-input--error]="isFieldInvalid('phone')"
                autocomplete="tel">
              @if (isFieldInvalid('phone')) {
                <span class="field-error">{{ getFieldError('phone') }}</span>
              }
            </div>

            <div class="form-group">
              <label for="reg-cpf" class="form-label">CPF</label>
              <input
                id="reg-cpf"
                type="text"
                formControlName="cpf"
                placeholder="000.000.000-00"
                maxlength="14"
                class="form-input"
                (input)="onCpfInput($event)"
                [class.form-input--error]="isFieldInvalid('cpf')">
              @if (isFieldInvalid('cpf')) {
                <span class="field-error">{{ getFieldError('cpf') }}</span>
              }
            </div>
          </div>

          <div class="form-group">
            <label for="reg-birthDate" class="form-label">Data de Nasc.</label>
            <input
              id="reg-birthDate"
              type="date"
              formControlName="birthDate"
              class="form-input"
              [class.form-input--error]="isFieldInvalid('birthDate')">
            @if (isFieldInvalid('birthDate')) {
              <span class="field-error">{{ getFieldError('birthDate') }}</span>
            }
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
                [class.form-input--error]="isFieldInvalid('password')"
                autocomplete="new-password">
              @if (isFieldInvalid('password')) {
                <span class="field-error">{{ getFieldError('password') }}</span>
              }
            </div>

            <div class="form-group">
              <label for="reg-confirmPassword" class="form-label">Confirme a senha</label>
              <input
                id="reg-confirmPassword"
                type="password"
                formControlName="confirmPassword"
                placeholder="Repita sua senha"
                class="form-input"
                [class.form-input--error]="isFieldInvalid('confirmPassword')"
                autocomplete="new-password">
              @if (isFieldInvalid('confirmPassword')) {
                <span class="field-error">{{ getFieldError('confirmPassword') }}</span>
              }
            </div>
          </div>

          <button type="submit" class="btn-submit" [disabled]="isLoading()">
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
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly form = new FormGroup({
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

  constructor() {
    this.form.controls.password.valueChanges.subscribe(() => {
      this.form.controls.confirmPassword.updateValueAndValidity();
    });
  }

  protected onCpfInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = CustomValidators.formatCpf(input.value);
    this.form.controls.cpf.setValue(formatted, { emitEvent: false });
  }

  protected onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = CustomValidators.formatPhone(input.value);
    this.form.controls.phone.setValue(formatted, { emitEvent: false });
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
    if (control.errors['cpfInvalid']) return control.errors['cpfInvalid'] as string;
    if (control.errors['phoneInvalid']) return control.errors['phoneInvalid'] as string;
    if (control.errors['birthDateInvalid']) return control.errors['birthDateInvalid'] as string;
    if (control.errors['minlength']) return 'Mínimo de 6 dígitos';
    if (control.errors['mismatch']) return 'As senhas não coincidem';
    return 'Valor inválido';
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Por favor, verifique os campos destacados em vermelho.');
      return;
    }

    const raw = this.form.getRawValue();

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
          const email = raw.email.trim();
          this.form.reset();
          this.errorMessage.set(null);
          this.successMessage.set('Conta criada com sucesso! Redirecionando para o login...');

          setTimeout(() => {
            void this.router.navigate(['/login'], { queryParams: { registered: 'true', email } });
          }, 1500);
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
