import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render the landing page and all section components', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('app-hero-section')).toBeTruthy();
    expect(compiled.querySelector('app-specialties-section')).toBeTruthy();
    expect(compiled.querySelector('app-about-section')).toBeTruthy();
    expect(compiled.querySelector('app-philosophy-section')).toBeTruthy();
    expect(compiled.querySelector('app-showcase-section')).toBeTruthy();
    expect(compiled.querySelector('app-journey-section')).toBeTruthy();
    expect(compiled.querySelector('app-faq-section')).toBeTruthy();
    expect(compiled.querySelector('app-cta-section')).toBeTruthy();
  });
});
