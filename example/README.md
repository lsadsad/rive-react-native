# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Adding Rive Files

To add local `.riv` files to the example app, see **[docs/ADDING_RIVE_FILES.md](./docs/ADDING_RIVE_FILES.md)** for the complete guide.

**Quick Summary:**
1. Copy `.riv` file to `assets/rive/`
2. Add to iOS Xcode project
3. Copy to `android/app/src/main/res/raw/` (lowercase filename)
4. Rebuild both platforms: `npx expo run:ios` and `npx expo run:android`

## Clearing cache

If the app isn’t picking up changes, assets, or new files, clear the Metro/Expo cache.

**Quick (often enough):**
```bash
npx expo start --clear
```
Or from the example folder: `yarn start:clear` or `npm run start:clear`.

**If that doesn’t fix it — full cache clear (macOS/Linux):**
```bash
cd example
watchman watch-del-all
rm -rf $TMPDIR/haste-map-*
rm -rf $TMPDIR/metro-cache
npx expo start --clear
```
If you use Watchman, `watchman watch-del-all` clears its cache. Then restart the dev server with `--clear`.

**Nuclear option (reinstall deps + clear caches):**
```bash
cd example
rm -rf node_modules
yarn cache clean    # or: npm cache clean --force
yarn               # or: npm install
watchman watch-del-all
rm -rf $TMPDIR/haste-map-* $TMPDIR/metro-cache
npx expo start --clear
```

After adding new `.riv` files or native assets, you still need a **full rebuild** (`yarn ios` / `yarn android`), not just a cache clear. See [docs/ADDING_RIVE_FILES.md](./docs/ADDING_RIVE_FILES.md).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
