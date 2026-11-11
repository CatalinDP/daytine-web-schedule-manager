import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { ProfileService } from './profile.store';

export const requireProfile: CanActivateFn = () =>
  inject(ProfileService).user() !== null || inject(Router).createUrlTree(['/welcome']);
