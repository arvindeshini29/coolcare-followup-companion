// AdMob scaffold — OFF by default, Android app only, Google TEST ids only.
// Real ad unit ids must never be committed; supply them at build time once
// your AdMob account is approved (see ANDROID.md).

/** Google's official public test banner unit. Always shows "Test Ad". */
export const ADMOB_TEST_BANNER_ID = "ca-app-pub-3940256099942544/6300978111";

/** Ads may only appear on these read-only overview screens — never on sign-in,
 * forms, lead details/editing, WhatsApp composer or follow-up actions. */
export const AD_ALLOWED_PATHS = ["/dashboard"] as const;

export function isAdAllowedOnPath(pathname: string): boolean {
  const clean = pathname.replace(/\/+$/, "") || "/";
  return (AD_ALLOWED_PATHS as readonly string[]).includes(clean);
}

export function adsEnabled(): boolean {
  return import.meta.env.VITE_ADS_ENABLED === "true";
}

export function bannerAdUnitId(): string {
  const configured = import.meta.env.VITE_ADMOB_BANNER_ID as string | undefined;
  // Use a real id only when explicitly provided for a production build.
  return configured && configured.startsWith("ca-app-pub-") ? configured : ADMOB_TEST_BANNER_ID;
}

/** Show a banner on Android only, after the Google consent (UMP) flow. Returns a cleanup fn. */
export async function showNativeBanner(pathname: string): Promise<() => void> {
  const noop = () => {};
  if (!adsEnabled() || !isAdAllowedOnPath(pathname)) return noop;
  const { Capacitor } = await import("@capacitor/core");
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") return noop;

  const { AdMob, BannerAdPosition, BannerAdSize } = await import("@capacitor-community/admob");
  try {
    await AdMob.initialize({ initializeForTesting: bannerAdUnitId() === ADMOB_TEST_BANNER_ID });
    // GDPR/consent: ask Google's User Messaging Platform; respects "not required" regions.
    const info = await AdMob.requestConsentInfo();
    if (info.isConsentFormAvailable && info.status === "REQUIRED") {
      await AdMob.showConsentForm();
    }
    await AdMob.showBanner({
      adId: bannerAdUnitId(),
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 80, // sits above the bottom menu, never covering it
      isTesting: bannerAdUnitId() === ADMOB_TEST_BANNER_ID,
    });
    return () => {
      void AdMob.removeBanner().catch(() => {});
    };
  } catch (e) {
    console.warn("Ad not shown", e);
    return noop;
  }
}
