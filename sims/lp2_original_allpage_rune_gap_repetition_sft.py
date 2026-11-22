"""Source-native inter-rune gap control across original LP2 unsolved pages.

Human motivation: earlier Cicada tasks used whitespace; a large alternate
kerning distance between the SAME pair of printed runes would be a possible
extra key bit. This checks stable repeated-pair gap measurements, not ciphertext
decoding. The p55-only kerning and full glyph-identity audits are prior work.

Run as a single file on Windows Python3.12 with numpy and Pillow.
Source: untouched resources/liber-primus/17.jpg through 72.jpg and
resources/liber-primus/lp2-corpus.json. Read-only.
"""
from __future__ import annotations

import json
from collections import Counter, defaultdict
from difflib import SequenceMatcher
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus"
BITS = np.asarray([i.bit_count() for i in range(256)], dtype=np.uint8)
NRUNES = 29
THRESHOLD = 314


def glyph_lines(page: int) -> list[list[dict]]:
    """Image-first fixed crop and threshold from prior 29-class source audit."""
    with Image.open(SOURCE / f"{page+17:02d}.jpg") as im:
        pixels = np.asarray(im.convert("L"))
    assert pixels.shape == (3600, 2400)
    row = (pixels[:, 500:1900] < 120).sum(axis=1) > 30
    row = np.convolve(row.astype(np.int16), np.ones(7, dtype=np.int16),
                      mode="same") > 0
    ys = np.flatnonzero(np.diff(np.pad(row.astype(np.int8), (1, 1))))
    lines: list[list[dict]] = []
    for y0, y1 in zip(ys[::2], ys[1::2]):
        if not 110 <= y1 - y0 <= 135:
            continue
        area = pixels[y0:y1, 580:1900]
        cols = (area < 120).any(axis=0)
        xs = np.flatnonzero(np.diff(np.pad(cols.astype(np.int8), (1, 1))))
        records: list[dict] = []
        for x0, x1 in zip(xs[::2], xs[1::2]):
            if not 7 <= x1 - x0 <= 92:
                continue
            raster = area[:, x0:x1]
            rows = np.flatnonzero((raster < 120).any(axis=1))
            if not len(rows) or rows[-1] - rows[0] + 1 < 80:
                continue
            native = (raster[rows[0]:rows[-1]+1] < 125).astype(np.uint8)
            normal = np.asarray(Image.fromarray(native).resize(
                (48, 96), resample=Image.Resampling.NEAREST))
            records.append({"x0": int(x0 + 580), "x1": int(x1 + 580),
                            "bits": np.packbits(normal.ravel())})
        if records:
            lines.append(records)
    return lines


def source_medoid(p9: list[list[dict]], original_p9: list[int]) -> np.ndarray:
    """Label original p9 glyphs using only exact manuscript rune positions."""
    records = [r for line in p9 for r in line]
    assert len(records) == 269  # The one extra source component is a border twig.
    assert len(original_p9) == 268 and set(original_p9) == set(range(NRUNES))
    vectors = np.stack([r["bits"] for r in records[:268]])
    labels = np.asarray(original_p9)
    model = []
    for rune in range(NRUNES):
        samples = vectors[labels == rune]
        diffs = BITS[np.bitwise_xor(samples[:, None, :],
                                    samples[None, :, :])].sum(axis=2)
        model.append(samples[int(np.argmin(diffs.sum(axis=1)))])
    return np.stack(model)


