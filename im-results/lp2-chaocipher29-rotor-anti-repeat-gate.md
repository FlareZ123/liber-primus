# Source-era Chaocipher rotating-wheel gate for original LP2

**Decision (18 November 2026):** The independently published Byrne/Moshe Rubin **Chaocipher** does not naturally account for the defining adjacent-doublet scarcity of the still-unsolved Liber Primus LP2 ciphertext. Its original 26-letter mechanism and three straightforward 29-Gematria-Primus extensions produce approximately the uniform-alphabet rate, about 447 adjacent equalities per 12,955 transitions, rather than the **86 actually printed**. This leaves the source-derived key and all 56 unknown LP2 pages unresolved. The test does **not** rule out a deliberately modified cipher or specially selected starting alphabets.

## Why test this, and what would have changed the solve route?

The authenticated LP1 instructions refer repeatedly to *the circumference*, while LP2 art includes symmetric loops and rings. Chaocipher, disclosed publicly in 2010 and therefore accessible to 2014 solvers, enciphers through two rotating and permuting alphabet wheels. It is a plausible human-identifiable historical cipher, rather than an arbitrary private key schedule. Two independently rotating wheels could, in principle, create memory in the ciphertext and discourage immediate repetition. An original-form cipher that strongly suppressed adjacent equalities without a fitted rule would justify further investigation of source-selected initial alphabet orders and potential word-level resets.

The test uses the **actual GP29 rune order**, 12,956 original LP2 ciphertext runes across physical pages 0–55, and **12,956 source-calibrated GP29 runes** of independent public-domain English from Gibran's *The Prophet*. The GP encoder is checked against the 95 original runes of solved LP2 p57. The implementation first reproduces the **2010 original Chaocipher published 26-letter plaintext/ciphertext test vector** exactly, and round-trips the 29-rune test through both wheels. It then tests the canonical fixed nadir 13 and two adjacent possible placements 14, 15 in a 29-letter wheel, for each of 24 independent starting alphabet pairs (one natural order and 23 seeded random permutations). Every output preserves the input rune count.

## Original ciphertext and honest predictions

| Configuration | Equalities in 12,955 transitions (24 keys) | Mean | Natural-order key |
| --- | ---: | ---: | ---: |
| Original LP2, source scan | **86** | 86 | N/A |
| Chaocipher GP29, nadir 13 | 425–499 | 451.54 | 433 |
| Chaocipher GP29, nadir 14 | 405–503 | 448.54 | 471 |
| Chaocipher GP29, nadir 15 | 402–476 | 446.54 | 446 |
| Uniform independent GP29 baseline | around 447 | 446.72 | N/A |

The native Gibran encoder matches every symbol on LP2 p57 and supplies an original-language rather than arbitrary independent-rune input. Across all **72 generated source-length ciphertexts**, the smallest number of immediate repeats was **402**. The observed **86** is more than 4.6-fold lower than that minimum. Standard rotating alphabets thus offer no explanatory advantage for LP2's suppression; the predicted equality rate is about 3.45% versus observed 0.664%.

This comparison is a **bounded mechanistic rejection**, not a proof covering the 29! squared hidden initial-key space, possible rekey/reset semantics, or novel circumference-based rotor algorithms. No ciphertext was decrypted, and no recovered plaintext or key is claimed. The absence of a source-authored Chaocipher key is an additional reason to prioritize independent clues over unconstrained rotor-key search.

## Independent execution

- [Read-only Node 22 CommonJS SFT](../sims/lp2_chaocipher29_original_repeat_gate_sft.cjs). Run from repository root: `node sims/lp2_chaocipher29_original_repeat_gate_sft.cjs`. Includes fixed-seed initial alphabets, source GP encoding, exact original LP2 rune count, classic cipher oracle, full 29-rune decryption round-trip, and printed trial counts.
- [Completed successful Windows Node 22 Actions execution, run 44219221144](https://github.com/FlareZ123/liber-primus/actions/runs/44219221144), 18 November 2026, original corpus and source-text checkout. A first run failed solely on Windows CRLF normalization of the LP2 p57 positive control; fixed before the linked passing run.
- [Original 2010 Chaocipher description and reference example](https://chaocipher.com/ActualChaocipher/Chaocipher-Revealed-Algorithm.pdf). Published vector: `WELLDONEISBETTERTHANWELLSAID` → `OAHQHCNYNXTSZJRRHJBYHQKSOUJY`.

**Next useful decision:** Do not promote Chaocipher to a leading unknown LP2 cipher family without a new original-source instruction for a modified rotor step that predicts both the near-absence of adjacent repeats and the 86 authentic exceptions. Continue seeking a source-authored reversible operation or a historical key rather than new 29-rune wheel initializations.
