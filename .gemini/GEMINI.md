# Package Management

- This project uses `pnpm` for package management.

# Code structure

- constants are in `src/constants/`
- UI files are in `src/ui/`
- CSS files are in `src/css/`

### All these files are with similar naming convention. For example, in the case of buildings:

- `src/constants/buildings.js` - contains building constants (note the plural form)
- `src/ui/buildingUi.js` - contains the React component for displaying a building
- `src/css/building.css` - contains the CSS for the building component
- `src/building.js` - contains the game logic for buildings

# Changelog

- All changes should be in the latest changelog file in `changelog/` folder.
- Migrations are in `migrations/` folder. They are used when there is a change that requires updating existing saved games.

# Languages

- All text is in `src/constants/languages/` folder.
- Everything should always be a translation key, do not hardcode text anywhere in the code.
- When adding new text, add it to all language files.

# Performance

- Performance is important. Always consider performance when making changes.
- Use memoization where appropriate.
- Always identify expensive calculations or re-renders of html elements and optimize them.

# Code

- never use (await import('./globals.js')), instead use import { ... } from './globals.js'
- prefer import over require
- do not add dynamic imports, always import on top of file
- never use git add, git commit, git push.
