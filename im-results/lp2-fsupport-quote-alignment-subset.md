# #2604 — spacing-free quotation alignment using the asymmetric transparent-F invariant

**Decision:** The three-source monotone subset calibration failed; do not open original ciphertext or fit keys using this witness. Exact correct placements 7/12, wrong selected placements 0/12, false independent-mask selections 0/12. No original LP2 quote values were scored and no plaintext or key recovered.

## Source-constrained method

The longest source-marked LP2 quotation is physical p42–43, global [10279,10439), 160 runes (34 printed words). Its original transcription records a single internal full-stop after relative rune 41; a physical page carry at relative 137 is not punctuation. This target is fixed from [source annotation](../resources/liber-primus/lp2-quote-punctuation-spans.json) and the canonical transcript before reading the quote's rune values. The shorter p30 Mabinogion length coincidence is unrelated and not retested.

For genuine plaintext-F-transparent encryption, plaintext GP index 0 must map to ciphertext 0 without consuming a key digit, but ciphertext 0 can also be an ordinary consuming output. Exact replay of native WELCOME and second KOAN confirms this: WELCOME 11 true holds / 25 visible Fs; KOAN 2 true holds / 5 visible Fs. The necessary compatibility test for a possible quote is therefore F(P) subset F(C), never equality or the reverse.

The three already frozen #2454 donor files are the first 300,000 characters of Shakespeare, Emerson essays, and Gibran's Prophet. Normalize each word to the existing native GP29 orthography (QU→CW, K/Q→C, V→U, Z→S, ING→NG, IO→IA; greedy GP multigraphs; internal apostrophes removed). Detect source sentence stops by .!? in interword gaps. Allow every source rune start, including starts/ends inside printed words, and require exactly one internal sentence stop at relative 41. The source punctuation parser is a fixed approximation: abbreviations/edition punctuation can differ; this test is only the stated geometry, not a universal quotation model.

All 1055 placements in the three-source subset are compared to every ciphertext mask. For a fixed ciphertext F count, the rarity of supporting a plaintext candidate's k F positions increases with k. Select only a unique maximum-k compatible placement exceeding all 99 corpus-wide maximum scores of matched, randomly located same-count F masks. A result with multiple compatible candidates is not itself a unique selection. Threshold and gate were locked in [issue comment 7134219117](https://github.com/FlareZ123/liber-primus/issues/2604#issuecomment-7134219117): ≥9/12 exact unique correct placements, zero wrong selections, ≤1/12 independent-mask false selections. The three-source subset is an initial necessary calibration for the same planted passages: adding other placements can only increase the competing maximum and/or ties and null maxima. No new source books are introduced. If this gate fails, a larger source corpus cannot turn the same failed true placements into selected placements under the fixed scoring rule.

## Calibration

Four source-native 160-rune passages per author selected by seeded draws from separate source-position quartiles, with margin160 ensuring nonoverlap, conditional only on the sentence geometry (not F count). Encrypt alternating authentic WELCOME/KOAN keys; the retrieval routine receives only the ciphertext F mask and fixed geometry, never key, plaintext or true location. These are actual borrowed literary text plants, not known LP2 quotations.

| Source | Native runes | Sentence stops | Eligible placements |
|---|---:|---:|---:|
| Shakespeare | 217075 | 3366 | 305 |
| Emerson | 321326 | 3805 | 664 |
| Gibran | 62492 | 875 | 86 |

| Plant | True source | True Fs | Visible Fs | Compatible | Best Fs | Best ties | Null max | Selected |
|---:|---|---:|---:|---:|---:|---:|---:|---|
| 1 | Shakespeare@23155 | 3 | 7 | 15 | 3 | 1 | 3 | abstain |
| 2 | Shakespeare@94289 | 6 | 7 | 19 | 6 | 1 | 2 | Shakespeare@94289 |
| 3 | Shakespeare@155044 | 5 | 8 | 17 | 5 | 1 | 3 | Shakespeare@155044 |
| 4 | Shakespeare@185066 | 4 | 5 | 15 | 4 | 1 | 2 | Shakespeare@185066 |
| 5 | Emerson@72152 | 4 | 5 | 16 | 4 | 1 | 2 | Emerson@72152 |
| 6 | Emerson@149430 | 1 | 1 | 12 | 1 | 1 | 1 | abstain |
| 7 | Emerson@222467 | 3 | 8 | 16 | 3 | 1 | 2 | Emerson@222467 |
| 8 | Emerson@296933 | 3 | 3 | 13 | 3 | 1 | 2 | Emerson@296933 |
| 9 | Gibran@2474 | 4 | 9 | 13 | 4 | 1 | 4 | abstain |
| 10 | Gibran@24554 | 4 | 7 | 17 | 4 | 1 | 3 | Gibran@24554 |
| 11 | Gibran@43835 | 2 | 5 | 12 | 2 | 1 | 2 | abstain |
| 12 | Gibran@59247 | 6 | 10 | 21 | 6 | 2 | 4 | abstain |

### Matched independent-mask nulls

Independent random placement of the same F count, rather than encrypting the same borrowed donor with a different pad (which would preserve the F witness).

| Null | True source | True Fs | Visible Fs | Compatible | Best Fs | Best ties | Null max | Selected |
|---:|---|---:|---:|---:|---:|---:|---:|---|
| 1 | independent mask | — | 7 | 13 | 1 | 2 | 3 | abstain |
| 2 | independent mask | — | 7 | 17 | 2 | 1 | 2 | abstain |
| 3 | independent mask | — | 8 | 17 | 2 | 1 | 3 | abstain |
| 4 | independent mask | — | 5 | 15 | 1 | 4 | 2 | abstain |
| 5 | independent mask | — | 5 | 16 | 2 | 2 | 2 | abstain |
| 6 | independent mask | — | 1 | 12 | 1 | 1 | 1 | abstain |
| 7 | independent mask | — | 8 | 14 | 1 | 3 | 3 | abstain |
| 8 | independent mask | — | 3 | 12 | 1 | 1 | 2 | abstain |
| 9 | independent mask | — | 9 | 17 | 2 | 1 | 3 | abstain |
| 10 | independent mask | — | 7 | 16 | 1 | 5 | 3 | abstain |
| 11 | independent mask | — | 5 | 18 | 2 | 1 | 2 | abstain |
| 12 | independent mask | — | 10 | 19 | 2 | 1 | 3 | abstain |

## Consequence

The selected rule fails the frozen sensitivity/specificity gate even with only three existing reference texts. Under the fixed rule, enlarging the placement universe cannot improve sensitivity for these controls. Do not scan the original quote, relax the threshold or infer a shift stream from a coincidental match. A different source-selected clue, longer authentic framing or another invariant could motivate a genuinely independent retrieval experiment. These finite counts cannot decide whether LP2 contains a quotation, or whether transparent F is its cipher. No source attribution, key or original plaintext is claimed.

Reproduction: `node sims/lp2_fsupport_quote_alignment_subset_sft.cjs`; [raw data](lp2-fsupport-quote-alignment-subset.json). Executed with connected V8 against repository sources; independent CI replay not claimed.
