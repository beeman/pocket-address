# Build Pocket Address: a Solana dApp Store app, end to end

Paste everything below the line into a coding agent (Claude Code or similar) inside an empty folder. It builds **Pocket Address**, a one-screen Android app that connects a wallet with Mobile Wallet Adapter and shows the wallet's address as a large QR code. It produces everything a dApp Store submission needs: a release-signed APK, an icon, a banner, screenshots, listing copy, and a website with a privacy policy and terms of service hosted on GitHub Pages.

Before you paste it, replace the values in the first section. Everything else adapts to them.

---

## Values for this build

| Placeholder      | Example                                   | Notes                                                                                                                                           |
| ---------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `<APP_NAME>`     | Pocket Address                            | Shown under the launcher icon and in the store.                                                                                                 |
| `<GITHUB_USER>`  | `your-github-username`                    | Lowercase. Used for the package name and the website URL.                                                                                       |
| `<KEYSTORE_DIR>` | `~/.android/keystores`                    | Where the release keystore lives. Outside the repo, and backed up.                                                                              |
| `<PACKAGE>`      | `io.github.<GITHUB_USER>.pocketaddress`   | Android application id. Must be unique in the dApp Store and can never change after the first release. Lowercase letters, digits and dots only. |
| `<REPO>`         | `pocket-address`                          | GitHub repository name, also the project folder name.                                                                                           |
| `<SITE_URL>`     | `https://<GITHUB_USER>.github.io/<REPO>/` | GitHub Pages URL for the website.                                                                                                               |

## Goal

Build an Android app called `<APP_NAME>` and get it ready to submit to the Solana dApp Store. It has one screen: the user connects their wallet with Mobile Wallet Adapter (MWA), and the app shows the wallet's public key as a large QR code, so someone else can scan it to pay them. It must be simple and polished, and look good in screenshots on both a Seeker phone and an Android emulator.

Work through the steps in order. Run each verification before moving on, and report anything you could not complete instead of working around it.

## 1. Scaffold

1. Run `npx solana-mobile@latest create <REPO> -t expo-kit-minimal --pm npm`. This is the React Native (Expo) template with Solana Kit and `@wallet-ui/react-native-kit` for Mobile Wallet Adapter.
2. If the dependency install fails (npm 11 has crashed on this template with `Cannot read properties of null (reading 'edgesOut')`), re-run `create` with `--skip-install`, add `legacy-peer-deps=true` to `.npmrc`, then run `npm install` yourself.
3. The template ships agent skills in `.agents/skills/`. Read `solana-mobile-wallet` for the wallet API and `solana-mobile-publishing` (including `references/signing.md`) for release signing, and follow them where they go deeper than this prompt.
4. `create` initializes a git repository on `main` with an initial commit. Do the work below on a feature branch.

## 2. What the app does

One screen, two states. There is no navigation, no tabs and no settings.

**Before connecting:**

- the brand mark (see step 5), about 96dp;
- `<APP_NAME>` as the title;
- the tagline "Your Solana address, ready to share";
- a full-width **Connect Wallet** button. While connecting it reads "Connecting…" and is disabled;
- if the user declines or the wallet fails, a short muted line: "Could not connect. Please try again." Keep that line's space reserved (render a blank line) so the layout doesn't jump.

**After connecting:**

- a large QR code of the public key: the plain base58 address, no `solana:` URI. Render it dark-on-white in a white rounded card, because inverted (light-on-dark) QR codes fail with some scanners. Draw the accent-coloured scan-frame corner brackets around the card, outside it;
- a small uppercase caption "YOUR ADDRESS", and below it the address shortened as first four … last four (for example `7xKX…gAsU`) in a monospace font;
- **Copy** (primary) and **Share** (secondary) buttons side by side, each half the width:
  - Copy puts the full address on the clipboard, gives a light haptic tap, and shows a short "Copied" toast;
  - Share opens the Android share sheet with the full address as the message;
- **Disconnect** as a small, muted text button below them. It returns to the connect screen.

**On every screen:** a small, muted **Privacy policy** link at the bottom, opening `<SITE_URL>privacy-policy/` in the browser.

**Behaviour:**

- The wallet connection persists across app restarts (wallet-ui does this already), and Disconnect clears it.
- The app makes no RPC calls and never asks the wallet to sign anything. It only reads the address.

### Implementation notes

