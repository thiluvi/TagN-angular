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

  it('should register and authenticate user with full fields', () => {
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
        expect(service.isAuthenticated()).toBe(true);
        expect(service.currentUser()?.name).toBe('Maria Silva');
        expect(service.currentUser()?.email).toBe('maria@exemplo.com');
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
});
