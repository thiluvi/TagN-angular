import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-about-section',
  imports: [NgOptimizedImage],
  templateUrl: './about-section.component.html',
  styleUrl: './about-section.component.scss',
})
export class AboutSectionComponent {
  private readonly whatsappNumber = '5511945541952';
  private readonly whatsappMessage =
    'Olá, Dra. Marcela! Gostaria de conversar sobre um atendimento na TagN Odonto.';

  readonly whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(this.whatsappMessage)}`;
}

  readonly whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(this.whatsappMessage)}`;
}