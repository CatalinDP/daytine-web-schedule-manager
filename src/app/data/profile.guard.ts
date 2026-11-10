import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { ProfileService } from './profile.store';

/** The app needs a saved profile, so send first-time visitors to onboarding. */
export const requireProfile: CanActivateFn = () =>
  inject(ProfileService).user() !== null || inject(Router).createUrlTree(['/welcome']);
