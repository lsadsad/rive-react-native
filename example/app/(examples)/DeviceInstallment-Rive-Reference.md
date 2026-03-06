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
| `milestone2Visible` | boolean | Set as `!milestone2Visible` (true when scenario is Standard, false for Next Up / Anytime) |
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
