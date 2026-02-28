# Advanced Stat Breakdown Tooltips — Implementation Plan

## Goal

When hovering any stat label in the Stats tab, show a tooltip that breaks down **every source contributing to that stat** (flat and percent), sorted by contribution descending, so the player can immediately see what's boosting them most.

This mirrors the existing `getAdvancedAttributeTooltip()` / `hero.statBreakdown` system that already works for **attributes** (strength, agility, etc.), and extends it to cover all stats.

---

## Current State (What Already Exists)

| Thing                                            | Status                                                      |
| ------------------------------------------------ | ----------------------------------------------------------- |
| `hero.statBreakdown[attr]` per-source breakdown  | ✅ Exists, attributes only                                  |
| `getAdvancedAttributeTooltip(attr)`              | ✅ Exists, attributes only                                  |
| `options.showAdvancedAttributeTooltips` toggle   | ✅ Exists, attributes only                                  |
| Stat label tooltips (offense/defense/misc panel) | ❌ Just shows static `getAttributeTooltip(key)` description |
| `generateStatBreakdown()` covering `STAT_KEYS`   | ❌ Only covers `ATTRIBUTE_KEYS`                             |

---

## Architecture Overview

### All Sources That Can Contribute to a Stat

The following sources are already passed into `generateStatBreakdown()` and must be tracked per stat:

| Source Key     | Object                                        | `isFraction` | Notes                                  |
| -------------- | --------------------------------------------- | ------------ | -------------------------------------- |
| `base`         | `STATS[stat].base + levelUpBonus * (level-1)` | —            | Hard-coded, not editable               |
| `perma`        | `hero.permaStats`                             | false        | Permanent potion bonuses               |
| `items`        | `equipmentBonuses`                            | false        | From `inventory.getEquipmentBonuses()` |
| `skills`       | `skillTreeBonuses`                            | false        | Skill tree                             |
| `training`     | `trainingBonuses`                             | false        | Training tab                           |
| `quests`       | `questsBonuses`                               | false        | Quest rewards                          |
| `achievements` | `achievementsBonuses`                         | true         | Achievement rewards                    |
| `prestige`     | `prestigeBonuses`                             | true         | Prestige bonuses                       |
| `ascension`    | `ascensionBonuses`                            | true         | Ascension bonuses                      |
| `soul`         | `soulBonuses`                                 | true         | Soul Shop                              |
| `runes`        | `runeBonuses`                                 | false        | Runes                                  |
| `attributes`   | computed via `calculateAttributeEffects()`    | —            | Indirect: e.g. STR → damage            |
| `ads`          | `getAdBonusMultipliers()`                     | —            | Multiplicative, temporary              |

### Shared/Cascade Bonuses (Flat)

These are bonus keys that do not map directly to a single stat but affect multiple stats:

| Shared Key       | Affects                                                           |
| ---------------- | ----------------------------------------------------------------- |
| `allAttributes`  | Every attribute (STR, AGI, INT, VIT, END)                         |
| `allResistance`  | Every elemental resistance                                        |
| `{stat}PerLevel` | Stat key derived at runtime (`damage` if key is `damagePerLevel`) |

### Shared/Cascade Bonuses (Percent)

| Shared Percent Key             | Affects                                                             |
| ------------------------------ | ------------------------------------------------------------------- |
| `allAttributesPercent`         | Every attribute's percent multiplier                                |
| `allResistancePercent`         | Every resistance's percent multiplier                               |
| `totalDamagePercent`           | `damage` flat entry + elemental damage via `DAMAGE_PERCENT_SOURCES` |
| `elementalDamagePercent`       | All elemental damage types                                          |
| `{element}DamagePercent` (own) | That specific elemental damage type                                 |
| `{stat}PercentPerLevel`        | Percent bonus per hero level                                        |

---

## Step-by-Step Implementation

### Step 1 — Extend `generateStatBreakdown()` in `src/hero.js`

**Current:** loops over `ATTRIBUTE_KEYS` only.  
**New:** also loops over all `STAT_KEYS` that are **not** attributes (or just loop everything; attributes will be overwritten last as before).

#### 1a. Define a helper to extract flat + percent for any stat from any source

