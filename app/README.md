# Loopa als echte app (Android en iPhone)

Deze map maakt van de web-app een echte app met [Capacitor](https://capacitorjs.com).

- `copy-web.js` kopieert de web-app uit de hoofdmap naar `www/` en voegt `native.js` toe.
- `native.js` regelt in de app: meldingen die ook komen als de app dicht is, back-up delen in plaats van downloaden, scherm aan houden tijdens GPS-sporten.
- Android: elke push naar `main` bouwt automatisch een nieuwe APK (workflow "Android-app bouwen").
  Download: https://github.com/thomasderks462-arch/loopa/releases/tag/app-latest
- iPhone: het Xcode-project staat in `ios/`. Bouwen en in de App Store zetten kan alleen met een Apple Developer-account (99 dollar per jaar) en Xcode op een Mac (of een cloud-Mac).

Zelf bouwen:

```
cd app
npm install
node copy-web.js && npx cap sync
npx cap open android   # of: npx cap open ios
```
