# MonthlySummary — Rive reference

| Item | Value |
|------|-------|
| **Rive file** | `cost_summary-v1.riv` (local) |
| **Android resource name** | `cost_summary_v1` (hyphens → underscores) |
| **Artboard** | `MonthlySummary` |
| **State machine** | `MonthlySummary_SM` |
| **View model** | `MonthlySummary_VM` via `AutoBind(true)` |

---

## VM structure

`MonthlySummary_VM` has three kinds of properties:

1. **Root properties** — set directly (e.g. `riveRef.setNumber('activeTab', 1)`)
2. **Nested month VMs** — `month00`–`month11`, each of type `MonthlySummary_MonthVM`. Set via slash path: `riveRef.setNumber('month00/seg01Height', 120)`
3. **Nested legend VM** — `legend`, of type `MonthlySummary_LegendVM`. Set via slash path: `riveRef.setString('legend/label_01', 'Data')`

---

## Root VM properties

### Numbers

| Property | Type | Description |
|----------|------|-------------|
| `activeTab` | number | 0, 1, or 2 — drives TabLayer state machine |
| `legendCount` | number | How many legend items to show (1–6) |
| `monthCount` | number | How many month bars to show (1–12) |
| `yAxisMax` | number | Max value for y-axis; used by host to compute segNNHeight |
| `scalePercent` | number | Scale factor — Phase 2 only, not implemented yet |

### Booleans

| Property | Type | Description |
|----------|------|-------------|
| `isDarkMode` | boolean | Dark/light theme toggle — DarkModeLayer in state machine |

### Triggers (output from Rive)

| Trigger | Description |
|---------|-------------|
| `barTapped` | Fired by Rive (InteractionLayer) when a bar is tapped. Subscribe with `useRiveTrigger(riveRef, 'barTapped', callback)` |

---

## Nested MonthVM properties (`month00`–`month11`)

Set via path: `riveRef.setNumber('month00/seg01Height', value)`

### Strings

| Property | Description |
|----------|-------------|
| `label` | Month label, e.g. `'Jan'` |
| `monthFormattedTotal` | Formatted total, e.g. `'$1,200'` or `'$1,300*'` |

### Numbers

| Property | Description |
|----------|-------------|
| `seg01Height`–`seg06Height` | **Host-computed** bar segment heights in Rive artboard units. Formula: `segNN / yAxisMax * CHART_HEIGHT`. CHART_HEIGHT must match the bar area height in the Rive artboard design (currently 200 — verify against artboard). |

### Booleans

| Property | Description |
|----------|-------------|
| `hideSeg01`–`hideSeg06` | `true` = segment hidden, `false` = visible. Uses Convert-to-Number converter in Rive: `false → 1.0` (visible), `true → 0.0` (hidden) |
| `seg06Striped` | `true` = segment 6 renders with stripe pattern (estimated/projected spend) |

---

## Nested LegendVM properties (`legend`)

Set via path: `riveRef.setString('legend/label_01', value)`

### Strings

| Property | Description |
|----------|-------------|
| `label_01`–`label_06` | Legend item labels, e.g. `'Streaming'`, `'Data'` |

### Booleans

| Property | Description |
|----------|-------------|
| `hide_01`–`hide_06` | `true` = hide legend item. Hide items beyond `legendCount`. |
| `stripe_06` | `true` = legend item 6 shows stripe swatch (matches `seg06Striped`) |

---

## State machine layers

| Layer | Purpose |
|-------|---------|
| `TabLayer` | Switches between tab 0/1/2 based on `activeTab` |
| `AnimationLayer` | Handles Intro → Idle → TabSwitch animations |
| `InteractionLayer` | BarTapFeedback animation; fires `barTapped` trigger |
| `ScaleModeLayer` | Scale100 animation — Phase 2 |
| `DarkModeLayer` | LightMode / DarkMode switch based on `isDarkMode` |

---

## Implementation notes

### Height computation

The host (React Native) pre-computes `segNNHeight` — there is no Luau runtime doing this:

```ts
const segHeight = (segValue: number, yAxisMax: number): number =>
  yAxisMax > 0 ? (segValue / yAxisMax) * CHART_HEIGHT : 0;
```

Hidden segments (`hideSeg = true`) should have `segNNHeight = 0`.

### Rive component props

| Prop | Value | Why |
|------|-------|-----|
| `fit` | `Fit.Contain` | Scales artboard proportionally. `Fit.Layout` renders tiny on Android for fixed-size artboards (see rive-kb #9) |
| `alignment` | `Alignment.Center` | Centers within container |
| `layoutScaleFactor` | `-1.0` | iOS: auto pixel density. Android: safely ignored (see rive-kb #10) |
| `dataBinding` | `AutoBind(true)` | Binds VM by name automatically |

### Android resource name

`cost_summary-v1.riv` → `cost_summary_v1` (hyphen and dot stripped by sync script).
Use `resourceName="cost_summary_v1"` in the component.

### Dev-only defaults to update before production

- `monthCount` starts at `6` — production may use a different default
- `yAxisMax` starts at `1500` — production derives this from real data
- `CHART_HEIGHT = 200` — **verify against actual Rive artboard bar area height**

### Phase 2 (not implemented)

- `scalePercent` (root VM) — scale factor for the chart
- Dark mode in BarGroup/Legend components (beyond DarkModeLayer at root)
