# Android / Google Play release guide

FollowUp Kit runs on the server (sign-in, private data per technician), so the
Android app is a **Capacitor shell that loads the published HTTPS site**
(`capacitor.config.ts → server.url`). Login, data and security are identical to
the website. A small offline page (`android-shell/index.html`) is bundled.

- Package id: `in.followupkit.app` (change in `capacitor.config.ts` and
  `android/app/build.gradle` **before** the first upload — it is permanent).
- Default site: `https://coolcare-followup-companion.lovable.app`. Override with
  `CAP_SERVER_URL=https://your-domain npx cap sync android`.

## 0. Prerequisites (your computer)
- Node 20+, JDK 17, Android Studio (SDK 35 platform + build tools).
- The web app must be **published** first — the shell loads the live site.

## 1. Sync the Android project
```sh
npm install
npx cap sync android
```

## 2. Create an upload key (once — back it up, never commit it)
```sh
keytool -genkeypair -v -keystore ~/followupkit-upload.jks -alias upload \
  -keyalg RSA -keysize 2048 -validity 10000
cp android/keystore.properties.example android/keystore.properties
# edit android/keystore.properties with the path and passwords
```
Enrol in **Play App Signing** when creating the app in Play Console; this is your upload key.

## 3. Build the signed AAB
Bump `versionCode` (integer, +1 each upload) and `versionName` in `android/app/build.gradle`, then:
```sh
cd android
./gradlew bundleRelease          # Windows: gradlew.bat bundleRelease
```
Output: `android/app/build/outputs/bundle/release/app-release.aab`.
Test on a device first: `./gradlew installDebug` or `npx cap run android`.

## 4. Play Console checklist
- Personal accounts created after Nov 2023 must run a **closed test with 12+
  testers for 14 days** before production access — check your account.
- Privacy policy URL (required; must mention customer data storage and, if ads are on, AdMob/advertising ID).
- Data safety form: collects email, name, customer phone/notes (user-provided), stored encrypted in transit, user can request deletion.
- Account deletion: Play requires an in-app path or web URL to request account deletion — add one before release.
- Content rating questionnaire, target audience (not children), app category: Business.
- Store listing: 512px icon (`public/icon-512.png`), 1024×500 feature graphic, phone screenshots.
- Play may reject "website-only" wrappers; the app should offer clear value (it does: private CRM), and keep the offline page.

## 5. Ads (AdMob) — OFF by default
Scaffold: `src/lib/ads.ts` (+ test `src/test/ads.test.ts`).
- Runs only inside the Android app, only when built with `VITE_ADS_ENABLED=true`.
- Only Google's **public test ids** are in the code
  (app `ca-app-pub-3940256099942544~3347511713`, banner `…/6300978111`).
- Single adaptive banner on the **Dashboard only**, above the bottom menu.
  Never on sign-in, password reset, lead forms, lead details, follow-ups,
  WhatsApp messages or settings (enforced by `isAdAllowedOnPath`, tested).
- Google UMP consent form is requested before any ad loads.

Because the shell loads the published site, `VITE_*` flags come from the
**published web build**. To turn ads on later:
1. Get AdMob approved, create an Android app + banner unit, link to Play listing.
2. Put the real App ID in `~/.gradle/gradle.properties` (not in git):
   `ADMOB_APP_ID=ca-app-pub-XXXX~YYYY`
3. Set `VITE_ADS_ENABLED=true` and `VITE_ADMOB_BANNER_ID=ca-app-pub-XXXX/ZZZZ` for the web build and republish.
4. Add `app-ads.txt` at your domain root, update the privacy policy and Data
   safety form (advertising ID), and declare "Contains ads" in Play Console.
5. Android 13+: add `<uses-permission android:name="com.google.android.gms.permission.AD_ID"/>` to `AndroidManifest.xml` when ads go live.

Never click your own live ads; keep test ids while developing.

## What cannot be done in this environment
- No Android SDK/JDK here, so `gradlew bundleRelease` was not run.
- Keystore creation, Play Console setup, AdMob account, testers and store assets need your accounts.
