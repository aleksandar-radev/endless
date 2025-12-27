# Package Management

- This project uses `pnpm` for package management.

# Code structure

- app/game logic is directly in `src/`
- constants are in `src/constants/` (and sometimes in subfolders)
- UI files are in `src/ui/`
- CSS files are in `src/css/`

### All these files are with similar naming convention. For example, in the case of buildings:

- `src/constants/buildings.js` - contains building constants (note the plural form)
- `src/ui/buildingUi.js` - contains the React component for displaying a building
- `src/css/building.css` - contains the CSS for the building component
- `src/building.js` - contains the game logic for buildings

# Changelog

- All changes should be in the latest changelog file in `changelog/` folder.
- Migrations are in `migrations/` folder. They are used when there is a change that requires updating existing saved games. (for example change of name or change a stat on existing items in the player's inventory)

# Languages

- All text is in `src/constants/languages/` folder.
- Each language has its own file, for example `en.js` for English, `es.js` for Spanish, etc.
- When adding new text, add it to all language files. You can copy from `en.js` and then translate.
- Everything should always be a translation key, do not hardcode text anywhere in the code.

# Performance

- Performance is important. Always consider performance when making changes.
- Use memoization where appropriate.
- Always identify expensive calculations or re-renders of html elements and optimize them.

# Code

- never use (await import('./globals.js')), instead use import { ... } from './globals.js'
- prefer import over require
- do not use global window object
- do not add dynamic imports, always import on top of file
- ignore linting and spacing errors ( Do not prompt to run pnpm lint)
- ignore indentation issues

* Do not run pnpm lint or pnpm build and do not commit any changes to generated files, except when you are explicitly asked to do so.
