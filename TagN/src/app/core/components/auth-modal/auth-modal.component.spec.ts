import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthModalComponent } from './auth-modal.component';
import { AuthService } from '../../services/auth.service';

describe('AuthModalComponent', () => {
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthModalComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    authService.logout();
    authService.closeAuthModal();
  });

  it('should not render backdrop when closed', () => {
    const fixture = TestBed.createComponent(AuthModalComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.modal-backdrop')).toBeNull();
  });

  it('should render modal dialog and switch between login and register', () => {
    authService.openAuthModal('login');
    const fixture = TestBed.createComponent(AuthModalComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.modal-backdrop')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.modal-title')?.textContent).toContain('Login');

    const tabs = fixture.nativeElement.querySelectorAll('.tab-btn') as NodeListOf<HTMLButtonElement>;
    tabs[1].click();
    fixture.detectChanges();

    expect(authService.authModalMode()).toBe('register');
    expect(fixture.nativeElement.querySelector('.modal-title')?.textContent).toContain('Criar conta');
    // Verifica presença dos 7 campos de cadastro
    expect(fixture.nativeElement.querySelector('#reg-name')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#reg-email')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#reg-phone')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#reg-cpf')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#reg-birthDate')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#reg-password')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#reg-confirmPassword')).toBeTruthy();
  });
});
