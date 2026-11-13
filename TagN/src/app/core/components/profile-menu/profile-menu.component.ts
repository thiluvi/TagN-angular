import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile-menu',
  templateUrl: './profile-menu.component.html',
  styleUrl: './profile-menu.component.scss',
})
export class ProfileMenuComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isOpen = signal(false);

  protected toggle(event: MouseEvent): void {
    event.stopPropagation();
    this.isOpen.update((v) => !v);
  }

  protected close(): void {
    this.isOpen.set(false);
  }

  protected onSelectOption(option: 'conta' | 'agendamentos'): void {
    this.close();

    if (this.authService.isAuthenticated()) {
      if (option === 'agendamentos') {
        void this.router.navigate(['/agendamento']);
      } else {
        void this.router.navigate(['/login']);
      }
    } else {
      // Usuário não autenticado: abre o Overlay Flutuante para efetuar Login ou Cadastro
      const targetDestination = option === 'agendamentos' ? '/agendamento' : '/login';
      this.authService.openAuthModal('login', targetDestination);
    }
  }

  protected openLogin(): void {
    this.close();
    this.authService.openAuthModal('login');
  }

  protected onLogout(): void {
    this.authService.logout();
    this.close();
  }
}
