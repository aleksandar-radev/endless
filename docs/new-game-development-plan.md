# New Game Development Plan

## Vision and Goals

- Deliver a multiplayer-ready idle/RPG hybrid that modernizes the existing Endless gameplay loop (regions, staged combat, prestige layers, crystal and soul economies, rocky fields, etc.) while making all combat logic authoritative on the server.
- Unify heroes and enemies into a single "character" entity model capable of holding shared stats (life, mana, attack, defense), attributes, skills, buffs, equipment, and status effects.
- Maintain parity with current progression features (skill tree paths, buildings, training, quests, bosses, rocky field side mode, crystal shop, soul shop, runes, unique items) to give players familiar goals while enabling future content drops.
- Prioritize performance, cheat resistance, and scalable multiplayer touchpoints (leaderboards, synchronous/async PvP, co-op raids/world bosses).

## Phase 0 – Discovery and Requirements

1. **Inventory existing systems**
   - Review current combat flow (`combat.js`, `game.js`, `boss.js`, `region.js`) to document required interactions, tick timing, damage calculations, battle logging, boss mechanics, and Rocky Field variant fights.
   - Catalogue progression layers: hero leveling and training, buildings, prestige/ascension, crystal and soul shops, runes, unique items, quests, statistics tracking, offline fight resolution, and data migration expectations.
   - Document save data layout (produced by `getGlobals()` and persisted through `dataManager`) to define serialization and migration needs for the new backend.
2. **Feature backlog**
   - Core PvE loop parity with staged exploration, boss gating, Rocky Field special regions, and auto/active skill usage.
   - Extended features: multiplayer leaderboards, player-versus-player duels, cooperative world bosses, guild support, seasonal ladders.
   - UX parity: i18n support, audio cues, modular UI tabs (stats, inventory, runes, quest log, etc.).
3. **Technical decisions**
   - Choose backend stack (e.g., Node.js + TypeScript + Fastify/NestJS) with persistent storage (PostgreSQL + Redis for sessions/queues) and message broker (e.g., NATS) to support live multiplayer updates.
   - Determine hosting topology (monorepo vs. multi-repo, containerization, CI/CD, observability tools).

## Phase 1 – Domain Modeling & Backend Foundations

1. **Domain definitions**
   - `Character` aggregate: stats, attributes, derived combat values, equipment slots, skill loadout, buffs/debuffs, AI behavior profile.
   - `ProgressionProfile`: stage/region state, crystal & soul currencies, building levels, training allocations, quest progress, prestige history.
   - `Inventory` & `Item` domain: stackable materials, unique items, runes, crafting components.
   - `Encounter` aggregate: deterministic turn loop, action queue, RNG seed management, loot rolls, XP/soul/crystal rewards.
   - `SaveSlot`/`Account`: holds characters, progression profiles, settings, cosmetics.
2. **Backend services**
   - **Game Gateway API** (REST + WebSocket) for Vue client; handles auth, session, command dispatch.
   - **Combat Service** for deterministic simulations (supports PvE, async PvP, co-op fights).
   - **Progression Service** managing rewards, leveling, training, buildings, quest states.
   - **Economy Service** for shops (crystal, soul, runes), balancing, and daily offers.
   - **Social Service** for leaderboards, matchmaking, guild/world boss coordination.
   - Shared libraries for domain models, validation, math utilities, localization keys, and feature flagging.
3. **Security & anti-cheat**
   - Server-authoritative combat resolution with signed result packets.
   - Rate limiting, replay protection, signature checks on commands, audit logs for suspicious behavior.
   - Use deterministic RNG seeds per encounter to permit client-side replays without revealing hidden rolls.

## Phase 2 – Persistence, Migration, and Save Strategy

1. **Schema design**
   - Normalize characters, inventories, and encounter history; use JSONB for flexible stat snapshots.
   - Introduce versioned migrations mirroring current `migrations/` process to safely upgrade live data.
2. **Save cadence**
   - Mirror current 5-second throttled saves and snapshot deduplication while storing authoritative state server-side.
   - Implement delta-based persistence for high-frequency stats (life, mana) and periodic full snapshots for recovery.
