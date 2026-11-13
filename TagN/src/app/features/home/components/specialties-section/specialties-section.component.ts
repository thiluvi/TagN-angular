import { Component } from '@angular/core';

interface Specialty {
  readonly number: string;
  readonly title: string;
  readonly description: string;
  readonly pillars: readonly string[];
}

@Component({
  selector: 'app-specialties-section',
  templateUrl: './specialties-section.component.html',
  styleUrl: './specialties-section.component.scss',
})
export class SpecialtiesSectionComponent {
  protected readonly specialties: readonly Specialty[] = [
    {
      number: '01',
      title: 'Odontologia',
      description:
        'A saúde do sorriso como ponto de partida. Um olhar que considera função, bem-estar e estética no planejamento do seu cuidado.',
      pillars: ['SAÚDE BUCAL', 'FUNÇÃO', 'ESTÉTICA DO SORRISO'],
    },
    {
      number: '02',
      title: 'Harmonização',
      description:
        'Um planejamento que valoriza seus traços, sem perder de vista a naturalidade. Cada indicação começa por uma avaliação individual.',
      pillars: ['EQUILÍBRIO', 'NATURALIDADE', 'INDIVIDUALIDADE'],
    },
  ];
}
