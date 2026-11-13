# MovieBox Discovery

A responsive, installable movie and TV discovery website. It uses the official **TMDB API** for catalogue metadata, search, ratings, posters, synopsis and official YouTube trailers.

> This is an independent project, not affiliated with MovieBox or TMDB. It does not reproduce MovieBox's private APIs, extract protected streams, or provide unlicensed video links. Full-length playback must come from a service or media source you are authorised to use.

## Features
- Trending, movies, TV and multi-search through TMDB
- Title detail views with synopsis, ratings, genres and official trailers
- Browser-local My List
- Responsive mobile/desktop layout
- PWA manifest and service worker
- API key entered by the site owner and stored in that browser's local storage

## Setup
1. Create a free TMDB account and request an API key at https://www.themoviedb.org/settings/api
2. Open the deployed site and enter the **v3 API key** in Settings.
3. The key is stored only in that browser. Do not put a private API Read Access Token in public source code.

## GitHub Pages
This repository includes a GitHub Actions workflow. In GitHub, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**. Pushes to `main` will deploy automatically. The site URL is:
`https://zbinmy.github.io/moviebox-web/`

## Local preview
Serve the repository root with any static server, e.g.:
`python3 -m http.server 8080`
Then open http://localhost:8080.

## Playback boundary
TMDB supplies metadata and artwork, not movie files. The APK's private app endpoints and signed playback protocol are not a supported public web API. This project intentionally does not reverse-engineer or bypass access controls. To add full playback, integrate a licensed streaming provider or your own media server and authenticate through its documented API.

## Privacy
The TMDB v3 API key is stored in localStorage in the current browser. My List is also stored locally. Clearing browser site data removes both.