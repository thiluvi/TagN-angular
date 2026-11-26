import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-cta-section',
  standalone: true,
  imports: [],
  templateUrl: './cta-section.component.html',
  styleUrl: './cta-section.component.scss',
})
export class CtaSectionComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  handleScheduleClick(): void {
    if (this.authService.isAuthenticated()) {
      void this.router.navigate([
        this.authService.isAdmin() ? '/agendamentos' : '/agendamento',
      ]);
    } else {
      this.authService.openAuthModal('login', '/agendamento');
    }
  }
}
