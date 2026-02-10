# Adding Rive Files to the Example App

This guide explains how to properly add local `.riv` files to the example app so they work on both iOS and Android.

## Quick Reference

| Method | Use Case | iOS Setup | Android Setup | Rebuild Required |
|--------|----------|-----------|---------------|------------------|
| `resourceName` | Simple, offline-first | Add to Xcode project | Copy to `res/raw/` | ✅ Yes |
| `source={require(...)}` | Metro bundling, hot reload | Add to Xcode project | Copy to `res/raw/` | ✅ Yes (first time) |
| `source={{ uri: 'https://...' }}` | Remote files | N/A | N/A | ❌ No |

## Method 1: Using `resourceName` (Recommended for Native Resources)

This method loads `.riv` files from native app bundles. It's the most reliable for offline use and production builds.

### Steps

#### 1. Add to iOS (Xcode Project)

```bash
# From the example directory
open ios/example.xcodeproj
```

In Xcode:
1. Right-click on the project in the sidebar
2. Select **"Add Files to 'example'"**
3. Navigate to your `.riv` file
4. Make sure **"Copy items if needed"** is checked
5. Verify it appears under **Build Phases → Copy Bundle Resources**

**Or** manually copy the file to `example/ios/` and add it via Xcode.

#### 2. Add to Android

```bash
# From the example directory
cp path/to/your-file.riv android/app/src/main/res/raw/your-file.riv
```

**Important:** Android raw resource names:
- Must be lowercase
- Can only contain `[a-z0-9_.]`
- Underscores are preferred over hyphens
- Example: `trial_countdown.riv` ✅, `TrialCountdown.riv` ❌

#### 3. Use in Component

```tsx
<Rive
  resourceName="your_file"  // WITHOUT the .riv extension
  fit={Fit.Contain}
  autoplay={true}
/>
```

#### 4. Rebuild

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

**Note:** Metro reload (R,R) is **not enough** after adding files to native projects. You must rebuild.

---

## Method 2: Using `source={require(...)}` (Metro Bundler)

This method uses Metro to bundle assets. It provides a single source of truth and works well with hot reload during development.

### Steps

#### 1. Add to Assets Directory

```bash
# From the example directory
cp path/to/your-file.riv assets/rive/your-file.riv
```

#### 2. ALSO Add to Native Projects

Even when using `require()`, you **must also** add the file to native projects for production builds:

- **iOS**: Add to Xcode (see Method 1, step 1)
- **Android**: Copy to `android/app/src/main/res/raw/` (see Method 1, step 2)

This is because:
- In development: Metro serves the asset
- In production: The native bundle is used
- On Android: The library resolves `require()` assets via native resources

#### 3. Use in Component

```tsx
<Rive
  source={require('../../assets/rive/your-file.riv')}
  fit={Fit.Contain}
  autoplay={true}
/>
```

#### 4. Rebuild (First Time)

The first time you add a file, rebuild both platforms:

```bash
npx expo run:ios
npx expo run:android
```

After the initial build, Metro hot reload should work for code changes (but not for adding new files).

---

## Method 3: Using Remote URLs

For files hosted on a CDN or server:

```tsx
<Rive
  source={{
    uri: 'https://public.rive.app/community/runtime-files/2195-4346-avatar-pack-use-case.riv'
  }}
  fit={Fit.Contain}
  autoplay={true}
/>
```

**Pros:**
- No native setup required
- No rebuild needed
- Easy to update remotely

**Cons:**
- Requires network connection
- Slower initial load
- Not suitable for offline-first apps

---

## Complete Example Checklist

When adding `trial_countdown.riv`:

- [ ] **Step 1:** Copy file to `example/assets/rive/trial_countdown.riv`
- [ ] **Step 2:** Add file to Xcode project (Build Phases → Copy Bundle Resources)
- [ ] **Step 3:** Copy file to `example/android/app/src/main/res/raw/trial_countdown.riv`
- [ ] **Step 4:** Verify filename is lowercase with underscores only
- [ ] **Step 5:** Use in component:
  ```tsx
  <Rive resourceName="trial_countdown" />
  // OR
  <Rive source={require('../../assets/rive/trial_countdown.riv')} />
  ```
- [ ] **Step 6:** Rebuild iOS: `npx expo run:ios`
- [ ] **Step 7:** Rebuild Android: `npx expo run:android`
- [ ] **Step 8:** Test on both platforms

---

## Common Issues

### ❌ "File resource not found" on Android

**Cause:** File is missing from `android/app/src/main/res/raw/`

**Fix:**
```bash
cp example/assets/rive/your-file.riv example/android/app/src/main/res/raw/your-file.riv
npx expo run:android  # Must rebuild
```

### ❌ "File resource not found" on iOS

**Cause:** File is not in Xcode project or not included in Copy Bundle Resources

**Fix:**
1. Open `example/ios/example.xcodeproj` in Xcode
2. Check if file appears in project navigator
3. Verify it's listed under **Build Phases → Copy Bundle Resources**
4. Rebuild: `npx expo run:ios`

### ❌ File works on iOS but not Android

**Cause:** Filename has uppercase letters or special characters

**Fix:**
```bash
# Rename to lowercase with underscores
mv example/android/app/src/main/res/raw/TrialCountdown.riv \
   example/android/app/src/main/res/raw/trial_countdown.riv
```

Update component to use `resourceName="trial_countdown"` and rebuild.

### ❌ "This build uses a Java 8 JVM" (Android)

**Cause:** Gradle is running with Java 8; the project requires Java 11+

**Fix:**
The project is configured to use Android Studio's JDK (Java 17) in `example/android/gradle.properties`. If you don't have Android Studio:

```bash
brew install openjdk@17
```

Then set in `example/android/gradle.properties`:
```properties
org.gradle.java.home=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
```

---

## Project Structure Reference

```
example/
├── assets/
│   └── rive/
│       ├── avatars.riv              # Metro bundler assets
│       └── trial_countdown.riv
│
├── ios/
│   ├── example.xcodeproj            # Must add files here via Xcode
│   └── Assets/                      # OR copy files here and add via Xcode
│       └── trial_countdown.riv
│
└── android/
    └── app/src/main/res/raw/
        ├── avatars.riv              # Android native resources
        └── trial_countdown.riv      # Must be lowercase [a-z0-9_.]
```

---

## Why Multiple Locations?

React Native apps can bundle assets in different ways:

1. **Metro Bundler** (development):
   - Serves assets from `example/assets/` via dev server
   - Hot reload works
   - Files loaded via `require()`

2. **Native Bundles** (production):
   - iOS: Assets embedded in app bundle via Xcode
   - Android: Assets in `res/raw/` compiled into APK
   - Files loaded via `resourceName` or native resolution of `require()`

For reliability across dev and production, files should be in **all three locations**:
- `example/assets/rive/` (Metro)
- iOS Xcode project (iOS native)
- `example/android/app/src/main/res/raw/` (Android native)

---

## Metro Configuration

The project's `metro.config.js` is already configured to handle `.riv` files:

```js
config.resolver.assetExts.push('riv');
```

No additional configuration is needed.

---

## See Also

- [QuickStart.tsx](../app/(examples)/QuickStart.tsx) - Example using `resourceName`
- [SourceProp.tsx](../app/(examples)/SourceProp.tsx) - Example using `source={require(...)}`
- [RIVE_FILE_CHECKLIST.md](./RIVE_FILE_CHECKLIST.md) - Quick checklist for adding files
- [Rive React Native Documentation](https://rive.app/docs/runtimes/react-native/)
