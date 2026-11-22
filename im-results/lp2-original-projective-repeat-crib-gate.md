# Source-locked LP2 GP29 affine/projective local-crib fingerprint

**18 November 2026, Agent4. Status: original-input negative crib search; no unknown plaintext.**

## Original clue and executable question

The original solved LP1 p05 Wisdom square visibly includes `MOBIUS` and its two-by-two corner matrix has been reconstructed as a GP29 projective action (source study #166). If a nine-rune phrase recurred in unknown LP2 ciphertext under independently chosen *constant local* affine or Möbius relabelings, its transformation-invariant fingerprint would survive the secret coefficients. An analogous match against the intact 95-rune clear p57 `PARABLE` could reveal an independently sourced plaintext crib. This test asks that constructive question directly on original GP29 symbols, without fitting keys or guessing English.

The fixed source is `resources/liber-primus/lp2-corpus.json`, 55 rune-bearing unsolved physical pages p0–p55, **12,956 GP29 runes**, and clear p57. Each candidate window lies wholly inside one original physical page; printed word boundaries are preserved as *locations*, but do not alter the rune sequence. Cross-page windows and plaintext having independently changed word segmentation remain outside the scope.

## Invariant and observations

For any window whose first three symbols `a,b,c` are distinct, the fractional-linear invariant for a later symbol `x` is

`(x-a)*(b-c)/((x-c)*(b-a)) mod29`.

A special `∞` token denotes `x=c`. Equality of all invariants is necessary and sufficient for a *local partial* nonsingular Möbius map in the projective line over GF29 mapping the two windows. The affine specialization needs only the first two distinct symbols and has invariant `(x-a)/(b-a)`. Hashing these normalized signatures permits an exhaustive exact comparison without iterating secret 2×2 matrices or affine coefficients.

| Original comparison | Minimum span | Non-overlapping source matches |
| --- | ---: | ---: |
| Unknown LP2 vs unknown LP2, affine | 7 runes | **1** |
| Unknown LP2 vs unknown LP2, affine | 8 runes | **0** |
| Unknown LP2 vs unknown LP2, projective | 7 runes | **101** |
| Unknown LP2 vs unknown LP2, projective | 8 runes | **6** |
| Unknown LP2 vs unknown LP2, projective | 9 runes | **0** |
| Unknown LP2 vs original clear p57, projective | 8 runes | **0** |

The sole affine seven-rune pair is **p13 offset20 ↔ p33 offset183** with `y=19x+1 mod29`; it ends at seven, and neither site supplies a source-selected common English phrase. The six projective eight-rune pairs have no ninth matching rune: **p27:134↔p28:18; p27:160↔p30:252; p7:15↔p38:109; p25:56↔p43:223; p48:247↔p54:22; p38:147↔p55:59**. The last pair alone is no evidence of a moth/terminal decipherment. At this corpus size, small numbers of seven-/eight-rune coincidences are entirely plausible by chance; the absence of a ninth matching rune is the useful cryptanalytic boundary, not an identification of any map.

The original `p57` result excludes a direct eight-rune copy of *that specific clear passage* within this local-map family. It cannot rule out an unknown passage resembling other English texts, changing-state keys, alternate register, added/removed runes, cross-page carry, or shorter match.

**Mathematical caveat:** a Möbius map with a finite pole is **not** a permutation of all 29 finite GP letters. Any Möbius action that preserves the complete 29-letter finite alphabet must be affine. The broader projective scan is deliberately a generous *local repeated-phrase* detector (a full projective cipher would additionally need a 30th infinity/special symbol and explicit boundary rules). Neither the LP1 word `MOBIUS` nor this test specifies the key, state clock or output operation on LP2.

## Reproducibility and decision

[Single-file CommonJS SFT](../sims/lp2_projective_repeat_original_sft.cjs) asserts original page counts, all six original comparisons, actual affine match positions, and a 12-symbol **nonlinear Möbius** positive versus a one-rune mutation and affine-wrong-family negative. No extracted short pattern has been promoted to a decryption.

**Decision:** this exact constant local affine/projective echo route yields **no unknown-page plaintext or key** and no nine-rune repeated crib. Its results are available for a *new independently authored key hypothesis* without retesting the same echo search. A proposed full 30-state space/projective cipher must explicitly specify what the infinity symbol denotes in the authentic printed separators, and demonstrate source-native controls, a coherent whole paragraph and exact reencryption before a claimed solve.
