# Save System Update Overview

## How to Test the Changes

1. **Install dependencies**: `pnpm install`
2. **Start the game locally**: `pnpm dev` and open the development URL shown in the terminal.
3. **Create gameplay activity**:
   - Engage in Explore combat long enough to obtain several material drops.
   - Spend and earn materials to ensure inventory updates occur.
4. **Verify autosave behaviour**:
   - Leave the game idling for at least 10 seconds; saves should occur roughly every five seconds.
   - Watch the HUD next to the offline progress label and confirm that the "Last saved" indicator updates when saves complete.
5. **Stress-test storage limits** (optional):
   - Use browser devtools to fill localStorage with large dummy entries.
   - Trigger another autosave and confirm that a toast warns about quota limits instead of crashing the game.
6. **Lint for regressions**: `pnpm lint`

## How the Debounced Save Flow Works

- `DataManager.saveGame` delays local writes so routine saves run at most once every five seconds. If a force-save or cloud sync happens, it bypasses the delay.
- When a save is due, `_performSave` serializes the live game state, reuses the previously encrypted snapshot when unchanged, and writes the result to the active slot plus the legacy key when space allows.
- After a successful write the manager records the timestamp, dispatches a `dataManager:saved` event, and the HUD listener updates the on-screen "Last saved" text.
- Cloud saves reuse the freshly serialized payload, supplement it with the other slot snapshots read from storage, and send the combined payload to the API.

## What `purgeBackupSaves` Does

- `_purgeBackupSaves` scans `localStorage` for keys that start with `game_backup_`, which come from older migration backups created before the new quota handling.
- If quota errors occur while writing the real save slot, those legacy backups are deleted to recover space and let the new save succeed.
- The method only touches backup keys—never the active save slots—so removing them is safe. The worst case is losing redundant rollback copies that are no longer necessary once the live save is healthy.
