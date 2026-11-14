# OnionVuln Studio Website

Responsive static portfolio/product website for the `ovulndeveloper` GitHub Pages site.

## Included
- Responsive desktop, tablet and mobile layout
- CSS-built visual identity; no AI-generated artwork
- PixVelo product section and screenshot slots
- PixVelo vs Tinix comparison with claims explicitly attributed to PixVelo's README
- Live public GitHub profile/repository cards via GitHub's unauthenticated public API
- Browser-local SHA-256 file hashing
- VirusTotal hash-report lookup link (does not upload a file or claim to perform a fresh scan)
- No build step, backend, database, or API keys required

## Add your own logo and screenshots
Put your original product assets in `assets/`:
- `logo.png` (optional; current header uses a CSS/text monogram)
- `pixvelo-main.png`
- `pixvelo-preview.png`
- `pixvelo-settings.png`
- `pixvelo-batch.png`

The site displays designed placeholders when screenshots are absent. Replace them with real screenshots captured from PixVelo. No generated images are included.

## Deploy using GitHub Pages
1. Create or open the repository intended for the website (for example `ovulndeveloper.github.io`).
2. Upload the **contents** of this folder to the repository root. Do not upload only the ZIP file.
3. Open **Settings → Pages**.
4. Set the source to **GitHub Actions**.
5. Push to the `main` branch. The included workflow publishes the site.
6. Open the Pages URL shown in Settings → Pages.

Alternatively, choose **Deploy from a branch**, select `main` and `/ (root)`. If you use that method, the included workflow is unnecessary.

## Test locally
Run a local web server from this folder:
```bash
python -m http.server 8000
```
Open `http://localhost:8000`. Web Crypto requires HTTPS or localhost; it will not work from a `file://` URL.

## VirusTotal and file privacy
The selected file is read locally in the browser to calculate SHA-256 using the Web Crypto API. The page opens a VirusTotal search URL for that digest. This only checks for an existing report. Unknown hashes may not have a report; a hash lookup is not a new malware scan. This page does not upload the file. Do not put a VirusTotal API key in public JavaScript; a real API integration needs a protected server-side component and must respect VirusTotal's terms and file privacy.

## Tinix comparison
The comparison section is an editorial summary of claims and criticisms contained in the PixVelo repository README. It is not an independent technical, security, privacy, or legal audit of Tinix. The wording deliberately attributes allegations rather than stating them as verified facts. Review the current source README and Tinix's own documentation before publishing strong claims.

## Customize
- Change profile links and account name in `index.html` / `app.js`.
- Replace placeholder screenshots in `assets/`.
- Change colors, spacing and typography in `styles.css`.
- Update product facts when PixVelo releases change.