```js
// Very similar to existing getSourceValues but for any stat (not just attributes)
const getStatSourceValues = (source, stat, isFraction = false) => {
  // Direct flat bonus for this stat
  let flat = source[stat] || 0;
  // Shared flat bonuses that cascade to this stat
  if (RESISTANCE_SET.has(stat)) flat += source.allResistance || 0;
  // PerLevel flat bonus: e.g. 'damagePerLevel' → scales to stat 'damage'
  const perLevelKey = `${stat}PerLevel`;
  if (source[perLevelKey]) flat += source[perLevelKey] * hero.level;

  // Percent bonus specific to this stat
  let percent = getNorm(source[`${stat}Percent`], `${stat}Percent`, isFraction);
  // Shared percent bonuses that cascade
  if (RESISTANCE_SET.has(stat)) {
    percent += getNorm(
      source.allResistancePercent,
      "allResistancePercent",
      isFraction,
    );
  }
  // PercentPerLevel: e.g. 'damagePercentPerLevel'
  const perLevelPctKey = `${stat}PercentPerLevel`;
  if (source[perLevelPctKey]) {
    percent +=
      getNorm(source[perLevelPctKey], perLevelPctKey, isFraction) * hero.level;
  }
  return { flat, percent };
};
```

#### 1b. Loop over STAT_KEYS (non-attributes)

```js
STAT_KEYS.forEach((stat) => {
  if (ATTRIBUTE_SET.has(stat)) return; // attributes already handled above

  const base =
    (STATS[stat]?.base || 0) +
    (STATS[stat]?.levelUpBonus || 0) * (this.level - 1);

  const permaVals = getStatSourceValues(this.permaStats, stat, false);
  const itemsVals = getStatSourceValues(equipmentBonuses, stat, false);
  const skillsVals = getStatSourceValues(skillTreeBonuses, stat, false);
  const trainingVals = getStatSourceValues(trainingBonuses, stat, false);
  const questsVals = getStatSourceValues(questsBonuses, stat, false);
  const achievVals = getStatSourceValues(achievementsBonuses, stat, true);
  const prestigeVals = getStatSourceValues(prestigeBonuses, stat, true);
  const ascVals = getStatSourceValues(ascensionBonuses, stat, true);
  const soulVals = getStatSourceValues(soulBonuses, stat, true);
  const runeVals = getStatSourceValues(runeBonuses, stat, false);

  // Attribute effects: re-use already-computed attributeEffects object
  // Must pass attributeEffects into generateStatBreakdown — see step 1c
  const attrFlat = attributeEffects[stat] || 0;
  const attrPercent = getNorm(
    attributeEffects[`${stat}Percent`],
    `${stat}Percent`,
    false,
  );

  this.statBreakdown[stat] = {
    base,
    perma: permaVals.flat,
    items: itemsVals.flat,
    skills: skillsVals.flat,
    training: trainingVals.flat,
    quests: questsVals.flat,
    achievements: achievVals.flat,
    prestige: prestigeVals.flat,
    ascension: ascVals.flat,
    soul: soulVals.flat,
    runes: runeVals.flat,
    attributes: attrFlat, // indirect: from hero's attributes
    percent: {
      perma: permaVals.percent,
      items: itemsVals.percent,
      skills: skillsVals.percent,
      training: trainingVals.percent,
      quests: questsVals.percent,
      achievements: achievVals.percent,
      prestige: prestigeVals.percent,
      ascension: ascVals.percent,
      soul: soulVals.percent,
      runes: runeVals.percent,
      attributes: attrPercent,
    },
  };
});
```

#### 1c. Pass `attributeEffects` into `generateStatBreakdown()`

`attributeEffects` is currently computed **after** `generateStatBreakdown()` is called in `recalculateFromAttributes()`. Fix the call order:

```js
// In recalculateFromAttributes():

// 4) Calculate Attribute Effects  ← move this BEFORE generateStatBreakdown
const attributeEffects = this.calculateAttributeEffects(skillTreeBonuses);

// Generate Stat Breakdown (now receives attributeEffects too)
this.generateStatBreakdown(
  prestigeBonuses,
  questsBonuses,
  achievementsBonuses,
  equipmentBonuses,
  skillTreeBonuses,
  trainingBonuses,
  soulBonuses,
  runeBonuses,
  attributeEffects, // ← new parameter
);
```

Update the method signature accordingly:

