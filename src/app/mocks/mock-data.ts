import { NavItem } from '../design/app-nav';
import { TaskSheetLabels } from '../design/task-sheet';
import { WeatherIcon } from '../design/weather';
import { STRINGS } from './strings';
import { Task } from '../data/task.model';

export interface MockHint {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly actionLabel?: string;
}

export const STREAK_DAYS = 3;
export const APP_VERSION = '0.1.0';

export const EMPTY_TASK: Task = {
  id: '',
  name: '',
  start: { hour: 9, minute: 0 },
  end: { hour: 9, minute: 30 },
  days: [],
  completedOn: [],
};

export const WEATHER: {
  icon: WeatherIcon;
  temperature: string;
  rain: number;
  max: string;
  min: string;
} = { icon: 'wb_sunny', temperature: '21°C', rain: 20, max: '24°', min: '14°' };

export const HOME_HINTS: readonly MockHint[] = [
  {
    id: 'plan',
    title: STRINGS.hints.planTitle,
    body: STRINGS.hints.planBody,
    actionLabel: STRINGS.hints.planAction,
  },
  { id: 'rest', title: STRINGS.hints.restTitle, body: STRINGS.hints.restBody },
];

export const NAV_ITEMS: readonly NavItem[] = [
  { route: '/', label: STRINGS.nav.home, icon: 'home' },
  { route: '/tasks', label: STRINGS.nav.tasks, icon: 'task' },
  { route: '/settings', label: STRINGS.nav.settings, icon: 'settings' },
];

export const TASK_SHEET_LABELS: TaskSheetLabels = {
  ...STRINGS.sheet,
  cancel: STRINGS.common.cancel,
  time: STRINGS.time,
};
