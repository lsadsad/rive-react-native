# Legacy Runtime Documentation

## Overview

This repository (`rive-react-native`) uses **legacy native Rive runtime versions** for both iOS and Android platforms. This document explains what the Rive runtime is, how it's used, and where it's configured in this project.

## What is the Rive Runtime?

The Rive runtime is the native SDK (Software Development Kit) that powers the actual rendering and playback of Rive animations on iOS and Android devices. The `rive-react-native` package is a wrapper that bridges these native runtimes to React Native, allowing developers to use Rive animations in React Native applications.

### Architecture

```
┌─────────────────────────────────────────┐
│     React Native Application            │
│  (JavaScript/TypeScript Layer)          │
└──────────────┬──────────────────────────┘
               │
               │ Bridge
               │
┌──────────────▼──────────────────────────┐
│     rive-react-native Package           │
│  (React Native Wrapper)                 │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌──────▼──────┐
│  Rive iOS   │  │ Rive Android│
│  Runtime    │  │  Runtime    │
│ RiveRuntime │  │ rive-android│
└─────────────┘  └─────────────┘
```

## Current Runtime Versions (LEGACY)

As of the current state of this repository, the following legacy runtime versions are configured:

### package.json Configuration

```json
"runtimeVersions": {
  "ios": "6.12.1",
  "android": "10.5.1"
}
```

### Latest Available Versions (as of January 2026)

Based on research:
- **iOS (RiveRuntime)**: Latest stable is approximately **6.12.2**
- **Android (rive-android)**: Latest stable is approximately **10.5.0**

**Status**: The versions in use are relatively recent, but may be considered "legacy" if:
1. They are not the absolute latest versions
2. There are newer versions with important bug fixes or features
3. They lack support for new Rive features available in newer runtime versions

## Where the Runtime is Used

### 1. iOS Platform

#### Configuration Files

**`rive-react-native.podspec`** (Lines 5-36)
- This is the CocoaPods specification file for iOS
- Reads the runtime version from `package.json` or optionally from `ios/Podfile.properties.json`
- Declares dependency on `RiveRuntime` at the specified version

```ruby
# Resolve Rive iOS SDK version
podfile_properties_path = File.join(__dir__, "ios", "Podfile.properties.json")
if File.exist?(podfile_properties_path)
  podfile_properties = JSON.parse(File.read(podfile_properties_path))
  rive_ios_version = podfile_properties["RiveRuntimeIOSVersion"]
end

rive_ios_version ||= package["runtimeVersions"]["ios"]

# ...

s.dependency "RiveRuntime", rive_ios_version
```

#### Native Implementation Files

The iOS runtime is used in these Swift files:
- `ios/RiveReactNativeView.swift` - Main view component that renders Rive animations
- `ios/RiveReactNativeViewManager.swift` - View manager for React Native bridge
- `ios/RiveReactNativeRendererModule.swift` - Module for renderer configuration
- `ios/RNAlignment.swift` - Alignment enum wrapper
- `ios/RNFit.swift` - Fit enum wrapper
- `ios/RNLoopMode.swift` - Loop mode enum wrapper
- `ios/RNRiveError.swift` - Error handling wrapper
- `ios/RNRiveRendererType.swift` - Renderer type wrapper

#### Installation

The iOS runtime is installed via CocoaPods when running:
```bash
cd ios && pod install
```

Or for updates:
```bash
cd ios && pod update RiveRuntime
```

### 2. Android Platform

#### Configuration Files

**`android/build.gradle`** (Lines 131-160)
- Gradle build script for Android
- Reads the runtime version from `package.json` or optionally from `android/gradle.properties`
- Declares dependency on `app.rive:rive-android` at the specified version

```gradle
def getRiveAndroidVersion() {
  if (project.hasProperty("Rive_RiveRuntimeAndroidVersion")) {
    return project.property("Rive_RiveRuntimeAndroidVersion")
  }

  def packageJsonFile = new File(projectDir, '../package.json')
  if (packageJsonFile.exists()) {
    def packageJson = new groovy.json.JsonSlurper().parseText(packageJsonFile.text)
    if (packageJson.runtimeVersions?.android) {
      return packageJson.runtimeVersions.android
    }
  }

  throw new GradleException("Could not determine Rive Android SDK version...")
}

def riveAndroidVersion = getRiveAndroidVersion()
println "rive-react-native: Using Rive Android SDK ${riveAndroidVersion}"

dependencies {
  // ...
  implementation "app.rive:rive-android:${riveAndroidVersion}"
}
```

#### Native Implementation Files

The Android runtime is used in these Kotlin files:
- `android/src/main/java/com/rivereactnative/RiveReactNativeView.kt` - Main view component
- `android/src/main/java/com/rivereactnative/RiveReactNativeRendererModule.kt` - Renderer module
- `android/src/main/java/com/rivereactnative/RNAlignment.kt` - Alignment enum wrapper
- `android/src/main/java/com/rivereactnative/RNDirection.kt` - Direction enum wrapper
- `android/src/main/java/com/rivereactnative/RNFit.kt` - Fit enum wrapper
- `android/src/main/java/com/rivereactnative/RNLoopMode.kt` - Loop mode enum wrapper
- `android/src/main/java/com/rivereactnative/RNRiveError.kt` - Error handling wrapper
- `android/src/main/java/com/rivereactnative/RNRiveRendererType.kt` - Renderer type wrapper

#### Installation

The Android runtime is automatically resolved by Gradle from Maven Central when building the Android project.

