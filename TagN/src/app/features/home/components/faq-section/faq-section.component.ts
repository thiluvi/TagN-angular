import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface FaqItem {
  readonly id: number;
  readonly question: string;
  readonly answer: string;
}

@Component({
  selector: 'app-faq-section',
  imports: [RouterLink],
  templateUrl: './faq-section.component.html',
  styleUrl: './faq-section.component.scss',
})
export class FaqSectionComponent {
  protected readonly expandedFaq = signal<number | null>(0);

  protected readonly faqList: readonly FaqItem[] = [
    {
      id: 0,
      question: 'Como funciona a primeira avaliação?',
      answer:
        'É um momento para conversar sobre seu histórico, suas expectativas e suas dúvidas. A avaliação clínica orienta as possibilidades de cuidado e o planejamento individual. Agendar uma avaliação não significa decidir por um procedimento.',
    },
    {
      id: 1,
      question: 'Preciso saber qual procedimento quero fazer?',
      answer:
        'Não. O objetivo primordial da consulta é justamente compreender suas queixas, avaliar sua estrutura facial e bucal e propor as melhores opções personalizadas.',
    },
    {
      id: 2,
      question: 'Odontologia e harmonização podem fazer parte do mesmo plano?',
      answer:
        'Sim. A integração entre a saúde do sorriso e a harmonia facial proporciona resultados muito mais equilibrados, respeitando funções mastigatórias e proporções naturais.',
    },
    {
      id: 3,
      question: 'Os resultados são iguais para todas as pessoas?',
      answer:
        'Cada rosto e sorriso possuem traços singulares. O trabalho é completamente individualizado, priorizando sua naturalidade e essência sem fórmulas prontas.',
    },
    {
      id: 4,
      question: 'Como saber os valores e as formas de pagamento?',
      answer:
        'A indicação precisa e o planejamento de investimento são apresentados com transparência após a avaliação clínica presencial, considerando as necessidades do seu caso.',
    },
  ];

  protected toggleFaq(id: number): void {
    this.expandedFaq.update((current) => (current === id ? null : id));
  }
}
