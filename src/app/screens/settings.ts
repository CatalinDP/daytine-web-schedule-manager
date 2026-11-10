import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { AppTopBar } from '../design/app-top-bar';
import {
  AppDialog,
  DialogOption,
  OptionDialog,
  TextFieldDialog,
  TimeInputDialog,
} from '../design/app-dialog';
import {
  CardSettingContainer,
  DoubleLineSetting,
  OptionSetting,
  SectionTitle,
  SingleLineSettingButton,
  SwitchRow,
} from '../design/settings-rows';
import { Snackbar } from '../design/snackbar';
import { TimeValue, formatTime, toMinutes } from '../design/time';
import { APP_VERSION } from '../mocks/mock-data';
import { STRINGS } from '../mocks/strings';
import { ThemeMode, ThemeService } from '../theme/theme.service';
import { ProfileService } from '../data/profile.store';
import { BackupService, ImportError } from '../data/backup.service';
import { NotificationService } from '../data/notifications.service';

type OpenDialog = 'theme' | 'interval' | 'window' | 'units' | 'name' | 'start' | 'import' | null;
type Units = 'celsius' | 'fahrenheit';

const S = STRINGS.settings;

// On big screens the section title goes in a column on the left
const SECTION =
  'flex flex-col gap-2 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8 lg:border-t ' +
  'lg:border-outline-variant lg:py-6 lg:first-of-type:border-t-0 lg:first-of-type:pt-0';

const THEME_OPTIONS: readonly DialogOption<ThemeMode>[] = [
  { value: 'system', label: S.themeSystem },
  { value: 'light', label: S.themeLight },
  { value: 'dark', label: S.themeDark },
];

const INTERVAL_OPTIONS: readonly DialogOption<number>[] = S.intervals.map((label, index) => ({
  value: index + 1,
  label,
}));

const UNIT_OPTIONS: readonly DialogOption<Units>[] = [
  { value: 'celsius', label: S.celsius },
  { value: 'fahrenheit', label: S.fahrenheit },
];

// One message per import error. If a new error is added, this stops compiling until it has a text.
const IMPORT_ERRORS: Record<ImportError, string> = {
  'too-big': S.importTooBig,
  'read-error': S.importReadError,
  'invalid-json': S.importInvalid,
  'not-a-backup': S.importInvalid,
  'invalid-data': S.importInvalid,
  'newer-version': S.importNewerVersion,
};

function labelOf<T>(options: readonly DialogOption<T>[], value: T): string {
  return options.find((option) => option.value === value)?.label ?? '';
}

