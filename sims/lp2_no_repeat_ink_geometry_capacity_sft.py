#!/usr/bin/env python3
"""Capacity audit of LP2's page-local red-span and large-mark geometry.

Run from the repository root:
    python sims/lp2_no_repeat_ink_geometry_capacity_sft.py

This is a generous combinatorial upper bound, not a cipher decoder. It uses
only source-derived rune counts and the committed ink annotation inventory.
"""
from __future__ import annotations

import json
import math
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CORPUS = ROOT / "resources/liber-primus/lp2-corpus.json"
ANNOTATIONS = ROOT / "resources/liber-primus/lp2-ink-annotations.json"
PUNCTUATION_CAPACITY = ROOT / "im-results/lp2-no-repeat-punctuation-identity-capacity.json"

# From the already audited original-compositor residual-line-end model.
LINE_RESIDUAL_BITS = 55


def log2_choose(n: int, k: int) -> float:
    if k < 0 or k > n:
        return float("-inf")
    return (math.lgamma(n + 1) - math.lgamma(k + 1) - math.lgamma(n - k + 1)) / math.log(2)


def main() -> None:
    corpus = json.loads(CORPUS.read_text(encoding="utf-8"))
    annotations = json.loads(ANNOTATIONS.read_text(encoding="utf-8"))
    punctuation = json.loads(PUNCTUATION_CAPACITY.read_text(encoding="utf-8"))
    page_by_number = {page["page"]: page for page in corpus["pages"]}
    annotation_by_number = {page["page"]: page for page in annotations["pages"]}
    unknown_pages = [p for p in range(56) if p != 50]
    assert len(unknown_pages) == 55

    fixed_span_bits = 0.0
    variable_span_bits = 0.0
    independent_mark_position_bits = 0.0
    independent_positions = []
    red_spans = red_runes = large_marks = mark_clusters = 0
    attached_clusters = 0
    pages_with_spans = pages_with_ink = 0

    for page_number in unknown_pages:
        page = page_by_number[page_number]
        ann = annotation_by_number.get(page_number, {})
        rune_count = len(page["indices"])
        spans = ann.get("red_spans", [])
        marks = ann.get("large_punctuation", [])
        if spans or marks:
            pages_with_ink += 1
        if spans:
            pages_with_spans += 1
        span_count = len(spans)
        red_count = sum(span["length"] for span in spans)
        red_spans += span_count
        red_runes += red_count

        if span_count:
            # Ordered, non-overlapping page-local spans; touching is allowed.
            # Fixed lengths: distribute L-R non-red runes into S+1 gaps.
            fixed_span_bits += log2_choose(rune_count - red_count + span_count, span_count)
            # More generous: also allow the S red-span lengths to vary while
            # preserving their page-local total and number of spans.
            variable_span_bits += (
                log2_choose(red_count - 1, span_count - 1)
                + log2_choose(rune_count - red_count + span_count, span_count)
            )

        large_marks += len(marks)
        unique_offsets = sorted({mark[0] for mark in marks})
        mark_clusters += len(unique_offsets)
        for offset in unique_offsets:
            at_page_end = offset == rune_count
            at_span_endpoint = any(
                offset == span["start"] or offset == span["start"] + span["length"]
                for span in spans
            )
            if at_page_end or at_span_endpoint:
                attached_clusters += 1
            else:
                independent_mark_position_bits += math.log2(rune_count + 1)
                independent_positions.append({
                    "page": page_number, "offset": offset, "runes": rune_count
                })

    # Generous allowance: every one of the 31 marks independently selects
    # one of 2 dot sizes x 2 colours, whether or not the source uses all states.
    mark_state_bits = 2 * large_marks
    ink_fixed_bits = fixed_span_bits + independent_mark_position_bits + mark_state_bits
    ink_variable_bits = variable_span_bits + independent_mark_position_bits + mark_state_bits
    fine_label_bits = punctuation["carrierBits"]["globalFine"]
    global_deficit_bits = punctuation["sourceDeficitBits"]["global"]

    fixed_plus_fine = ink_fixed_bits + fine_label_bits
    variable_plus_fine = ink_variable_bits + fine_label_bits
    fixed_plus_line = fixed_plus_fine + LINE_RESIDUAL_BITS
    variable_plus_line = variable_plus_fine + LINE_RESIDUAL_BITS

    assert (red_spans, red_runes, large_marks) == (16, 213, 31)
    assert (mark_clusters, attached_clusters) == (30, 28)
    assert independent_positions == [
        {"page": 36, "offset": 99, "runes": 238},
        {"page": 38, "offset": 186, "runes": 228},
    ]
    assert abs(fixed_span_bits - 118.74873335137019) < 1e-8
    assert abs(variable_span_bits - 131.25404870750646) < 1e-8
    assert abs(independent_mark_position_bits - 15.740070596077693) < 1e-8
    assert abs(global_deficit_bits - 325.4502541839829) < 1e-8
    assert fixed_plus_fine < global_deficit_bits
    assert variable_plus_fine < global_deficit_bits
    assert fixed_plus_line > global_deficit_bits
    assert variable_plus_line > global_deficit_bits

    result = {
        "classification": "conditional capacity upper bound; not a decoder",
        "scope": {
            "unknown_pages": len(unknown_pages),
            "pages_with_ink": pages_with_ink,
            "pages_with_red_spans": pages_with_spans,
            "red_spans": red_spans,
            "red_runes": red_runes,
            "large_marks": large_marks,
            "unique_large_mark_positions": mark_clusters,
            "mark_positions_attached_to_span_endpoint_or_page_end": attached_clusters,
            "independent_interior_mark_positions": independent_positions,
        },
        "capacity_bits": {
            "red_span_placement_fixed_lengths": fixed_span_bits,
            "red_span_placement_variable_lengths": variable_span_bits,
            "independent_mark_positions": independent_mark_position_bits,
            "four_state_per_large_mark_allowance": mark_state_bits,
            "structured_ink_fixed_lengths": ink_fixed_bits,
            "structured_ink_variable_lengths": ink_variable_bits,
            "pooled_fine_punctuation_labels": fine_label_bits,
            "global_at_most_86_codebook_deficit": global_deficit_bits,
            "fixed_lengths_ink_plus_fine_labels": fixed_plus_fine,
            "variable_lengths_ink_plus_fine_labels": variable_plus_fine,
            "fixed_lengths_plus_all_55_line_residual_bits": fixed_plus_line,
            "variable_lengths_plus_all_55_line_residual_bits": variable_plus_line,
            "shortfall_without_line_bits_fixed_lengths": global_deficit_bits - fixed_plus_fine,
            "shortfall_without_line_bits_variable_lengths": global_deficit_bits - variable_plus_fine,
            "surplus_if_all_line_bits_independent_fixed_lengths": fixed_plus_line - global_deficit_bits,
            "surplus_if_all_line_bits_independent_variable_lengths": variable_plus_line - global_deficit_bits,
        },
        "assumptions": [
            "Red spans stay on their original pages and remain non-overlapping; touching is allowed.",
            "Fixed-length model preserves each observed span length; variable-length model only preserves per-page span count and total red-rune count.",
            "Only two unique large-mark positions are treated as independently movable; the other 28 are tied to red-span endpoints or page ends.",
            "Every large mark is generously allowed four independent size/colour states (two bits each).",
            "The 77.5654-bit pooled punctuation-label carrier and 55 residual-line bits are added independently, even where physical channels may overlap.",
            "The 55 residual-line bits are an optional upper bound, not an authenticated or source-selected cipher channel.",
        ],
        "decision": "Structured ink geometry plus pooled fine punctuation labels remains below the 325.4503-bit global deficit. It crosses only if all 55 residual-line bits are independently available; no source-selected readout or plaintext is established.",
    }
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
