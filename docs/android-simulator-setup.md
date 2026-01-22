# Android Simulator Quick Setup Guide

This document provides quick reference commands for setting up and launching the Android simulator for development.

## Prerequisites

- Android SDK installed (typically at `/Users/[username]/Library/Android/sdk` on macOS)
- Android emulator configured through Android Studio AVD Manager

## Quick Commands

### List Available Emulators

```bash
/Users/levinsadsad/Library/Android/sdk/emulator/emulator -list-avds
```

Or add the emulator to your PATH and use:
```bash
emulator -list-avds
```

### Current Available Emulator

- **Medium_Phone_API_36.1** (Android API 36)

### Launch Android Emulator

```bash
/Users/levinsadsad/Library/Android/sdk/emulator/emulator -avd Medium_Phone_API_36.1 &
```

The `&` at the end runs it in the background. The emulator typically takes 1-2 minutes to fully boot.

### Alternative: Use shorter command (if PATH is configured)

```bash
emulator -avd Medium_Phone_API_36.1 &
```

## Running the Example App on Android

Once the emulator is running and fully booted:

```bash
cd example
yarn android
```

Or with Expo:

```bash
cd example
yarn expo run:android
```

## Environment Variables (if needed)

If you encounter Java-related issues, ensure JAVA_HOME is set:

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
```

You can add this to your `~/.zshrc` or `~/.bashrc` for persistence.

## Troubleshooting

### Emulator not found
If you get "command not found: emulator", add Android SDK tools to your PATH:

```bash
export ANDROID_HOME=/Users/levinsadsad/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Check if emulator is running

```bash
adb devices
```

This will list all connected devices and emulators.

### Kill a stuck emulator

```bash
adb emu kill
```

Or find and kill the process:
```bash
ps aux | grep emulator
kill [PID]
```

## Notes

- The emulator requires hardware acceleration (Intel HAXM on macOS Intel, or Apple Silicon native support on M1/M2/M3 Macs)
- First boot may take longer than subsequent boots
- Keep the emulator window open while developing
- You can create additional AVDs through Android Studio's AVD Manager

## Quick Start Checklist

1. ✅ Launch emulator: `/Users/levinsadsad/Library/Android/sdk/emulator/emulator -avd Medium_Phone_API_36.1 &`
2. ⏱️ Wait 1-2 minutes for emulator to fully boot
3. ✅ Verify with: `adb devices`
4. ✅ Run app: `cd example && yarn android`
