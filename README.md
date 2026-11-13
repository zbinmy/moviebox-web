# MovieBox · Free Cinema

A responsive, installable full-length film website. The catalogue is sourced live from the Internet Archive Advanced Search API and restricted to records carrying public-domain or selected Creative Commons licence URLs. The player reads the item's metadata and selects an MP4, WebM or OGV file for in-browser playback.

## What works
- Live Internet Archive catalogue search, with title search and pagination
- Full-length in-page HTML5 video playback where a browser-compatible file exists
- Rights label displayed with a link to the licence
- Link to the original Internet Archive item
- Responsive mobile/desktop layout and PWA support
- No TMDB API key required

## Rights and availability
The app filters for records whose uploader-supplied `licenseurl` indicates public domain, CC0, CC BY or CC BY-SA. Internet Archive states that rights vary by film and that uploader licence claims are not guaranteed to be accurate. Check the source record and licence before reuse or redistribution. Some records have no compatible video derivative or may fail browser playback.

Sources:
- Internet Archive Advanced Search API: https://archive.org/advancedsearch.php
- Internet Archive Metadata API: https://archive.org/metadata/
- Internet Archive guidance on movie rights and streaming: https://archivesupport.zendesk.com/hc/en-us/articles/360017808151-Movies-and-Videos-A-Basic-Guide

## Deployment
GitHub Actions deploys the static site to GitHub Pages on pushes to `main`.
