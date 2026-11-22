"""Source-delimited Jung *Liber Primus* GP29 word-address original test.

The only changed source assumption from the earlier full-reader address gate:
the first-party exact name 'Liber Primus' selects just the named book.
Do not select PDF offsets by response to original ciphertext.
Python 3.12, Windows Actions, no source-text repository copies.
"""
from __future__ import annotations
from hashlib import sha256
from pathlib import Path
from random import Random
from urllib.request import Request, urlopen
import importlib
import json
import re
import unicodedata

import pymupdf
base = importlib.import_module("lp2_jung_liberprimus_wordaddress_sft")


def source_subbook() -> tuple[bytes, list[str], dict]:
    with urlopen(Request(base.PDF_URL, headers={"User-Agent": "Mozilla/5.0"}), timeout=100) as response:
        raw = response.read(50_000_000)
    digest = sha256(raw).hexdigest()
    assert digest == base.PDF_SHA, f"source edition mismatch {digest}"
    headings = {"LIBER PRIMUS": [], "LIBER SECUNDUS": []}
    with pymupdf.open(stream=raw, filetype="pdf") as doc:
        contents = [page.get_text("text") for page in doc]
        toc = [(level, title, p) for level,title,p in doc.get_toc()
               if "LIBER PRIMUS" in title.upper() or "LIBER SECUNDUS" in title.upper()]
    for p, text in enumerate(contents):
        n = unicodedata.normalize("NFKD", text)
        # Exact body headings only, never inline or table-of-contents references.
        for k in headings:
            if re.search(r"(?mi)^[ \t]*" + k.replace(" ", r"\s+") + r"[ \t]*$", n):
                headings[k].append(p)
    # The latest complete pair is source-determined, not tuned against ciphertext.
    pairs = [(start,end) for start in headings["LIBER PRIMUS"]
             for end in headings["LIBER SECUNDUS"] if end > start and 10 <= end-start <= 160]
    print("SOURCE_HEADING_INDEX", json.dumps({
        "liber_primus_pdf_pages_zero_based": headings["LIBER PRIMUS"],
        "liber_secundus_pdf_pages_zero_based": headings["LIBER SECUNDUS"],
        "pdf_bookmarks": toc,
        "candidate_pairs": pairs,
    }, separators=(",",":")))
    assert pairs, "do not invent a section if source heading is unavailable"
    begin, finish = pairs[-1]
    selected = "\n".join(contents[begin:finish])
    # Trim exactly at headings, retaining all narrative chapters and page words.
    m=re.search(r"(?mi)^[ \t]*LIBER\s+PRIMUS[ \t]*$",selected)
    assert m is not None
    selected=selected[m.end():]
    text=unicodedata.normalize("NFKD", selected)
    tokens=re.findall(r"[A-Za-z]+",text)
    assert len(tokens)>2000, "section source too short for robust word address"
    return raw, tokens, {
        "selected_pdf_start_zero_based":begin,
        "selected_pdf_end_exclusive_zero_based":finish,
        "source_words":len(tokens),
    }


def main() -> None:
    words, corpus=base.original_words()
    original, donor, bounds=source_subbook()
    primes=corpus["prime"]
    base.plant(donor,words,primes)
    model=base.trigram_model(" ".join(donor))
    rng=Random(0x33014B53)
    reports=[]
    for radix, name in ((29,"whole-word-base29"),(0,"word-prime-sum")):
        decoded=base.source_readout(words, donor, primes, radix)
        observed=base.score(decoded,model)
        shuffles=[]
        for _ in range(200):
            letters=list(decoded)
            rng.shuffle(letters)
            shuffles.append(base.score("".join(letters),model))
        reports.append({
            "mode":name,
            "first_140":decoded[:140],
            "trigram_gain_per_letter":round(observed,6),
            "shuffle_range":[round(min(shuffles),6),round(max(shuffles),6)],
            "upper_tail":round((1+sum(x>=observed for x in shuffles))/201,6),
            "locked_phrase_hits":{k:[i for i in range(len(decoded))
                               if decoded.startswith(k,i)]
                   for k in base.ANCHORS if k in decoded},
        })
    print("ORIGINAL_SECTION",json.dumps({
        "source_pdf_sha256":sha256(original).hexdigest(),
        **bounds,
        "gp29_original_runes":12956,
        "original_printed_words":len(words),
        "selection":"strict same-title body after LIBER PRIMUS heading, ending before LIBER SECUNDUS heading",
        "readouts":reports,
    },separators=(",",":")))


if __name__=="__main__":
    main()
