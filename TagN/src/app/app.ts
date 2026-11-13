import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthModalComponent } from './core/components/auth-modal/auth-modal.component';

@Component({
  imports: [RouterOutlet, AuthModalComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('TagN');
}
