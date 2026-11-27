"""Acquire only exact, period-relevant oak source candidates for #3254.

The archive query is exact-URL, with no wildcard, and sample lookup is the
publisher's own public project tree. No geometry or rune fitting is performed
until a genuinely new image is found. Network errors are reported separately
from a successful empty archive query.
"""
import hashlib
import io
import json
from urllib.parse import urlencode, quote
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from PIL import Image

KNOWN = {
    "6fc875c099081908587fed6f1b3ac96bceece97f276e9fdd5cd52ec5ea791a34": "known broad-foot ClipartBest/MonokumaBear",
    "608288991f92b8ab901a9fbb39937f93ebdfeb5fd84edeecfa637d5262ff7b29": "known 2005 Commons original",
}
ASSET = "http://www.clipartbest.com/cliparts/abc/y97/abcy97qTL.jpeg"
GITLAB = "https://resources.oreilly.com/api/v4/projects/1779"
UA = "LiberPrimus-source-research/1.0 (public exact asset acquisition)"
LIMIT = 12 * 1024 * 1024

def fetch(url, limit=LIMIT):
    request = Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    try:
        with urlopen(request, timeout=18) as response:
            data = response.read(limit + 1)
            if len(data) > limit:
                return {"url": url, "error": "size cap"}, None
            return {
                "url": url, "final": response.geturl(),
                "status": response.status, "bytes": len(data),
                "content_type": response.headers.get("Content-Type"),
                "sha256": hashlib.sha256(data).hexdigest(),
            }, data
    except (HTTPError, URLError, TimeoutError, OSError) as error:
        return {"url": url, "error": str(error)}, None

def getjson(url):
    meta, data = fetch(url)
    if data is None:
        return meta, None
    try:
        return meta, json.loads(data)
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        meta["parse_error"] = str(error)
        return meta, None

def inspect_image(url, label, date=None):
    meta, data = fetch(url)
    meta.update(label=label, date=date)
    if data is not None:
        meta["known"] = KNOWN.get(meta["sha256"])
        try:
            with Image.open(io.BytesIO(data)) as image:
                meta.update(format=image.format, size=list(image.size))
                exif = image.getexif()
                meta["exif"] = {str(k): str(exif[k])[:200] for k in (271,272,305,306,315,36867,33432) if k in exif}
                # A small diagnostic thumbnail, not a source reconstruction.
                image = image.convert("L")
                image.thumbnail((64,64))
                meta["thumbnail"] = ["".join(" .:-=+*#%@"[(255-v)*9//255] for v in row) for row in
                    [list(image.getdata())[i*image.width:(i+1)*image.width] for i in range(image.height)]]
        except (OSError, ValueError) as error:
            meta["image_error"] = str(error)
    return meta

def main():
    report = {"publisher": [], "archive": [], "images": []}
    # GitLab project ID from the publisher's public landing page.
    meta, project = getjson(GITLAB)
    report["publisher"].append(meta)
    if isinstance(project, dict) and isinstance(project.get("default_branch"), str):
        ref = project["default_branch"]
        for page in range(1, 9):
            url = GITLAB + "/repository/tree?" + urlencode({"ref":ref,"recursive":"true","per_page":100,"page":page})
            meta, rows = getjson(url)
            report["publisher"].append(meta)
            if not isinstance(rows,list):
                break
            for row in rows:
                path = row.get("path","")
                if row.get("type") == "blob" and path.rsplit("/",1)[-1].lower() == "deadtree.jpg":
                    raw = GITLAB + "/repository/files/" + quote(path,safe="") + "/raw?" + urlencode({"ref":ref})
                    report["images"].append(inspect_image(raw,"publisher chapter 4 practice file (book 2010; exact bytes not yet period-authenticated)"))
            if len(rows)<100:
                break
    if not any(x["label"].startswith("publisher") for x in report["images"]):
        report["images"].append(inspect_image("https://resources.oreilly.com/examples/0636920001140/-/raw/master/DeadTree.jpg","publisher root fallback, filename only"))
    # Wayback index exact asset URL, only relevant pre-2016 captures.
    cdx = "https://web.archive.org/cdx/search/cdx?" + urlencode({
        "url":ASSET, "matchType":"exact", "from":"2005","to":"2015",
        "output":"json","filter":"statuscode:200","collapse":"digest","fl":"timestamp,original,digest,mimetype,statuscode",
        "limit":30})
    meta, rows = getjson(cdx)
    report["archive"].append({**meta,"rows":rows})
    found = set()
    if isinstance(rows,list) and rows and isinstance(rows[0],list):
        for row in rows[1:]:
            if len(row)!=5 or not row[0].isdigit() or row[4]!="200":
                continue
            ts, original, digest, mime, status = row
            if original.split("://",1)[-1].lower() != ASSET.split("://",1)[-1].lower():
                continue
            if digest in found:
                continue
            found.add(digest)
            report["images"].append(inspect_image("https://web.archive.org/web/"+ts+"id_/"+original,"archived exact stock endpoint",ts))
    # Availability API is an independent access path for the same exact URL.
    for target in ("20140430","20151231"):
        url = "https://archive.org/wayback/available?" + urlencode({"url":ASSET,"timestamp":target})
        meta, obj = getjson(url)
        report["archive"].append({**meta,"availability":obj})
        if isinstance(obj,dict):
            closest = obj.get("archived_snapshots",{}).get("closest",{})
            ts = closest.get("timestamp","")
            if closest.get("available") and ts.isdigit() and ts[:4] <= "2015" and not any(x.get("date")==ts for x in report["images"]):
                report["images"].append(inspect_image("https://web.archive.org/web/"+ts+"id_/"+ASSET,"archived exact stock endpoint",ts))
    for image in report["images"]:
        thumb=image.pop("thumbnail",None)
        print("IMAGE", json.dumps(image,ensure_ascii=True), flush=True)
        if thumb:
            print("\n".join(thumb),flush=True)
    print("ACQUISITION",json.dumps({"publisher":report["publisher"],"archive":report["archive"]},ensure_ascii=True),flush=True)

if __name__ == "__main__":
    main()
