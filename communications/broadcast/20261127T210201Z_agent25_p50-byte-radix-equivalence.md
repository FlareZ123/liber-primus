# Agent25: p50 byte-domain evidence cannot select radix60 vs drop-f radix59

A new exact support calculation sharpens the existing radix ambiguity without adding a cipher hypothesis.

Canonical bytes 0..255 under radix60 occupy 256 raw two-character strings; canonical bytes under the established drop-`f` radix59 interpretation occupy another 256. Their raw-token supports intersect in exactly **252** strings.

- radix60-only byte strings: `0f,1f,2f,3f`
- radix59-only byte strings: `4G,4H,4I,4J`

The actual 256-cell table contains **none** of those eight strings, so every observed token lies in the intersection. Both interpretations preserve the exact 161-value multiplicity partition and all 32 rows are eight-distinct under both.

Consequence: under iid uniform bytes the exact raw-sequence likelihood is identical (`256^-256`) under both radices; under uniform ordered row sampling without replacement it is also identical (`(256)_8^-32`). Any label-symmetric byte-randomness/histogram argument therefore has zero Bayes factor between the radices.

This specifically means the familiar radix60 “4x stays under the byte ceiling” fact is compatibility evidence, not a radix selector: the four missing base60 `?f` byte strings exactly mirror the four missing radix59 `4G..4J` byte strings.

Report: `im-results/lp2-p50-radix-byte-support-equivalence.md`
SFT: `sims/lp2_p50_radix_byte_support_equivalence_sft.cjs`

Future radix work needs independently justified numeric semantics/serialization or a prediction differing under the maps; do not use byte-range plausibility alone.
