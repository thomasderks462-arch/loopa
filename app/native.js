/* Loopa native brug: alleen actief in de Android/iPhone-app (Capacitor). */
(function () {
  var C = window.Capacitor;
  if (!C || !C.isNativePlatform || !C.isNativePlatform()) return;
  var P = function (n) { return (C.Plugins && C.Plugins[n]) || C.registerPlugin(n); };
  var LN = P("LocalNotifications"), FS = P("Filesystem"), SH = P("Share"), KA = P("KeepAwake");
  document.documentElement.classList.add("native-app");

  /* Back-up en agenda-bestand: downloaden werkt niet in een app, dus delen we het bestand. */
  var origClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    var name = this.getAttribute("download"), href = this.href || "";
    if (name && /^(blob|data):/.test(href)) {
      fetch(href).then(function (r) { return r.text(); }).then(function (txt) {
        return FS.writeFile({ path: name, data: txt, directory: "CACHE", encoding: "utf8" });
      }).then(function (res) {
        return SH.share({ title: name, dialogTitle: "Bewaar of deel " + name, files: [res.uri] });
      }).catch(function (e) { console.warn("delen mislukt", e); });
      return;
    }
    return origClick.call(this);
  };

  /* Delen van tekst (weekrapport, boodschappenlijst). */
  if (!navigator.share) {
    navigator.share = function (o) {
      return SH.share({ title: o.title, text: o.text, url: o.url, dialogTitle: "Delen" }).catch(function (e) {
        var err = new Error(String(e && e.message || e)); if (/cancel/i.test(err.message)) err.name = "AbortError"; throw err;
      });
    };
  }

  /* Scherm aan houden tijdens GPS-sporten. */
  try {
    Object.defineProperty(navigator, "wakeLock", { configurable: true, value: {
      request: function () {
        return KA.keepAwake().then(function () {
          return { released: false, release: function () { this.released = true; return KA.allowSleep(); }, addEventListener: function () {} };
        });
      }
    } });
  } catch (e) {}

  /* Stappen uit Health Connect (Android) of Apple Gezondheid (iPhone). */
  var HE = P("Health"), plat = C.getPlatform ? C.getPlatform() : "android";
  var dkey = function (d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  window.LoopaHealth = {
    platform: plat,
    connect: function () {
      return HE.isAvailable().then(function (a) {
        if (!a.available) { if (plat === "android") HE.openHealthConnectSettings().catch(function () {}); return false; }
        return HE.requestAuthorization({ read: ["steps"] }).then(function (r) {
          return !(r && r.readDenied && r.readDenied.indexOf("steps") >= 0);
        });
      });
    },
    steps: function (days) {
      var start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - (days - 1));
      return HE.queryAggregated({ dataType: "steps", startDate: start.toISOString(), endDate: new Date().toISOString(), bucket: "day", aggregation: "sum" }).then(function (r) {
        var out = {}; (r.samples || []).forEach(function (s) { out[dkey(new Date(s.startDate))] = Math.round(s.value || 0); }); return out;
      });
    },
    settings: function () { return HE.openHealthConnectSettings().catch(function () {}); }
  };

  /* Meldingen: echte herinneringen die ook komen als de app dicht is. */
  var perm = "default";
  function Noti() {} /* de app plant zelf vooruit, dus losse meldingen zijn niet nodig */
  Noti.requestPermission = function () {
    return LN.requestPermissions().then(function (r) { perm = r.display === "granted" ? "granted" : r.display === "denied" ? "denied" : "default"; lastSig = null; schedule(); return perm; });
  };
  Object.defineProperty(Noti, "permission", { get: function () { return perm; } });
  window.Notification = Noti;
  LN.checkPermissions().then(function (r) { perm = r.display === "granted" ? "granted" : r.display === "denied" ? "denied" : "default"; schedule(); }).catch(function () {});

  var KEY = "dagritme-v1", t = null, lastSig = null;
  function hm(s, def) { var m = /^(\d{1,2}):(\d{2})$/.exec(s || def); return { hour: +m[1], minute: +m[2] }; }
  function schedule() {
    if (perm !== "granted") return;
    var st = {}; try { st = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) {}
    var r = (st.profile && st.profile.rem) || {}, list = [];
    if (r.habits && (st.habits || []).length) { var h = hm(r.habitsAt, "20:30");
      list.push({ id: 101, title: "Gewoontes afvinken", body: "Kijk even welke gewoontes je vandaag nog kunt doen.", schedule: { on: h, repeats: true, allowWhileIdle: true } }); }
    if (r.bed) { var b = hm(r.bedAt, "23:00"), m = (b.hour * 60 + b.minute - 30 + 1440) % 1440;
      list.push({ id: 102, title: "Bijna bedtijd", body: "Over een half uur is het bedtijd (" + (r.bedAt || "23:00") + "). Leg je telefoon zo weg.", schedule: { on: { hour: Math.floor(m / 60), minute: m % 60 }, repeats: true, allowWhileIdle: true } }); }
    if (r.water) [10, 12, 14, 16, 18, 20].forEach(function (hr, i) {
      list.push({ id: 110 + i, title: "Tijd voor water", body: "Drink een glas water en tik het aan in Loopa.", schedule: { on: { hour: hr, minute: 0 }, repeats: true } }); });
    var sig = JSON.stringify(list.map(function (n) { return [n.id, n.schedule.on]; }));
    if (sig === lastSig) return; lastSig = sig;
    var ids = [101, 102, 110, 111, 112, 113, 114, 115].map(function (id) { return { id: id }; });
    LN.cancel({ notifications: ids }).catch(function () {}).then(function () { if (list.length) return LN.schedule({ notifications: list }); }).catch(function (e) { console.warn("plannen mislukt", e); });
  }
  var origSet = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) {
    origSet.call(this, k, v);
    if (this === window.localStorage && k === KEY) { clearTimeout(t); t = setTimeout(schedule, 1500); }
  };
})();
