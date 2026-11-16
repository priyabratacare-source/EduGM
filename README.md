# EduGM UniTools — GitHub-ready project

Repository target: `priyabratacare-source/EduGM`, branch `main`.

## Structure
- `www/index.html` Home
- `www/tools.html` local tools
- `www/about.html` separate About page
- `www/contact.html` separate Firebase Contact page
- `www/settings.html` settings
- `www/css/style.css` shared styling
- `www/js/app.js` app initialization
- `www/js/tools.js` local tools
- `www/js/contact.js` Firestore contact submission
- `www/js/firebase-config.js` Firebase project config
- `.github/workflows/android.yml` builds APK artifact
- `.github/workflows/pages.yml` deploys `www` to GitHub Pages

## Add to your existing GitHub repository
Upload/replace these files in the existing repository. Do not delete any other required project files until you compare them. Commit to `main`.

## GitHub Pages
In repository Settings → Pages → Build and deployment, select **GitHub Actions**. The `pages.yml` workflow publishes the `www` directory.

## Build APK
Open Actions → **Build EduGM UniTools APK** → Run workflow. On a successful run, open the workflow run and download artifact `EduGM-UniTools-APK`.

## Firebase
The contact page uses the existing Firebase project and stores documents in Firestore collection `contactMessages`. It loads Firebase SDK only when a user submits the form, so local tools do not need Firebase. Firebase submission needs internet. Keep Firestore rules restrictive: allow validated `create` only; deny public read/update/delete.

## Offline/local behaviour
Attendance, percentage, SGPA, CGPA, image compression/resizing/conversion/cropping, student image sizing, and file selection are local. The app shell is cached by the service worker after the first online visit. The PDF viewer uses the device/browser's built-in PDF viewer; Text-to-PDF uses the device print dialog. Camera input uses the native file/camera chooser on Android WebView. For guaranteed native camera preview and advanced Android permissions, add and configure a Capacitor Camera plugin in a later native integration.

## Important
This is a working starter set of core tools, not a claim that every tool in the old catalogue is implemented. Do not display PDF merge/split, Office conversion, QR, etc. as available until implemented and tested offline.
