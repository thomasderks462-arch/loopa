# Loopa

Loopa is een persoonlijke app om je gewoontes, eten, sport, gym en slaap bij te houden. Het is een web-app die je op het beginscherm van je telefoon zet.

## Wat erin zit

- **Vandaag**: je gewoontes per ochtend, middag en avond, je reeks en een overzicht van je dag.
- **Eten & drinken**: calorieën en eiwit, koolhydraten en vet. Je voegt eten toe door een barcode of QR-code live te scannen (de voedingswaarden komen uit [Open Food Facts](https://world.openfoodfacts.org)), door een foto te maken (herkend door Claude) of door het zelf in te vullen.
- **Sport**: een gym-logger met ruim 130 oefeningen, sets, kg, herhalingen, rusttimer en schema's, en daarnaast andere trainingen en stappen.
- **Slaap**: bedtijd, opstaan en hoe uitgerust je bent, met een grafiek van 14 dagen.
- **Overzicht**: gemiddelden van de week, je niveau en een raster van je gewoontes.

## Je gegevens

Alles wordt opgeslagen in de browser op je eigen telefoon. Er gaat niets naar een server, behalve:
- de barcode die je scant (naar Open Food Facts, om het product op te zoeken);
- een foto die je laat herkennen (naar Anthropic, met je eigen API-sleutel).

Maak af en toe een back-up via **Gewoontes & doelen → Back-up downloaden**.

## Foto's herkennen

Maak een API-sleutel aan op [console.anthropic.com](https://console.anthropic.com) en vul hem in onder **Gewoontes & doelen**. De sleutel blijft op je telefoon. Per foto betaal je een klein bedrag aan Anthropic.

## Bestanden

- `index.html`: de hele app
- `zxing.min.js`: barcodelezer ([ZXing](https://github.com/zxing-js/library), Apache-2.0)
- `sw.js` en `manifest.webmanifest`: zorgen dat de app installeerbaar is en offline opent
- `icons/`: het app-icoon
