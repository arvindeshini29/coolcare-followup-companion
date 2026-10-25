import type { CapacitorConfig } from "@capacitor/cli";

// The app is server-rendered (TanStack Start on an edge worker), so it cannot be
// exported as static files. The Android shell loads the published HTTPS site.
// Override with CAP_SERVER_URL (e.g. a custom domain) when syncing.
const serverUrl = process.env.CAP_SERVER_URL ?? "https://coolcare-followup-companion.lovable.app";

const config: CapacitorConfig = {
  appId: "in.followupkit.app",
  appName: "FollowUp Kit",
  // Offline fallback page bundled into the APK/AAB.
  webDir: "android-shell",
  server: {
    url: serverUrl,
    cleartext: false,
    androidScheme: "https",
    errorPath: "index.html",
  },
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    AdMob: {
      // No real ad units are configured. See ANDROID.md.
    },
  },
};

export default config;
