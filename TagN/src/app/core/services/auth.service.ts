import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly cpf?: string;
  readonly birthDate?: string;
  readonly role?: 'PATIENT' | 'ADMIN';
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

export interface AuthResponse {
  readonly token: string;
  readonly user: User;
}

const STORAGE_USER_KEY = 'tagn_auth_user';
const STORAGE_TOKEN_KEY = 'tagn_token';
const API_BASE = 'http://localhost:8080/api';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly currentUser = signal<User | null>(this.loadStoredUser());
  readonly isAuthenticated = computed(() => !!this.currentUser());

  readonly isAuthModalOpen = signal(false);
  readonly authModalMode = signal<'login' | 'register' | 'forgot-password' | 'reset-password'>('login');
  readonly pendingDestination = signal<string | null>(null);

  openAuthModal(
    mode: 'login' | 'register' | 'forgot-password' | 'reset-password' = 'login',
    destination?: string
  ): void {
    this.authModalMode.set(mode);
    this.pendingDestination.set(destination ?? null);
    this.isAuthModalOpen.set(true);
  }

  closeAuthModal(): void {
    this.isAuthModalOpen.set(false);
    this.pendingDestination.set(null);
  }

  setModalMode(mode: 'login' | 'register' | 'forgot-password' | 'reset-password'): void {
    this.authModalMode.set(mode);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_BASE}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          this.setAuth(res);
          this.handlePostAuthSuccess();
        })
      );
  }

  register(data: RegisterData): Observable<AuthResponse> {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      cpf: data.cpf,
      birthDate: data.birthDate,
      password: data.password,
    };

    return this.http.post<AuthResponse>(`${API_BASE}/auth/register`, payload);
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API_BASE}/auth/forgot-password`, { email });
  }

  resetPassword(email: string, code: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API_BASE}/auth/reset-password`, {
      email,
      code,
      newPassword,
    });
  }

  logout(): void {
    this.setAuth(null);
    void this.router.navigateByUrl('/');
  }

  fetchProfile(): Observable<User> {
    return this.http.get<User>(`${API_BASE}/users/me`).pipe(
      tap((user) => {
        this.currentUser.set(user);
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
        }
      })
    );
  }

  private handlePostAuthSuccess(): void {
    const destination = this.pendingDestination();
    this.closeAuthModal();

    if (destination) {
      void this.router.navigateByUrl(destination);
    }
  }

  private setAuth(auth: AuthResponse | null): void {
    const user = auth?.user ?? null;
    this.currentUser.set(user);

    if (typeof window !== 'undefined' && window.localStorage) {
      if (auth) {
        localStorage.setItem(STORAGE_TOKEN_KEY, auth.token);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(auth.user));
      } else {
        localStorage.removeItem(STORAGE_TOKEN_KEY);
        localStorage.removeItem(STORAGE_USER_KEY);
      }
    }
  }

  private loadStoredUser(): User | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    try {
      const stored = localStorage.getItem(STORAGE_USER_KEY);
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  }
}
