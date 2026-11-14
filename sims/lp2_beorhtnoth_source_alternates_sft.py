"""Check whether period-authentic Beorhtnoth GSUB alternates explain original LP2 U glyphs.

Run with the same dependencies as lp2_beorhtnoth_original_font_sft.py.
All source bytes and period-original font hashes are pinned in that module.
"""
from __future__ import annotations

import hashlib
import io
from urllib.request import urlopen

from PIL import ImageFont
from fontTools.ttLib import TTFont

from lp2_beorhtnoth_original_font_sft import (
    CANDIDATE_GIT_BLOB,
    CANDIDATE_URL,
    glyph,
    match,
    p55_original_masks,
    p55_font_report,
)


def substituted(data: bytes, codepoint: int, glyphname: str) -> bytes:
    font = TTFont(io.BytesIO(data))
    for cmap in font["cmap"].tables:
        if codepoint in cmap.cmap:
            cmap.cmap[codepoint] = glyphname
    buf = io.BytesIO()
    font.save(buf)
    return buf.getvalue()


def run() -> None:
    with urlopen(CANDIDATE_URL, timeout=40) as response:
        data = response.read()
    blob = hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()
    assert blob == CANDIDATE_GIT_BLOB

    original, labels = p55_original_masks()
    positions = [i for i, ch in enumerate(labels) if ch == "ᚢ"]
    assert positions == [20, 29, 72], positions
    font = TTFont(io.BytesIO(data))
    base_glyph = font.getBestCmap()[ord("ᚢ")]
    print("BABELSTONE ORIGINAL U", base_glyph, "p55 positions", [i+1 for i in positions])
    features = {}
    if "GSUB" in font:
        table = font["GSUB"].table
        for record in table.FeatureList.FeatureRecord:
            mappings = {}
            for index in record.Feature.LookupListIndex:
                lookup = table.LookupList.Lookup[index]
                for subtable in lookup.SubTable:
                    if hasattr(subtable, "alternates"):
                        mappings.update(subtable.alternates)
                    if hasattr(subtable, "mapping"):
                        mappings.update(subtable.mapping)
            features[record.FeatureTag] = mappings
    print("ORIGINAL GSUB FEATURES", sorted(features))
    source = font.getBestCmap()
    candidates = [(base_glyph, data, "default")]
    for feature, mappings in features.items():
        mapped = mappings.get(base_glyph)
        if isinstance(mapped, str):
            alternates = [mapped]
        elif isinstance(mapped, (tuple, list)):
            alternates = mapped
        else:
            alternates = []
        for name in alternates:
            candidates.append((name, substituted(data, ord("ᚢ"), name), feature))
    print("SOURCE-PINNED U ALTERNATES", [(feat, glyphname) for glyphname, _, feat in candidates])
    for glyphname, data_variant, feature in candidates:
        face = ImageFont.truetype(io.BytesIO(data_variant), size=160)
        template = glyph(face, "ᚢ")
        results = [match(original[pos], template) for pos in positions]
        print("U ORIGINAL", feature, glyphname, "distance IoU", results)


if __name__ == "__main__":
    run()
