import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [RouterLink],
  template: `
    <section class="auth-section">
      <div class="auth-card">
        <header class="auth-header">
          <h1 class="auth-title">Crie sua conta</h1>
          <p class="auth-subtitle">Cadastre-se para gerenciar suas consultas e receber orientações personalizadas.</p>
        </header>

        <div class="auth-placeholder-body">
          <p class="auth-notice">Formulário de cadastro em desenvolvimento.</p>
          <div class="auth-footer-links">
            <span class="auth-text">Já possui uma conta?</span>
            <a routerLink="/login" class="auth-link">Acesse sua conta</a>
          </div>
        </div>
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
    }

    .auth-subtitle {
      font-family: $font-family-sans;
      font-size: $font-size-body-sm;
      color: $color-text-secondary;
      line-height: $line-height-body-sm;
      margin: 0;
    }

    .auth-placeholder-body {
      display: flex;
      flex-direction: column;
      gap: $spacing-lg;
      padding-top: $spacing-md;
      border-top: $border-width solid $color-border-primary;
    }

    .auth-notice {
      font-size: $font-size-caption;
      color: $color-text-muted;
      margin: 0;
    }

    .auth-footer-links {
      display: flex;
      gap: $spacing-xs;
      font-size: $font-size-caption;
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
export class RegisterComponent {}
