"""Original LP2 printed-word-length source-literal gate.

Read-only, single-file Windows Python 3.12 SFT. Assesses whether exact
consecutive GP29 word lengths identify a plain quotation in the NLTK
public-domain Gutenberg selections. The search does not assume any
cipher mechanism and reports finite source-specific matches only.
"""
from __future__ import annotations

from collections import defaultdict
from hashlib import sha256
from io import BytesIO
from pathlib import Path
import json
import re
import urllib.request
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "resources" / "liber-primus"
URL = "https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/packages/corpora/gutenberg.zip"
ZIP_SHA256 = "2d3c3ab548c653944310f37f536443ec85d0a0ad855fcae217a0c9efdce2d611"
ANCHOR = 12

corpus = json.loads((DATA / "lp2-corpus.json").read_text(encoding="utf-8"))
raw = (DATA / "lp2-transcription.txt").read_text(encoding="utf-8")
runes = set(corpus["runes"])
words = [
    "".join(ch for ch in token if ch in runes)
    for token in re.split(r"[-.]", re.sub(r"[/\n%&$§]", "", raw))
]
words = [word for word in words if word][:2896]
assert len(words) == 2896
source = "".join(words)
original = "".join(
    corpus["runes"][index]
    for page in corpus["pages"] if page["page"] <= 55
    for index in page["indices"]
)
assert len(source) == 12956 and source == original
lengths = [len(w) for w in words]
assert sum(lengths) == 12956

# One explicitly published GP29 transliteration convention, not freely
# optimized per candidate literary text. The 2014 solved-page forms
# use TH and NG as runes; the existing source-native TextBlob grammar
# also maps ING to NG and QU to CW.
tokens = sorted(corpus["translit"], key=len, reverse=True)
def gp_length(word: str) -> int:
    """Return GP rune count, or -1 when the spelling cannot be mapped."""
    s = word.upper().replace("QU", "CW").replace("V", "U")
    s = s.replace("K", "C").replace("Z", "S")
    total = 0
    i = 0
    while i < len(s):
        if s.startswith("ING", i):
            total += 1
            i += 3
            continue
        part = next((part for part in tokens if s.startswith(part, i)), None)
        if part is None:
            return -1
        i += len(part)
        total += 1
    return total

assert [gp_length(x) for x in ("THE", "THINGS", "END", "QUICK", "CICADA")] == [2, 3, 3, 4, 6]

keys: dict[tuple[int, ...], list[int]] = defaultdict(list)
for j in range(len(lengths) - ANCHOR + 1):
    keys[tuple(lengths[j : j + ANCHOR])].append(j)

def exact_matches(other: list[int], seed_length: int = ANCHOR):
    """Return complete maximal matching intervals, with candidate coordinates."""
    hits: dict[tuple[int,int,int], tuple[int,int,int]] = {}
    for k in range(len(other) - seed_length + 1):
        offsets = keys.get(tuple(other[k : k + seed_length]), ())
        for j in offsets:
            left = 0
            while j-left>0 and k-left>0 and lengths[j-left-1]==other[k-left-1]:
                left += 1
            right = seed_length
            while (j+right<len(lengths) and k+right<len(other)
                   and lengths[j+right]==other[k+right]):
                right += 1
            size = right + left
            if size >= seed_length:
                start = (j-left,k-left)
                hits[(start[0],start[1],size)] = (*start,size)
    return sorted(hits.values(), key=lambda x: (-x[2],x[0],x[1]))

# Genuine SFT planted positive, even if external material is inaccessible:
# the matching algorithm must find 26 contiguous source words when inserted
# into a disjoint synthetic random-length tape.
plant = [27] * 300 + lengths[487:513] + [27] * 300
assert any(m[0] == 487 and m[1] == 300 and m[2] >= 26
           for m in exact_matches(plant))

req = urllib.request.Request(URL, headers={"User-Agent": "LiberPrimus-research-source-audit/1.0"})
with urllib.request.urlopen(req, timeout=120) as response:
    data = response.read()
digest = sha256(data).hexdigest()
assert digest == ZIP_SHA256, (digest, "NLTK source package changed")

observations = []
with ZipFile(BytesIO(data)) as archive:
    texts = [n for n in archive.namelist() if n.endswith(".txt")
             and not n.startswith("__MACOSX")]
    for name in sorted(texts):
        material = archive.read(name).decode("utf-8", errors="replace")
        lexical = re.findall(r"[A-Za-z]+", material)
        translated = [gp_length(w) for w in lexical]
        # -1 is a genuine non-mappable spelling barrier.
        hits = exact_matches(translated)
        best = [
            {
                "source_word_start": j,
                "public_text_word_start": k,
                "length": n,
                "candidate_source_words": lexical[k:k+min(n,22)],
                "ciphertext_word_lengths": lengths[j:j+min(n,22)],
                "ciphertext_gp_words": [
                    "".join(corpus["translit"][corpus["runes"].index(ch)]
                            for ch in w)
                    for w in words[j:j+min(n,10)]
                ],
            }
            for j,k,n in hits[:3]
        ]
        observations.append({
            "public_text":name,
            "public_words":len(lexical),
            "unmappable":sum(x<0 for x in translated),
            "max_run":hits[0][2] if hits else 0,
            "matches_at_least_12":len(hits),
            "strongest":best
        })
        print(json.dumps({
            "book":name, "words":len(lexical),
            "max_run":observations[-1]["max_run"],
            "count_12":len(hits)
        },ensure_ascii=False))

top = sorted(observations,key=lambda x:-x["max_run"])
print(json.dumps({
    "status":"PASS",
    "source":"NLTK official Gutenberg public-domain corpus",
    "source_zip_sha256":digest,
    "source_word_lengths":len(lengths),
    "source_runes":len(source),
    "tested_books":len(texts),
    "public_words":sum(x["public_words"] for x in observations),
    "plant_positive":"26 matching words detected at locked coordinates",
    "max_match":top[0]["max_run"],
    "top_books":top[:8],
    "interpretation":"Literal GP-native word-length quotation search only; no original cipher inverse, no inferred key.",
},ensure_ascii=False))
