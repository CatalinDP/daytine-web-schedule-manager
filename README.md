<p align="center">
  <img src="public/logo.svg" alt="" width="96" height="96" />
</p>

<h1 align="center">DayTine</h1>

<p align="center">Your day, at a good pace. A daily routine planner built with Angular.</p>

<p align="center">
  <a href="https://github.com/CatalinDP/daytine-web-schedule-manager/actions/workflows/ci.yml"><img src="https://github.com/CatalinDP/daytine-web-schedule-manager/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI status" /></a>
</p>

---

DayTine helps you build a daily routine: create tasks with a time and the weekdays they repeat on, tick them off each day, get a browser notification when each one starts, and see how your week is going.

This is the web version. There is also an Android app; both use the same backup file format, so tasks can move between them.

## Features

- **Tasks:** create, edit and delete them (with undo), choose start and end time and the days they repeat on.
- **Daily tracking:** tick tasks off per day; the history is kept for each date.
- **Weekly view:** a board for the whole week on desktop, one day at a time on mobile, plus a weekly completion chart.
- **Reminders:** a browser notification when a task starts, while the app is open.
- **Backup:** export your tasks to a JSON file and import them again, on the web or in the Android app.
- **Personalization:** light, dark or system theme, and English or Spanish.
- **Responsive and accessible:** works from phone to desktop, with keyboard navigation and screen reader labels.
- **No account needed:** everything is stored in your browser.

Weather, streaks and location are placeholders for now.

## Tech stack

- [Angular 22](https://angular.dev): standalone components, signals, zoneless change detection, lazy-loaded routes
- [Tailwind CSS 4](https://tailwindcss.com) with Material 3 color tokens
- [Vitest](https://vitest.dev) for unit and component tests
- ESLint ([angular-eslint](https://github.com/angular-eslint/angular-eslint)) and Prettier
- TypeScript in strict mode

## Getting started

Requirements: **Node.js** `^22.22.3`, `^24.15.0` or `>=26` and **npm**. The version CI uses is in `.nvmrc`; with [nvm](https://github.com/nvm-sh/nvm) you can run `nvm use` to switch to it.

```sh
npm ci
npm start
```

Then open http://localhost:4200.

## Scripts

| Command                | What it does                              |
| ---------------------- | ----------------------------------------- |
| `npm start`            | Dev server with live reload               |
| `npm test`             | Unit and component tests (Vitest)         |
| `npm run lint`         | ESLint                                    |
| `npm run format`       | Format every file with Prettier           |
| `npm run format:check` | Check the formatting without changing it  |
| `npm run build`        | Production build into `dist/daytine-web/` |

## Continuous integration

Every pull request to `main`, and every push to `main`, runs the [CI workflow](.github/workflows/ci.yml) on GitHub Actions. It installs the dependencies with `npm ci`, using the Node version in `.nvmrc`, and then runs these checks in order. If one fails, the run stops there:

1. Formatting (Prettier, check only: it never changes files)
2. Lint (ESLint)
3. Unit and component tests (Vitest)
4. Production build

To run the same checks locally before you push:

```sh
npm run format:check
npm run lint
npm test -- --watch=false
npm run build
```

If the formatting check fails, run `npm run format` and commit the result.

### Formatting on your machine

You rarely need to run Prettier by hand:

- **On save:** the workspace settings in `.vscode/` make VS Code format every file with Prettier when you save it. Install the recommended [Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) when VS Code suggests it.
- **On commit:** a [husky](https://typicode.github.io/husky/) `pre-commit` hook runs [lint-staged](https://github.com/lint-staged/lint-staged), which formats the staged files before the commit is created. `npm install` / `npm ci` set the hook up automatically.

CI still checks the formatting, so a commit made with `--no-verify` is caught there.

## Project structure

```
src/
├── app/
│   ├── data/      State and logic: services, models, validators (no UI)
│   ├── design/    Reusable UI components; they only take inputs and emit outputs
│   ├── screens/   Pages: welcome, home, tasks, settings
│   ├── mocks/     App texts (English and Spanish) and placeholder data
│   └── theme/     Light / dark / system theme
└── styles/        Color tokens and Tailwind theme
```

## Data and privacy

There is no backend. Tasks, profile and settings are saved in the browser's `localStorage`, and everything read back is validated before use. Clearing the site data deletes them, so use **Settings → Export tasks file** to keep a backup.

## Documentation

- [Export and import plan](docs/export-import-plan.md): the backup file format shared with the Android app
