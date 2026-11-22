"""Source-selected running-key inverse on exact original LP2 p23-26.

The mayflies on these pages share an image with a public historical insect
article (Wings XIV, Figure 4 item 5). A human might follow the image to
running textual key material. This bounds that interpretation: consume article
visible English as GP29 runes, and test every literal source offset under both
GP29 additive signs, with/without the known solved-page F interrupter.

Selecting the article through artwork does NOT authenticate a text-key cipher;
a high IoC alone is not plaintext. This complete original-input test uses
predeclared Vigenere and F conventions, plus a genuine-source inverse plant.
"""
from __future__ import annotations

from html.parser import HTMLParser
import hashlib
import json
import os
from pathlib import Path
import re
import tempfile

from filelock import FileLock
import numpy as np
import requests

ROOT = Path(__file__).resolve().parents[1]
URL = "https://www.metafysica.nl/wings/wings_14.html"
OUT = ROOT / "im-results/lp2-metafysica-wings14-running-key-original.json"
CORPUS = ROOT / "resources/liber-primus/lp2-corpus.json"


class VisibleText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self.depth = 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "noscript"):
            self.depth += 1

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript"):
            self.depth -= 1

    def handle_data(self, data):
        if self.depth == 0:
            self.parts.append(data + " ")


def load_text():
    response = requests.get(URL, headers={"User-Agent": "Mozilla/5.0 (LP2 research)"}, timeout=50)
    response.raise_for_status()
    assert len(response.content) > 5000
    parser = VisibleText()
    parser.feed(response.content.decode("utf8", "replace"))
    return " ".join(parser.parts), hashlib.sha256(response.content).hexdigest()


def gp_encode(s, mapping):
    s = s.upper().replace("QU", "CW").replace("V", "U").replace("K", "C").replace("Q", "C").replace("Z", "S")
    s = re.sub("[^A-Z]", "", s)
    choices = sorted(mapping, key=len, reverse=True)
    out = []
    i = 0
    while i < len(s):
        token = next((item for item in choices if s.startswith(item, i)), None)
        if token is None:
            raise ValueError("unexpected character in normalized source")
        out.append(mapping[token])
        i += len(token)
    return np.asarray(out, dtype=np.int16)


def collision(seq):
    counts = np.bincount(np.asarray(seq, dtype=np.int16), minlength=29)
    n = len(seq)
    return float(np.dot(counts, counts-1) / (n*(n-1)))


def all_offsets(cipher, key):
    """Evaluate every source location, 320 separate key positions per batch."""
    rows = np.lib.stride_tricks.sliding_window_view(key, len(cipher))
    pool = []
    for sign in (1, -1):
        best = []
        scores = []
        for start in range(0, len(rows), 320):
            sample = rows[start:start+320]
            decoded = (cipher[None, :] + sign * sample) % 29
            t = decoded.shape[0]
            tags = decoded + 29*np.arange(t, dtype=np.int32)[:, None]
            freqs = np.bincount(tags.reshape(-1), minlength=29*t).reshape(t, 29)
            counts = np.sum(freqs * (freqs-1), axis=1)
            winners = np.argsort(counts)[-5:]
            best.extend((int(counts[idx]), start+int(idx)) for idx in winners)
            scores.extend(int(x) for x in counts)
        best = sorted(best, reverse=True)[:6]
        n = len(cipher)
        for pair_count, offset in best:
            output = ((cipher + sign * key[offset:offset+n]) % 29).astype(int).tolist()
            pool.append({"sign": sign, "source_offset": offset, "ioc": pair_count/(n*(n-1)),
                         "first_120_indices": output[:120]})
        # Independent diagnostic of searched-score distribution, not a p value.
        pool.append({"sign": sign, "tested_offsets": len(rows), "median_ioc":
                     float(np.median(scores)/(n*(n-1))), "max_ioc":
                     float(max(scores)/(n*(n-1)))})
    return pool


def run():
    data = json.loads(CORPUS.read_text(encoding="utf8"))
    mapping = {v: i for i, v in enumerate(data["translit"])}
    pages = data["pages"]
    cipher = np.asarray([x for page in pages[23:27] for x in page["indices"]], dtype=np.int16)
    assert len(cipher) == 1021 and all(pages[i]["status"] == "unsolved" for i in range(23,27))
    article, digest = load_text()
    key = gp_encode(article, mapping)
    assert len(key) > 1500
    caption_match = re.search(r"ephemerella\s+ignita", article, flags=re.IGNORECASE)
    assert caption_match, "the original source page no longer contains the Figure 4 mayfly label"
    caption_position = caption_match.start()
    caption_rune_offset = len(gp_encode(article[:caption_position], mapping))
    probes = []
    for transparent in (False, True):
        eligible = cipher != 0 if transparent else np.ones(len(cipher), dtype=bool)
        observed = cipher[eligible]
        results = all_offsets(observed, key)
        for rec in results:
            if "first_120_indices" in rec:
                rec["first_120_translit"] = "".join(data["translit"][t] for t in rec.pop("first_120_indices"))
        for sign in (1, -1):
            start = caption_rune_offset
            if start+len(observed) <= len(key):
                output = (observed + sign*key[start:start+len(observed)]) % 29
                results.append({"sign": sign, "source_offset": start,
                                "selected_by": "first EPHEMERELLA after Figure 4",
                                "ioc": collision(output),
                                "first_120_translit": "".join(data["translit"][int(t)] for t in output[:120])})
        probes.append({"f_interrupter": transparent, "active_runes": len(observed),
                       "source_at_start_ioc": [
                           collision((observed + sign*key[:len(observed)])%29) for sign in (1,-1)
                       ], "searched_offsets": len(key)-len(observed)+1, "directions": results})
    # Original known-source positive: direct additive plant exactly decodes
    # using this exact real article key and a published 95-rune p57 plaintext.
    clean = np.asarray(pages[57]["indices"], dtype=np.int16)
    assert len(clean) == 95
    planted = (clean + key[caption_rune_offset:caption_rune_offset+95]) % 29
    assert np.array_equal((planted-key[caption_rune_offset:caption_rune_offset+95])%29, clean)
    report = {"article": URL, "article_sha256": digest, "source_gp29_runes": len(key),
              "figure4_ephemerella_gp_offset": caption_rune_offset, "original_pages": [23,24,25,26],
              "original_runes": len(cipher), "original_ioc": collision(cipher),
              "plant_recovered": "95/95 GP29 from original clear p57",
              "probes": probes,
              "scope": "literal article running text, every source offset, GP29 +/- and optional F bypass"}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(OUT) + ".lock"):
        with tempfile.NamedTemporaryFile("w", encoding="utf8", newline="\n",
                                         prefix=".mayfly-pad-", suffix=".tmp",
                                         dir=OUT.parent, delete=False) as f:
            path = Path(f.name)
            json.dump(report, f, indent=2)
            f.write("\n")
            f.flush()
            os.fsync(f.fileno())
        os.replace(path, OUT)
    print("SUMMARY", json.dumps({"original_ioc": report["original_ioc"], "source_runes": len(key),
                                 "figure4_source_offset": caption_rune_offset,
                                 "probes": [
                                   {"transparent": p["f_interrupter"], "active": p["active_runes"],
                                    "max": sorted([v for v in p["directions"] if "source_offset" in v],
                                                  key=lambda d:d["ioc"],reverse=True)[:3],
                                    "source0":p["source_at_start_ioc"]} for p in probes
                                 ]}), flush=True)


if __name__ == "__main__":
    run()