- **Wallet:** use `MobileWalletProvider` and `useMobileWallet()` from `@wallet-ui/react-native-kit` (`account`, `connect`, `disconnect`).
  - Cluster: `createSolanaMainnet({ url: 'https://api.mainnet.solana.com' })`. Name it "mainnet" everywhere; never write `mainnet-beta`.
  - Identity: `{ name: '<APP_NAME>' }`. **Do not set an identity `uri`** unless you can serve `/.well-known/assetlinks.json` at the root of that domain. A GitHub Pages project site lives under a sub-path and can't, and with a `uri` set, wallets show "Verification failed" instead of "Client not verifiable".
- **QR code:** generate the matrix with `uqr` (`encode(address, { border: 0, ecc: 'M' })`) and draw it with `react-native-svg` (install with `npx expo install react-native-svg`).
  - Draw it as a single `<Path>`, with one rectangle per horizontal run of dark modules.
  - Overlap each row onto the next by about 0.05 of a module, so anti-aliasing doesn't leave hairline seams between rows.
  - Size the card from `useWindowDimensions()`, capped at about 340dp.
- **Copy and haptics:** `@react-native-clipboard/clipboard` and `expo-haptics`, both already in the template.
- **Toast:**
  - Make visibility a `useState` flag with a `setTimeout` (about 1.5s), and use Reanimated only for the `entering`/`exiting` fades. Don't drive visibility with an animation sequence: with system animations turned off, Reanimated skips the sequence and the toast never shows.
  - Put the toast near the **top** of the screen. On Android 13+, the system clipboard preview covers the bottom-left corner right after a copy.
- **Scan frame:** draw the corner brackets in an SVG behind the card, with the card absolutely positioned on top. Crop the SVG `viewBox` to the brackets (for example `6 6 88 88`) and inset the card about 28dp, so the bracket lines sit outside the card rather than hidden under it.
- **Buttons:** a small `Pressable` button with `primary`, `secondary` and `text` variants and a `style` prop. Only the two buttons in the row get `flex: 1`. If the base button has `flex: 1`, the lone Disconnect button stretches vertically and pushes the layout apart.
- Use the React Compiler-friendly Reanimated API (`sharedValue.get()` / `.set()`), and make `npm run lint:check` pass.

## 3. Strip the template

Remove everything that isn't part of the app above:

- the account and network demo features (balance, airdrop, sign message, sign transaction, sign in);
- the cluster picker;
- the action-button and status components;
- `e2e/`, the `reset-project` script and its test;
- `og-image.png`, the React logo images, and the test utilities that only served the removed features;
- dependencies that are no longer used, such as `@solana-program/memo`, `@rn-primitives/dropdown-menu` and `@tanstack/react-query`. Keep `@react-native-async-storage/async-storage`: wallet-ui needs it as a native dependency.

Also remove the `e2e` and `reset-project` scripts from `package.json`, and set its `displayName` and `description` to describe this app.

No template branding, placeholder text, "example" wording or TODOs may remain anywhere in the UI. Rewrite the README (step 10) rather than editing the template's.

Keep the existing `utils/ellipsify.ts` helper, switch its delimiter to `…`, and update its test.

## 4. Look and feel

A dark theme with one accent colour and lots of whitespace. The QR code is the star. Put the colours in one theme module:

| Token        | Value     | Use                               |
| ------------ | --------- | --------------------------------- |
| accent       | `#3DDC97` | primary button, scan frame, toast |
| accentText   | `#04140D` | text on the accent colour         |
| background   | `#0B0D10` | screen, splash, icon background   |
| border       | `#23272E` | secondary button border           |
| qrBackground | `#FFFFFF` | QR card                           |
| qrForeground | `#0B0D10` | QR modules                        |
| surface      | `#15181D` | secondary button fill             |
| text         | `#F4F6F8` | title, address                    |
| textMuted    | `#8A919C` | tagline, caption, links           |

In `app.json`, set `userInterfaceStyle` to `dark` and the root `backgroundColor` to `#0B0D10`. Use the light status bar style. Use 32dp of horizontal padding, and centre the content vertically.

## 5. Branding assets

Make a simple, consistent mark: four rounded scan-frame corner brackets with a small solid rounded square in the middle, in the accent colour on the dark background. In a 100×100 box:

```svg
<path d="M8 30V18a10 10 0 0 1 10-10h12M70 8h12a10 10 0 0 1 10 10v12M92 70v12a10 10 0 0 1-10 10H70M30 92H18a10 10 0 0 1-10-10V70"
      fill="none" stroke="#3DDC97" stroke-linecap="round" stroke-width="8"/>
<rect x="36" y="36" width="28" height="28" rx="6" fill="#3DDC97"/>
```

