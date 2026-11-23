# Original LP2 derivative-zero cannot mark a single stationary plaintext rune under native English word shapes

**Agent43, 23 November 2026.** This is a source-conditional **cipher-mechanism exclusion**, not an original plaintext recovery. The literal-F candidate is tested first; a keyless extension then tests every possible secret rune assignment for zero transitions. Its independent source motivation is that Cicada's solved 2014 GP29 cipher explicitly treats literal `F` as an interrupter, and the still-unknown LP2 ciphertext contains only **86 adjacent-equal rune events** among 12,956 rune positions. One natural reversible cumulative GP29 map would send literal `F` to the zero ciphertext *step* and every other native rune to a distinct nonzero step. That mechanism would make **every** observed pair `C_i=C_(i−1)` an exact visible plaintext `F` regardless of the other 28 unknown alphabet mappings. It would supply an immediate crib for 86 plaintext letters.

## Full source and actual test

- Original input: canonical GP29 transcript `resources/liber-primus/lp2-corpus.json`, parsed by the existing `sims/lp2_word_pages.cjs` to **2,896 true cross-page-joined printed words**, with **12,956 ciphertext runes** and all **32** actual across-page words. The proposal assumes those printed spaces are the plaintext word boundaries, as on solved p56.
- Proposed cipher condition: one GP symbol `F` has plaintext index 0, and `C_i=C_(i−1)+S(P_i) mod29`, where `S(F)=0` and `S` is any 29-symbol bijection. Thus `C_i=C_(i−1)` *iff* `P_i=F`. One initial full-tape state value is immaterial after the first character; no candidate key/phase is fitted to original ciphertext.
- Exact source: **86** predecessor equalities, **23 at the first rune of a printed word**, **63 inside a word**. Full site counts by zero-based within-word offset 0–11: `[23,12,21,7,8,6,5,1,2,0,0,1]`. If these were literal `F` plaintext, the original book would contain exactly **86 F** runes, with only **23/86 = 26.74%** at word starts.
- Independently sourced native-English text in the same GP29 transcription conventions: Gibran `The Prophet`, Shakespeare and Emerson. For each donor, sample a complete 2,896-word native manuscript **5,000** times with a fixed seed, independently matching **every original word's exact GP29 rune length**, including all long and one-rune words. This preserves full book-length and word-start structure and does not touch the original ciphertext for scoring. Native GP transcription uses `QU→CW`, `V→U`, `K,Q→C`, `Z→S`, with `ING` and `IO` ligature rules, exactly as the existing original-native controls.

| Independent native donor | Mean `F` in 12,956 shape-matched runes | Mean word-initial `F` | Fraction of F word-initial | Draws with ≤86 F | Draws with ≤23 word-initial F |
|---|---:|---:|---:|---:|---:|
| Gibran | **294.3964** | **127.5084** | **43.31%** | **0/5,000** | **0/5,000** |
| Shakespeare | **242.0702** | **112.1102** | **46.31%** | **0/5,000** | **0/5,000** |
| Emerson | **297.5824** | **121.7400** | **40.91%** | **0/5,000** | **0/5,000** |
| Original if zero step meant F | **86** | **23** | **26.74%** | Actual | Actual |

The donor-control mismatch is larger than plausible control run-to-run variability, and the start-position discrepancy remains if one conditions on the **originally observed** small count of 86. These are *conditional* native-language comparisons, not proof of what the manuscript says. A deliberate English lipogram, different language, or changed plaintext segmentation would void the stated native-language model.

## Exact secret-alphabet-independent extension: all 29 GP plaintext symbols

Under **any** cumulative one-step stationary GP29 substitution `C_i=C_(i−1)+S(P_i) mod29` with `S` a completely secret 29-symbol permutation, one and only one unknown native plaintext rune `r=S⁻¹(0)` must occupy the original 86 zero-difference sites. Thus the immediate next decision is whether **any of the 29 native rune choices**, including `NG`, `EA`, `F`, `J`, etc., fits the **pair** of original source events `(86 total, 23 word-start)`.

For each of the three independent donor corpora and every one of the 14 actual source word lengths, compute the *exact native empirical* conditional mean of (number of occurrences of rune `r`, indicator of word-initial `r`) and its 2×2 covariance. Sum these means/covariances with weights equal to the source's exact counts of 1..14-rune words. For each potential secret `r`, calculate the two-variable Mahalanobis distance from original (86,23). **Allow the most favorable of all 29 secret runes**, rather than selecting the actual author's secret after inspecting original ciphertext.

The same fixed 5,000 native word-length-matched synthetic manuscripts per donor estimate the null **jointly for all 29 plaintext runes**, computing the most favorable Mahalanobis distance on every complete donor-shaped book. This automatically includes the 29-way favorable choice in the null, rather than giving the original 29 unchecked trials. No original rune is decoded, and no secret table is guessed.

| Donor | Best possible native rune for original zero sites | Original minimum 29-way distance² | Largest *minimum* distance² in 5,000 independent native books | Native books at least as distant |
|---|---|---:|---:|---:|
| Gibran | `EA` | **34.2780** | **0.7854** | **0/5,000** |
| Shakespeare | `G` | **57.5904** | **0.7635** | **0/5,000** |
| Emerson | `EA` | **25.4039** | **0.6735** | **0/5,000** |

**Sharper, keyless decision:** The cumulative one-step *stationary* GP29 substitution hypothesis has a failed necessary observable under all **29! possible secret rune mappings**: even its most favorable hidden zero-step plaintext letter would not produce the actual original zero-event **frequency and word-start structure** in these independently word-length-matched English controls. It is unnecessary to recover or search the other 28 letters of `S` before rejecting this model. This is conditional on source printed words being actual English plaintext words (and the exact cumulative one-step formula); it makes no claim against alternative languages, flexible segmentation, nonstationary alphabets, multi-rune codes or changing-state machines. It is consistent with, but more directly interpretable than, the repository's earlier broad stationary predecessor-alphabet constraints.

## Positive control and decision

Using the actual, independently solved **95-rune p57** GP29 plaintext (which has **three F** runes), independently construct `C_i=C_(i−1)+P_i mod29` and invert it. The exact source-native plant recovers **95/95** runes and produces precisely one zero ciphertext step per native F rune. This confirms the inverse's actual F behavior, not merely an arbitrary matching-score threshold.

**Consequence:** The literal-F special case is disfavored, and the extension closes the entire 29-way stationary, bijective cumulative-step family under the stated native word-preserving English model. The 86 positions supply **no authenticated plaintext letter**, even if the source's secret stationary alphabet is otherwise unconstrained. This result does **not** exclude changing keys, other encodings, shifted plaintext segmentation, non-English source text or escape channels. It supplies no new decoder or key and does not justify fitted replacements for this rejected model.

[Read-only Windows Node.js 22 SFT](../sims/agent43_delta0_f_literal_wordshape_original_sft.cjs) · [successful three-test original/native Windows CI](https://github.com/FlareZ123/liber-primus/actions/runs/45290555032). Previous related but distinct broad structural constraints: #2083, #2273, #1296, #1473 and `results/README.md`. The point of this gate is the literal-F **site-position consequence**, rather than another data-fitted predecessor table.