@Component({
  selector: 'dt-settings',
  imports: [
    AppDialog,
    AppTopBar,
    CardSettingContainer,
    DoubleLineSetting,
    OptionDialog,
    OptionSetting,
    SectionTitle,
    SingleLineSettingButton,
    Snackbar,
    SwitchRow,
    TextFieldDialog,
    TimeInputDialog,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto flex max-w-2xl flex-col gap-4 lg:mx-0 lg:max-w-4xl lg:gap-0">
      <dt-app-top-bar
        desktopHeading="title"
        [label]="s.label"
        [title]="s.pageTitle"
        [brand]="brand"
      />

      <section class="${SECTION}">
        <dt-section-title>{{ s.notifications }}</dt-section-title>
        <dt-card-setting-container>
          <dt-double-line-setting
            [label]="s.notificationPermission"
            [state]="notificationState()"
            [actionLabel]="notificationAction()"
            (action)="changeNotifications()"
          />
        </dt-card-setting-container>
      </section>

      <section class="${SECTION}">
        <dt-section-title>{{ s.location }}</dt-section-title>
        <dt-card-setting-container>
          <dt-double-line-setting
            [label]="s.locationPermission"
            [state]="s.notAllowed"
            [actionLabel]="common.openSettings"
            (action)="showNotConnected()"
          />
        </dt-card-setting-container>
      </section>

      <section class="${SECTION}">
        <dt-section-title>{{ s.appearance }}</dt-section-title>
        <dt-card-setting-container>
          <dt-option-setting
            [label]="s.theme"
            [options]="themeOptions"
            [selected]="theme.mode()"
            (pressed)="dialog.set('theme')"
            (selectedChange)="theme.setMode($event)"
          />
        </dt-card-setting-container>
      </section>

      <section class="${SECTION}">
        <dt-section-title>{{ s.rests }}</dt-section-title>
        <dt-card-setting-container>
          <dt-single-line-setting-button
            [label]="s.getUpInterval"
            [value]="intervalLabel()"
            (pressed)="dialog.set('interval')"
          />
          <dt-single-line-setting-button
            [label]="s.timeWindow"
            [value]="windowLabel()"
            (pressed)="dialog.set('window')"
          />
        </dt-card-setting-container>
      </section>

      <section class="${SECTION}">
        <dt-section-title>{{ s.weather }}</dt-section-title>
        <dt-card-setting-container>
          <dt-switch-row
            [label]="s.showWeather"
            [checked]="showWeather()"
            (checkedChange)="showWeather.set($event)"
          />
          <dt-option-setting
            [label]="s.units"
            [options]="unitOptions"
            [selected]="units()"
            (pressed)="dialog.set('units')"
            (selectedChange)="units.set($event)"
          />
        </dt-card-setting-container>
      </section>

      <section class="${SECTION}">
        <dt-section-title>{{ s.userSettings }}</dt-section-title>
        <dt-card-setting-container>
          <dt-single-line-setting-button
            [label]="s.changeName"
            [value]="userName()"
            (pressed)="dialog.set('name')"
          />
          <dt-single-line-setting-button
            [label]="s.changeStartTime"
            [value]="startLabel()"
            (pressed)="dialog.set('start')"
          />
        </dt-card-setting-container>
      </section>

      <section class="${SECTION}">
        <dt-section-title>{{ s.hints }}</dt-section-title>
        <dt-card-setting-container>
          <dt-single-line-setting-button
            [label]="s.resetHints"
            (pressed)="snackbar.set(s.hintsReset)"
          />
        </dt-card-setting-container>
      </section>

      <section class="${SECTION}">
        <dt-section-title>{{ s.about }}</dt-section-title>
        <dt-card-setting-container>
          <dt-single-line-setting-button
            [label]="s.version"
            [value]="version"
            [interactive]="false"
          />
          <dt-single-line-setting-button [label]="s.privacyPolicy" (pressed)="showNotConnected()" />
          <dt-single-line-setting-button [label]="s.sendFeedback" (pressed)="showNotConnected()" />
        </dt-card-setting-container>
      </section>

      <section class="${SECTION}">
        <dt-section-title>{{ s.backUpSettings }}</dt-section-title>
        <dt-card-setting-container>
          <dt-single-line-setting-button [label]="s.exportFile" (pressed)="exportBackup()" />
          <dt-single-line-setting-button [label]="s.importFile" (pressed)="fileInput.click()" />
        </dt-card-setting-container>
        <!-- Hidden: the "Import" row above opens it -->
        <input
          #fileInput
          type="file"
          accept=".json,application/json"
          class="hidden"
          (change)="loadFile($event)"
        />
      </section>
    </div>

    <dt-option-dialog
      [open]="dialog() === 'theme'"
      [title]="s.theme"
      [cancelLabel]="common.cancel"
      [options]="themeOptions"
      [value]="theme.mode()"
      (selected)="selectTheme($event)"
      (cancelled)="dialog.set(null)"
    />
    <dt-option-dialog
      [open]="dialog() === 'interval'"
      [title]="s.getUpInterval"
      [cancelLabel]="common.cancel"
      [options]="intervalOptions"
      [value]="interval()"
      (selected)="interval.set($event); dialog.set(null)"
      (cancelled)="dialog.set(null)"
    />
    <dt-option-dialog
      [open]="dialog() === 'units'"
      [title]="s.units"
      [cancelLabel]="common.cancel"
      [options]="unitOptions"
      [value]="units()"
      (selected)="units.set($event); dialog.set(null)"
      (cancelled)="dialog.set(null)"
    />
    <dt-text-field-dialog
      [open]="dialog() === 'name'"
      [title]="s.changeName"
      [label]="s.nameLabel"
      [value]="userName()"
      [cancelLabel]="common.cancel"
      [confirmLabel]="common.confirm"
      (confirmed)="updateName($event); dialog.set(null)"
      (cancelled)="dialog.set(null)"
    />
    <dt-time-input-dialog
      [open]="dialog() === 'start'"
      [title]="s.changeStartTime"
      [fields]="startFields()"
      [labels]="timeLabels"
      [cancelLabel]="common.cancel"
      [confirmLabel]="common.confirm"
      (confirmed)="updateStart($event[0]); dialog.set(null)"
      (cancelled)="dialog.set(null)"
    />
    <dt-time-input-dialog
      [open]="dialog() === 'window'"
      [title]="s.timeWindow"
      [fields]="windowFields()"
      [labels]="timeLabels"
      [cancelLabel]="common.cancel"
      [confirmLabel]="common.confirm"
      [validate]="validateWindow"
      (confirmed)="timeWindow.set($event); dialog.set(null)"
      (cancelled)="dialog.set(null)"
    />
    <dt-app-dialog
      icon="error"
      [open]="dialog() === 'import'"
      [title]="s.importTitle"
      [cancelLabel]="common.cancel"
      [confirmLabel]="common.confirm"
      (confirmed)="confirmImport()"
      (cancelled)="cancelImport()"
    >
      <p>{{ s.importHint }}</p>
    </dt-app-dialog>

    <dt-snackbar [message]="snackbar()" (dismissed)="snackbar.set(null)" />
  `,
})
export class Settings {
  protected readonly theme = inject(ThemeService);
  private readonly profileService = inject(ProfileService);
  private readonly backupService = inject(BackupService);
  private readonly notifications = inject(NotificationService);

  protected readonly s = S;
  protected readonly brand = STRINGS.brand;
  protected readonly common = STRINGS.common;
  protected readonly timeLabels = STRINGS.time;
  protected readonly version = APP_VERSION;
  protected readonly themeOptions = THEME_OPTIONS;
  protected readonly intervalOptions = INTERVAL_OPTIONS;
  protected readonly unitOptions = UNIT_OPTIONS;

  protected readonly dialog = signal<OpenDialog>(null);
  protected readonly snackbar = signal<string | null>(null);
  protected readonly interval = signal(2);
  protected readonly units = signal<Units>('celsius');
  protected readonly showWeather = signal(true);
  protected readonly userName = signal(this.profileService.user()?.name ?? '');
  protected readonly startTime = signal<TimeValue>(
    this.profileService.user()?.start ?? { hour: 9, minute: 0 },
  );
  protected readonly timeWindow = signal<readonly TimeValue[]>([
    { hour: 9, minute: 0 },
    { hour: 18, minute: 0 },
  ]);

  // File chosen by the user, waiting for the confirmation dialog
  private readonly pendingFile = signal<File | null>(null);

  protected readonly notificationState = computed(() => {
    if (!this.notifications.supported) return S.notSupported;
    return { granted: S.allowed, denied: S.blocked, default: S.notAllowed }[
      this.notifications.permission()
    ];
  });
  // Only an unanswered permission can be asked from the page; otherwise we explain how to change it
  protected readonly canAskNotifications = computed(
    () => this.notifications.supported && this.notifications.permission() === 'default',
  );
  protected readonly notificationAction = computed(() =>
    this.canAskNotifications() ? S.allow : S.howToChange,
  );

  protected readonly intervalLabel = computed(() => labelOf(INTERVAL_OPTIONS, this.interval()));
  protected readonly startLabel = computed(() => formatTime(this.startTime()));
  protected readonly windowLabel = computed(() =>
    this.timeWindow()
      .map((t) => formatTime(t))
      .join(' - '),
  );

  protected readonly startFields = computed(() => [
    { label: S.startTimeLabel, value: this.startTime() },
  ]);
  protected readonly windowFields = computed(() => {
    const [start, end] = this.timeWindow();
    return [
      { label: S.timeWindowStart, value: start },
      { label: S.timeWindowEnd, value: end },
    ];
  });

  protected updateName(name: string): void {
    this.userName.set(name);
    this.profileService.updateName(name);
  }

  protected updateStart(start: TimeValue): void {
    this.startTime.set(start);
    this.profileService.updateStart(start);
  }

  protected readonly validateWindow = ([start, end]: readonly TimeValue[]): string | null =>
    toMinutes(end) > toMinutes(start) ? null : S.timeWindowError;

  protected selectTheme(mode: ThemeMode): void {
    this.theme.setMode(mode);
    this.dialog.set(null);
  }

  protected async changeNotifications(): Promise<void> {
    if (this.canAskNotifications()) {
      await this.notifications.request();
    } else {
      this.snackbar.set(S.notificationsHelp);
    }
  }

  protected showNotConnected(): void {
    this.snackbar.set(this.common.notConnected);
  }

  protected exportBackup(): void {
    this.backupService.exportToFile();
    this.snackbar.set(S.exportDone);
  }

  protected loadFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // so choosing the same file again fires (change)
    if (!file) return;
    this.pendingFile.set(file);
    this.dialog.set('import');
  }

  protected async confirmImport(): Promise<void> {
    // Read the file before clearing it
    const file = this.pendingFile();
    this.pendingFile.set(null);
    this.dialog.set(null);
    if (!file) return;

    const result = await this.backupService.importFromFile(file);
    this.snackbar.set(
      result.ok ? S.importDone(result.backup.tasks.length) : IMPORT_ERRORS[result.error],
    );
  }

  protected cancelImport(): void {
    this.pendingFile.set(null);
    this.dialog.set(null);
  }
}