Keep every SVG source in `assets/branding/`, next to its exported PNG. Add an `export.sh` there that re-exports all of them with `rsvg-convert` (`brew install librsvg`).

| File                          | Size      | Content                                                                                                                                                                              |
| ----------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `android-icon-background.svg` | 1024×1024 | solid `#0B0D10`                                                                                                                                                                      |
| `android-icon-foreground.svg` | 1024×1024 | transparent, mark at **480px**, centred: the adaptive-icon safe zone is a circle about 620px across, and the bracket corners must stay inside it                                     |
| `android-icon-monochrome.svg` | 1024×1024 | same as the foreground, in white (Android 13+ themed icons)                                                                                                                          |
| `favicon.png`                 | 48×48     | exported from `icon.svg`, for the website                                                                                                                                            |
| `icon.svg`                    | 1024×1024 | full-bleed `#0B0D10` square, mark at 600px, centred                                                                                                                                  |
| `splash-icon.svg`             | 1024×1024 | transparent, mark filling the canvas                                                                                                                                                 |
| `store-banner.svg`            | 1200×600  | dark background with a faint accent radial glow on the left; the mark on the left, `<APP_NAME>` in large bold text and the tagline in muted text on the right: the dApp Store banner |
| `store-icon.svg`              | 512×512   | full-bleed `#0B0D10`, mark at 300px: the dApp Store icon                                                                                                                             |

Delete `assets/images/`, and point `app.json` at the branding PNGs:

- `icon`;
- `android.adaptiveIcon`: foreground, background and monochrome images, with `backgroundColor` `#0B0D10`;
- the `expo-splash-screen` plugin: image `splash-icon.png`, `imageWidth` 120, `backgroundColor` `#0B0D10`;
- the web `favicon`.

Open the exported store icon and banner and look at them before moving on.

## 6. App config

In `app.json`:

- `name`: `<APP_NAME>`;
- `android.package`: `<PACKAGE>`. Never ship the template's `com.anonymous.*` placeholder;
- `version`: `1.0.0`;
- `android.versionCode`: `1`. Raise it for every release: the dApp Store rejects an update whose versionCode isn't higher than the published one.

Keep the template's `expo-dev-client` plugin options as they are.

## 7. Release build and signing

The dApp Store only accepts an **APK** (not an `.aab`), and rejects debug-signed APKs. A stock Expo prebuild signs the release variant with the **debug** key, so this needs real work.

1. **Ask the developer** where the keystore should live (default `<KEYSTORE_DIR>/<REPO>-release.jks`). Never put it in the repo. Generate it with `keytool -genkeypair -storetype PKCS12 -keyalg RSA -keysize 4096 -validity 10000 -alias <REPO>`. Use a random password, and **never print it**.
2. Store the credentials in `~/.gradle/gradle.properties` (`chmod 600`), or in environment variables with the same names:
   - `<PREFIX>_UPLOAD_STORE_FILE`
   - `<PREFIX>_UPLOAD_STORE_PASSWORD`
   - `<PREFIX>_UPLOAD_KEY_ALIAS`
   - `<PREFIX>_UPLOAD_KEY_PASSWORD`

   `<PREFIX>` is the app name in upper snake case, for example `POCKET_ADDRESS`.

3. Tell the developer to back up the keystore and its password now, for example in a password manager. **Every future update must be signed with this exact key.** If it's lost, the app can't be updated and has to be listed again under a new package name.
4. The template gitignores `android/` and regenerates it with `expo prebuild`, so a hand edit to `build.gradle` would be lost. Write a config plugin, `plugins/with-release-signing.js`, using `withAppBuildGradle`. It must:
   - add a `release` signingConfig that reads the four values with `findProperty(name) ?: System.getenv(name)`;
   - point the release build type at it;
   - add a `gradle.taskGraph.whenReady` guard that **fails any release task** when the store file isn't set, instead of quietly signing with the debug key;
   - mark what it inserts so it runs only once, and throw if `build.gradle` doesn't have the expected shape.
