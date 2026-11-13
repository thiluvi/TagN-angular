import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

interface ShowcaseItem {
  readonly title: string;
  readonly category: string;
  readonly image: string;
  readonly width: number;
  readonly height: number;
}

@Component({
  selector: 'app-showcase-section',
  imports: [NgOptimizedImage],
  templateUrl: './showcase-section.component.html',
  styleUrl: './showcase-section.component.scss',
})
export class ShowcaseSectionComponent {
  protected readonly showcaseItems: readonly ShowcaseItem[] = [
    {
      title: 'O sorriso',
      category: 'Odontologia ·',
      image: 'images/vitrine-sorriso.png',
      width: 1016,
      height: 1009,
    },
    {
      title: 'A harmonia',
      category: 'Harmonização ·',
      image: 'images/vitrine-harmonia.png',
      width: 746,
      height: 1010,
    },
    {
      title: 'Os detalhes',
      category: 'Cuidado individual ·',
      image: 'images/vitrine-detalhes-4ea95b.png',
      width: 576,
      height: 556,
    },
  ];
}
