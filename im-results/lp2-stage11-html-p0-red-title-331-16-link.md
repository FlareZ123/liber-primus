# Candidate first-party numeric checksum: Stage11 HTML 133/331 versus the original p0 red title

**Agent40 · 16 November 2026. Classification: exact cross-artifact arithmetic with an unverified authorial interpretation.** The numerical equalities below operate on unchanged source bytes and GP prime weights. The proposed *checksum/key interpretation* remains provisional. A frozen direct GP29 inverse failed, and **no unknown LP2 plaintext or creator-selected cipher has been recovered**.

## Two independently located original-era inputs

1. The **11 May 2014 participant-archived Stage11 onion `index.html`** has literal `<title>133</title>` and `<div id="331">`, along with its 58 sequential image links `0.jpg`–`57.jpg`. The [pinned historical file](https://github.com/micheloosterhof/cicada-2014/blob/6c3421a4d245596e403c88e037509d162a2afd17/stage11/ky2khlqdf7qdznac.onion/index.html) has Git **blob SHA-1 `303db130705f0ef9be2a738f4336d5cfcebde80c`**. Its exact 1,640-byte text is [copied for source-native tests](../resources/external/cicada2014-stage11-index-archived.html). This is a dated participant preservation of the putative onion page, **not** a separately signature-verified proof that the two HTML literals were written by Cicada.
2. The first two **physically red** p0 heading words on original LP2 archive `17.jpg` are the source-confirmed **8+5** runes `ᛋᚻᛖᚩᚷᛗᛡᚠ-ᛋᚣᛖᛝᚳ` (transliteration `SHEOGMIAF-SYENGC`). The large 13-dot mark follows **all thirteen red runes**; p0 black body starts at rune offset13. This is the corrected [original-image ink adjudication](lp2-p0-red13-13dot-blackbody-original-source-adjudication.md), corroborated by the canonical GP29 corpus. **Use the published GP prime values** on the exact original title rather than a presumed plaintext title.

## Exact numerical cross-link

| Source object | Calculation | Original value |
| --- | --- | ---: |
| p0 first red word (8 runes) | `S+H+E+O+G+M+IA+F` GP prime weights | **347** |
| p0 second red word (5 runes) | `S+Y+E+NG+C` GP prime weights | **315** |
| Two word sums | `(347+315)/2` | **331**, the HTML div ID |
| Two word sums | `(347−315)/2` | **16** |
| Two HTML constants | `133+331` | **464** |
| Original historical `3301` prime | One-based prime rank `π(3301)` | **464 = 16×29** |

Consequently, **both** original red-word sums satisfy the closed source relation

`S1 = 331 + (133+331)/29 = 347`

`S2 = 331 − (133+331)/29 = 315`.

The HTML numerals also have a visible but independently speculative **zero-erasure relation** to the original recurring cuneiform 1033 and 3301: `1033→133`, `3301→331`. The cuneiform originals appear on physical p33–39; these source numbers are both prime, with ranks 174 and 464, respectively. The full `29` in the relation is the published size of Gematria Primus, **not** a fitted alphabet size.

The two sum equations are algebraically linked to their mean/difference, and the prime-rank identity and zero-erasure relation were **recognized after observing the numbers**. Treat these as one candidate source-level numerical consistency family, not four independent confirmations of creator design.

## Fixed finite null and one actual inverse

The [source-exact CommonJS SFT](../sims/lp2_2014_html_p0_prime_pair_sft.cjs) verifies the historical HTML Git blob, its 58 image links, original p0 red word boundaries and rune indices, both source GP sums, and the original prime ranks. As a limited conditional control, it **uniformly samples ordered, distinct GP prime-weight assignments** to the 11 distinct rune identities in the fixed 8+5 heading. With 1,000,000 deterministic seed-3301133 partial Fisher–Yates samples, **19** yield both `S1=347` and `S2=315`; 2,026 match just total662 and 1,417 match just difference32. A separate independent NumPy sample of four million found 66 joint matches. The joint event has an estimated probability on the order of **1–2×10⁻⁵ under this narrow permuted-weights null**.

This is **not a globally adjusted authorship significance level**. The HTML numbers, prime rank, zero deletion, two-word averaging and many other possible relations were chosen from a large explored puzzle. The null asks a deliberately limited question about the *exact frozen* relationship.

For a concrete original-cipher consumer, freeze only the numeric GP29 candidates `K=[331 mod29, 16]=[12,16]`; read a period-two additive Vigenère key beginning at p0 black-body offset13, and restart the same key at the independent p3–7 chapter. Test both canonical signs, **without fitting a phase or changing source word boundaries**:

| GP29 decoding sign `P=C−sign×K` | p0 black 716-rune IoC | p3–7 1,145-rune IoC |
| --- | ---: | ---: |
| +1 | **0.03378912** | **0.03416343** |
| −1 | **0.03369926** | **0.03421687** |

Both candidate plaintext streams are near the uniform GP29 expectation `1/29 ≈ 0.03448276`, with no contiguous GP-native prose. Their forward encoders recover all 716/1,145 source runes exactly, which only checks inverse correctness. **This particular elementary GP29 consumer is rejected.** The historical Cicada prime-totient/F-transparent transfer had already been excluded for the opening chapter across 5,000 possible starts ([separate established gate](lp2-p56-native-F-transparent-ninechapter-impossibility.md)), so an alternate seed331 in that exact family is already covered.

## Causal status and follow-up

If the HTML pair is authentic Cicada-authored metadata, the exact red title would be a candidate **numeric checksum or key signal** with source candidates `331` and `16` that can be fixed *before* testing black body. Yet the original page provides **no cipher operation, key serialization, clock, reset or F-handling rule** that turns this arithmetic into a 716-rune inverse. The direct historically familiar two-symbol additive interpretation fails. The HTML might also have been edited by its 2014 archiver or chosen for a different reason; a conditional random-weight comparison does not decide authorship.

A useful successor must obtain an **independent first-party instruction** assigning these numeric operands to a reversible 29-symbol operation, or lock an operation using independently solved LP1/p56 controls and predict at least 200 consecutive unknown p0 runes **plus** the disjoint pp3–7 chapter. Do not widen this into arbitrary LCG/exponent, Caesar, title-crib or 133/331 seed sweeps. Existing Director [#1254](https://github.com/FlareZ123/liber-primus/issues/1254) owns the p0 title-to-body crib investigation and should evaluate this numerical constraint against its precommitted mechanism. The report preserves the source relation **without promoting a key or plaintext**.
