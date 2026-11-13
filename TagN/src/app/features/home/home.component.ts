import { Component } from '@angular/core';
import { AboutSectionComponent } from './components/about-section/about-section.component';
import { CtaSectionComponent } from './components/cta-section/cta-section.component';
import { FaqSectionComponent } from './components/faq-section/faq-section.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { JourneySectionComponent } from './components/journey-section/journey-section.component';
import { PhilosophySectionComponent } from './components/philosophy-section/philosophy-section.component';
import { ShowcaseSectionComponent } from './components/showcase-section/showcase-section.component';
import { SpecialtiesSectionComponent } from './components/specialties-section/specialties-section.component';

@Component({
  selector: 'app-home',
  imports: [
    HeroSectionComponent,
    SpecialtiesSectionComponent,
    AboutSectionComponent,
    PhilosophySectionComponent,
    ShowcaseSectionComponent,
    JourneySectionComponent,
    FaqSectionComponent,
    CtaSectionComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
