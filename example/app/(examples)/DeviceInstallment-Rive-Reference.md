# DeviceInstallment — Rive reference

| Item | Value |
|------|--------|
| **Rive file** | `services_installments` (local) / remote URL when `USE_REMOTE` is true |
| **View model / data binding** | `AutoBind(true)` (Rive runtime binds VM inputs/outputs by name) |
| **Artboard** | `DeviceInstallments` |
| **State machine** | `MilestoneStates` |

---

## Variables (inputs set by the component)

All of these are set on the Rive view model via `riveRef.setNumber`, `setBoolean`, or `setString` in the component’s `useEffect`.

### Numbers

| Variable | Type | Description / source |
|----------|------|----------------------|
| `scenarioType` | number | 1 = Standard, 2 = Next Up, 3 = Next Up Anytime |
| `currentMonth` | number | Current month index (0–36) |
| `totalMonths` | number | Always `36` |
| `milestone2Month` | number | 0 (Standard), 18 (Next Up), or 12 (Next Up Anytime) |
| `scalePercent` | number | Always `100` |
| `filledDotCount` | number | 0–10: connector 1 dots (0–5) + connector 2 dots (5–10), animated step-by-step |

### Booleans

| Variable | Type | Description / source |
|----------|------|----------------------|
| `milestone2Hide` | boolean | `scenarioType === 1` — true when Standard (hides M2), false for Next Up / Anytime (shows M2) |
| `isDarkMode` | boolean | From `useColorScheme() === 'dark'` |
| `milestone1Active` | boolean | `currentMonth > 0` |
| `milestone2Active` | boolean | State (delayed): fires one `DOT_STEP_INTERVAL_MS` after `milestone2Visible && currentMonth >= milestone2Month && filledDotCount >= 5` is first true; M2 always follows dot 5 by one beat |
| `milestone3Active` | boolean | State (delayed): fires one `DOT_STEP_INTERVAL_MS` after `currentMonth >= 36` and all path dots are filled (`filledDotCount >= 10` when M2 visible, else `>= 5`); pinned to month 36 |
| `milestone1HideLink` | boolean | `scenarioType !== 3` |
| `milestone2HideLink` | boolean | Set to `false` when milestone 2 is visible |
| `milestone3HideLink` | boolean | Set to `false` |

### Strings

| Variable | Type | Description / source |
|----------|------|----------------------|
| `milestone1Subtitle` | string | `'1 Month'` |
| `milestone1Description` | string | `'First installment on Sep 24, 2025'` |
| `milestone1LinkLabel` | string | `''` or `'Pay ($800.16) to own'` (when scenario is Next Up Anytime) |
| `milestone2Subtitle` | string | `'18 Months'` or `'12 Months'` (when milestone 2 visible) |
| `milestone2Description` | string | `'Early upgrade & deals unlocked'` or `'Anytime upgrade unlocked'` |
| `milestone2LinkLabel` | string | `'Pay ($400.08) to upgrade'` |
| `milestone3Subtitle` | string | `'36 Months'` |
| `milestone3Description` | string | `"Your phone's all yours!"` |
| `milestone3LinkLabel` | string | `'Pay ($800.16) to own'` |

---

## Triggers (outputs from Rive, listened by the component)

Fired by Rive Listeners on link tap areas; the component subscribes via `useRiveTrigger`.

| Trigger name | Component action |
|--------------|------------------|
| `milestone1LinkTapped` | `Alert.alert(…, 'Navigate to: /installments/milestone-1')` |
| `milestone2LinkTapped` | `Alert.alert(…, 'Navigate to: /installments/milestone-2')` |
| `milestone3LinkTapped` | `Alert.alert(…, 'Navigate to: /installments/milestone-3')` |

> **Stub:** All three trigger handlers currently call `Alert.alert` as a placeholder. Production must wire these to the real navigation stack (e.g. React Navigation `navigate('/installments/milestone-N')`).

---

## Implementation notes

### Rive component props

| Prop | Value | Why |
|------|-------|-----|
| `fit` | `Fit.Contain` | Scales the artboard proportionally to fill the available width while maintaining aspect ratio. `Fit.Layout` renders the artboard at its design-time size on Android (appears very small) because the Rive Android SDK defaults to physical-pixel coordinates when `layoutScaleFactor` is not a positive value. |
| `alignment` | `Alignment.Center` | Centers the artboard within its container when `Fit.Layout` leaves extra space |
| `layoutScaleFactor` | `-1.0` | Tells the runtime to use the device's native pixel ratio for scaling. Omitting this or using `1.0` causes blurry rendering on high-DPI screens |
| `dataBinding` | `AutoBind(true)` | Rive runtime auto-binds the view model by matching variable names. All inputs listed above must exactly match the names in the Rive file's view model |

### Dot animation timing constants

| Constant | Value | Description |
|----------|-------|-------------|
| `DOT_STEP_INTERVAL_MS` | `300` | Delay between each individual dot step. **Must be ≥ the Rive state's own animation interval/duration**, otherwise the next count arrives before the current dot finishes and visual frames are skipped |
| `DOT_START_DELAY_MS` | `800` | Initial hold before the first dot animates in — applies on mount and on every scenario change |

### `milestone2Hide` naming convention

The Rive VM input `milestone2Hide` follows the same `hide`-prefix convention as `milestone1HideLink`, `milestone2HideLink`, and `milestone3HideLink` — `true` means hidden. The binding is simply `riveRef.setBoolean('milestone2Hide', scenarioType === 1)`, readable without any mental inversion.

### M2 inputs are never written in Standard scenario

When `scenarioType === 1`, the `if (milestone2Visible)` block is skipped entirely — `milestone2Subtitle`, `milestone2Description`, `milestone2LinkLabel`, and `milestone2HideLink` are never called. They retain the Rive file's defaults. This is intentional: the Rive artboard hides M2 content via the `milestone2Hide` flag. Do not add an explicit reset without understanding the Rive side.

### Scenario change side effects

`handleScenarioChange` calls both `setScenarioType` and `setCurrentMonth(0)` in the same handler. A separate `useEffect` on `scenarioType` then synchronously resets `animatedDotCount → 0`, `m2Active → false`, and `m3Active → false`. All of this must fire together to keep the dot animation and milestone states consistent with the new scenario.

### Dot placement formula

`getFilledDotCount(startMonth, endMonth, currentMonth)` places dots at fractions `i/(DOT_COUNT+1)` of the span (not `i/DOT_COUNT`). This offsets the last dot so it completes one beat *before* the milestone activates, never simultaneously. Connector 1 always starts at month **1**, not 0, so no dots fill at month 0.

### Dev-only defaults to update before production

- **Initial scenario:** `useState<ScenarioType>(2)` — starts on Next Up for testing. Production likely starts at `1` (Standard).
- **Initial month:** `useState(28)` — starts mid-journey for testing. Production likely starts at `0`.
- **`USE_REMOTE = false`:** switch to `true` and update `remoteUrl` for production. Note the current `remoteUrl` points to `rive_featureTest.riv`, **not** `services_installments.riv` — update the URL before enabling remote loading.
