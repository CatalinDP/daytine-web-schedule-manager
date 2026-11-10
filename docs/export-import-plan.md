# Export and import tasks as JSON

## Goal

The user can download all their data as a `.json` file and load it again, on the web or in the Android app. There are no accounts and no server: the file is the only way to move data between devices or to keep a backup.

## Decisions

| Topic            | Decision                                                                             | Why                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Format           | One JSON object with `app`, `version`, `exportedAt`, `tasks` (see `backup.model.ts`) | `app` tells our files apart from any other JSON; `version` lets the format change later |
| Field values     | Days as `"MONDAY"`, times as `{ hour, minute }`, dates as `"2026-11-09"`             | They map directly to Kotlin `DayOfWeek`, `LocalTime` and `LocalDate`                    |
| What is exported | Tasks with their history                                                             | The profile and settings like the theme stay per device                                 |
| Import mode      | **Replace** everything, after a confirmation dialog                                  | Simplest to explain and to build. Merging by `id` can come later                        |
| Invalid file     | Nothing changes, and a snackbar says why                                             | The current data is never half-overwritten                                              |
| Max size         | 1 MB                                                                                 | Real backups are a few KB; it stops huge files from freezing the page                   |

## Steps

### 1. `toBackup` and `backupFileName` (`src/app/data/backup.model.ts`)

- Build a `BackupFile`. Use `BACKUP_APP_ID`, `BACKUP_VERSION` and `now.toISOString()`.
- Map each task to a **new object** with only the `BackupTask` fields (don't spread `...task`).
- File name: `daytine-backup-${dateKey(now)}.json`.
- Write the tests in `backup.model.spec.ts` as you go.

### 2. `parseBackup` (`src/app/data/backup.model.ts`)

Check in this order and return the first error:

1. `JSON.parse` inside `try/catch` → `invalid-json`.
2. It's an object and `app === BACKUP_APP_ID` → otherwise `not-a-backup`.
3. `version` is a number and `<= BACKUP_VERSION` → otherwise `newer-version`.
4. `exportedAt` is a string and `tasks` passes `isTaskList` from `task.model.ts` → otherwise `invalid-data`.
5. Return `{ ok: true, backup }`, rebuilding the objects with only the known fields, like in `toBackup`.

### 3. Export (`src/app/data/backup.service.ts`)

```ts
const json = JSON.stringify(backup, null, 2);
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = backupFileName(now);
link.click();
URL.revokeObjectURL(url);
```

### 4. Import (`src/app/data/backup.service.ts`)

- If `file.size > MAX_BACKUP_BYTES`, return `{ ok: false, error: 'too-big' }`.
- `const text = await file.text();` then `parseBackup(text)`.
- If it's OK, replace the data:
  - Add `replaceAll(tasks: Task[])` to `TaskService`. It calls `setTasks` and clears `lastDeleted`.
- Return the result.

### 5. UI in Settings (`src/app/screens/settings.ts`)

- New section "Your data" with two rows (`dt-single-line-setting-button`): **Export tasks** and **Import tasks**.
- Export: call `backup.exportToFile()` and show a snackbar.
- Import:
  - A hidden `<input type="file" accept=".json,application/json">`. The row's click calls `input.click()` (use `viewChild`).
  - On `(change)`, keep the file and open a confirmation dialog: "This replaces all your tasks. Continue?". `AppDialog` from `app-dialog.ts` already supports title, cancel and confirm.
  - On confirm, call `importFromFile` and show one snackbar per result (`too-big`, `invalid-json`, etc.).
  - Reset `input.value = ''` so the same file can be picked twice.
- Put all texts in `strings.ts`.

### 6. Android app

- Use the same field names. With `kotlinx.serialization`, `@Serializable data class` objects with these names work as is.
- Export: `ACTION_CREATE_DOCUMENT` (Storage Access Framework). No storage permission is needed.
- Import: `ACTION_OPEN_DOCUMENT` with type `application/json`.
- Run the same checks as in step 2 (`app`, `version`, valid data).
- Test with a file exported from the web, and the other way round.

## Done when

- [ ] Every `it.todo` in `backup.model.spec.ts` is a real passing test.
- [ ] Export → delete everything → import leaves the same tasks and history.
- [ ] A random `.json`, a broken file and a file with `"version": 99` show an error and change nothing.
- [ ] A file exported on the web opens in the Android app, and the other way round.
- [ ] `ng build`, `ng lint` and `ng test` pass.

## Later

- Merge instead of replace: keep both, and for the same `id` join the `completedOn` lists.
- Android: share the file with the share sheet (`ACTION_SEND`) instead of saving it.
