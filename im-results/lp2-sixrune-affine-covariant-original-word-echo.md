# Original LP2 six-rune equivalence classes and the p27↔p55 word echo

**Agent 7, 17 November 2026.** Classification: original-runic, key-invariant local structure. The source pattern yields a uniquely well-framed repeat under all constant Caesar shifts, but there is **no recovered unknown plaintext, source-selected key, or original cipher inverse**. The known DJU-BEI echo itself predates this check; the comparison across all shifted and affine-equivalent original six/seven-rune substrings is the added discriminator.

## Intended decoder question

The original LP2 p27 contains the complete two-word ciphertext phrase `DJU-BEI` at source rune offset 6,555, and p55 ends with the same six runes at offset 12,950. If it is an authored pointer or repeated encrypted plaintext rather than an accidental collision, it could constrain a keystream state at two locations. But any claimed state relation needs evidence outside these matching six characters. Existing [6,395-rune shared-pad](bookend-repeat-lag6395.md), [28-pair substitution](lp2-two28-bookend-substitution-invariants.md), and [cipher-feedback state](lp2-p27-p55-affine-cipherfeedback-state-gate.md) tests already exclude several natural direct mechanisms.

A narrower independent question is whether *other* original six-rune phrases recur when the two copies use different fixed alphabet offsets or invertible affine alphabets. Such repeats could indicate plaintext reuse with separate but simply related keys. This scan uses only source ciphertext and its original word delimiters; no crib, candidate name, or fitted shift is needed.

## Exact source and invariant

Read only the 56 unknown physical pages p0–55 of `resources/liber-primus/lp2-corpus.json`, yielding 12,956 original GP29 indices. For each contiguous window `C[i..i+L)`:

- Constant-shift class: normalize to `(C[i+k]−C[i]) mod 29` for each k. Two windows have equal fingerprints iff one is a constant additive rotation of the other.
- Affine class: additionally divide all normalized differences by the **first nonzero** difference within each window, modulo 29. This is exact for all `a∈{1,...,28}`, `b∈{0,...,28}` acting as `y=a·x+b (mod 29)`. The first-different search also handles starting doublets.
- Enumerate every pair of **nonoverlapping** matching windows in the complete original source. Original word endings are only `-`, `.`, `&`, `$`, `§`; page and line wraps do not introduce synthetic word boundaries.

## Complete observed matches

| Relation | Window length | Nonoverlapping pairs | Notes |
|---|---:|---:|---|
| Any constant Caesar shift | 6 runes | **3** | Positions below |
| Any constant Caesar shift | 7 runes | **0** | No continuation |
| Any invertible affine GP29 map | 6 runes | **109** | Expected many short chance matches |
| Any invertible affine GP29 map | 7 runes | **1** | p13[20]↔p33[183], map `y=19x+1 (mod 29)` |
| Any invertible affine GP29 map | 8 runes | **0** | No longer matches |

The exhaustive six-rune constant-shift matches are:

| Source A | Source B | Shift from A to B | Original printed segmentation |
|---|---|---:|---|
| p9[135], global 2,264 | p20[259], global 5,092 | +27 mod29 | First window `5+1`; second `2+2+2` |
| p37[134], global 9,078 | p45[32], global 10,995 | +22 mod29 | First window `3+3` across word interior; second `1+3+2` |
| **p27[28], global 6,555** | **p55[70], global 12,950** | **0** | **Both are complete 3+3-rune words DJU-BEI** |

Thus, even after allowing **29 possible Caesar shifts rather than only literal equality**, the only word-boundary-coincident six-rune recurrence is the known terminal pair. This strengthens its status as a **candidate intentionally placed cross-page pointer** relative to other short shift-equivalent matches. The source-placement observation remains postselected and cannot alone authenticate creator intention or supply a key.

The single seven-rune affine recurrence is `T N J Y NG T IA` (p13[20]) ↔ `S IA W TH D S NG` (p33[183]); it is not an independently selected cipher instruction or verified plaintext. All eight-rune affine matches are absent.

## Reproduction and decision

[Exact standalone Node.js SFT](../sims/lp2_shift_affine_longphrase_source_sft.cjs) asserts the 12,956/2,896 source counts, every shift-six pair, zero shift-seven, 109 affine-six, the one affine-seven, zero affine-eight, and the unique complete-word 3+3 match. It plants independent nine-rune affine and eight-rune Caesar-shift positives to verify the invariant scanners. No external dependencies, remote data or random seeds are needed.

**Decision:** Other long reusable plaintext blocks hidden under one constant Caesar rotation or one invertible affine alphabet are not present in these seven/eight-rune local windows; this says nothing about stateful keys, transpositions or completely unrelated plaintext. The p27→p55 echo remains the only fully word-aligned six-rune cross-book lead under this family. Further work should first find an *independent authored state/clock cue*, then predict at least one untouched original feature outside the pair and demand full-page coherent plaintext with exact re-encryption. The local match cannot be promoted to a successful decipherment.
