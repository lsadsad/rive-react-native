# FraudSpamCard Troubleshooting Summary

## Overview
Comparison between the working implementation and your engineers' code revealed **4 key issues** that prevent the Rive animation from working correctly.

---

## Issues Found

### ⚠️ Issue #1: Incorrect Data Values
**Location:** Lines ~100-102 in engineers' code

**Problem:**
```typescript
// Engineers' code (INCORRECT)
setCallsAnalyzedValue(15);
setCallsDayValue(1);

// Working code (CORRECT)
setCallsAnalyzedValue(215);
setCallsDayValue(0.6);
```

**Impact:** The animation displays wrong values, particularly for "calls analyzed" (should show 215, not 15) and "calls/day" (should show 0.6, not 1).

**Fix:** Update the values to match the working implementation.

---

### ⚠️ Issue #2: Incorrect layoutScaleFactor
**Location:** Rive component props

**Problem:**
```typescript
// Engineers' code (INCORRECT)
layoutScaleFactor={1.0}

// Working code (CORRECT)
layoutScaleFactor={-1.0}
```

**Impact:** Using `1.0` forces a fixed scale factor. Using `-1.0` enables auto-scaling based on device pixel ratio, which provides better rendering quality across different screen densities.

**Fix:** Change `layoutScaleFactor` from `1.0` to `-1.0`.

---

### ⚠️ Issue #3: URL Query Parameter
**Location:** Rive component `url` prop

**Problem:**
```typescript
// Engineers' code (includes version param)
url='https://att.com/scmsassets/mobile_apps/motion/security_fraudspam.riv?v=3'

// Working code (no version param)
url="https://att.com/scmsassets/mobile_apps/motion/security_fraudspam.riv"
```

**Impact:** The `?v=3` query parameter might cause caching issues or the wrong version of the file to load. While this may not break the animation entirely, it could cause unexpected behavior.

**Fix:** Remove the `?v=3` query parameter from the URL.

---

### ⚠️ Issue #4: console.tron.log Usage
**Location:** onError callback

**Problem:**
```typescript
// Engineers' code
onError={riveError => {
  console.tron.log(riveError); // console.tron may not be available
}}

// Working code
onError={(riveError) => {
  console.log(riveError); // Standard console.log
}}
```

**Impact:** If `console.tron` is not configured or available in the environment, this will cause a runtime error when an error occurs.

**Fix:** Use standard `console.log()` or ensure `console.tron` is properly configured in your production environment.

---

## Files Created for Testing

1. **`FraudSpamCard_engineers_test.tsx`** - Engineers' code with issue markers
2. **`FraudSpamCard_engineers_fixed.tsx`** - Fixed version with all corrections applied
3. **`TROUBLESHOOTING_SUMMARY.md`** - This document

---

## Quick Fix Checklist

For your engineers to apply to their production code:

- [ ] Change `setCallsAnalyzedValue(15)` to `setCallsAnalyzedValue(215)`
- [ ] Change `setCallsDayValue(1)` to `setCallsDayValue(0.6)`
- [ ] Change `layoutScaleFactor={1.0}` to `layoutScaleFactor={-1.0}`
- [ ] Remove `?v=3` from the Rive file URL
- [ ] Replace `console.tron.log` with `console.log` or ensure Reactotron is configured

---

## Additional Considerations

### For Production Deployment
When integrating into your production codebase with `@myatt/ui-kit`:

1. Keep the custom `useStylesWithColors` styling approach - it's fine
2. Keep the `useAppearance` hook for dark mode detection
3. Keep the `cardFactory` registration pattern
4. Just apply the 4 fixes listed above

### Testing
You can test the fixed version by:
1. Running the app with `FraudSpamCard_engineers_fixed.tsx`
2. Comparing side-by-side with `FraudSpamCard.tsx` (working version)
3. Verifying that numbers display correctly (215 calls analyzed, 0.6 calls/day)
4. Checking that the animation scales properly on different devices

---

## Root Cause Analysis

The most critical issue is **Issue #1** (incorrect data values), which would cause visible incorrect numbers in the UI. 

**Issue #2** (layoutScaleFactor) affects rendering quality but might not be immediately obvious.

**Issue #3** (URL parameter) is minor but could cause version mismatches.

**Issue #4** (console.tron) only affects error logging and won't break the animation unless an error occurs.

