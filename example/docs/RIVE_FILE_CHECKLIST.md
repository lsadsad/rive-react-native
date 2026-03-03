# Quick Checklist: Adding a Rive File

Copy this checklist when adding a new `.riv` file to the example app.

**Sync script:** Files in `example/assets/rive/` are copied to iOS and Android automatically when you run `npm run ios` or `npm run android` (or run `npm run sync-rive` manually). You only need to maintain the assets folder; the script keeps the native folders in sync.

---

## ✅ File: `your_file_name.riv`

### Step 1: Prepare the File
- [ ] Rename to lowercase with underscores: `your_file_name.riv`
- [ ] Remove any special characters (only `a-z`, `0-9`, `_`, `.` allowed for Android)

### Step 2: Copy to Assets (source of truth)
```bash
cp path/to/your_file_name.riv example/assets/rive/your_file_name.riv
```
- [ ] File copied to `example/assets/rive/`

### Step 3: Sync to Native Folders
```bash
cd example && npm run sync-rive
```
- [ ] Sync run (or will run automatically on next `npm run ios` / `npm run android`)

### Step 4: Add to iOS (first time only for this file)
```bash
open example/ios/example.xcodeproj
```
- [ ] Added file via Xcode "Add Files to 'example'" (file is already in `ios/Assets/` after sync)
- [ ] Checked "Copy items if needed"
- [ ] Verified in Build Phases → Copy Bundle Resources

### Step 5: Android
- [ ] No extra step — sync script already copied to `android/.../res/raw/` (Android picks up new files automatically)

### Step 6: Update Component
```tsx
// Option 1: resourceName
<Rive resourceName="your_file_name" />

// Option 2: require (also needs native files)
<Rive source={require('../../assets/rive/your_file_name.riv')} />
```
- [ ] Component updated with correct prop

### Step 7: Rebuild
```bash
# iOS (runs sync-rive first)
npm run ios

# Android (runs sync-rive first)
npm run android
```
- [ ] iOS build successful
- [ ] Android build successful

### Step 8: Test
- [ ] iOS: Animation loads correctly
- [ ] Android: Animation loads correctly
- [ ] No "File resource not found" errors

---

## 🚨 Common Issues

| Issue | Fix |
|-------|-----|
| "File resource not found" on Android | File missing from `android/app/src/main/res/raw/` |
| "File resource not found" on iOS | File not in Xcode Copy Bundle Resources |
| File works on iOS but not Android | Filename has uppercase or special chars |
| "Java 8 JVM" error | See `android/gradle.properties` - requires Java 11+ |

---

## 📁 Expected File Locations

After completing the checklist, your file should exist in **3 places** (sync script keeps the last two in sync with the first):

```
✅ example/assets/rive/your_file_name.riv   ← maintain only this
✅ example/ios/Assets/ + listed in Xcode project (sync script copies here)
✅ example/android/app/src/main/res/raw/your_file_name.riv (sync script copies here)
```

---

**See [ADDING_RIVE_FILES.md](./ADDING_RIVE_FILES.md) for detailed explanations and sync script usage.**
