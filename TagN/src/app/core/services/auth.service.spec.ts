import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    service.logout();
  });

  it('should be created and initial state unauthenticated', () => {
    expect(service).toBeTruthy();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('should open and close auth modal with target destination', () => {
    service.openAuthModal('login', '/agendamento');
    expect(service.isAuthModalOpen()).toBe(true);
    expect(service.authModalMode()).toBe('login');
    expect(service.pendingDestination()).toBe('/agendamento');

    service.closeAuthModal();
    expect(service.isAuthModalOpen()).toBe(false);
    expect(service.pendingDestination()).toBeNull();
  });

  it('should authenticate user upon valid login', () => {
    const success = service.login('dra.marcela@clinica.com', '123456');
    expect(success).toBe(true);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.email).toBe('dra.marcela@clinica.com');
  });

  it('should register and authenticate user with full fields', () => {
    const success = service.register({
      name: 'Maria Silva',
      email: 'maria@exemplo.com',
      phone: '(11) 98888-7777',
      cpf: '111.222.333-44',
      birthDate: '1995-05-12',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(success).toBe(true);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.name).toBe('Maria Silva');
    expect(service.currentUser()?.email).toBe('maria@exemplo.com');
  });

  it('should clear user state upon logout', () => {
    service.login('teste@exemplo.com', '123456');
    expect(service.isAuthenticated()).toBe(true);

    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });
});
