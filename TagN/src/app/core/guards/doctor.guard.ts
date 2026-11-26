import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const doctorGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isDoctor()) {
    return true;
  }

  if (!authService.isAuthenticated()) {
    authService.openAuthModal('login', '/agendamentos');
  }

  return router.createUrlTree(['/']);
};
