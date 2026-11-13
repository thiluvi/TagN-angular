import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ProfileMenuComponent } from '../../components/profile-menu/profile-menu.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink, ProfileMenuComponent],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.scss',
})
export class PublicLayoutComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isMobileMenuOpen = signal(false);

  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((open) => !open);
  }

  protected closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  protected onMobileOption(option: 'conta' | 'agendamentos'): void {
    this.closeMobileMenu();

    if (this.authService.isAuthenticated()) {
      if (option === 'agendamentos') {
        void this.router.navigate(['/agendamento']);
      } else {
        void this.router.navigate(['/login']);
      }
    } else {
      const destination = option === 'agendamentos' ? '/agendamento' : '/login';
      this.authService.openAuthModal('login', destination);
    }
  }
}
