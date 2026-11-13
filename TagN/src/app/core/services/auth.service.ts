import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly cpf?: string;
  readonly birthDate?: string;
}

export interface RegisterData {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly cpf: string;
  readonly birthDate: string;
  readonly password: string;
  readonly confirmPassword: string;
}

const STORAGE_KEY = 'tagn_auth_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);

  readonly currentUser = signal<User | null>(this.loadStoredUser());
  readonly isAuthenticated = computed(() => !!this.currentUser());

  readonly isAuthModalOpen = signal(false);
  readonly authModalMode = signal<'login' | 'register'>('login');
  readonly pendingDestination = signal<string | null>(null);

  openAuthModal(mode: 'login' | 'register' = 'login', destination?: string): void {
    this.authModalMode.set(mode);
    this.pendingDestination.set(destination ?? null);
    this.isAuthModalOpen.set(true);
  }

  closeAuthModal(): void {
    this.isAuthModalOpen.set(false);
    this.pendingDestination.set(null);
  }

  setModalMode(mode: 'login' | 'register'): void {
    this.authModalMode.set(mode);
  }

  login(email: string, _password: string): boolean {
    if (!email) return false;

    // Simula autenticação com persistência local
    const namePart = email.split('@')[0] || 'Paciente';
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    const user: User = {
      id: crypto.randomUUID(),
      name: formattedName,
      email,
      phone: '(11) 98765-4321',
      cpf: '123.456.789-00',
    };

    this.setCurrentUser(user);
    this.handlePostAuthSuccess();
    return true;
  }

  register(data: RegisterData): boolean {
    if (!data.name || !data.email || !data.password) return false;

    const user: User = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      cpf: data.cpf,
      birthDate: data.birthDate,
    };

    this.setCurrentUser(user);
    this.handlePostAuthSuccess();
    return true;
  }

  logout(): void {
    this.setCurrentUser(null);
  }

  private handlePostAuthSuccess(): void {
    const destination = this.pendingDestination();
    this.closeAuthModal();

    if (destination) {
      void this.router.navigateByUrl(destination);
    }
  }

  private setCurrentUser(user: User | null): void {
    this.currentUser.set(user);
    if (typeof window !== 'undefined' && window.localStorage) {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  private loadStoredUser(): User | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  }
}
