---
mode: agent
---

- run the changelog prompt first (changelog.prompt.md) to write changelog, bump version, and add migration
- run `pnpm build:electron`
- run `pnpm dist:win`
- run `pnpm dist:linux`
- remind the user to run the following git commands manually (do NOT run them yourself):
  ```
  git add -A
  git commit -m "v<version>"
  git tag v<version>
  git push && git push --tags
  ```
