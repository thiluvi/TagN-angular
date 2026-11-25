import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    service.logout();
  });

  afterEach(() => {
    httpMock.verify();
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
    const mockResponse = {
      token: 'mock-jwt-token',
      user: {
        id: '123',
        name: 'Dra Marcela',
        email: 'dra.marcela@clinica.com',
      },
    };

    service.login('dra.marcela@clinica.com', '123456').subscribe((res) => {
      expect(res.token).toBe('mock-jwt-token');
      expect(service.isAuthenticated()).toBe(true);
      expect(service.currentUser()?.email).toBe('dra.marcela@clinica.com');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should register user with full fields without auto-login', () => {
    const mockResponse = {
      token: 'mock-jwt-token-register',
      user: {
        id: '456',
        name: 'Maria Silva',
        email: 'maria@exemplo.com',
        phone: '(11) 98888-7777',
        cpf: '111.222.333-44',
      },
    };

    service
      .register({
        name: 'Maria Silva',
        email: 'maria@exemplo.com',
        phone: '(11) 98888-7777',
        cpf: '111.222.333-44',
        birthDate: '1995-05-12',
        password: 'password123',
        confirmPassword: 'password123',
      })
      .subscribe((res) => {
        expect(res.token).toBe('mock-jwt-token-register');
        // Register does not auto-login to allow showing success alert and redirecting to login
        expect(service.isAuthenticated()).toBe(false);
      });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/register');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should clear user state upon logout', () => {
    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('should request forgot password code', () => {
    service.forgotPassword('teste@exemplo.com').subscribe((res) => {
      expect(res.message).toBe('Código enviado com sucesso');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/forgot-password');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'teste@exemplo.com' });
    req.flush({ message: 'Código enviado com sucesso' });
  });

  it('should reset password with valid code', () => {
    service.resetPassword('teste@exemplo.com', '123456', 'novasenha123').subscribe((res) => {
      expect(res.message).toBe('Senha redefinida com sucesso');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/reset-password');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'teste@exemplo.com',
      code: '123456',
      newPassword: 'novasenha123',
    });
    req.flush({ message: 'Senha redefinida com sucesso' });
  });
});
