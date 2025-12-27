# Proposed File & Module Structure

The new project will be organized as a monorepo housing both backend (authoritative game services) and frontend (Vue.js client). Each responsibility is isolated to keep combat logic, economy math, persistence, and UI concerns separate while enabling shared domain models and constants.

```
endless-next/
├── package.json                # Workspace config (npm/pnpm workspaces)
├── pnpm-workspace.yaml
├── turbo.json                  # Task orchestration (lint/test/build)
├── docker/
│   ├── backend.Dockerfile
│   └── frontend.Dockerfile
├── config/
│   ├── default.yaml            # Environment-agnostic config (tick rates, save cadences, drop tables)
│   ├── production.yaml
│   ├── development.yaml
│   └── schema/                 # JSON schema validation for config files
├── scripts/
│   ├── seed-data.ts            # Bootstrap database with starter regions, characters, items
│   ├── migrate.ts              # Runs database migrations across services
│   └── balance-report.ts       # Generates analytics for designers
├── libs/
│   ├── domain/
│   │   ├── character/
│   │   │   ├── Character.ts    # Aggregate root for unified hero/enemy entity
│   │   │   ├── Attributes.ts   # Strength, agility, vitality, etc.
│   │   │   ├── Stats.ts        # Life, mana, regen, crit rates, resistances
│   │   │   ├── Skills.ts       # Active/passive skills, cooldown logic
│   │   │   └── Equipment.ts
│   │   ├── progression/
│   │   │   ├── StageProgress.ts
│   │   │   ├── BossProgress.ts
│   │   │   ├── RockyFieldProgress.ts
│   │   │   └── PrestigeProfile.ts
│   │   ├── economy/
│   │   │   ├── Currency.ts     # Crystals, souls, gold, etc.
│   │   │   ├── Shops.ts        # Crystal shop, soul shop, rune crafting
│   │   │   └── Rewards.ts
│   │   ├── inventory/
│   │   │   ├── Item.ts         # Shared item definition for unique items, crafting mats, runes
│   │   │   ├── Inventory.ts
│   │   │   └── Loadout.ts
│   │   ├── quest/
│   │   │   ├── Quest.ts        # Quest definitions & requirements
│   │   │   └── QuestLog.ts
│   │   └── combat/
│   │       ├── Encounter.ts    # Deterministic combat simulation
│   │       ├── ActionQueue.ts
│   │       ├── Damage.ts       # Damage formulas, breakdown logging
│   │       ├── Buffs.ts
│   │       └── RNG.ts          # Seeded RNG utilities
│   ├── constants/
│   │   ├── regions.ts          # Replaces `region.js`
│   │   ├── bosses.ts
│   │   ├── rockyField.ts
│   │   ├── skills.ts           # Unified list for characters & enemies
│   │   ├── items.ts
│   │   ├── buildings.ts
│   │   ├── quests.ts
│   │   ├── translations/
│   │   │   ├── en.json
│   │   │   └── ...
│   │   └── balance/
│   │       ├── growthCurves.ts
│   │       └── dropTables.ts
│   ├── math/
│   │   ├── scaling.ts          # Handles exponential/linear stat curves
│   │   ├── formatting.ts       # Number formatting akin to `format.js`
│   │   └── time.ts             # Tick intervals, regen calculations
│   ├── utils/
│   │   ├── validation.ts
│   │   ├── logger.ts
│   │   ├── featureFlags.ts
│   │   └── security.ts         # Hashing, signature helpers
│   └── messaging/
│       ├── events.ts           # Domain events names/contracts
│       └── pubsub.ts
├── backend/
│   ├── apps/
│   │   ├── gateway/            # REST + WebSocket interface
│   │   │   ├── src/
│   │   │   │   ├── main.ts
│   │   │   │   ├── modules/
│   │   │   │   │   ├── auth/
│   │   │   │   │   ├── sessions/
│   │   │   │   │   ├── combat-controller/
│   │   │   │   │   ├── progression-controller/
│   │   │   │   │   ├── leaderboards-controller/
│   │   │   │   │   └── websocket/
│   │   │   │   └── middleware/
│   │   │   └── tests/
│   │   ├── combat-service/
│   │   │   ├── src/
│   │   │   │   ├── orchestrators/   # Encounter processing, turn scheduling
│   │   │   │   ├── processors/     # Damage resolution, loot tables
│   │   │   │   ├── repositories/
│   │   │   │   ├── dto/
│   │   │   │   └── workers/
│   │   │   └── tests/
│   │   ├── progression-service/
│   │   ├── economy-service/
│   │   └── social-service/
│   ├── prisma/ or orm/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── tests/
│       ├── integration/
│       ├── contract/
│       └── load/
├── frontend/
│   ├── app/
│   │   ├── index.html
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── App.vue
│   │   │   ├── router/
│   │   │   ├── stores/
│   │   │   │   ├── character.ts       # Mirror backend character model
│   │   │   │   ├── encounter.ts
│   │   │   │   ├── economy.ts
│   │   │   │   └── settings.ts
│   │   │   ├── components/
│   │   │   │   ├── combat/
│   │   │   │   │   ├── BattleViewport.vue
│   │   │   │   │   ├── BattleLog.vue
│   │   │   │   │   └── SkillBar.vue
│   │   │   │   ├── progression/
│   │   │   │   │   ├── StagePanel.vue
│   │   │   │   │   ├── BossPanel.vue
│   │   │   │   │   └── RockyFieldPanel.vue
│   │   │   │   ├── economy/
│   │   │   │   │   ├── CrystalShop.vue
│   │   │   │   │   ├── SoulShop.vue
│   │   │   │   │   └── RunesWorkshop.vue
│   │   │   │   ├── character/
│   │   │   │   │   ├── StatsCard.vue
│   │   │   │   │   ├── AttributesTable.vue
│   │   │   │   │   ├── SkillTree.vue
│   │   │   │   │   └── TrainingPanel.vue
│   │   │   │   ├── inventory/
│   │   │   │   │   ├── InventoryGrid.vue
│   │   │   │   │   ├── ItemTooltip.vue
│   │   │   │   │   └── LoadoutManager.vue
│   │   │   │   ├── quests/
│   │   │   │   │   └── QuestLog.vue
│   │   │   │   ├── social/
│   │   │   │   │   ├── Leaderboard.vue
│   │   │   │   │   ├── PvPLobby.vue
│   │   │   │   │   └── WorldBoss.vue
│   │   │   │   ├── layout/
│   │   │   │   │   ├── TabNavigation.vue
│   │   │   │   │   ├── ResourceHUD.vue
│   │   │   │   │   └── SettingsDrawer.vue
│   │   │   ├── assets/
│   │   │   ├── composables/
│   │   │   │   ├── useWebSocket.ts
│   │   │   │   ├── useLocalization.ts
│   │   │   │   └── useNumberFormatter.ts
│   │   │   ├── locales/
│   │   │   ├── styles/
│   │   │   ├── utils/
│   │   │   └── types/
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   └── e2e/
│   │   └── vite.config.ts
│   └── tools/
│       ├── storybook/
│       └── design-tokens/
└── docs/
    ├── architecture/
    ├── gameplay/
    ├── api/
    ├── operations/
    └── changelog/
```

## Key Principles

- **Separation of concerns**: each service focuses on a narrow responsibility while shared libraries keep domain math consistent.
- **Shared domain package**: ensures front and back agree on stat names, skill ids, translation keys, and damage formulas.
- **Config-driven balance**: regions, bosses, skills, and progression scalars live in data files so designers can tweak without code changes.
- **Testability**: service tests reside beside code, with top-level integration/load suites for cross-service verification.
- **Vue isolation**: UI components grouped by feature (combat, progression, economy) mirroring current game's tab structure for maintainability.
