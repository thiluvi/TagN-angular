import { Component } from '@angular/core';

@Component({
  selector: 'app-scheduling',
  template: `
    <section class="scheduling-section">
      <div class="scheduling-container">
        <header class="scheduling-header">
          <h1 class="scheduling-title">Seu cuidado começa aqui.</h1>
          <p class="scheduling-subtitle">
            Complete os dados necessários para a consulta. Em seguida, escolha o melhor dia e horário.
          </p>
        </header>

        <div class="scheduling-placeholder">
          <p class="scheduling-notice">Módulo de agendamento em etapas em desenvolvimento.</p>
        </div>
      </div>
    </section>
  `,
  styles: `
    @use 'styles/variables' as *;

    .scheduling-section {
      padding: $spacing-3xl $section-padding-x;
      max-width: $container-max-width;
      margin: 0 auto;

      @media (max-width: 992px) {
        padding: $spacing-xl $spacing-lg;
      }
    }

    .scheduling-container {
      display: flex;
      flex-direction: column;
      gap: $spacing-xl;
    }

    .scheduling-header {
      display: flex;
      flex-direction: column;
      gap: $spacing-10;
    }

    .scheduling-title {
      font-family: $font-family-serif;
      font-size: $font-size-display-3;
      color: $color-brand-dark;
      line-height: $line-height-title;

      @media (max-width: 768px) {
        font-size: $font-size-h2;
      }
    }

    .scheduling-subtitle {
      font-family: $font-family-sans;
      font-size: $font-size-body;
      color: $color-text-secondary;
      line-height: $line-height-body;
      margin: 0;
      max-width: 600px;
    }

    .scheduling-placeholder {
      padding: $spacing-36;
      background-color: $color-bg-secondary;
      border: $border-width solid $color-border-primary;
      border-radius: $border-radius-sm;
    }

    .scheduling-notice {
      font-size: $font-size-caption;
      color: $color-text-muted;
      margin: 0;
    }
  `,
})
export class SchedulingComponent {}