3. **Offline progression**
   - Provide queued simulations for offline fights similar to `offlineFight.js`, executed server-side with rewards granted on next login.

## Phase 3 – Gameplay Systems Parity

1. **Combat engine**
   - Reimplement action timing (attack delays, regen ticks every 200ms), buff interactions (mana shield, crit multipliers), damage breakdown logging, and defeat flow (stage increment, Rocky Field progression, boss selection).
   - Support skill activations, auto-cast toggles, buff durations, DOTs, life steal, resurrection logic.
   - Convert current enemy definitions (`enemy.js`, `boss.js`, `rockyField.js`) into reusable character templates.
2. **Progression systems**
   - Skill tree path selection and respec, building upgrades affecting stats/resource generation, training & ascension loops, prestige resets with retained meta currencies.
   - Soul shop perks, crystal shop upgrades (including starting stage logic), runes crafting/upgrading, unique item acquisition.
   - Quest tracking and statistics achievements.
3. **Economy balancing**
   - Recreate drop tables, currency sinks, and scaling curves. Use analytics to ensure pacing matches existing game while enabling tuning via config files.

## Phase 4 – Frontend (Vue.js) Implementation

1. **Client architecture**
   - Vue 3 + TypeScript + Pinia store; UI components map to existing tabs (Stats, Inventory, Skill Tree, Shops, Quests, Battle Log).
   - Thin client: UI dispatches commands/events to backend, renders state streamed from authoritative services.
   - Maintain localization via i18n plugin using translation keys mirroring `src/constants/languages/`.
2. **Real-time interactions**
   - WebSocket subscription for combat updates, leaderboards, co-op boss status.
   - Optimistic UI with rollback for shop purchases where latency matters.
3. **Accessibility & UX**
   - Responsive layout, keyboard navigation for key actions, audio toggles equivalent to current `audio.js` behavior.

## Phase 5 – Multiplayer Features

1. **Leaderboards**
   - Aggregated stats (highest stage per region tier, Rocky Field best, fastest boss kills) updated via event pipeline.
2. **PvP**
   - Async duels using saved character builds and encounter simulator; anti-cheat by server-run results.
   - Optional synchronous matches with turn timers and spectator logs.
3. **Co-op / World Boss**
   - Shared boss HP pool with periodic rotations; server aggregates contributions and distributes rewards.
   - Raid queues, matchmaking, contribution tracking, enrage timers.
4. **Social layer**
   - Guild/clan system, chat moderation tools, friend lists.

## Phase 6 – Tooling, QA, and Launch

1. **Developer tooling**
   - Monorepo with linting, type checking, unit/integration tests, load testing harness for combat service.
   - Balancing dashboards for tuning stats, droprates, and economy multipliers.
2. **Testing**
   - Automated tests for combat math (unit tests vs. golden files), regression tests for migrations, end-to-end flows using Playwright or Cypress (client) + contract tests for API.
   - Performance/load tests replicating peak concurrent encounters and save/load bursts.
3. **Deployment**
   - CI/CD pipeline (GitHub Actions) building Docker images, running tests, deploying to staging/production.
   - Observability: structured logs, metrics (tick duration, encounter throughput), alerts for save backlog or queue saturation.

## Phase 7 – Post-Launch Iteration

- Live-ops roadmap: new regions, seasonal events, alternate progression (roguelike shards), cosmetic monetization.
- Telemetry-driven balancing: collect anonymized data, feed into dashboards, adjust configs without redeploying code.
- Community feedback loop: in-game surveys, roadmap visibility, rapid hotfix path for economy exploits.

## Risks & Mitigations

- **Complex migration of legacy save data** → build import tool that reads existing JSON saves, maps to new schema, and validates via integration tests.
- **Performance regressions** → define SLOs (combat tick < 10ms, API p95 < 150ms), instrument profilers, apply caching.
- **Cheating & exploits** → enforce server-side validation, secure randomness, detect anomalies with heuristics.
- **Scope creep** → maintain prioritized backlog, deliver MVP with core parity before expanding multiplayer scope.
