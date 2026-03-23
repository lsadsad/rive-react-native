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

## 8. Android: .riv file changes require a full native rebuild

**Problem:** You updated a `.riv` file in `android/app/src/main/res/raw/` (e.g. via `npm run sync-rive`) and reloaded the JS bundle, but the animation still uses the old file.

**Cause:** Files in `res/raw/` are compiled into the APK during the Android build. A Metro/Expo JS reload only re-bundles JavaScript — it does not re-package native resources.

**Fix:** Run `npm run android` (or `expo run:android`) to rebuild the APK. Any change to `res/raw/` requires a full native build.

---

## 9. Android: `Fit.Layout` renders the artboard tiny for fixed-size artboards

**Problem:** A Rive animation renders very small (e.g. ~36% of container width) on Android even though the React Native container has the correct dimensions. The same component looks correct on iOS.

**Cause:** `Fit.Layout` only works correctly when the Rive artboard uses Rive's internal CSS-like layout engine (a "responsive artboard"). On a standard fixed-size artboard, `Fit.Layout` renders at the artboard's design-time dimensions without any scaling. The Android Rive SDK also treats `layoutScaleFactor=-1.0` as `null` (silently ignored because the ViewManager only applies values `> 0`), which can compound the size mismatch.

**Fix:** Use `Fit.Contain` for fixed-size artboards. It scales the artboard proportionally to fill the container width regardless of artboard type:

```tsx
<Rive
  fit={Fit.Contain}
  alignment={Alignment.Center}
  layoutScaleFactor={-1.0}   // still fine: iOS uses it, Android ignores it safely
  style={{ width: '100%', minHeight: 480 }}
  ...
/>
```

**Diagnosis tip:** Wrap the Rive component in `<View onLayout={e => console.log(e.nativeEvent.layout)}>` and log the container's dp dimensions. If the container is correct (e.g. 411×770dp) but the Rive content appears tiny, the artboard is fixed-size and `Fit.Contain` is the right fix.

---

## 10. Android: `layoutScaleFactor=-1.0` is silently ignored

**Problem:** You pass `layoutScaleFactor={-1.0}` (the iOS "auto pixel density" value) cross-platform, and wonder if it affects Android.

**Cause:** The Android `RiveReactNativeViewManager` only applies `layoutScaleFactor` when the value is strictly positive (`> 0`). The value `-1.0` hits the else branch and results in `null` (SDK default). This is the intended behavior — the Android SDK default produces correct rendering.

**Fix:** None needed. `layoutScaleFactor={-1.0}` is safe to use cross-platform. It applies on iOS and is a safe no-op on Android.

---

## 11. Android: resource names are normalized — Java reserved words get `_riv` suffix

**Problem:** A screen that loads `resourceName="switch"` works on iOS but fails on Android.

**Cause:** Android resource names must be valid Java identifiers. The `sync-rive-assets.js` script normalizes filenames: hyphens → underscores, all lowercase, and Java reserved keywords (like `switch`, `class`, `for`) get `_riv` appended. So `switch.riv` becomes `switch_riv.riv` in `res/raw/`.

**Fix:** Use the normalized name in `resourceName`. For Java-reserved filenames, append `_riv`:

```tsx
// switch.riv → android: switch_riv.riv
<Rive resourceName="switch_riv" ... />
```

---

## 12. Debug `console.log` works from Android; `fetch` to `127.0.0.1` does not

**Problem:** You add `fetch('http://127.0.0.1:<port>/ingest/...')` instrumentation that works fine on the iOS Simulator but produces no logs when running on the Android Emulator.

**Cause:** The Android Emulator is a separate VM. Inside it, `127.0.0.1` resolves to the emulator itself, not the Mac host. Requests to `127.0.0.1` from the Android Emulator silently fail.

**Fix:** Use `console.log(...)` for Android-side JS instrumentation. Metro captures all `console.log` output and displays it in the terminal regardless of platform. If you need HTTP-based logging from Android, use `10.0.2.2` (the standard Android emulator alias for the host loopback) or the Mac's LAN IP.

