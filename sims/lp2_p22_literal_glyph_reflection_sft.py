#!/usr/bin/env python3
"""Original-image LP2 p22 horizontal glyph-reflection experiment.

Run: python sims/lp2_p22_literal_glyph_reflection_sft.py
Requires numpy, Pillow, scipy and original JPEGs in resources/liber-primus.
Reuses the independently calibrated segmentation from the p2 reflection SFT.
"""
from __future__ import annotations

import json
from collections import Counter, defaultdict
import numpy as np
from lp2_p2_literal_glyph_reflection_sft import (
    REFS, RUNES, TRANSLIT, glyph_rows, source_lines,
)


def placements(glyphs, dy=0, dx=0, mirror=False):
    """Fixed 140x100 canvas, same tight boxes and ±1px IoU as the p2 SFT."""
    data = np.zeros((len(glyphs), 140, 100), dtype=np.float32)
    for i, g in enumerate(glyphs):
        ink = g["crop"][:, ::-1] if mirror else g["crop"]
        height, width = ink.shape
        assert height <= 136 and width <= 96, (height, width)
        data[i, 2 + dy:2 + dy + height, 2 + dx:2 + dx + width] = ink
    return data.reshape(len(glyphs), -1)


def classify(samples, gallery, mirror=False, exclude_identity=False):
    templates = placements(gallery)
    shifted = [
        placements(samples, dy, dx, mirror)
        for dy in (-1, 0, 1) for dx in (-1, 0, 1)
    ]
    overlap = np.maximum.reduce([s @ templates.T for s in shifted])
    foreground = shifted[0].sum(axis=1)[:, None]
    template_ink = templates.sum(axis=1)[None, :]
    scores = overlap / (foreground + template_ink - overlap + 1e-12)
    if exclude_identity:
        for i, sample in enumerate(samples):
            for j, reference in enumerate(gallery):
                if sample is reference:
                    scores[i, j] = -1
    labels = [g["label"] for g in gallery]
    return [
        sorted(
            ((symbol, float(max(row[j] for j, c in enumerate(labels) if c == symbol)))
             for symbol in RUNES),
            key=lambda item: item[1],
            reverse=True,
        )
        for row in scores
    ]


def run():
    p2_text, p2_lines, p57_lines = source_lines()
    transcription = (REFS / "lp2-transcription.txt").read_text(encoding="utf-8")
    p22_text = transcription.split("%")[22].split("&")[0].strip()
    p22_lines = [
        [c for c in line if c in RUNES]
        for line in p22_text.replace("\n", "").split("/")
        if any(c in RUNES for c in line)
    ]
    assert [len(line) for line in p22_lines] == [22, 24, 23, 23, 19, 20]
    assert sum(map(len, p22_lines)) == 131

    p2 = glyph_rows(
        REFS / "19.jpg", p2_lines,
        [700, 888, 1077, 1269, 1453, 1638, 1830, 2016, 2205],
        595, p2=True,
    )
    training = [g for g in p2 if 1 <= g["row"] <= 7]
    withheld = [g for g in p2 if g["row"] in (0, 8)]
    assert len(training) == 161 and len(withheld) == 40
    assert set(g["label"] for g in training) == set(RUNES)

    p22 = glyph_rows(
        REFS / "39.jpg", p22_lines,
        [727, 915, 1077, 1267, 1485, 1711], 595,
    )
    assert len(p22) == 131
    solved = glyph_rows(
        REFS / "74.jpg", p57_lines[:4],
        [944, 1132, 1378, 1569], 850,
    )
    assert len(solved) == 72
    solved_black = solved[7:]

    train_original = classify(training, training, exclude_identity=True)
    p2_hold_original = classify(withheld, training)
    p22_original = classify(p22, training)
    solved_original = classify(solved_black, training)
    train_mirrored = classify(training, training, mirror=True, exclude_identity=True)
    p22_mirrored = classify(p22, training, mirror=True)

    votes = defaultdict(Counter)
    for glyph, prediction in zip(training, train_mirrored):
        votes[glyph["label"]][prediction[0][0]] += 1
    reflection = {r: votes[r].most_common(1)[0][0] for r in RUNES}
    output = "".join(
        TRANSLIT[RUNES.index(reflection[c])] if c in RUNES else c
        for c in p22_text
    )
    facts = {
        "original_images": ["19.jpg", "39.jpg", "74.jpg"],
        "p22_total": len(p22),
        "p2_train_loo": sum(g["label"] == r[0][0] for g, r in zip(training, train_original)),
        "p2_train_total": len(training),
        "p2_heldout": sum(g["label"] == r[0][0] for g, r in zip(withheld, p2_hold_original)),
        "p2_heldout_total": len(withheld),
        "solved_p57_black": sum(g["label"] == r[0][0] for g, r in zip(solved_black, solved_original)),
        "solved_p57_black_total": len(solved_black),
        "p22_unmirrored": sum(g["label"] == r[0][0] for g, r in zip(p22, p22_original)),
        "p22_unmirrored_total": len(p22),
        "mirror_distinct_outputs": len(set(reflection.values())),
        "mirror_median_iou": float(np.median([r[0][1] for r in p22_mirrored])),
        "mirror_top_iou_ge_0.9": sum(r[0][1] >= 0.9 for r in p22_mirrored),
        "mirror_map_agreement": sum(
            reflection[g["label"]] == r[0][0] for g, r in zip(p22, p22_mirrored)
        ),
        "mirror_map_agreement_total": len(p22),
        "reflection_gp29": {
            TRANSLIT[i]: TRANSLIT[RUNES.index(reflection[r])]
            for i, r in enumerate(RUNES)
        },
        "p22_reflected_modal_transliteration": output,
        "p22_individual_reflected_top_matches": [
            {"row": g["row"], "source": TRANSLIT[RUNES.index(g["label"])],
             "nearest": TRANSLIT[RUNES.index(r[0][0])], "iou": round(r[0][1], 6)}
            for g, r in zip(p22, p22_mirrored)
        ],
    }
    assert facts["p2_train_loo"] == 159 and facts["p2_heldout"] == 40
    assert facts["p22_unmirrored"] == 131 and facts["solved_p57_black"] == 65
    assert facts["mirror_distinct_outputs"] == 17
    assert facts["mirror_map_agreement"] == 112
    assert facts["mirror_top_iou_ge_0.9"] == 31
    assert all(np.array_equal(g["crop"], g["crop"][:, ::-1][:, ::-1]) for g in p22)
    return facts


if __name__ == "__main__":
    print(json.dumps(run(), ensure_ascii=False, indent=2))
