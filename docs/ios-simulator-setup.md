# iOS Simulator Setup Reference

This document provides quick reference for setting up and running the iOS simulator for this React Native project.

## Quick Start (If Previously Set Up)

```bash
cd example
yarn ios
```

## First Time Setup / Troubleshooting

### Prerequisites
- Xcode installed
- Node.js and Yarn installed
- CocoaPods installed (`sudo gem install cocoapods`)

### Common Issues and Solutions

#### 1. CocoaPods Permission Issues

If you encounter permission errors with CocoaPods cache:

```bash
# Clear CocoaPods cache completely
rm -rf ~/.cocoapods

# Reinitialize CocoaPods
pod setup

# Create trunk directory structure
mkdir -p ~/.cocoapods/repos/trunk
chmod -R 755 ~/.cocoapods
```

#### 2. CocoaPods Installation

Install pods with full permissions (run from example directory):

```bash
cd example/ios
pod install
```

**Important**: If you get sandbox/permission errors, you may need to run with elevated permissions or from a non-sandboxed environment.

#### 3. Building and Running

From the `example` directory:

```bash
yarn ios
```

This will:
- Install CocoaPods dependencies (if needed)
- Build the native iOS app with Xcode
- Launch the iOS Simulator
- Install and run the app
- Connect to Metro bundler for hot reloading

### Build Process Overview

The build typically takes 2-5 minutes on first run and includes:

1. **CocoaPods Installation** (~30-60 seconds)
   - Downloads and configures native dependencies
   - Generates Xcode workspace

2. **Xcode Build** (~2-4 minutes)
   - Compiles React Native framework
   - Compiles Expo modules
   - Compiles native modules (Rive, Reanimated, Gesture Handler, etc.)
   - Links libraries
   - Signs the app

3. **Simulator Launch** (~10-20 seconds)
   - Opens iOS Simulator app
   - Boots selected device (iPhone 15 Pro by default)
   - Installs the app
   - Launches the app

### Opening Simulator Manually

If you need to open the simulator separately:

```bash
open -a Simulator
```

### Checking Simulator Status

```bash
# List all available simulators
xcrun simctl list devices

# List currently booted simulators
xcrun simctl list devices booted
```

### Key Files and Directories

- `example/ios/Podfile` - CocoaPods dependency configuration
- `example/ios/example.xcworkspace` - Xcode workspace (open this, not .xcodeproj)
- `~/.cocoapods/` - CocoaPods cache and repository data
- `example/ios/Pods/` - Installed pod dependencies
- `example/ios/build/` - Xcode build artifacts

### Metro Bundler

The Metro bundler runs automatically on `http://localhost:8081`. If you need to start it manually:

```bash
cd example
yarn start
```

### Troubleshooting Tips

1. **Clean build if issues occur:**
   ```bash
   cd example/ios
   rm -rf Pods Podfile.lock build
   pod install
   ```

2. **Check for running processes:**
   ```bash
   # Check if simulator is running
   ps aux | grep Simulator
   
   # Check if Metro bundler is running
   ps aux | grep metro
   ```

3. **Simulator not responding:**
   - Quit Simulator.app completely
   - Run `yarn ios` again
   - Or open Simulator manually first, then run `yarn ios`

4. **CocoaPods trunk repository issues:**
   - The trunk repository may need special permissions
   - Solution: Remove entire `~/.cocoapods` directory and run `pod setup`

### Device Selection

To run on a different simulator device:

```bash
# List available devices
xcrun simctl list devices available

# Run on specific device
yarn ios --simulator="iPhone 14"
```

### Development Workflow

Once the simulator is running:

1. Edit your React Native code
2. Save the file
3. Changes will hot reload automatically
4. For native code changes, rebuild with `yarn ios`

### Performance Notes

- First build: ~2-5 minutes
- Subsequent builds: ~30-60 seconds (incremental)
- Simulator launch (if already built): ~10-20 seconds

### Last Successful Setup

- **Date**: January 13, 2026
- **Device**: iPhone 15 Pro (iOS 17.4 Simulator)
- **React Native**: 0.76.7
- **Expo**: ~52.0.35
- **CocoaPods**: 1.16.2
- **Xcode**: 26.2 (17C52)
- **Build Time**: ~3 minutes
- **Status**: ✅ Build Succeeded, App Installed and Running

### Quick Reference Commands

```bash
# Full setup and run
cd example && yarn ios

# Just install pods
cd example/ios && pod install

# Clean and reinstall pods
cd example/ios && rm -rf Pods Podfile.lock && pod install

# Open simulator manually
open -a Simulator

# Start Metro bundler only
cd example && yarn start

# Fix CocoaPods permissions
rm -rf ~/.cocoapods && pod setup && mkdir -p ~/.cocoapods/repos/trunk
```

---

**Note**: If you encounter new issues, refer to the CocoaPods and Xcode error messages. Most issues relate to permissions, cache, or missing dependencies that can be resolved by cleaning and reinstalling.