---

## 13. Metro CI mode silently prevents hot reload and file-change detection

**Problem:** You edit a `.tsx` file (e.g. change a hardcoded VM value like `scalePercent`) and reload the app, but the change has no effect. The app continues to behave as if the old file is still in use.

**Cause:** `expo run:ios` (and `npm run ios`) inherits the `CI` environment variable if it is set in your shell. When `CI=true`, Metro starts in CI mode (`"Metro is running in CI mode, reloads are disabled"`), which **disables the file watcher and hot module replacement**. Metro will not detect changes to `.tsx` files on disk, and the app continues serving the stale cached bundle even after a full JS reload.

**Diagnosis:** Look for this line in the Metro output:
```
Metro is running in CI mode, reloads are disabled. Remove CI=true to enable watch mode.
```
Also check your shell: `echo $CI`. If it prints `true` or `1`, this is the cause.

**Fix:** Unset `CI` before starting Metro, or run Metro separately from the native build:

```bash
# Option A: unset for the current session, then rebuild
unset CI && npm run ios

# Option B: build native once, then run Metro separately for development
npm run ios           # first time: installs dev client on simulator
unset CI && npx expo start   # subsequent JS-only changes: hot reload works
```

Add a `"dev"` script to `package.json` to make this easy:

```json
"dev": "unset CI && expo start"
```

Use `npm run ios` once to install/update the native build, then `npm run dev` for all active JS development. Changes to `.tsx` files will hot-reload without rebuilding.

---

## 14. `expo start --ios` opens Expo Go instead of the dev client

**Problem:** You run `npx expo start --ios` (or `expo start --ios`) to start Metro, and the iOS Simulator opens **Expo Go** instead of the custom dev client. Native modules like `rive-react-native` are unavailable, the app fails to load screens that import them, and you see warnings like:
```
Route "./(examples)/MyScreen.tsx" is missing the required default export.
No route named "(examples)/MyScreen" exists in nested children.
```

**Cause:** `expo start --ios` launches Expo Go by default unless explicitly told to use the dev client. Expo Go is a sandboxed runtime that cannot load custom native modules.

**Fix:** Always use `expo run:ios` (or `npm run ios`) to build and launch the custom dev client. Once the dev client is installed on the simulator, you can run Metro separately with `expo start` and the dev client will auto-connect — but use `expo run:ios` for the initial install and any time native code changes:

```bash
npm run ios          # builds native app + installs dev client + starts Metro
# or for JS-only iteration after initial build:
unset CI && npx expo start   # Metro only — open the "example" dev client manually in simulator
```

Never use `expo start --ios` / `expo start --android` for projects with native modules.

---

## 7. Syncing milestone (or landmark) activation with stepped dot count

**Problem:** You want a milestone to activate at a specific business threshold (e.g. month 18) and also in the right visual order (e.g. after dot 5 has filled, before dot 6). Using only the stepped VM count (e.g. `filledDotCount >= 5`) makes the milestone fire when the 5th dot fills—which can be a different month than the intended one, and can make dot 5 and the milestone appear simultaneously.

**Cause:** Dots are often placed at fractions of the span (e.g. 1/6 … 5/6), so the last dot on a segment fills *before* the end of that segment. Example: connector from month 1→18 has dot 5 at 5/6 of the span, so dot 5 fills at month 15, not 18. If the milestone is driven only by "5 dots filled," it triggers at 15 and at the same moment as dot 5.

**Fix:** Require **both** the business threshold and the dot count. For example: `milestone2Active = currentMonth >= milestone2Month && animatedDotCount >= 5`. Then the milestone turns on only when (1) the correct month (e.g. 18 or 12) is reached, and (2) the preceding dots have already filled and animated, so the order is dot 5 → then milestone → then dot 6. Use the same pattern whenever a "landmark" must hit a specific value (time, progress) but should still appear after a stepped animation has reached the right step.
