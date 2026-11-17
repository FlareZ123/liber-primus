"""Historically selected Jung Liber Primus text as LP2 direct running Vigenere key.

Windows Python 3.12 single runnable read-only source test. Source chosen by
the book title "Liber Primus" and first-party 2016 road/within theme, never
by ciphertext fitting. Downloads public English Jung reader's PDF in memory;
does not redistribute or write the copyrighted text. Exhausts all source
rune offsets of the direct additive family, both signs; strictly holds out
the untouched remainder of the p0..p2 original 729-rune opening chapter.
"""
from collections import Counter
from hashlib import sha256
from heapq import heappush, heapreplace
from math import log
from pathlib import Path
from urllib.request import Request, urlopen
import json
import re
import unicodedata

import pymupdf

ROOT = Path(__file__).resolve().parent.parent
PDF_URL = "https://logoilibrary.com/wp-content/uploads/2023/11/The-Red-Book-Jung.pdf"
GP = [
    "F", "U", "TH", "O", "R", "C", "G", "W", "H", "N", "I", "J", "EO",
    "P", "X", "S", "T", "B", "E", "M", "L", "NG", "OE", "D", "A",
    "AE", "Y", "IA", "EA",
]
SYMBOLS = {symbol: i for i, symbol in enumerate(GP)}
PAIRS = {"TH", "NG", "EO", "OE", "AE", "IA", "EA"}
HEAD = 80
MAX_UNIGRAM_SURVIVORS = 2500
TOP = 5


def runes(source_text: str) -> list[int]:
    """Solved-LP1 GP register; keep word order, discard punctuation."""
    norm = unicodedata.normalize("NFKD", source_text)
    letters = re.findall(r"[A-Za-z]+", norm)
    output = []
    for word in letters:
        word = (word.upper().replace("K", "C").replace("Q", "CW")
                .replace("V", "U").replace("Z", "S"))
        i = 0
        while i < len(word):
            if word.startswith("ING", i):
                unit, size = "NG", 3
            elif word[i:i + 2] in PAIRS:
                unit, size = word[i:i + 2], 2
            else:
                unit, size = word[i], 1
            output.append(SYMBOLS[unit])
            i += size
    return output


def download_pdf() -> bytes:
    request = Request(PDF_URL, headers={
        "User-Agent": "Mozilla/5.0 (compatible; historical-source-research/1.0)",
        "Accept": "application/pdf,*/*",
    })
    with urlopen(request, timeout=90) as response:
        data = response.read(75_000_001)
    assert 100_000 < len(data) <= 75_000_000
    assert data.startswith(b"%PDF")
    return data


def model(training: list[int]) -> tuple[list[float], list[float]]:
    uni = Counter(training)
    tri = Counter(zip(training, training[1:], training[2:]))
    pairs = Counter(zip(training, training[1:]))
    total = len(training)
    p1 = [log((uni[i] + 0.1) / (total + 2.9)) for i in range(29)]
    p3 = [0.0] * (29 ** 3)
    for a in range(29):
        for b in range(29):
            denom = pairs[a, b] + 2.9
            for c in range(29):
                p3[a * 841 + b * 29 + c] = log((tri[a, b, c] + 0.1) / denom)
    return p1, p3


def scores(cipher: list[int], key: list[int], start: int, sign: int,
           tri_log: list[float], sample_start: int, sample_end: int) -> tuple[float, float]:
    letters = [(cipher[i] + sign * key[start + i]) % 29
               for i in range(sample_start, sample_end)]
    tri = sum(tri_log[letters[i] * 841 + letters[i+1] * 29 + letters[i+2]]
              for i in range(len(letters)-2)) / (len(letters)-2)
    freq = Counter(letters)
    n = len(letters)
    ioc = sum(v * (v - 1) for v in freq.values()) / (n * (n - 1))
    return tri, ioc


