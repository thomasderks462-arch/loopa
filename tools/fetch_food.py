# Haalt per Wikipedia-artikel de hoofdfoto op en zet hem in food/ (alleen vrij te gebruiken licenties).
import json, os, re, time, urllib.request, urllib.parse
UA = {"User-Agent": "LoopaFoodPhotos/1.0 (https://github.com/thomasderks462-arch/loopa)"}
def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r: return r.read()
titles = json.load(open("tools/foodtitles.json"))
os.makedirs("food", exist_ok=True)
out = {}
for t in titles:
    slug = re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")
    try:
        q = "https://en.wikipedia.org/w/api.php?" + urllib.parse.urlencode({"action":"query","prop":"pageimages","piprop":"original|name","titles":t,"redirects":1,"format":"json"})
        pg = list(json.loads(get(q))["query"]["pages"].values())[0]
        name = pg.get("pageimage")
        if not name: print("geen foto", t); continue
        q2 = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({"action":"query","titles":"File:"+name,"prop":"imageinfo","iiprop":"url|extmetadata","iiurlwidth":320,"format":"json"})
        p2 = list(json.loads(get(q2))["query"]["pages"].values())[0]
        ii = p2["imageinfo"][0]; md = ii.get("extmetadata", {})
        lic = md.get("LicenseShortName", {}).get("value", "")
        if not re.search(r"CC|Public domain|PD|GFDL", lic, re.I): print("licentie?", t, lic); continue
        artist = re.sub(r"<[^>]+>", "", md.get("Artist", {}).get("value", ""))[:80]
        data = get(ii["thumburl"])
        ext = ".png" if ii["thumburl"].lower().endswith(".png") else ".jpg"
        open("food/" + slug + ext, "wb").write(data)
        out[t] = {"f": slug + ext, "lic": lic, "by": artist, "src": ii["descriptionurl"]}
        print("ok", t, lic)
    except Exception as e:
        print("fout", t, e)
    time.sleep(0.3)
json.dump(out, open("food/index.json", "w"), ensure_ascii=False, indent=0)
