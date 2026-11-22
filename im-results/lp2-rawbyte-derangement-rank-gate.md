# Direct raw-byte derangement rank: original-input gate

**Classification (11 November 2026): bounded original-source exclusion, no recovered LP2 plaintext, key, cipher or destination.**

## Why test this mechanism?

Across the 55 rune-bearing unsolved physical LP2 pages, there are **12,956 GP29 runes**, **86 adjacent-equal within-page rune pairs**, and **12,815 nonrepeating successor positions**. A straightforward implementation of an output that avoids repeating the previous rune has 28 choices. The printed 256-entry numerical table and a historical 256-byte onion stage make byte registers worth considering, although neither supplies a source instruction to use this mechanism.

Two explicit direct-byte output rules are tested. The byte `b` is assumed independently uniform on 0..255, and exceptional repeated-glyph positions are assumed selected independently from it.

1. **Cyclic GP order:** `C[i] = (C[i-1] + 1 + (b % 28)) % 29`.
2. **Ascending skipped GP order:** enumerate GP glyph indices 0..28 with the previous ciphertext glyph removed, then select the member at zero-based index `b % 28`.

Both allow the key-free encoded rank to be recovered directly from adjacent visible original ciphertext. Because 256 = 9×28 + 4, the first four ranks have ten byte preimages each and the remaining 24 have nine. For `n=12815` independent byte emissions, the first-four count follows `Binomial(12815, 40/256)`, with expectation **2,002.34375**.

## Actual original evidence

| Predeclared order | Original first-four count | Exact one-sided lower tail under byte%28 | Highest contiguous four-rank count over every cyclic rotation | Conservative tail bound under unknown cyclic phase |
| --- | ---: | ---: | ---: | ---: |
| Cyclic GP difference (ranks 1..28) | **1,831** | **1.31283×10⁻⁵** | **1,904** | **0.0083381** |
| Ascending GP with previous glyph omitted | **1,864** | **0.00035833** | **1,918** | **0.0202389** |

The rotation-bound argument avoids treating the 28 alternative phases as independent. For the true phase to be a candidate, the corresponding four-rank count cannot exceed the observed maximum. Its lower tail is therefore bounded by the single binomial tail at that maximum. Reversing direction simply chooses another contiguous four-rank window. An arbitrary secret permutation of the 28 ranks, changing symbol sets per position, is **not** covered.

**Source-shaped positive:** iterate `b[i] = (197i + 13) mod 256`, whose every 256-byte cycle visits each byte once. Generate new ciphertext under each rule, while preserving every original physical-page length, first glyph and the exact 86 original repeat sites. Each positive yields precisely **2,002** first-four ranks, as expected from a true byte%28 register. This validates original position bookkeeping and the predicted source-side rank bias. It is not a planted plaintext/key recovery.

## Decision

The natural cyclic and ascending-skipped **direct uniform-byte modulo-28 output models** fail this key-free original input test. This result does not constrain a secret output alphabet, rejection-sampled uniform residues, nonuniform or dependent bytes, feedback chosen from plaintext, or a different treatment of the 86 exceptions. It also says nothing about the literal distribution of the book's printed 256-byte table. The original stream may use a more careful balanced rank encoder; a source-derived rule and an inverse recovering coherent original plaintext would be needed to establish it.

**Reproducer:** `sims/lp2_rawbyte_derangement_rank_gate.cjs`, using `resources/liber-primus/lp2-corpus.json`. It asserts both original and positive-control counts and computes the binomial tails with log-factorial summation. No new CI workflow or output-only claim of decryption.
