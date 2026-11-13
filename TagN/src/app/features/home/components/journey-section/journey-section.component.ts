import { Component } from '@angular/core';

interface JourneyStep {
  readonly number: string;
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'app-journey-section',
  templateUrl: './journey-section.component.html',
  styleUrl: './journey-section.component.scss',
})
export class JourneySectionComponent {
  protected readonly journeySteps: readonly JourneyStep[] = [
    {
      number: '01',
      title: 'Uma boa conversa',
      description:
        'Um momento para falar sobre você, suas dúvidas e o que espera do cuidado.',
    },
    {
      number: '02',
      title: 'Um olhar completo',
      description:
        'Avaliação individual para compreender suas necessidades e as possibilidades de cuidado.',
    },
    {
      number: '03',
      title: 'Um plano para você',
      description:
        'Orientações claras sobre indicações, etapas e cuidados, com espaço para decidir com calma.',
    },
    {
      number: '04',
      title: 'Cuidado que continua',
      description:
        'Acompanhamento e orientações definidos de acordo com o planejamento e cada procedimento.',
    },
  ];
}
