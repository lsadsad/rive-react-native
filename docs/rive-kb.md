# Rive integration knowledge base

Learnings from integrating Rive with React Native (state machines, view models, stepping animations).

---

## 1. Stepping a VM number (e.g. dot count) without double steps

**Problem:** When driving a Rive VM number (e.g. `filledDotCount`) step-by-step with `setState(prev => prev + 1)`, the count sometimes jumps by 2 and two dots trigger at once.

**Cause:** In React 18 development, Strict Mode can **double-invoke** state updater functions. So `setState(prev => prev + 1)` may run twice in one “step” (e.g. 4→5→6), causing a skip.

**Fix:** Avoid the functional updater for this use case. Compute the next value once (e.g. from a ref set when scheduling the timeout) and call `setState(next)` with that single value. No double-invoke, so the count only ever moves by ±1 per step.

```ts
// Prefer: compute next once, set once
stepRef.current = { from: animatedDotCount, to: targetDotCount };
const timer = setTimeout(() => {
  const step = stepRef.current;
  if (!step) return;
  const next = step.from < step.to ? step.from + 1 : step.from - 1;
  setAnimatedDotCount(next);  // single value, not (prev => prev + 1)
}, INTERVAL_MS);
```

---

## 2. Step interval vs Rive state duration

**Problem:** Dots (or other VM-driven visuals) still appear to trigger two at once even when the React count steps by 1.

**Cause:** The delay between steps was shorter than the Rive state machine’s interval/duration. The next `filledDotCount` was sent before the previous dot’s animation finished, so the Rive file reacted to the new value while the previous transition was still playing.

**Fix:** Set the step interval (e.g. `DOT_STEP_INTERVAL_MS`) to **at least** the duration of the Rive state that reacts to the number (or the “interval state” in the state machine). Increase it in the Rive editor or in React until each step fully completes before the next value is sent.

---

## 3. “Any State” in the state machine

**Problem:** Animations re-trigger, overlap, or look like two things at once when inputs (e.g. `filledDotCount`) update.

**Cause:** A transition whose **source** is **Any State** is eligible from whatever state the machine is in. If the condition (e.g. “filledDotCount &gt; 0”) stays true, the same transition can fire again and **re-enter** the same state, restarting its animation.

**Fix:** Prefer explicit states and transitions (e.g. Entry → Idle → “Show dots”) instead of Any State for the main flow. Reserve “Any State” for narrow cases (e.g. “go to error from anywhere”). Avoid transitions like “Any State → [same state you’re already in]” when the condition is tied to frequently updated inputs.

---

## 4. Documenting VM bindings

**Problem:** Hard to remember or communicate which artboard, state machine, and VM inputs/outputs a component uses.

**Fix:** Keep a small reference (e.g. a Markdown table) per screen or component listing: Rive file, artboard, state machine, and all variables (numbers, booleans, strings) set on the VM, plus any triggers listened to. Example: `DeviceInstallment-Rive-Reference.md` in the same folder as the component. Optionally define a const for each VM property name (e.g. `const VM_FILLED_DOT_COUNT = 'filledDotCount'`) and use it in `setNumber`/`setBoolean`/etc. so the contract is single-source and typo-safe.

---

## 5. Cascading VM updates and the React Native bridge

**Problem:** You drive a Rive VM with staggered updates (e.g. set dot 1, then 60 ms later dot 2, then dot 3…) to get a cascading reveal, but all updates appear at once.

**Cause:** The React Native bridge can batch multiple native calls that occur in the same JS turn (or in quick succession). Several `setNumber`/`setBoolean` calls from different `setTimeout` callbacks may be delivered to the native Rive view in one batch and applied together, so the “stagger” is lost.

**Fix:** Serialize updates so only one VM property update runs per timer tick. Use a single recurring timer (or a queue processed by one `setTimeout` chain): each tick applies one logical update (e.g. one dot’s state), then schedules the next. That way each call crosses the bridge separately and the native side can advance/display each step in sequence.

---

## 6. Correct value from JS but no change in the animation

**Problem:** You set a VM number (e.g. `filledDotCount`) from React and logs show the value is correct, but the Rive animation doesn’t update (e.g. dots don’t fill).

**Cause:** The value is reaching the runtime, but the Rive file’s view model isn’t wired to the visuals. The VM property may exist but not be bound to the elements that drive the dot display, or the property name/path in the .riv file doesn’t match what you’re setting (e.g. casing or nesting).

**Fix:** Verify in the Rive editor that (1) the VM has a number (or boolean) with the exact name you pass to `setNumber`/`setBoolean`, and (2) that property is bound to the visual (e.g. “show N of 10 dots”). Fix the binding or rename the VM property in the .riv to match the app. No code change needed on the React Native side if the value you send is already correct.

---

## 7. Syncing milestone (or landmark) activation with stepped dot count

**Problem:** You want a milestone to activate at a specific business threshold (e.g. month 18) and also in the right visual order (e.g. after dot 5 has filled, before dot 6). Using only the stepped VM count (e.g. `filledDotCount >= 5`) makes the milestone fire when the 5th dot fills—which can be a different month than the intended one, and can make dot 5 and the milestone appear simultaneously.

**Cause:** Dots are often placed at fractions of the span (e.g. 1/6 … 5/6), so the last dot on a segment fills *before* the end of that segment. Example: connector from month 1→18 has dot 5 at 5/6 of the span, so dot 5 fills at month 15, not 18. If the milestone is driven only by "5 dots filled," it triggers at 15 and at the same moment as dot 5.

**Fix:** Require **both** the business threshold and the dot count. For example: `milestone2Active = currentMonth >= milestone2Month && animatedDotCount >= 5`. Then the milestone turns on only when (1) the correct month (e.g. 18 or 12) is reached, and (2) the preceding dots have already filled and animated, so the order is dot 5 → then milestone → then dot 6. Use the same pattern whenever a "landmark" must hit a specific value (time, progress) but should still appear after a stepped animation has reached the right step.
