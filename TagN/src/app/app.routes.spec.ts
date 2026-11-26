import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { App } from './app';
import { AuthService } from './core/services/auth.service';

describe('App Routing & Schedule Button', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient()],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should navigate to /agendamento when calling router.navigate(["/agendamento"])', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);

    const navigated = await router.navigate(['/agendamento']);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(navigated).toBe(true);
    expect(router.url).toBe('/agendamento');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-scheduling')).toBeTruthy();
  });

  it('should open auth modal when clicking "Agendar consulta" while logged out', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const authService = TestBed.inject(AuthService);

    await router.navigate(['/']);
    fixture.detectChanges();
    await fixture.whenStable();

    const heroBtn = fixture.nativeElement.querySelector('app-hero-section .btn-primary') as HTMLButtonElement;
    expect(heroBtn).toBeTruthy();
    heroBtn.click();
    fixture.detectChanges();

    expect(authService.isAuthModalOpen()).toBe(true);
    expect(authService.authModalMode()).toBe('login');
    expect(authService.pendingDestination()).toBe('/agendamento');
    expect(router.url).toBe('/');
    expect(fixture.nativeElement.querySelector('.modal-backdrop')).toBeTruthy();
  });

  it('should redirect to /agendamento when clicking "Agendar consulta" while logged in', async () => {
    localStorage.setItem(
      'tagn_auth_user',
      JSON.stringify({ id: '1', name: 'Teste', email: 'teste@teste.com' })
    );

    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const authService = TestBed.inject(AuthService);

    expect(authService.isAuthenticated()).toBe(true);

    await router.navigate(['/']);
    fixture.detectChanges();
    await fixture.whenStable();

    const heroBtn = fixture.nativeElement.querySelector('app-hero-section .btn-primary') as HTMLButtonElement;
    expect(heroBtn).toBeTruthy();
    heroBtn.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(router.url).toBe('/agendamento');
    expect(fixture.nativeElement.querySelector('app-scheduling')).toBeTruthy();
  });

  it('should navigate to /meus-agendamentos and render MyAppointmentsComponent', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);

    const navigated = await router.navigate(['/meus-agendamentos']);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(navigated).toBe(true);
    expect(router.url).toBe('/meus-agendamentos');
    expect(fixture.nativeElement.querySelector('app-my-appointments')).toBeTruthy();
  });

  it('should navigate to /conta and render AccountComponent', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);

    const navigated = await router.navigate(['/conta']);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(navigated).toBe(true);
    expect(router.url).toBe('/conta');
    expect(fixture.nativeElement.querySelector('app-account')).toBeTruthy();
  });

  it('should block /agendamentos for non-doctor users and allow dramarcela@gmail.com', async () => {
    localStorage.setItem(
      'tagn_auth_user',
      JSON.stringify({ id: '2', name: 'Paciente', email: 'paciente@teste.com' })
    );

    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);

    await router.navigate(['/agendamentos']);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(router.url).toBe('/');

    TestBed.resetTestingModule();
    localStorage.setItem(
      'tagn_auth_user',
      JSON.stringify({ id: '3', name: 'Dra. Marcela', email: 'dramarcela@gmail.com' })
    );

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient()],
    }).compileComponents();

    const docFixture = TestBed.createComponent(App);
    const docRouter = TestBed.inject(Router);

    const allowed = await docRouter.navigate(['/agendamentos']);
    docFixture.detectChanges();
    await docFixture.whenStable();

    expect(allowed).toBe(true);
    expect(docRouter.url).toBe('/agendamentos');
    expect(docFixture.nativeElement.querySelector('app-doctor-appointments')).toBeTruthy();
  });
});
