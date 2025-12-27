# Performance & Scalability Strategy

This document captures lessons from the current Endless codebase and extends them for the new server-authoritative architecture. High performance is crucial both for responsive gameplay and for resisting cheating via consistent authoritative simulations.

## Current Game Insights

- **Tick cadence**: `game.js` and `combat.js` rely on 200 ms regen intervals and attack timers; any new engine must support configurable tick rates while keeping per-tick work O(players + encounters).
- **Save throttling**: `dataManager.js` enforces a 5s local save interval, deduplicates snapshots (`_lastSerializedSnapshot`), and defers writes with promises. We should mimic throttled saves server-side to balance durability and throughput.
- **Offline fight handling**: `offlineFight.js` batches simulations and rewards, showing need for background workers that can run encounters without blocking the main loop.
- **Formatting & math utilities**: `format.js`, `materialsUtil.js`, and `functions.js` provide optimized number formatting and cryptographic helpers—indicating tight control over repeated calculations.
- **UI update batching**: UI modules (e.g., `ui/ui.js`, `ui/statsAndAttributesUi.js`) update DOM in targeted ways; Vue client should adopt similar fine-grained reactivity to avoid unnecessary re-renders.

## Backend Performance Principles

1. **Deterministic Simulation**
   - Use fixed-step combat loop with precomputed turn order, caching derived stats per encounter.
   - Keep RNG seed per encounter, enabling replays and debugging without recomputation.
2. **Horizontal Scalability**
   - Stateless API gateway; sticky sessions only for WebSocket connection routing.
   - Combat workers process encounters via job queues (e.g., BullMQ/NATS JetStream). Maintain worker pools sized to CPU cores.
3. **Efficient Persistence**
   - Adopt write-ahead log / event-sourcing for encounters to replay results or audit cheating.
   - Persist frequently changing stats (life, mana) via Redis with periodic flush to PostgreSQL to reduce I/O.
   - Run background compaction jobs to snapshot player state, similar to deduping in `dataManager`.
4. **Caching**
   - Cache static balance data (regions, bosses, skill definitions) in memory at service startup and refresh via config hot-reload.
   - Use CDN or edge caching for localization bundles and static assets.
5. **Network Optimization**
   - Compress payloads (JSON -> binary protocols like Protocol Buffers for combat streams).
   - Diff-based state updates over WebSocket: send only changed fields (HP delta, buff timers) per tick.
6. **Profiling & Instrumentation**
   - Integrate tracing (OpenTelemetry) capturing encounter duration, queue wait times, DB response.
   - Metrics: encounter TPS, queue backlog, save latency, websocket fan-out counts.
   - Alert thresholds aligned with SLA (combat tick < 10ms, API p95 < 150ms).

## Frontend Performance Principles

1. **Reactive Stores**
   - Pinia modules subscribe to WebSocket patches, update only necessary observables (similar to targeted `updatePlayerLife`, `updateResources`).
2. **Virtualized Lists**
   - Virtual scroll for inventory, leaderboards, battle logs to prevent DOM bloat.
3. **Code Splitting**
   - Route-level and component-level dynamic imports; prefetch active tabs.
4. **Web Worker Usage**
   - Offload expensive local formatting (e.g., large number formatting) or offline replay preview calculations to workers.
5. **Asset Strategy**
   - Use vector or compressed sprites; lazy-load audio similar to `audio.js` to avoid blocking main thread.

## Multiplayer & Real-time Considerations

- **World Boss Scaling**: Partition boss HP pools per shard; use CRDT or consistent hashing to aggregate contributions without a single bottleneck.
- **Leaderboards**: Maintain incremental aggregates via Redis sorted sets, flush to SQL periodically.
- **PvP**: For synchronous matches, enforce turn deadlines via server timers; disconnect/resync logic handled by authoritative state.

## Testing & Monitoring

- Load-test combat service with synthetic encounters (mirroring `enemy.js`/`hero.js` stat ranges) to ensure stability under peak.
- Chaos testing for queue delays, DB outages, and network partition to guarantee graceful degradation.
- Benchmark serialization/deserialization for save payloads; ensure encryption/signature overhead mirrors current `crypt` usage without significant latency.

## Optimization Backlog

- Build automated regression benchmarks comparing new engine outputs to legacy combat logs for correctness and timing.
- Explore SIMD or WebAssembly modules for tight loops (damage calculation, RNG) if CPU hotspots emerge.
- Investigate delta compression for long-running world boss updates to reduce bandwidth.
