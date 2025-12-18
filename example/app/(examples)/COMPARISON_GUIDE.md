# How to Test Side-by-Side

## Quick Start

1. **Run your app** (if not already running):
   ```bash
   yarn expo run:ios
   # or
   yarn expo run:android
   ```

2. **Navigate to the comparison screen**:
   - From the home screen, tap **"🔬 Fraud Spam Comparison"** (orange button)

3. **Switch between versions**:
   - Tap the three buttons at the top to switch between:
     - **✅ Working** - Your current working implementation
     - **⚠️ Engineers** - Engineers' code with issues
     - **🔧 Fixed** - Engineers' code with fixes applied

## What to Look For

### Key Differences to Test:

#### 1. **Data Values** (Most Important)
Switch between "Working" and "Engineers" and look at:
- **"calls analyzed"** - Should be **215** (not 15)
- **"calls / day"** - Should be **0.6** (not 1)

#### 2. **Visual Quality** (layoutScaleFactor)
- **Engineers version** (1.0) - May appear slightly blurry, especially text
- **Working/Fixed version** (-1.0) - Crisp and sharp on high-DPI screens

#### 3. **Loading** (URL parameter)
- If Engineers version fails to load → URL issue with `?v=3`
- If it loads → URL is fine (may be cached or server handles it)

## Testing Checklist

- [ ] Engineers version shows **15** calls analyzed (WRONG)
- [ ] Working version shows **215** calls analyzed (CORRECT)
- [ ] Fixed version shows **215** calls analyzed (CORRECT)
- [ ] Engineers version shows **1** calls/day (WRONG)
- [ ] Working version shows **0.6** calls/day (CORRECT)
- [ ] Fixed version shows **0.6** calls/day (CORRECT)
- [ ] Visual quality: Compare text sharpness between versions
- [ ] All versions load successfully (or note which ones fail)

## Expected Results

### Engineers Version (⚠️ Issues)
```
❌ 15 calls analyzed (should be 215)
❌ 1 calls / day (should be 0.6)
❌ Slightly blurry rendering
⚠️ May or may not load (URL issue)
```

### Working Version (✅)
```
✅ 215 calls analyzed
✅ 0.6 calls / day
✅ Crisp rendering
✅ Loads correctly
```

### Fixed Version (🔧)
```
✅ 215 calls analyzed
✅ 0.6 calls / day
✅ Crisp rendering
✅ Loads correctly
(Should match Working version exactly)
```

## Screenshots/Videos

Consider taking screenshots of each version to document the differences for your engineers. Focus on:
1. The "calls analyzed" number
2. The "calls / day" number
3. Text sharpness (zoom in if needed)

## Next Steps

Once you've confirmed the differences:
1. Share the findings with your engineers
2. Point them to `/TROUBLESHOOTING_SUMMARY.md` for detailed fixes
3. Have them apply the 4 fixes to their production code
4. Test again to verify all issues are resolved
