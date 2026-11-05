// Kopieert de web-app (repo-root) naar app/www voor Capacitor.
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, ".."), www = path.join(__dirname, "www");
fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(www, { recursive: true });
for (const f of ["index.html", "sw.js", "manifest.webmanifest", "zxing.min.js", "icons", "ex", "food", "leaflet"]) {
  const src = path.join(root, f);
  if (fs.existsSync(src)) fs.cpSync(src, path.join(www, f), { recursive: true });
}
// Aanpassingen voor de app-versie
const ip = path.join(www, "index.html");
let h = fs.readFileSync(ip, "utf8");
const swap = (a, b) => { if (!h.includes(a)) throw new Error("niet gevonden: " + a.slice(0, 60)); h = h.split(a).join(b); };
fs.copyFileSync(path.join(__dirname, "native.js"), path.join(www, "native.js"));
swap('location.protocol==="https:")navigator.serviceWorker.register', 'location.protocol==="https:"&&!window.Capacitor)navigator.serviceWorker.register');
swap("Je krijgt een melding als Loopa open staat en je ziet ze bovenaan Vandaag. Wil je ook een seintje als de app dicht is, zet ze dan in je agenda.",
     "Je krijgt een melding op je telefoon, ook als Loopa dicht is, en je ziet ze bovenaan Vandaag.");
h = h.replace(/<script/, '<script src="native.js"></script><script');
fs.writeFileSync(ip, h);
console.log("web-bestanden gekopieerd naar app/www");
