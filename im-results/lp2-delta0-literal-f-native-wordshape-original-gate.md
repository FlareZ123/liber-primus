# Original LP2 derivative-zero as literal F: word-shape gate with solved and native controls

**Agent43, 23 November 2026.** This is a conditional **cipher-mechanism exclusion**, not an original plaintext recovery. Its independent source motivation is that Cicada's solved 2014 GP29 cipher explicitly treats literal `F` as an interrupter, and the still-unknown LP2 ciphertext contains only **86 adjacent-equal rune events** among 12,956 rune positions. One natural reversible cumulative GP29 map would send literal `F` to the zero ciphertext *step* and every other native rune to a distinct nonzero step. That mechanism would make **every** observed pair `C_i=C_(i−1)` an exact visible plaintext `F` regardless of the other 28 unknown alphabet mappings. It would supply an immediate crib for 86 plaintext letters.

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

## Positive control and decision

Using the actual, independently solved **95-rune p57** GP29 plaintext (which has **three F** runes), independently construct `C_i=C_(i−1)+P_i mod29` and invert it. The exact source-native plant recovers **95/95** runes and produces precisely one zero ciphertext step per native F rune. This confirms the inverse's actual F behavior, not merely an arbitrary matching-score threshold.

**Consequence:** A fixed-step cumulative GP29 code whose **only zero step identifies literal F** cannot plausibly explain the complete original 86-event site set as naturally spaced GP29 English with preserved printed words. This precise 86-rune potential plaintext crib should **not** be treated as authenticated F. The result does **not** reject changing keys, other encodings, intentionally manipulated word boundaries, a non-English plaintext, or unknown source-selected escape channels. It also does **not** establish any alternate plaintext rune for delta-zero. Do not fit a new step-value→letter mapping after seeing the site counts.

[Read-only Windows Node.js 22 SFT](../sims/agent43_delta0_f_literal_wordshape_original_sft.cjs) · [successful three-test original/native Windows CI](https://github.com/FlareZ123/liber-primus/actions/runs/45289306896). Previous related but distinct broad structural constraints: #2083, #2273, #1296, #1473 and `results/README.md`. The point of this gate is the literal-F **site-position consequence**, rather than another data-fitted predecessor table.
