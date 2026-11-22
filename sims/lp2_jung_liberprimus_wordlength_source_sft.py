"""Source-selected Jung 2009/2012 Liber Primus English word-length crib.

Read-only Windows Python 3.12 SFT. Downloads a public reader's edition into memory
during a manually dispatched run, scans its 100% source-native word-length stream
against all 2,896 genuine encrypted LP2 whole-word lengths, and prints only metadata.
No protected source text or document bytes are written to this repository.
"""
from collections import Counter, defaultdict
from hashlib import sha256
from pathlib import Path
import json
import random
import re
import unicodedata
from urllib.request import Request, urlopen

import pymupdf

ROOT = Path(__file__).resolve().parent.parent
PDF_URL = "https://logoilibrary.com/wp-content/uploads/2023/11/The-Red-Book-Jung.pdf"
GP_DIGRAPHS = {"TH", "NG", "EO", "OE", "AE", "IA", "EA"}
SEED = 7
CHAPTER_CUTS = (0, 3, 8, 15, 23, 27, 33, 40, 54, 56)


def gp_length(token: str) -> int:
    """Same GP29 source spelling model as the pinned LP2 length-control SFT."""
    word = (token.upper().replace("K", "C").replace("Q", "CW")
            .replace("V", "U").replace("Z", "S"))
    i = 0
    length = 0
    while i < len(word):
        if word.startswith("ING", i):
            i += 3
        elif word[i:i + 2] in GP_DIGRAPHS:
            i += 2
        else:
            i += 1
        length += 1
    return length


def original_words() -> tuple[list[int], list[int]]:
    raw = (ROOT / "resources" / "liber-primus" / "lp2-transcription.txt").read_text(
        encoding="utf-8").split("%")
    source = "%".join(raw[:55])
    words = []
    pages = []
    page = 0
    current = 0
    start_page = 0
    total_runes = 0
    cross_page = 0
    for c in source:
        if "\u16a0" <= c <= "\u16ff":
            if current == 0:
                start_page = page
            current += 1
            total_runes += 1
            last_page = page
        elif c == "%":
            page += 1
        elif c == "/" or c.isspace():
            continue
        elif current > 0:
            words.append(current)
            pages.append(start_page + (start_page >= 50))
            cross_page += last_page != start_page
            current = 0
    if current:
        words.append(current)
        pages.append(start_page + (start_page >= 50))
        cross_page += last_page != start_page
    assert len(words) == 2896
    assert total_runes == 12956
    assert cross_page == 32
    return words, pages


def chapter(page: int) -> int:
    return next(i for i in range(9) if CHAPTER_CUTS[i] <= page < CHAPTER_CUTS[i + 1])


def make_lookup(source: list[int]) -> dict:
    lookup = defaultdict(list)
    for j in range(len(source) - SEED + 1):
        lookup[tuple(source[j:j + SEED])].append(j)
    return lookup


def search(target: list[int], pages: list[int],
           source: list[int], lookup: dict, max_items: int = 12) -> dict:
    target_ch = [chapter(page) for page in pages]
    best = 0
    hit_count = 0
    locations = []
    for i in range(len(target) - SEED + 1):
        if target_ch[i] != target_ch[i + SEED - 1]:
            continue
        for j in lookup.get(tuple(target[i:i + SEED]), ()):
            hit_count += 1
            left, right = 0, SEED
            while (i - left > 0 and j - left > 0
                   and target_ch[i - left - 1] == target_ch[i]
                   and target[i - left - 1] == source[j - left - 1]):
                left += 1
            while (i + right < len(target) and j + right < len(source)
                   and target_ch[i + right] == target_ch[i]
                   and target[i + right] == source[j + right]):
                right += 1
            length = left + right
            if length > best:
                best = length
                locations = []
            if length == best and len(locations) < max_items:
                location = {
                    "original_word_index": i - left,
                    "physical_page": pages[i - left],
                    "source_word_index": j - left,
                    "matching_lengths": length,
                    "length_signature": target[i - left:i + right],
                }
                if location not in locations:
                    locations.append(location)
    return {"best": best, "seven_word_seed_hits": hit_count,
            "top_match_locations": locations}


def download_reader() -> bytes:
    request = Request(PDF_URL, headers={
        "User-Agent": "Mozilla/5.0 (compatible; source-research/1.0)",
        "Accept": "application/pdf,*/*",
    })
    with urlopen(request, timeout=90) as response:
        data = response.read(75_000_001)
    assert 100_000 < len(data) <= 75_000_000
    assert data.startswith(b"%PDF")
    return data


def source_tokens(pdf_bytes: bytes) -> tuple[list[int], int, int]:
    with pymupdf.open(stream=pdf_bytes, filetype="pdf") as doc:
        pages = len(doc)
        text = "\n".join(page.get_text() for page in doc)
    text = unicodedata.normalize("NFKD", text)
    tokens = re.findall(r"[A-Za-z]+", text)
    return [gp_length(w) for w in tokens], pages, len(tokens)


def main() -> None:
    original, physical_pages = original_words()
    source_bytes = download_reader()
    source, pdf_pages, source_word_count = source_tokens(source_bytes)
    assert pdf_pages > 100
    assert len(source) > 20_000

    # Exact source-native positive. The search must find 25 Jung-source lengths
    # spliced at the beginning of an original chapter, without knowing the key.
    lookup = make_lookup(source)
    control = original[:]
    control[15:40] = source[5000:5025]
    planted = search(control, physical_pages, source, lookup)
    assert planted["best"] >= 25

    actual = search(original, physical_pages, source, lookup)
    # Source-conditioned negative: shuffle original word lengths only within
    # the actual visual chapters, preserving all nine source length histograms.
    groups = defaultdict(list)
    for i, page in enumerate(physical_pages):
        groups[chapter(page)].append(i)
    rng = random.Random(0x3301C0DE)
    null_max = []
    for _ in range(120):
        synthetic = original[:]
        for positions in groups.values():
            perm = [synthetic[i] for i in positions]
            rng.shuffle(perm)
            for index, length in zip(positions, perm):
                synthetic[index] = length
        null_max.append(search(synthetic, physical_pages, source, lookup, max_items=0)["best"])

    print(json.dumps({
        "classification": ("candidate plaintext length crib: investigate" if actual["best"] >= 14
                           else "no long source-native exact excerpt"),
        "origin": "2009 Jung Liber Novus, reader's edition English first 2012",
        "source_url": PDF_URL,
        "pdf_sha256": sha256(source_bytes).hexdigest(),
        "pdf_size": len(source_bytes),
        "pdf_pages": pdf_pages,
        "source_words": source_word_count,
        "original_unknown_page_runes": 12956,
        "original_exact_whole_words": len(original),
        "gp_normalization": "K>C Q>CW V>U Z>S, ING and TH/NG/EO/OE/AE/IA/EA contraction",
        "seed": SEED,
        "positive_plant_best": planted["best"],
        "real": actual,
        "null_runs": len(null_max),
        "null_median_max": sorted(null_max)[len(null_max) // 2],
        "null_min_max": [min(null_max), max(null_max)],
        "null_ge_real": sum(x >= actual["best"] for x in null_max),
    }, indent=2))


if __name__ == "__main__":
    main()
