import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ThemeService } from './theme/theme.service';
import { TaskNotifierService } from './data/task.notifier.service';
import { LanguageService } from './data/language';

@Component({
  selector: 'dt-root',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<router-outlet />',
})
export class App {
  constructor() {
    inject(TaskNotifierService);
    inject(ThemeService);
    inject(LanguageService);
  }
}