```js
generateStatBreakdown(prestigeBonuses, questsBonuses, achievementsBonuses,
  equipmentBonuses, skillTreeBonuses, trainingBonuses, soulBonuses, runeBonuses,
  attributeEffects = {}) { ... }
```

#### 1d. Special Cases Inside `generateStatBreakdown()`

| Special Case                                             | Handling                                                                                                                                                                                                                                                          |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ascensionElementalDamage`                               | Add `ascensionBonuses.ascensionElementalDamage` (per-element share) to `ascVals.flat` for each `{element}Damage` stat                                                                                                                                             |
| `allAttributes` flat                                     | For attributes only, already handled via `getSourceValues` adding `source.allAttributes`                                                                                                                                                                          |
| `manaPerLevel` bonus                                     | Tracked as a standalone stat bonus (`mana`'s `PerLevel` key cascades naturally)                                                                                                                                                                                   |
| Percent stats (keys ending in `Percent`)                 | `flat` bucket will always be 0; only `percent` bucket matters. The breakdown should only show percent rows.                                                                                                                                                       |
| `totalDamagePercent`                                     | For `damage`, add it as a shared percent source. For elemental damage types, handled via `elementalDamagePercent + totalDamagePercent`.                                                                                                                           |
| Intelligence → elemental (distributed)                   | The `attributeEffects` will already contain per-`{element}Damage` amounts after `distributeElementalAmount`. Use those directly; don't double-count.                                                                                                              |
| `attackSpeed` special formula                            | The flat breakdown still accurately shows each source's flat additive contribution. Note in tooltip that attackSpeed uses `base × (1 + %) + flat additions`.                                                                                                      |
| `convertManaToLifePercent` / `manaToLifeTransferPercent` | These post-process `life` and `mana` after all other calculations. Add a special note row in the breakdown tooltip for those two stats only.                                                                                                                      |
| `blockChance` (requires shield)                          | If no shield equipped, show tooltip note: "Requires a shield" instead of the breakdown.                                                                                                                                                                           |
| Ad bonuses                                               | Tracked as a multiplicative source. Store `adFlat` = `(adMultipliers[stat] - 1)` when non-zero. Display as a separate row labeled "Ads (Active)" in a different color. Ad bonuses apply after flat+percent, so document them as a multiplier row, not a flat row. |

---

### Step 2 — Create `getAdvancedStatTooltip(key)` in `src/ui/statsAndAttributesUi.js`

```js
function getAdvancedStatTooltip(key) {
  const breakdown = hero.statBreakdown?.[key];
  if (!breakdown)
    return html`<strong>${formatStatName(key)}</strong
      ><br />${getAttributeTooltip(key)}`;

  const isPercent = key.endsWith("Percent");
  const divisor = getDivisor(key);
  const decimals = getStatDecimalPlaces(key);
  const finalValue = hero.stats[key];

  // Build the ordered list of flat sources (skip for pure percent stats)
  const flatSources = isPercent
    ? []
    : [
        { label: t("stats.breakdown.base"), flat: breakdown.base, percent: 0 },
        {
          label: t("stats.breakdown.attributes"),
          flat: breakdown.attributes,
          percent: breakdown.percent.attributes,
        },
        {
          label: t("stats.breakdown.items"),
          flat: breakdown.items,
          percent: breakdown.percent.items,
        },
        {
          label: t("stats.breakdown.skills"),
          flat: breakdown.skills,
          percent: breakdown.percent.skills,
        },
        {
          label: t("stats.breakdown.training"),
          flat: breakdown.training,
          percent: breakdown.percent.training,
        },
        {
          label: t("stats.breakdown.potions"),
          flat: breakdown.perma,
          percent: breakdown.percent.perma,
        },
        {
          label: t("stats.breakdown.quests"),
          flat: breakdown.quests,
          percent: breakdown.percent.quests,
        },
        {
          label: t("stats.breakdown.achievements"),
          flat: breakdown.achievements,
          percent: breakdown.percent.achievements,
        },
        {
          label: t("stats.breakdown.prestige"),
          flat: breakdown.prestige,
          percent: breakdown.percent.prestige,
        },
        {
          label: t("stats.breakdown.ascension"),
          flat: breakdown.ascension,
          percent: breakdown.percent.ascension,
        },
        {
          label: t("stats.breakdown.soulShop"),
          flat: breakdown.soul,
          percent: breakdown.percent.soul,
        },
        {
          label: t("stats.breakdown.runes"),
          flat: breakdown.runes,
          percent: breakdown.percent.runes,
        },
      ].filter((s) => s.flat || s.percent);

  // For percent stats, build percent sources instead
  const percentSources = isPercent
    ? [
        { label: t("stats.breakdown.items"), percent: breakdown.percent.items },
        {
          label: t("stats.breakdown.skills"),
          percent: breakdown.percent.skills,
        },
        {
          label: t("stats.breakdown.training"),
          percent: breakdown.percent.training,
        },
        {
          label: t("stats.breakdown.potions"),
          percent: breakdown.percent.perma,
        },
        {
          label: t("stats.breakdown.quests"),
          percent: breakdown.percent.quests,
        },
        {
          label: t("stats.breakdown.achievements"),
          percent: breakdown.percent.achievements,
        },
        {
          label: t("stats.breakdown.prestige"),
          percent: breakdown.percent.prestige,
        },
        {
          label: t("stats.breakdown.ascension"),
          percent: breakdown.percent.ascension,
        },
        {
          label: t("stats.breakdown.soulShop"),
          percent: breakdown.percent.soul,
        },
        { label: t("stats.breakdown.runes"), percent: breakdown.percent.runes },
      ].filter((s) => s.percent)
    : [];

  // Sort by contribution descending so most impactful source appears first
  flatSources.sort((a, b) => Math.abs(b.flat) - Math.abs(a.flat));
  percentSources.sort((a, b) => Math.abs(b.percent) - Math.abs(a.percent));

  // Format value based on whether it's a percent stat
  const fmt = (val) => {
    if (divisor !== 1) return (val * divisor).toFixed(decimals) + "%";
    return formatNumber(val.toFixed(decimals));
  };

  const fmtPct = (pct) => (pct * 100).toFixed(1) + "%";

  const lines = flatSources
    .map(
      (s) =>
        `${s.label}: +${fmt(s.flat)}${s.percent ? ` <em>(+${fmtPct(s.percent)})</em>` : ""}`,
    )
    .join("<br />");

  const pctLines = percentSources
    .map((s) => `${s.label}: +${fmtPct(s.percent)}`)
    .join("<br />");

  const descBlock = html` <div
    style="margin-bottom:8px; font-size:0.9em; color:var(--text-muted);
                border-bottom: 1px solid var(--border); padding-bottom: 4px;"
  >
    ${getAttributeTooltip(key)}
  </div>`;

  // Ad bonus row (if any)
  const adMultiplier = breakdown.adMultiplier || 0;
  const adBlock =
    adMultiplier > 0
      ? `<div style="color:var(--ad-bonus, #f9a825); margin-top:4px;">
         ${t("stats.breakdown.ads")}: ×${(1 + adMultiplier).toFixed(2)}
       </div>`
      : "";

  // Special notes
  const noteBlock = (() => {
    if (key === "blockChance" && !breakdown.hasShield) {
      return `<div style="color:var(--warning)">${t("stats.breakdown.noShield")}</div>`;
    }
    if (key === "life" && breakdown.manaConversion) {
      return `<div style="font-size:0.85em; color:var(--text-muted);">
        + ${formatNumber(breakdown.manaConversion.toFixed(decimals))} ${t("stats.breakdown.fromMana")}
      </div>`;
    }
    if (key === "mana" && breakdown.manaConversion) {
      return `<div style="font-size:0.85em; color:var(--text-muted);">
        − ${formatNumber(breakdown.manaConversion.toFixed(decimals))} ${t("stats.breakdown.toLife")}
      </div>`;
    }
    if (key === "attackSpeed") {
      return `<div style="font-size:0.8em; color:var(--text-muted); margin-top:2px;">
        ${t("stats.breakdown.attackSpeedNote")}
      </div>`;
    }
    if (
      (key === "critChance" ||
        key === "blockChance" ||
        key === "attackSpeed") &&
      breakdown.cap !== undefined
    ) {
      return `<div style="font-size:0.85em; color:var(--text-muted);">
        ${t("common.cap")}: ${fmt(breakdown.cap / divisor)}
      </div>`;
    }
    return "";
  })();

  // Totals row
  const totalFlat = flatSources.reduce((s, r) => s + r.flat, 0);
  const totalPercent = flatSources.reduce((s, r) => s + (r.percent || 0), 0);

  const totalRow = !isPercent
    ? html`<hr
          style="border:none; border-top:1px solid var(--border); margin:4px 0"
        />
        <em>${t("attributes.breakdown.totalFlat")}:</em> ${fmt(totalFlat)}<br />
        ${totalPercent
          ? `<em>${t("attributes.breakdown.totalPercent")}:</em> +${fmtPct(totalPercent)}<br />`
          : ""}
        <strong>${t("attributes.breakdown.total")}:</strong> ${fmt(finalValue)}`
    : html`<hr
          style="border:none; border-top:1px solid var(--border); margin:4px 0"
        />
        <strong>${t("attributes.breakdown.total")}:</strong> ${fmtPct(
          finalValue,
        )}`;

  return html`
    <strong>${formatStatName(key)}</strong><br />
    ${descBlock} ${isPercent ? pctLines : lines} ${adBlock} ${noteBlock}
    ${totalRow}
  `;
}
```

---

### Step 3 — Wire Up Tooltips in `addStatsToPanel()`

In `src/ui/statsAndAttributesUi.js`, `addStatsToPanel()` registers `mouseenter` handlers on `lbl` (the stat name label). There are **two code paths** — one for `options.showAllStats` (with subcategories) and one without. Both need to be updated.

**Replace:**

```js
lbl.addEventListener("mouseenter", (e) =>
  showTooltip(
    html`<strong>${formatStatName(key)}</strong><br />${getAttributeTooltip(
        key,
      )}`,
    e,
  ),
);
```

**With:**

```js
lbl.addEventListener("mouseenter", (e) =>
  showTooltip(getAdvancedStatTooltip(key), e),
);
```

This applies to both occurrences (the `showAllStats` subcategory path and the regular path).

---

### Step 4 — Store Additional Data on `statBreakdown[stat]` for Special Cases

Extend the breakdown object to carry a few extra fields needed by the tooltip:

```js
this.statBreakdown[stat] = {
  // ... all sources ...
  cap: (() => {
    if (stat === "critChance") return flatValues.critChanceCap || 50;
    if (stat === "blockChance") return flatValues.blockChanceCap || 50;
    if (stat === "attackSpeed") return /* attackSpeedCap */ 5;
    return undefined;
  })(),
  hasShield:
    stat === "blockChance"
      ? Object.values(inventory.equippedItems).some((i) => i?.type === "SHIELD")
      : undefined,
  manaConversion: (() => {
    if (stat === "life" || stat === "mana") {
      // Record how much mana was converted for the life/mana tooltip note
      return undefined; // filled post-applyFinalCalculations — see step 4b
    }
  })(),
  adMultiplier: adMultipliers[stat] ? adMultipliers[stat] - 1 : 0,
};
```

> **Note on `manaConversion`:** The mana → life transfer is computed in `applyFinalCalculations()` _after_ `generateStatBreakdown()`. Store the result on `statBreakdown` at the end of `recalculateFromAttributes()`:
>
> ```js
> // After applyFinalCalculations:
> if (convertedManaForBloodmage > 0) {
>   if (this.statBreakdown.life)
>     this.statBreakdown.life.manaConversion = convertedManaForBloodmage;
>   if (this.statBreakdown.mana)
>     this.statBreakdown.mana.manaConversion = convertedManaForBloodmage;
> }
> ```

---

### Step 5 — Language Keys

Add the following keys to **all three language files**:
`src/languages/en/common.js`, `src/languages/es/common.js`, `src/languages/zh/common.js`

```js
// Stat breakdown sources (used for stats tab tooltips)
'stats.breakdown.base':           'Base',
'stats.breakdown.attributes':     'Attributes',
'stats.breakdown.items':          'Items',
'stats.breakdown.skills':         'Skills',
'stats.breakdown.training':       'Training',
'stats.breakdown.potions':        'Potions',
'stats.breakdown.quests':         'Quests',
'stats.breakdown.achievements':   'Achievements',
'stats.breakdown.prestige':       'Prestige',
'stats.breakdown.ascension':      'Ascension',
'stats.breakdown.soulShop':       'Soul Shop',
'stats.breakdown.runes':          'Runes',
'stats.breakdown.ads':            'Ads (Active)',
'stats.breakdown.noShield':       'Requires a shield equipped',
'stats.breakdown.fromMana':       'from Mana conversion',
'stats.breakdown.toLife':         'transferred to Life',
'stats.breakdown.attackSpeedNote':'Formula: Base × (1 + %) + flat bonuses',
```

Translate appropriately for ES and ZH.

---

### Step 6 — Changelog Entry

Add an entry to the latest changelog file in `src/changelog/`:

```js
{
  type: 'feature',
  text: 'changelog.statBreakdownTooltips',
}
```

Add the key to all language files:

```js
'changelog.statBreakdownTooltips': 'Hovering a stat in the Stats tab now shows a full breakdown of all bonus sources, sorted by contribution.',
```

---

## Edge Cases & How Each Is Handled

### Pure Percent Stats (`key.endsWith('Percent')`)

- These stats have `divisor = 100` and no meaningful flat bucket.
- `flatSources` array is skipped entirely.
- Only `percentSources` are shown.
- Totals row shows the final percent value only.

### Stats With `displayed: false` or `showInUI: false`

- These never have DOM label elements, so no `mouseenter` is registered. No change needed; the breakdown is computed but never shown. Safe to compute anyway for free.

### `allResistance` stat itself

- Displayed as a stat but only meaningful as a pool redistributed to individual resistances.
- Its breakdown shows which sources contribute flat resistance globally.
- Add a note: "Distributed equally across all resistances."

### Elemental Damage Types (`fireDamage`, `coldDamage`, etc.)

- Intelligence → elemental goes through `distributeElementalAmount()`. After Step 1c passes `attributeEffects` into `generateStatBreakdown()`, the already-distributed-per-element amounts are stored correctly in `attributes` flat for each elemental stat.
- `totalDamagePercent` and `elementalDamagePercent` are shared percent bonuses. They must be summed into the `percent` column. In `getStatSourceValues`, add logic:
  ```js
  // For elemental damage types, the percent bucket should also include shared sources:
  if (ELEMENT_IDS.includes(stat.replace("Damage", ""))) {
    percent += getNorm(
      source.elementalDamagePercent,
      "elementalDamagePercent",
      isFraction,
    );
    percent += getNorm(
      source.totalDamagePercent,
      "totalDamagePercent",
      isFraction,
    );
  }
  if (stat === "damage") {
    percent += getNorm(
      source.totalDamagePercent,
      "totalDamagePercent",
      isFraction,
    );
  }
  ```
- Elemental effectiveness (`{element}EffectivenessPercent`) is a multiplier that modifies both the flat and percent of that elemental type. This is already applied in the final calculation. The breakdown tooltip should note: shows pre-effectiveness values, with a footnote if effectiveness != 0%.

### `attackSpeed` Special Formula

- Formula: `base × (1 + attackSpeedPercent) + flat_additions`
- The flat breakdown remains useful (shows per-source flat contributions). The note block in the tooltip explains the formula.
- The cap is shown if applicable.

### `blockChance` Without a Shield

- `breakdown.hasShield = false` → tooltip shows "Requires a shield equipped" note instead of the breakdown header.
- Fall back to showing the description tooltip only.

### `critChance` / `blockChance` Caps

- Breakdowns are shown normally. A "Cap: X%" note is appended via `noteBlock`.

### `cooldownReductionPercent` Soft Cap Display

- `hero.stats.cooldownReductionCapPercent` is already handled in stat value display. The tooltip breakdown can note current effective value vs total accumulated value if they differ.

### Ad Bonuses (Multiplicative, Temporary)

- Ad bonuses are not additive flat/percent — they are a multiplier applied after all other bonuses.
- They are NOT stored in any source object but computed in `applyFinalCalculations()` via `getAdBonusMultipliers()`.
- Stored on `statBreakdown[stat].adMultiplier` after `applyFinalCalculations()` runs.
- Displayed in a distinct color (gold/amber) with `×N.NN` notation, not mixed with flat/percent rows.

### `mana → life` Conversion (`convertManaToLifePercent` / `manaToLifeTransferPercent`)

- Applied post-calculation. Stored on `statBreakdown.life.manaConversion` / `statBreakdown.mana.manaConversion` after `applyFinalCalculations()`. Tooltip shows the transferred amount as a footnote.

### `ascensionElementalDamage`

- This is a special ascension bonus that distributes flat damage evenly across all elemental types.
- In `getStatSourceValues` for element damage stats, add:
  ```js
  if (ELEMENT_IDS.some((id) => `${id}Damage` === stat)) {
    const totalAscElemental =
      (source.ascensionElementalDamage || 0) * ELEMENT_IDS.length;
    const shareMap = getElementalShareMap();
    flat += distributeElementalAmount(totalAscElemental, shareMap)[stat] || 0;
  }
  ```
  Since this is only in `ascensionBonuses` (isFraction=true), it will not double-count with the attributeEffects path.

### `manaPerLevel` Bonus

- `mana` stat gets `(hero.stats.manaPerLevel || 0) * (hero.level - 1)` added in `applyFinalCalculations()`.
- `manaPerLevel` itself is a stat (tracked in MISC_STATS). Its breakdown tooltip is handled normally.
- For the `mana` stat's breakdown, there is no separate source tracking for `manaPerLevel` effects. Add it as a special `perLevel` flat row: scan all source objects for `manaPerLevel` key, scale by level.

### `PerLevel` Bonuses (Generic)

- In `getStatSourceValues`, check for `${stat}PerLevel` keys in each source and multiply by `hero.level`.
- These are intrinsically "level-scaled" so no separate label is needed; the values are just rolled into each source's flat contribution.

### `flatPenetrationPercent` affecting `armorPenetration` and `elementalPenetration`

- `flatPenetrationPercent` adds to the **percent** bucket for these two stats.
- In `getStatSourceValues` for `armorPenetration` / `elementalPenetration`, include `flatPenetrationPercent` grouped into the `skills` or `items` bucket (wherever it originates). Since `flatPenetrationPercent` is a stat value from `hero.stats`, scan source objects for `flatPenetrationPercent` and add to the percent bucket for these two stats.

### Stats Not Present in `STAT_KEYS` (Dynamic/Internal)

- Some stat keys are injected dynamically (e.g., `adDamagePercent`, `adLifePercent`). These are not in `STAT_KEYS` so they have no definition in `STATS`. They also don't have rows in the stats panel. No action needed.

### Zero-Value Stats (`options.hideZeroStats`)

- `statBreakdown` is still computed even if the stat is hidden. Tooltip, if somehow triggered, will correctly show all-zero breakdown.

### Performance

- `generateStatBreakdown()` is already called on every `recalculateFromAttributes()`. Extending it to `STAT_KEYS` increases iterations from ~5 attributes to ~100+ stats. Each iteration is O(n_sources) with no DOM access. Acceptable; should remain sub-millisecond.
- Tooltip generation (`getAdvancedStatTooltip`) is only called on hover — lazy, no cost at compute time.
- No memoization of the tooltip HTML is needed (stats change frequently, tooltip is generated on hover).

---

## Files Modified

| File                             | Change                                                                                                                                                                                              |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/hero.js`                    | Extend `generateStatBreakdown()` to cover `STAT_KEYS`; pass `attributeEffects`; store `adMultiplier`, `hasShield`, `cap`, `manaConversion` on breakdown; reorder `calculateAttributeEffects()` call |
| `src/ui/statsAndAttributesUi.js` | Add `getAdvancedStatTooltip(key)`; replace both `mouseenter` tooltip registrations in `addStatsToPanel()`                                                                                           |
| `src/languages/en/common.js`     | Add 14 new `stats.breakdown.*` keys + changelog key                                                                                                                                                 |
| `src/languages/es/common.js`     | Same keys, translated                                                                                                                                                                               |
| `src/languages/zh/common.js`     | Same keys, translated                                                                                                                                                                               |
| `src/changelog/<latest>.js`      | Add changelog entry                                                                                                                                                                                 |

---

## Things NOT In Scope (Deliberate Exclusions)

- No new UI option toggle needed — the tooltip is always shown (the existing attribute tooltip option is separate). If a toggle is desired later, add `options.showAdvancedStatTooltips` and gate `getAdvancedStatTooltip` behind it (mirror existing `showAdvancedAttributeTooltips` pattern).
- No changes to how stats are actually calculated — purely additive instrumentation.
- Derived display stats (hit chance, armor reduction) shown in the value column are computed combat-stats — they are already annotated in the value column; no need to add them to the breakdown tooltip.
- `hero.statBreakdown` is not persisted to save data (it is always recomputed on load).