def image_pair_measurements(pages: dict[int, list[int]]) -> dict:
    model = source_medoid(glyph_lines(9), pages[9])
    groups: dict[tuple[str, int, int], list[tuple[int, int, int]]] = defaultdict(list)
    total_seen = total_labeled = total_original_aligned = 0
    accepted_adjacencies = 0
    gap_hist = Counter()

    for page in range(56):
        if page == 50:
            assert pages[page] == []  # Numeral-only table, no GP rune text.
            continue
        lines = glyph_lines(page)
        records = [r for line in lines for r in line]
        total_seen += len(records)
        for record in records:
            dist = BITS[np.bitwise_xor(model, record["bits"])].sum(axis=1)
            winner = int(np.argmin(dist))
            record["label"] = winner if int(dist[winner]) <= THRESHOLD else None
            total_labeled += int(record["label"] is not None)

        observed = [r["label"] for r in records]
        expected = pages[page]
        matcher = SequenceMatcher(a=observed, b=expected, autojunk=False)
        src_index: dict[int, int] = {}
        for block in matcher.get_matching_blocks():
            for offset in range(block.size):
                src_index[block.a + offset] = block.b + offset
        total_original_aligned += len(src_index)

        flat_index = 0
        for line_id, line in enumerate(lines):
            for local in range(len(line)-1):
                i, j = flat_index+local, flat_index+local+1
                if i not in src_index or j not in src_index:
                    continue
                if src_index[j] != src_index[i]+1:
                    continue
                a, b = line[local], line[local+1]
                gap = b["x0"]-a["x1"]
                gap_hist[gap] += 1
                kind = ("rune" if 0 <= gap <= 8 else
                        "word" if 16 <= gap <= 25 else None)
                if kind is None:
                    continue
                groups[kind, a["label"], b["label"]].append(
                    (page, line_id, gap))
                accepted_adjacencies += 1
            flat_index += len(line)

    metrics = {}
    all_wide = []
    for kind in ("rune", "word"):
        values = {k: v for k, v in groups.items() if k[0] == kind}
        repeats = {k: v for k, v in values.items() if len(v) >= 3}
        coverage = sum(map(len, repeats.values()))
        spread = Counter(max(q[2] for q in v)-min(q[2] for q in v)
                         for v in repeats.values())
        original_wide = [k for k, v in repeats.items()
                         if max(q[2] for q in v)-min(q[2] for q in v) >= 4]
        all_wide.extend(original_wide)

        # Synthetic +4px gap at the largest observed gap of each repeated
        # source glyph-pair class. Repeated controls survive any JPEG baseline
        # because native gap measurements are unchanged and separately held.
        planted_hit = 0
        for v in repeats.values():
            x = [q[2] for q in v]
            at = x.index(max(x))
            x[at] += 4
            planted_hit += int(max(x)-min(x) >= 4)

        metrics[kind] = {
            "measured_pair_events": sum(map(len, values.values())),
            "distinct_bigram_classes": len(values),
            "repeated_classes_3plus": len(repeats),
            "repeated_events": coverage,
            "group_range_hist_px": dict(sorted(spread.items())),
            "observed_distinct_4px_class_count": len(original_wide),
            "planted_4px_class_count": len(repeats),
            "detected_planted_4px_classes": planted_hit,
        }
        assert planted_hit == len(repeats)
    return {
        "pages": "physical p0-p55, original scans 17-72; p50 rune-free",
        "original_runic_source": sum(map(len, pages.values())),
        "image_components": total_seen,
        "classified_components": total_labeled,
        "source_order_aligned_components": total_original_aligned,
        "admitted_gap_events": accepted_adjacencies,
        "native_gap_hist": dict(sorted(gap_hist.items())),
        "results": metrics,
        "original_4px_bigram_class_outliers": [
            {"kind": kind, "a": a, "b": b, "values": groups[kind, a, b]}
            for kind, a, b in all_wide[:30]
        ]
    }


def main() -> None:
    corpus = json.loads((SOURCE / "lp2-corpus.json").read_text(encoding="utf-8"))
    pages = {p["page"]: p["indices"] for p in corpus["pages"] if p["page"] <= 55}
    assert sum(map(len, pages.values())) == 12956
    assert pages[50] == []
    output = image_pair_measurements(pages)
    print(json.dumps(output, ensure_ascii=False, indent=2))
    # This is a source-material test, not a claim that an unknown key exists.
    assert output["classified_components"] > 11000
    assert output["source_order_aligned_components"] > 10500
    assert output["results"]["rune"]["repeated_classes_3plus"] > 600
    assert output["results"]["word"]["repeated_classes_3plus"] > 200


if __name__ == "__main__":
    main()