def search(cipher: list[int], key: list[int], p1: list[float],
           p3: list[float], top: int) -> dict:
    """All source offsets, both signs, GP29 exact invertible additive family."""
    assert len(cipher) >= 2 * HEAD
    heap = []
    nstarts = len(key) - len(cipher) + 1
    for sign in (-1, 1):
        for start in range(nstarts):
            unigram_score = 0.0
            for i in range(HEAD):
                unigram_score += p1[(cipher[i] + sign * key[start + i]) % 29]
            candidate = (unigram_score, start, sign)
            if len(heap) < MAX_UNIGRAM_SURVIVORS:
                heappush(heap, candidate)
            elif candidate > heap[0]:
                heapreplace(heap, candidate)

    ranked = []
    for unigram_score, start, sign in heap:
        training, tioc = scores(cipher, key, start, sign, p3, 0, HEAD)
        held, hioc = scores(cipher, key, start, sign, p3, HEAD, len(cipher))
        ranked.append({
            "offset": start,
            "inverse_sign": sign,
            "head_unigram_log": unigram_score / HEAD,
            "head_trigram_log": training,
            "holdout_trigram_log": held,
            "head_ioc": tioc,
            "holdout_ioc": hioc,
        })
    ranked.sort(key=lambda v: v["head_trigram_log"], reverse=True)
    return {"offsets_per_sign": nstarts,
            "total_original_models": nstarts * 2,
            "first_stage_survivors": len(heap),
            "best_by_head_trigram": ranked[:top]}


def main() -> None:
    raw = json.loads((ROOT / "resources" / "liber-primus" / "lp2-corpus.json")
                     .read_text(encoding="utf-8"))
    original = sum((raw["pages"][i]["indices"] for i in range(3)), [])
    assert [len(raw["pages"][i]["indices"]) for i in range(3)] == [262,266,201]
    assert len(original) == 729
    assert raw["translit"] == GP
    pdf_bytes = download_pdf()
    with pymupdf.open(stream=pdf_bytes, filetype="pdf") as pdf:
        pdf_pages = len(pdf)
        jung = runes(" ".join(page.get_text() for page in pdf))
    assert pdf_pages > 100 and len(jung) > 40_000
    gibran_text = (ROOT / "resources" / "control" / "gibran_prophet_58585.txt").read_text(
        encoding="utf-8")
    gibran = runes(gibran_text)
    assert len(gibran) > 50_000
    p1, p3 = model(gibran)
    original_result = search(original, jung, p1, p3, TOP)

    # Real 729-GP-rune English plant, secret-offset source passage, source
    # and sign selected independently of the original unknown cipher.
    planted_offset = 3301
    true_plain = gibran[1000:1729]
    assert len(true_plain) == 729
    true_cipher = [(p + jung[planted_offset+i]) % 29
                   for i, p in enumerate(true_plain)]
    planted = search(true_cipher, jung, p1, p3, 300)
    recovered = next((x for i, x in enumerate(planted["best_by_head_trigram"])
                      if x["offset"] == planted_offset and x["inverse_sign"] == -1), None)
    assert recovered is not None, "Blind first-300 genuine-source running-key positive failed"
    assert recovered["holdout_trigram_log"] > -4.5

    print(json.dumps({
        "status": "source-selected direct-running-key test; no plaintext asserted",
        "independent_source": "C G Jung, The Red Book: Liber Novus / Liber Primus (2009/2012)",
        "pdf_url": PDF_URL,
        "pdf_sha256": sha256(pdf_bytes).hexdigest(),
        "pdf_pages": pdf_pages,
        "jung_source_runes": len(jung),
        "original_p0_p2_cipher_runes": len(original),
        "train_head_runes": HEAD,
        "holdout_runes": len(original) - HEAD,
        "method": "all start positions; both GP29 additive signs; no transparent-F skip",
        "native_gp_register": "LP1-solved spelling ING->NG, K>C Q>CW V>U Z>S",
        "native_plant": {"source_offset": planted_offset,
                         "inverse_sign": -1,
                         "control_holdout_trigram": recovered["holdout_trigram_log"],
                         "control_holdout_ioc": recovered["holdout_ioc"]},
        "real": original_result,
        "decision": "Seek readable full plaintext and authentic source offset; high head score alone is not a decryption",
    }, indent=2))


if __name__ == "__main__":
    main()
