"""Source-selected historical webpage as possible verbatim plaintext crib.

The original pp23-26 mayfly was copied from Figure 4 item 5 in Wings XIV,
www.metafysica.nl/wings/wings_14.html. This test asks whether any *verbatim*
passage from that independently motivated source survives the manuscript's
original printed GP29 word lengths. It fits no ciphertext transformation.
"""
from __future__ import annotations

from collections import defaultdict
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import random
import re
import tempfile

from filelock import FileLock
import requests

ROOT = Path(__file__).resolve().parents[1]
ARTICLE = "https://www.metafysica.nl/wings/wings_14.html"
INPUT = ROOT / "resources/liber-primus/lp2-transcription.txt"
OUT = ROOT / "im-results/lp2-metafysica-wings14-original-wordlength.json"
HEADERS = {"User-Agent": "Mozilla/5.0 (LP2 public original source experiment)"}


class VisibleText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in ("style", "script", "noscript"):
            self.skip += 1
        if tag in ("p", "br", "div", "td", "tr", "h1", "h2", "h3"):
            self.parts.append(" ")

    def handle_endtag(self, tag):
        if tag in ("style", "script", "noscript"):
            self.skip -= 1
        if tag in ("p", "div", "td", "tr", "h1", "h2", "h3"):
            self.parts.append(" ")

    def handle_data(self, data):
        if self.skip == 0:
            self.parts.append(" " + data + " ")


def source_words():
    response = requests.get(ARTICLE, headers=HEADERS, timeout=50)
    response.raise_for_status()
    assert len(response.content) > 5000
    reader = VisibleText()
    reader.feed(response.content.decode("utf8", "replace"))
    tokens = re.findall("[A-Za-z]+", " ".join(reader.parts))
    assert len(tokens) > 1000, "unusable source page text"
    return tokens


def manuscript_words():
    body = INPUT.read_text(encoding="utf8").split("%")
    assert len(body) == 57, "transcript contains 55 unknown and two solved rune pages"
    text = "".join(body[:55])
    text = re.sub(r"[/\s]", "", text)
    words = re.findall(r"[\u16A0-\u16FF]+", text)
    assert len(words) == 2896 and sum(map(len, words)) == 12956
    return words


def gp_length(word, fused):
    s = word.upper().replace("QU", "CW").replace("V", "U").replace("K", "C").replace("Q", "C").replace("Z", "S")
    specials = ("ING", "IO") if fused else ()
    digraphs = ("TH", "NG", "EO", "OE", "AE", "IA", "EA")
    i = n = 0
    while i < len(s):
        token = next((t for t in specials if s.startswith(t, i)), None)
        if token is None:
            token = next((t for t in digraphs if s.startswith(t, i)), None)
        i += len(token) if token else 1
        n += 1
    return n


def extend_all(original, source):
    shingle = 8
    index = defaultdict(list)
    for j in range(len(source) - shingle + 1):
        index[tuple(source[j:j+shingle])].append(j)
    candidates = {}
    best = 0
    for i in range(len(original) - shingle + 1):
        for j in index.get(tuple(original[i:i+shingle]), ()):
            start_i, start_j = i, j
            while start_i > 0 and start_j > 0 and original[start_i - 1] == source[start_j - 1]:
                start_i -= 1
                start_j -= 1
            length = shingle
            while i + length < len(original) and j + length < len(source) and original[i + length] == source[j + length]:
                length += 1
            length += i - start_i
            old = candidates.get((start_i, start_j))
            if old is None or old < length:
                candidates[(start_i, start_j)] = length
            best = max(best, length)
    matches = [{"lp2_word": i, "article_word": j, "length": length}
               for (i, j), length in candidates.items()]
    matches.sort(key=lambda v: (-v["length"], v["lp2_word"], v["article_word"]))
    return best, matches


def run():
    original = [len(w) for w in manuscript_words()]
    words = source_words()
    result = {"source": ARTICLE, "original_words": len(original), "source_words": len(words), "readings": []}
    for fused in (False, True):
        lens = [gp_length(w, fused) for w in words]
        best, matches = extend_all(original, lens)
        for item in matches[:12]:
            j, n = item["article_word"], item["length"]
            item["source_excerpt"] = " ".join(words[j:j+n])[:250]
            item["original_lengths"] = original[item["lp2_word"]:item["lp2_word"]+n]
        # A planted 24-word direct source passage must be located exactly.
        plant_at, source_at = 1200, len(lens)//2
        plant = original[:]
        plant[plant_at:plant_at+24] = lens[source_at:source_at+24]
        assert extend_all(plant, lens)[0] >= 24, "24-word source positive not detected"
        rng = random.Random(3301)
        nulls = []
        for _ in range(64):
            shuffled = original[:]
            rng.shuffle(shuffled)
            nulls.append(extend_all(shuffled, lens)[0])
        reading = {"gp_normalization": "ING/IO fused" if fused else "standard GP digraphs only",
                   "best_exact_words": best, "eight_word_matches": len(matches),
                   "top_matches": matches[:12], "64_shuffled_maxima": nulls,
                   "controls_gte_observed": sum(v >= best for v in nulls),
                   "positive_plant": "at least 24-word exact source passage recovered"}
        result["readings"].append(reading)
        print(json.dumps({"reading": reading["gp_normalization"], "original_best": best,
                          "matches": matches[:5], "null_ge": reading["controls_gte_observed"],
                          "positive": "pass"}, ensure_ascii=True), flush=True)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(OUT) + ".lock"):
        with tempfile.NamedTemporaryFile("w", encoding="utf8", newline="\n", dir=OUT.parent,
                                         prefix=".web-words-", suffix=".tmp", delete=False) as tmp:
            path = Path(tmp.name)
            json.dump(result, tmp, indent=2, ensure_ascii=True)
            tmp.write("\n")
            tmp.flush()
            os.fsync(tmp.fileno())
        os.replace(path, OUT)
    return result


if __name__ == "__main__":
    run()
