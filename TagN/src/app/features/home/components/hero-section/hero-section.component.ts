import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss',
})
export class HeroSectionComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  handleScheduleClick(): void {
    if (this.authService.isAuthenticated()) {
      void this.router.navigate(['/agendamento']);
    } else {
      this.authService.openAuthModal('login', '/agendamento');
    }
  }
}
