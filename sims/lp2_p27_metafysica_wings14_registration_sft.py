"""Original-input SFT: test whether LP2 p27's isolated wing shares an illustration
source with the already attributed LP2 p24–26 mayfly (metafysica Wings XIV).
An exact match can select an independently captioned source; it is not plaintext.
"""
from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, as_completed
from html.parser import HTMLParser
import hashlib
import json
import os
from pathlib import Path
import tempfile
from urllib.parse import urljoin, urlparse, urldefrag

import cv2
from filelock import FileLock
import numpy as np
import requests

ROOT = Path(__file__).resolve().parents[1]
ARTICLE = "https://www.metafysica.nl/wings/wings_14.html"
TARGET = ROOT / "resources/liber-primus/44.jpg"
REPORT = ROOT / "im-results/lp2-p27-metafysica-wings14-image-registration.json"
SHA = "c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e"
HEADERS = {"User-Agent": "Mozilla/5.0 (LP2 original-source image comparison)"}


class Pictures(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        key = "src" if tag == "img" else "href" if tag == "a" else None
        if key and data.get(key):
            self.urls.append((data[key], data.get("alt", "")))


def get(url, limit=10_000_000):
    response = requests.get(url, headers=HEADERS, timeout=40)
    response.raise_for_status()
    if not 100 < len(response.content) <= limit:
        raise ValueError("unexpected source size " + str(len(response.content)))
    return response.content


def website():
    document = get(ARTICLE, 3_000_000)
    parsed = Pictures()
    parsed.feed(document.decode("utf8", "replace"))
    candidates = list(parsed.urls)
    for name in ("thieme_90.jpg", "rohd1949_125.jpg", "rohd1949_125B.jpg"):
        candidates.append((name, "source-selected comparison"))
    unique = {}
    for href, label in candidates:
        url = urldefrag(urljoin(ARTICLE, href))[0]
        p = urlparse(url)
        if p.hostname not in ("www.metafysica.nl", "metafysica.nl"):
            continue
        if not p.path.startswith("/wings/") or not p.path.lower().endswith((".jpg", ".jpeg", ".gif", ".png")):
            continue
        unique[url] = unique.get(url, label[:140])
    assert len(unique) > 5, "source page did not expose figure image URLs"
    return hashlib.sha256(document).hexdigest(), [{"url": k, "label": v} for k, v in unique.items()]


def match(source, target):
    sift = cv2.SIFT_create(nfeatures=6000, contrastThreshold=0.004, edgeThreshold=22)
    kp_t, d_t = sift.detectAndCompute(target, None)
    kp_s, d_s = sift.detectAndCompute(source, None)
    if d_t is None or d_s is None or len(kp_t) < 4 or len(kp_s) < 4:
        return {"inliers": 0, "xspan": 0, "yspan": 0, "valid": False}
    bf = cv2.BFMatcher(cv2.NORM_L2)
    pairs = bf.knnMatch(d_t, d_s, k=2)
    back = {m.queryIdx: m.trainIdx for m in bf.match(d_s, d_t)}
    good = [a for a, b in pairs if a.distance < 0.75 * b.distance and back.get(a.trainIdx) == a.queryIdx]
    if len(good) < 4:
        return {"inliers": 0, "xspan": 0, "yspan": 0, "valid": False}
    points = np.float32([kp_t[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    others = np.float32([kp_s[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    model, mask = cv2.estimateAffinePartial2D(points, others, method=cv2.RANSAC,
                                               ransacReprojThreshold=5, maxIters=3000, confidence=0.995)
    if model is None or mask is None:
        return {"inliers": 0, "xspan": 0, "yspan": 0, "valid": False}
    pts = points.reshape(-1, 2)[mask.ravel().astype(bool)]
    scale = float(np.hypot(model[0, 0], model[0, 1]))
    xspan = float(np.ptp(pts[:, 0]) / target.shape[1])
    yspan = float(np.ptp(pts[:, 1]) / target.shape[0])
    valid = len(pts) >= 30 and 0.08 <= scale <= 4 and xspan > 0.5 and yspan > 0.15
    return {"inliers": len(pts), "xspan": round(xspan, 5), "yspan": round(yspan, 5),
            "scale": round(scale, 5), "valid": valid}


def regions(src):
    result = [("full-image", src)]
    ink = cv2.morphologyEx((src < 180).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((2, 2), np.uint8))
    n, labels, stats, _ = cv2.connectedComponentsWithStats(ink, connectivity=8)
    selected = []
    for idx in range(1, n):
        x, y, w, h, area = (int(v) for v in stats[idx])
        if w < 110 or h < 30 or area < 150 or not (1.25 < w / h < 12):
            continue
        mask = np.where(labels[y:y+h, x:x+w] == idx, 0, 255).astype(np.uint8)
        selected.append((w * h, "isolated-" + str(idx), cv2.copyMakeBorder(mask, 15, 15, 15, 15,
                                                                           cv2.BORDER_CONSTANT, value=255)))
    selected.sort(key=lambda x: x[0], reverse=True)
    result.extend((label, img) for _, label, img in selected[:4])
    return result


def one(item, target):
    out = dict(item)
    try:
        raw = get(item["url"], 8_000_000)
        src = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_GRAYSCALE)
        if src is None:
            raise ValueError("not an image")
        out.update({"sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw),
                    "dimensions": [src.shape[1], src.shape[0]]})
        tests = []
        for orient, image in (("original", src), ("mirror", cv2.flip(src, 1))):
            for label, frame in regions(image):
                m = max(frame.shape)
                if m > 2400:
                    k = 2400 / m
                    frame = cv2.resize(frame, (round(frame.shape[1]*k), round(frame.shape[0]*k)))
                if m < 650:
                    k = 1000 / m
                    frame = cv2.resize(frame, (round(frame.shape[1]*k), round(frame.shape[0]*k)))
                tests.append({"region": orient + ":" + label, **match(frame, target)})
        out["frames"] = len(tests)
        out["best"] = max(tests, key=lambda t: (t["valid"], t["inliers"], t["xspan"]))
    except Exception as ex:
        out["error"] = type(ex).__name__ + ": " + str(ex)[:200]
    return out


def main():
    raw = TARGET.read_bytes()
    assert hashlib.sha256(raw).hexdigest() == SHA
    image = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_GRAYSCALE)
    assert image is not None and image.shape == (3600, 2400)
    wing = image[516:855, 643:1787].copy()
    rotation = cv2.warpAffine(wing, cv2.getRotationMatrix2D((572, 169), 4, 0.87),
                             (1300, 430), borderValue=255)
    smaller = cv2.resize(cv2.flip(wing, 1), (570, 170), interpolation=cv2.INTER_AREA)
    scaled = cv2.resize(smaller, (1140, 340), interpolation=cv2.INTER_CUBIC)
    wrong = cv2.imdecode(np.frombuffer((ROOT / "resources/liber-primus/70.jpg").read_bytes(),
                                      np.uint8), cv2.IMREAD_GRAYSCALE)[2700:3299, 600:1800]
    controls = {"rotated_original": match(rotation, wing),
                "downscaled_mirrored_original": match(cv2.flip(scaled, 1), wing),
                "independent_wrong_art": match(wrong, wing)}
    assert controls["rotated_original"]["valid"]
    assert controls["downscaled_mirrored_original"]["valid"]
    assert not controls["independent_wrong_art"]["valid"]
    print("ORIGINAL CONTROLS", json.dumps(controls), flush=True)
    page_hash, items = website()
    print("SOURCE ARTICLE IMAGE COUNT", len(items), flush=True)
    tested = []
    with ThreadPoolExecutor(max_workers=3) as executor:
        for done in as_completed([executor.submit(one, item, wing) for item in items]):
            result = done.result()
            tested.append(result)
            print("IMAGE", result["url"], "BEST", result.get("best", {}).get("inliers", 0),
                  "VALID", result.get("best", {}).get("valid", False), result.get("error", ""), flush=True)
    tested.sort(key=lambda x: (x.get("best", {}).get("valid", False),
                               x.get("best", {}).get("inliers", 0)), reverse=True)
    report = {"source_article": ARTICLE, "source_article_sha256": page_hash,
              "question": "Does original p27 wing match any picture on p24 mayfly source's page?",
              "p27_sha256": SHA, "p27_crop": [643, 516, 1787, 855],
              "controls": controls, "images_exposed": len(items),
              "images_retrieved": sum("bytes" in x for x in tested),
              "valid_matches": sum(x.get("best", {}).get("valid", False) for x in tested),
              "results": tested, "scope": "original images linked in Wings Part XIV, with affine and mirrored comparisons"}
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(REPORT) + ".lock"):
        with tempfile.NamedTemporaryFile("w", encoding="utf8", newline="\n", dir=REPORT.parent,
                                         prefix=".metafysica-", suffix=".tmp", delete=False) as f:
            temp = Path(f.name)
            json.dump(report, f, indent=2, ensure_ascii=True)
            f.write("\n")
            f.flush()
            os.fsync(f.fileno())
        os.replace(temp, REPORT)
    print("RESULT", json.dumps({"images_exposed": len(items),
                               "images_retrieved": report["images_retrieved"],
                               "valid_matches": report["valid_matches"], "top": tested[:8]}), flush=True)


if __name__ == "__main__":
    main()
