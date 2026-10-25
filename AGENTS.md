<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Android
- Android app is a Capacitor shell (`android/`, `capacitor.config.ts`) loading the published HTTPS site via `server.url`, because the app is SSR and cannot be statically exported. See ANDROID.md.
- Ads live only in `src/lib/ads.ts`: off unless `VITE_ADS_ENABLED=true`, Android-only, allowed paths enforced by `isAdAllowedOnPath`; never commit real AdMob ids.