### 3. React Native JavaScript/TypeScript Layer

The React Native wrapper exposes the native runtime functionality through:

**`src/Rive.tsx`** - Main React component
- Provides declarative API for rendering Rive animations
- Handles communication with native modules

**`src/types.ts`** - TypeScript type definitions
- Defines types for props, refs, and enums
- Provides type safety for runtime interactions

## How the Runtime is Used

### 1. Animation Loading
The runtime handles loading `.riv` files from:
- Local resources (embedded in the app bundle)
- HTTP/HTTPS URLs
- Local file paths

### 2. Animation Rendering
The runtime renders animations using:
- **iOS**: Metal or CoreGraphics (depending on renderer type)
- **Android**: Skia or Rive Renderer (depending on renderer type)

### 3. Animation Playback
The runtime manages:
- Play/pause controls
- Animation state
- Timeline scrubbing
- Loop modes (oneShot, loop, pingPong, autoLoop)

### 4. State Machine Interaction
The runtime handles:
- State machine inputs (boolean, number, trigger)
- State transitions
- Event listeners
- Text run manipulation

### 5. Layout and Fitting
The runtime controls:
- Alignment options
- Fit modes (fill, contain, cover, fitWidth, fitHeight, etc.)
- Viewport transformations

## Version Resolution Priority

The runtime version is resolved in the following order:

### iOS
1. `ios/Podfile.properties.json` → `RiveRuntimeIOSVersion` (highest priority)
2. `package.json` → `runtimeVersions.ios` (default)

### Android
1. `android/gradle.properties` → `Rive_RiveRuntimeAndroidVersion` (highest priority)
2. `package.json` → `runtimeVersions.android` (default)

## Customizing Runtime Versions

### For Vanilla React Native Projects

#### iOS
Create or edit `ios/Podfile.properties.json`:
```json
{
  "RiveRuntimeIOSVersion": "6.13.0"
}
```

Then run:
```bash
cd ios && pod install
```

#### Android
Add to `android/gradle.properties`:
```properties
Rive_RiveRuntimeAndroidVersion=10.6.0
```

### For Expo Projects

Use config plugins in `app.config.ts`:
```typescript
import { ExpoConfig, ConfigContext } from 'expo/config';
import { withPodfileProperties, withGradleProperties } from '@expo/config-plugins';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  plugins: [
    [
      withPodfileProperties,
      {
        RiveRuntimeIOSVersion: '6.13.0',
      },
    ],
    [
      withGradleProperties,
      {
        Rive_RiveRuntimeAndroidVersion: '10.6.0',
      },
    ],
  ],
});
```

## Upgrading from Legacy Runtime

### Before Upgrading

1. **Check Compatibility**: Review the changelog for the target runtime versions
   - iOS: https://github.com/rive-app/rive-ios/releases
   - Android: https://github.com/rive-app/rive-android/releases

2. **Review Breaking Changes**: Look for any API changes or deprecations

3. **Test Thoroughly**: Ensure all animations work as expected with the new runtime

### Upgrade Steps

#### 1. Update package.json

```json
"runtimeVersions": {
  "ios": "6.13.0",    // Update to desired version
  "android": "10.6.0"  // Update to desired version
}
```

#### 2. Update iOS Dependencies

```bash
cd example/ios
pod update RiveRuntime
cd ../..
```

#### 3. Update Android Dependencies

Android dependencies are resolved automatically on the next build, but you can force a clean build:

```bash
cd example/android
./gradlew clean
cd ../..
```

#### 4. Test on Both Platforms

```bash
# iOS
cd example
yarn expo run:ios

# Android
yarn expo run:android
```

### Common Issues When Upgrading

1. **API Changes**: New runtime versions may change or deprecate APIs
2. **Rendering Differences**: Visual differences may occur with renderer updates
3. **Performance Changes**: New optimizations or regressions may affect performance
4. **Compatibility**: Ensure the `rive-react-native` version supports the runtime versions

## Minimum Supported Versions

### iOS
- Minimum iOS version: **14.0+**
- Swift version: **5.0**

### Android
- Minimum SDK version: **21**
- Target SDK version: **33**

## References

- [Rive React Native Documentation](https://help.rive.app/runtimes/overview/react-native)
- [Rive iOS Runtime Repository](https://github.com/rive-app/rive-ios)
- [Rive Android Runtime Repository](https://github.com/rive-app/rive-android)
- [Rive iOS Runtime Releases](https://github.com/rive-app/rive-ios/releases)
- [Rive Android Runtime Releases](https://github.com/rive-app/rive-android/releases)
- [React Native Setup Guide](./CONTRIBUTING.md)
- [README - Native SDK Version Customization](./README.md#native-sdk-version-customization)

## For AI/LLM Context

This document is intended to provide comprehensive context about the Rive runtime for AI assistants working with this codebase. Key takeaways:

1. **The "runtime"** refers to the native iOS and Android SDKs that actually render Rive animations
2. **Legacy versions** are `6.12.1` (iOS) and `10.5.1` (Android) as specified in `package.json`
3. **Configuration** happens in two places: `package.json` (default) and platform-specific override files
4. **Native code** in `ios/` and `android/` folders interfaces with these runtimes
5. **Upgrading** requires updating version numbers and running platform-specific dependency update commands
6. **Testing** should be done on both platforms after any runtime version changes

When working with this codebase, consider that:
- Changes to runtime versions may affect rendering behavior
- Native code changes require rebuilding the app
- Different runtime versions may have different APIs or capabilities
- The wrapper code may need updates to support new runtime features
