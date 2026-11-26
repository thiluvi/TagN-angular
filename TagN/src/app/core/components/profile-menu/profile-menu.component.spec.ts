import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProfileMenuComponent } from './profile-menu.component';
import { AuthService } from '../../services/auth.service';

describe('ProfileMenuComponent', () => {
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileMenuComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    authService.logout();
  });

  it('should toggle overlay menu on profile button click', () => {
    const fixture = TestBed.createComponent(ProfileMenuComponent);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.account-btn') as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.profile-popover')).toBeNull();

    button.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.profile-popover')).toBeTruthy();
  });

  it('should open auth modal when unauthenticated user selects "Meus agendamentos"', () => {
    const fixture = TestBed.createComponent(ProfileMenuComponent);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.account-btn') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.popover-item') as NodeListOf<HTMLButtonElement>;
    const agendamentosBtn = Array.from(items).find((el) => el.textContent?.includes('Meus agendamentos'));
    expect(agendamentosBtn).toBeTruthy();

    agendamentosBtn?.click();
    fixture.detectChanges();

    expect(authService.isAuthModalOpen()).toBe(true);
    expect(authService.pendingDestination()).toBe('/meus-agendamentos');
  });
});
