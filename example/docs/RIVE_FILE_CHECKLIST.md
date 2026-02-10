# Quick Checklist: Adding a Rive File

Copy this checklist when adding a new `.riv` file to the example app.

---

## ✅ File: `your_file_name.riv`

### Step 1: Prepare the File
- [ ] Rename to lowercase with underscores: `your_file_name.riv`
- [ ] Remove any special characters (only `a-z`, `0-9`, `_`, `.` allowed for Android)

### Step 2: Copy to Assets
```bash
cp path/to/your_file_name.riv example/assets/rive/your_file_name.riv
```
- [ ] File copied to `example/assets/rive/`

### Step 3: Add to iOS
```bash
open example/ios/example.xcodeproj
```
- [ ] Added file via Xcode "Add Files to 'example'"
- [ ] Checked "Copy items if needed"
- [ ] Verified in Build Phases → Copy Bundle Resources

### Step 4: Add to Android
```bash
cp example/assets/rive/your_file_name.riv example/android/app/src/main/res/raw/your_file_name.riv
```
- [ ] File copied to `example/android/app/src/main/res/raw/`
- [ ] Verified filename is all lowercase

### Step 5: Update Component
```tsx
// Option 1: resourceName
<Rive resourceName="your_file_name" />

// Option 2: require (also needs native files)
<Rive source={require('../../assets/rive/your_file_name.riv')} />
```
- [ ] Component updated with correct prop

### Step 6: Rebuild
```bash
# iOS
npx expo run:ios

# Android  
npx expo run:android
```
- [ ] iOS build successful
- [ ] Android build successful

### Step 7: Test
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

After completing the checklist, your file should exist in **3 places**:

```
✅ example/assets/rive/your_file_name.riv
✅ example/ios/ (or Assets/) + listed in Xcode project
✅ example/android/app/src/main/res/raw/your_file_name.riv
```

---

**See [ADDING_RIVE_FILES.md](./ADDING_RIVE_FILES.md) for detailed explanations.**
