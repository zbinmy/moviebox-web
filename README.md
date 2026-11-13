# MovieBox Web

A responsive, MovieBox-inspired web discovery shell deployed as a static GitHub Pages site. It replaces the former Internet Archive-only catalogue with the APK's four primary destinations (Home, NovelHub, Downloads, Me), the requested Home category rail, public metadata discovery, local watchlist/recent history, and a standards-based browser sample player.

## Run and deploy

Open `index.html` from a local static server (for example `python3 -m http.server 8000`) and visit `http://localhost:8000/moviebox-web/` if the server root is the parent directory. The existing `.github/workflows/pages.yml` publishes the repository to GitHub Pages on pushes to `main`. Relative app assets and hash routes work under `/moviebox-web/` and refresh without server-side route configuration.

## Metadata setup

The site has no embedded credentials. To load current movie/TV metadata and search results, create/use your own TMDB v3 API key and enter it under **Me → Metadata provider**. It is stored in this browser's LocalStorage. Do not put private keys in a public static repository; for a production deployment use a proxy/backend you control and secure. Public metadata (title, cast, synopsis, images, ratings) is not a playable source.

## Playback and authorization

The APK hostnames/routes/components are architectural clues only. This site does not access MovieBox's private backend, visitor login, VIP, signed resources, DRM, or Android loopback DashServer. No MovieBox backend credentials were provided. Title detail pages therefore report full-length playback as unavailable. The player can test browser controls using separately identified public sample assets: Big Buck Bunny MP4, Mux HLS test stream, and Shaka demo DASH stream. These are sample streams, not the selected film/episode or substitutes for one. User-loaded WebVTT/SRT subtitle files, speed, fullscreen, PiP where supported, and local position persistence are included. Browser/host CORS and codec support can vary.

## Local storage

Watchlist, recent titles, playback position, TMDB key, subtitle language preference, and informational download records are stored in LocalStorage. The Downloads screen does not claim to save protected media offline. NovelHub is a separate module shell; an authorized novel catalogue/provider is not supplied.

## Scope and known unavailable functions

- Original APK screens/assets and exact visual behavior cannot be confirmed without an APK extraction/reference screenshots; this is a web adaptation, not a byte-for-byte reconstruction.
- Private MovieBox API authentication and playback, live channels, promotional wajegame destination, and licensed offline downloads require authorization/provider integration and are intentionally unavailable.
- ShortTV is implemented as a distinct discovery view, but public metadata providers may not have a dedicated short-form taxonomy.
- TMDB key is user-supplied; live catalogue/search cannot function until configured and the key's network/CORS access is available.
- HLS/DASH demos load third-party libraries on demand from CDNs; those formats depend on network and browser support.

## Verification

The code provides responsive layouts, four-item bottom navigation, all fourteen requested category names, hash-based detail/category navigation, metadata-backed search after key configuration, movie/TV detail and season/episode metadata, local persistence, and sample MP4/HLS/DASH player controls. This environment did not run a browser, mobile device, console inspection, GitHub Actions deployment, or playback/CORS acceptance tests; deployment and those runtime checks are not claimed as passed.