5. Add a second config plugin, `plugins/with-arm64-only.js` (`withGradleProperties`), that sets `reactNativeArchitectures=arm64-v8a`. Seekers and Apple-silicon emulators are arm64, and four ABIs roughly triple the APK size (from about 57 MB to about 150 MB).
6. Add both plugins to `app.json`, and add a script: `"android:release": "expo prebuild -p android --clean && cd android && ./gradlew assembleRelease"`.
7. Add the signing patterns to `.gitignore`: `*.apk`, `*.aab`, `*.keystore`, `*.jks`, `keystore.properties`, `signing.properties`.
8. Build with `npm run android:release`. The APK is `android/app/build/outputs/apk/release/app-release.apk`.
9. Verify the APK:
   - `$ANDROID_HOME/build-tools/<highest>/apksigner verify --print-certs <apk>`. `apksigner` isn't on `PATH` by default. The signer DN must be your own certificate, **not** `CN=Android Debug`. Record the certificate's SHA-256.
   - `aapt2 dump badging <apk>` must show `<PACKAGE>`, versionName `1.0.0` and versionCode `1`, with no `application-debuggable`.
   - If `npx solana-mobile@latest release --help` lists a `check` command, also run `npx solana-mobile@latest release check --apk android/app/build/outputs/apk/release/app-release.apk` and fix anything it reports.
   - Run the build once with the store file blanked (`./gradlew assembleRelease -P<PREFIX>_UPLOAD_STORE_FILE=`) and confirm the guard fails it.
10. Install the release APK with `adb install -r`, and test it (step 9).

## 8. Website on GitHub Pages

The dApp Store listing needs a privacy policy URL, and a website and terms of service are worth having too. For a **public** repository, GitHub Pages hosts them for free with no build step: serve a plain static site from `docs/` on `main`. (Pages on a private repository needs a paid GitHub plan.)

Create:

- **`docs/index.html`:** the landing page.
  - The icon (copy `store-icon.png` to `docs/icon.png`), `<APP_NAME>`, the tagline, and two or three honest sentences about what the app does.
  - The Android package name.
  - Links: `solanadappstore://details?id=<PACKAGE>` (labelled "dApp Store"), Privacy Policy, Terms of Service.
  - Once screenshots exist (step 9), a grid of `docs/screenshots/*.png`. Show four across on desktop and two on narrow screens, scaled down with CSS, each linking to the full-size image.
- **`docs/privacy-policy/index.html`:** a plain, honest policy that matches what the app actually does:
  - no accounts, analytics or server;
  - the wallet provides only the public address;
  - the address is stored on the device until Disconnect;
  - no private keys and no signing;
  - the address leaves the app only when the user scans, copies or shares it;
  - the wallet app, the dApp Store, the browser and GitHub Pages have their own policies;
  - questions go to the GitHub repository.
- **`docs/terms-of-service/index.html`:**
  - the app only displays an address;
  - it holds no funds and gives no financial, legal or tax advice;
  - check the address before sharing it, because payments can't be reversed;
  - it's provided as is, without warranty.
- **`docs/favicon.png`.**

Keep the pages minimal: system font, a 42rem column, no JavaScript, no external assets. Use absolute paths that start with `/<REPO>/` (Pages serves a project site under that prefix). Show a "Last updated" date on the two policy pages.

After the repository is pushed and the work is merged to `main` (ask the developer before every push and every PR), enable Pages and set the repository details:

```bash
gh api -X POST repos/<GITHUB_USER>/<REPO>/pages -f 'source[branch]=main' -f 'source[path]=/docs'
gh repo edit <GITHUB_USER>/<REPO> --homepage "<SITE_URL>" --description "<short description>"
```

Wait for `gh api repos/<GITHUB_USER>/<REPO>/pages --jq .status` to report `built`, then check that `<SITE_URL>`, `<SITE_URL>privacy-policy/` and `<SITE_URL>terms-of-service/` all return 200. The app's privacy link points there, so the site has to be live before the app is submitted.

## 9. Test and capture screenshots

**Test the release build**, not a dev build, on an emulator with a wallet installed (for example the MWA Fake Wallet), or on a Seeker:

