import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-focus-layout',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './focus-layout.component.html',
  styleUrl: './focus-layout.component.scss',
})
export class FocusLayoutComponent {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected readonly headerTitle = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.extractHeaderTitle(this.activatedRoute))
    ),
    { initialValue: this.extractHeaderTitle(this.activatedRoute) }
  );

  private extractHeaderTitle(route: ActivatedRoute): string {
    let current: ActivatedRoute | null = route;
    while (current?.firstChild) {
      current = current.firstChild;
    }
    return (current?.snapshot?.data?.['headerTitle'] as string | undefined) ?? '';
  }
}
