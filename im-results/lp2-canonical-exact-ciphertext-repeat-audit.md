# Canonical LP2 exact ciphertext-repeat audit — Agent25, 27 November 2026

## Result

A current external tracker claims six large “two-time-pad ciphertext overlaps” in the unsolved manuscript, including p27–p31 (1,312 runes) duplicated from the start of p44 and the special case p27 = first 234 runes of p44.

Those claims do **not** reproduce against this repository’s canonical source-derived LP2 corpus.

- Canonical p27 has exactly 234 runes.
- Aligned p27 versus the first 234 p44 runes agrees at only **13/234 positions**; position 0 already differs.
- Canonical p27–p31 has exactly **1,312 runes**, matching the external claim’s stated length, so the rejection is not caused merely by a range-length misunderstanding.
- Comparing that exact 1,312-rune block against the first 1,312 continuous runes beginning at canonical p44 gives only **53/1,312 aligned equalities**, with position 0 different.

Thus there is no exact TTP block at the stated canonical coordinates.

## Full canonical repeat census

I then ignored the external coordinates and computed the longest exact repeated substring across the entire canonical p0–p55 unknown ciphertext tape (12,956 runes), using a suffix array over the exact GP29 indices.

The maximum exact repeat length is **6 runes**, occurring once:

- p27 offset 28
- p55 offset 70
- glyph sequence: `ᛞᛄᚢᛒᛖᛁ`

There are **no repeated 7-rune substrings** anywhere in the tape.

Exact n-gram collision counts:

| n | duplicate n-gram types | collision pairs | iid expectation from empirical unigram |
|---:|---:|---:|---:|
| 2 | 837 | 102,332 | 100,179.96 |
| 3 | 2,508 | 3,580 | 3,460.98 |
| 4 | 127 | 129 | 119.57 |
| 5 | 6 | 6 | 4.13 |
| 6 | 1 | 1 | 0.1427 |
| 7 | 0 | 0 | 0.00493 |

The empirical one-rune collision probability is 0.0345529. Under a simple independent-rune calibration using that marginal, the expected number of 6-gram collision pairs is 0.1427, corresponding to a Poisson probability of about **13.3%** for at least one. The unique six-rune repeat is therefore not itself strong evidence for copied ciphertext or key reuse.

This iid calculation is only a calibration, not a claim that LP2 is iid; the observed 2–5-gram collision counts are close enough to the same baseline that the six-rune maximum has no obvious anomaly demanding a copy mechanism.

## Consequence

Do **not** import the external 97–1,468-rune overlap constraints, TTP link map, or any plaintext/key inference derived from them into this repository. They are incompatible with the canonical ciphertext.

A genuine two-time-pad/key-reuse attack would need a relation other than literal repeated ciphertext, established directly on the original corpus. The exact-repeat route supplies no such long relation.

This result does not exclude repeated *keystream* under different plaintexts; it only establishes that the claimed exact ciphertext duplication is absent and that the canonical tape’s literal repeats stop at length six.

## Reproduction

Run:

`node sims/lp2_exact_ciphertext_repeat_audit_sft.cjs`

The script reads only `resources/liber-primus/lp2-corpus.json`, checks the stated p27/p44 coordinates, builds a suffix array over the 12,956-rune tape, and reports exact n-gram collision counts and the empirical-unigram iid calibration.
