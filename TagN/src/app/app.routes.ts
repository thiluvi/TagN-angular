import { Routes } from '@angular/router';
import { doctorGuard } from './core/guards/doctor.guard';

export const routes: Routes = [
  // Layout Institucional (navbar + footer completo)
  {
    path: '',
    loadComponent: () =>
      import('./core/layouts/public-layout/public-layout.component').then(
        (m) => m.PublicLayoutComponent
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/home/home.component').then((m) => m.HomeComponent),
        title: 'Drª. Marcela Medeiros — Odontologia & Harmonização',
      },
    ],
  },

  // Layout Focado / Minimalista (header simples, sem navbar)
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
      {
        path: 'meus-agendamentos',
        loadComponent: () =>
          import('./features/my-appointments/my-appointments.component').then(
            (m) => m.MyAppointmentsComponent
          ),
        data: { headerTitle: 'AGENDAMENTO DE CONSULTA' },
        title: 'Meus Agendamentos — Drª. Marcela Medeiros',
      },
      {
        path: 'agendamentos',
        canActivate: [doctorGuard],
        loadComponent: () =>
          import('./features/doctor-appointments/doctor-appointments.component').then(
            (m) => m.DoctorAppointmentsComponent
          ),
        data: { headerTitle: 'GESTÃO DE AGENDAMENTOS' },
        title: 'Gestão de Agendamentos — Integra Clínica',
      },
      {
        path: 'consulta/:id',
        loadComponent: () =>
          import('./features/appointment-detail/appointment-detail.component').then(
            (m) => m.AppointmentDetailComponent
          ),
        data: { headerTitle: 'DETALHES DA CONSULTA' },
        title: 'Detalhes da Consulta — Integra Clínica',
      },
      {
        path: 'conta',
        loadComponent: () =>
          import('./features/account/account.component').then((m) => m.AccountComponent),
        data: { headerTitle: 'MINHA CONTA' },
        title: 'Minha Conta — Integra Clínica',
      },
      {
        path: 'termos-de-uso',
        loadComponent: () =>
          import('./features/legal/terms.component').then((m) => m.TermsComponent),
        data: { headerTitle: 'TERMOS DE USO' },
        title: 'Termos de Uso — Integra Clínica',
      },
      {
        path: 'politicas-de-privacidade',
        loadComponent: () =>
          import('./features/legal/privacy.component').then((m) => m.PrivacyComponent),
        data: { headerTitle: 'POLÍTICA DE PRIVACIDADE' },
        title: 'Políticas de Privacidade — Integra Clínica',
      },
    ],
  },

  // Fallback
  {
    path: '**',
    redirectTo: '',
  },
];
