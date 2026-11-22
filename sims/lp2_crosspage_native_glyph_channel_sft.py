#!/usr/bin/env python3
"""Cross-page native-glyph channel gate on original LP2 JPEGs.

Run: python sims/lp2_crosspage_native_glyph_channel_sft.py
Only pages with exact one-to-one original-source component registration are used.
No OCR, trial keys, or ciphertext-driven font templates.
"""
from __future__ import annotations

import json
import numpy as np
from lp2_p55_native_glyph_variants_sft import (
    binary_features, nearest_same_label, summarize,
)

SOURCE_PAGE = 43
TEST_PAGES = (29, 34, 35, 47, 52, 55)
EXPECTED_COUNTS = {29: 277, 34: 261, 35: 271, 47: 274, 52: 263, 55: 76}
EXPECTED_MAX = {29: 265, 34: 351, 35: 265, 47: 234, 52: 265, 55: 227}


def main() -> None:
    reference_labels, reference = binary_features(SOURCE_PAGE)
    ref_distance, ref_readback = nearest_same_label(
        reference_labels, reference, reference_labels, reference, True,
    )
    assert len(reference_labels) == 274
    assert np.array_equal(ref_readback, reference_labels)
    assert int(ref_distance.max()) == 271
    boundary = int(ref_distance.max())
    result = {
        "reference": {
            "physical_page": SOURCE_PAGE, "image": "60.jpg",
            "source_exact_runes": 274,
            "native_same_label_leave_one_out": summarize(ref_distance),
        },
        "tests": [],
    }
    for page in TEST_PAGES:
        labels, features = binary_features(page)
        assert len(labels) == EXPECTED_COUNTS[page]
        dist, readback = nearest_same_label(
            labels, features, reference_labels, reference, False,
        )
        assert np.array_equal(readback, labels), page
        assert int(dist.max()) == EXPECTED_MAX[page], page
        anomalous = np.flatnonzero(dist > boundary)
        result["tests"].append({
            "physical_page": page,
            "image": f"{page + 17:02d}.jpg",
            "source_exact_runes": len(labels),
            "readback_correct": int(np.count_nonzero(readback == labels)),
            "same_label": summarize(dist),
            "above_reference_max": [
                {"rune_index": int(i), "hamming_distance": int(dist[i])}
                for i in anomalous
            ],
        })
    # Independent planted local alteration on all 274 original p47 glyphs.
    # No refitting or chosen readout. A 20x20 added corner stroke must register.
    labels, native = binary_features(47)
    modified = native.reshape(-1, 122, 100).copy()
    modified[:, 102:122, 80:100] = 1
    altered = modified.reshape(-1, 12200)
    distances, _ = nearest_same_label(
        labels, altered, reference_labels, reference, False,
    )
    assert np.all(distances > boundary), "planted 20x20 marks must be detected"
    result["positive_control"] = {
        "page": 47,
        "planted_extra_pixels_per_rune": 400,
        "detected_outside_native_reference": int(np.count_nonzero(distances > boundary)),
        "total_planted": len(labels),
    }
    assert sum(EXPECTED_COUNTS[p] for p in TEST_PAGES if p != 55) == 1346
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
