import { Routes } from '@angular/router';

export const routes: Routes = [
  // Layout Institucional Completo
  {
    path: '',
    loadComponent: () =>
      import('./core/layouts/public-layout/public-layout.component').then(
        (m) => m.PublicLayoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/home.component').then((m) => m.HomeComponent),
        title: 'Drª. Marcela Medeiros — Odontologia & Harmonização',
      },
    ],
  },

  // Layout Focado / Minimalista
  {
    path: '',
    loadComponent: () =>
      import('./core/layouts/focus-layout/focus-layout.component').then(
        (m) => m.FocusLayoutComponent
      ),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent),
        data: { headerTitle: 'ACESSE SUA CONTA' },
        title: 'Acesse sua conta — Drª. Marcela Medeiros',
      },
      {
        path: 'cadastro',
        loadComponent: () =>
          import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
        data: { headerTitle: 'CRIE SUA CONTA' },
        title: 'Crie sua conta — Drª. Marcela Medeiros',
      },
      {
        path: 'agendamento',
        loadComponent: () =>
          import('./features/scheduling/scheduling.component').then((m) => m.SchedulingComponent),
        data: { headerTitle: 'AGENDAMENTO DE CONSULTA' },
        title: 'Agendamento de Consulta — Drª. Marcela Medeiros',
      },
    ],
  },

  // Fallback para rota inicial
  {
    path: '**',
    redirectTo: '',
  },
];