- [ ] cold start shows the dark splash, then the connect screen
- [ ] Connect opens the wallet, approving shows the QR screen, and declining shows the "Could not connect" line
- [ ] the QR decodes to the full address (decode a screenshot, for example with OpenCV's `QRCodeDetector`, and compare it with the address)
- [ ] Copy puts the full address on the clipboard and shows the "Copied" toast; check this with system animations both on and off
- [ ] Share opens the share sheet with the full address
- [ ] Disconnect returns to the connect screen and stays disconnected after a restart
- [ ] the Privacy policy link opens the live policy page
- [ ] the launcher shows the adaptive icon, and the themed icon on Android 13+

An emulator with a lock-screen PIN stays locked after a cold boot. Then every `am start` fails with `-92`, which looks like a broken APK but isn't. Use an emulator without a PIN.

**Capture four store screenshots** with the release build, at the device's native resolution:

1. **Welcome:** the connect screen.
2. **Your QR code:** connected, with the QR, the shortened address, Copy and Share.
3. **Copied:** right after tapping Copy, with the toast visible. Tap empty space first to dismiss Android's clipboard preview.
4. **Share:** the share sheet open, with the address in the preview.

For a clean status bar, use SystemUI demo mode:

```bash
adb shell settings put global sysui_demo_allowed 1
adb shell am broadcast -a com.android.systemui.demo -e command enter
adb shell am broadcast -a com.android.systemui.demo -e command clock -e hhmm 1200
adb shell am broadcast -a com.android.systemui.demo -e command battery -e level 100 -e plugged false
adb shell am broadcast -a com.android.systemui.demo -e command network -e wifi show -e level 4 -e fully true
adb shell am broadcast -a com.android.systemui.demo -e command network -e mobile hide
adb shell am broadcast -a com.android.systemui.demo -e command notifications -e visible false
```

If the device is in light mode, switch it to dark (`adb shell cmd uimode night yes`) for the share-sheet shot, so the sheet matches the app. Restore every setting afterwards (`… -e command exit`, `sysui_demo_allowed 0`, and the original night mode).

Save the shots as `docs/screenshots/1-welcome.png`, `2-qr-code.png`, `3-copied.png` and `4-share.png`, so they serve the store listing, the website and the README.

## 10. Store listing and README

Write `STORE_LISTING.md` with everything the dApp Store publisher portal asks for. Keep the language plain and honest: no hype, no "revolutionary", and no references to tutorials, videos or series. For example:

- **App name:** `<APP_NAME>`
- **Short description:** Show your Solana address as a QR code so others can scan it and pay you.
- **Long description:**

  > `<APP_NAME>` does one thing. Connect your wallet and it shows your Solana address as a large QR code that someone else can scan with their wallet to send you funds.
  >
  > It uses Mobile Wallet Adapter to read your public key from the wallet you already use. It never asks you to sign anything, and it does not send your address to a server. The shortened address under the QR code helps you check that it is the right account. Copy puts the full address on your clipboard, and Share sends it to any app on your phone.
  >
  > When you are done, disconnect and the app forgets your address.

- **Category:** Finance (Tools also fits)
- **Website:** `<SITE_URL>`
- **Privacy policy:** `<SITE_URL>privacy-policy/`
- **Terms of service:** `<SITE_URL>terms-of-service/`
- **Icon:** `assets/branding/store-icon.png` (512×512)
- **Banner:** `assets/branding/store-banner.png` (1200×600)
- **Screenshots:** the four files in `docs/screenshots/`, each with a one-line description of the app state it shows
- **Release:** package `<PACKAGE>`, version 1.0.0, versionCode 1, and the release certificate's SHA-256

Write `README.md`:

- one line about the app, with the four screenshots at 200px wide, each linking to the full-size image;
- development commands;
- how to rebuild the release APK:
  - a table of the four signing properties, sorted by name;
  - first-time keystore creation, with the backup warning;
  - `npm run android:release`, then verifying with `apksigner` and installing with `adb`;
- how to re-export the branding (`assets/branding/export.sh`);
- where the website lives and its URL.

## Rules

- Never commit the keystore, its passwords or any `.apk`/`.aab`. Never print a password or private key in output, logs, commits or PR text.
- Never put `mainnet-beta` in code, config or docs; the cluster is "mainnet".
- Keep lists, table rows and object keys in alphabetical order unless order matters (such as steps).
- Ask the developer before creating a GitHub repository, pushing, opening or merging a PR, or enabling Pages.

## Done when

- [ ] `npx tsc --noEmit`, `npm run lint:check` and `npm test` pass
- [ ] the release APK is built, signed with the release key (not `CN=Android Debug`), verified with `apksigner`, installed, and tested through every step of the checklist in step 9
- [ ] the branding SVGs and PNGs are in `assets/branding/`, and the store icon and banner have been visually checked
- [ ] the four screenshots are in `docs/screenshots/`
- [ ] the website, privacy policy and terms of service are live on GitHub Pages, and the in-app privacy link opens them
- [ ] `STORE_LISTING.md` and `README.md` are written
- [ ] you have told the developer the APK path and size, the certificate SHA-256, and where the keystore is, and reminded them to back it up
