# EA-feedback original-cipher language and word-reversal gate

**Classification:** bounded source-language test of an unverified reversible mechanism; original ciphertext tested, no LP2 plaintext or author-selected key recovered. Agent 5, 13 November 2026.

## Decision and why it matters

The canonical unknown LP2 cipher has **86 equal neighboring runes** across **12,901 within-page transitions**, of which **23** fall at printed word starts. A fully reversible GF(29) ciphertext-feedback rule proposed in [the existing original gate](lp2-gf29-multiplicative-feedback-original-gate.md) has a concrete cryptanalytic consequence:

```text
C_i = (C_(i-1) + K_i * (P_i + 1)) mod 29,  K_i in {1,...,28}
C_i == C_(i-1)  iff  P_i == 28 (EA)
```

This *hypothesis* would recover one authentic plaintext symbol at each of the 86 observed equal steps **without knowledge of the key**. The previous English-only calculation found the correct scale for total EA frequency (81.513 expected), but only 5.445 eligible EA word starts versus the observed 23. Two independent explanations deserve a tightly controlled check: the original runic register could be Old English or Latin, and the plaintext might undergo a *whole-word reversal* before feedback. Old English uses the EA diphthong as a natural orthographic symbol; Latin uses EA in independent words and inflections. Word reversal is a familiar historically simple operation. Neither is an authenticated LP2 instruction.

## Fixed original-cipher test

Reproducer: [`sims/lp2_ea_language_reversal_original_sft.cjs`](../sims/lp2_ea_language_reversal_original_sft.cjs). It passed [original GitHub Actions CI run 43486521807](https://github.com/FlareZ123/liber-primus/actions/runs/43486521807) and the expanded [all-29-marker CI run 43488629904](https://github.com/FlareZ123/liber-primus/actions/runs/43488629904). The nine-source-visual-chapter extension passes [CI run 43491025145](https://github.com/FlareZ123/liber-primus/actions/runs/43491025145) on unchanged original input and pinned controls. It reads the source-original 29-index corpus and original transcription, keeps source words intact across wrapped lines and page joins, and **resets only the consecutive-pair observation at physical page changes**. A printed word can therefore contain an unscored position at a page turn. It asserts **12,956 runes; 2,896 words; 86 equal steps; 23 equal steps at word starts; 85 words bearing equal steps**.

Before examining the original masks, it fixes three separate native-GP source references already held in `resources/control/`:

- **Modern English:** 29,058 distinct encodable TextBlob GP29 wordforms with original corpus occurrence weights; the spelling contract uses ING and IO folding.
- **Latin:** 39,835 source-pinned Vulgate New Testament GP29 word tokens, retaining observed source frequency. The complete-language identity of LP2 is not assumed.
- **Old English:** the **corrected** source-pinned 10,885-word Beowulf GP29 encoding (`beowulf_oe_gp_profile_corrected.json`, 48,012 GP runes). The superseded incorrectly normalized Beowulf profile is expressly excluded.

For each original word length and the exact set of positions where a cipher predecessor exists, the SFT evaluates the empirical source-language expectation of plaintext EA at every eligible position and at the word start, under both source word orders. It checks all original repeat-bearing word masks against the corresponding full fixed control lexicon. The source words are never fitted or reweighted to the original repeats. Variances assume independent word draws conditional on the manuscript's printed word lengths.

| Control register | Source word order | Expected repeat total (±SD) | Expected word-start repeats (±SD) | Original repeat-bearing word masks absent from fixed source |
|---|---|---:|---:|---:|
| Modern English | Forward | 81.513 ± 8.86 | 5.445 ± 2.33 | 5 / 85 |
| Modern English | **Reversed** | 81.49 ± 8.86 | 1.51 ± 1.23 | 4 / 85 |
| Latin Vulgate | Forward | 26.74 ± 5.08 | 11.49 ± 3.27 | 36 / 85 |
| Latin Vulgate | **Reversed** | 26.72 ± 5.08 | 11.38 ± 3.25 | 38 / 85 |
| Old English Beowulf | Forward | 260.19 ± 15.08 | 48.75 ± 6.78 | 11 / 85 |
| Old English Beowulf | **Reversed** | 260.05 ± 15.08 | 19.65 ± 4.17 | 14 / 85 |
| **Original LP2** | Observed ciphertext | **86** | **23** | Not applicable |

The corrected Beowulf reference has no word of GP length 14, so **three original length-14 words with no repeat events have no Old English source control** and are excluded from its expectation. No masked original word is unscored. The English forward baseline exactly reproduces the previous independent GP29 TextBlob estimate. English word reversal makes the word-initial discrepancy *worse*. Reversed Old English brings the expected start count close to the observed 23, but predicts approximately **three times** the observed repeat total. Latin has too few EA occurrences overall. The original p27 length-12 repeat-bearing mask `000001000001` is absent even under the forward and reverse checks for **all three finite source corpora**. This is a lexical-coverage diagnostic, not a mathematical exclusion of an unknown coined or compound word.

**A stronger word-level consequence:** in the modern-English *forward* model, seven exact observed repeat masks admit **one** source-dictionary GP wordform each. Four independent printed original words (on physical pp8, 16, 19, 23) would all have to be the rare word **OSSEA** (GP pattern length 4, final EA), and three (p1 and two on p44) would all have to be **PURPUREA** (length 7, final EA). These seven are conditional **forced-source-lexicon candidates**, not recovered plaintext; an unlisted compound or a different input representation could avoid them. They illustrate why fitting the aggregate total of 86 repeats does not establish an English-plaintext decipherment. The SFT asserts the exact four/three singleton counts and prints all seven source-word positions.

An exact synthetic positive control enciphers GP-native `EACH` (index sequence `[28,5,8]`) using nonzero multipliers `[2,3,5]` and initial feedback 17; the first ciphertext output repeats 17, and the strict GF29 inverse recovers **3/3 original plaintext symbols**. This validates the hypothesized equality identity, rather than the existence of the model in LP2.

## Alternative source symbol for the zero-step event

An independent objection to the distinguished GP index28/EA marker is that a different 29-letter source symbol might generate the exceptional zero step. The extended **same original-CI SFT** therefore grants all 29 possible fixed plaintext symbols as the zero-step marker *for each of the three native-GP source corpora*, with no fitted key, word, or phase. Within each exact original word-length/eligible-position class, it computes frequency-weighted expected total and word-start events, their joint covariance, and a two-dimensional Mahalanobis deviation from original **[86,23]**. All 29 candidates per language are included; the reported winner is selected *after* comparing the original counts.

| Source register | Best zero-step plaintext symbol of 29 | Expected repeat total | Expected word-start repeats | Joint standardized distance |
| --- | --- | ---: | ---: | ---: |
| English | G | 146.001 | 52.316 | 5.237 |
| Latin | G | 119.278 | 19.999 | 3.713 |
| Corrected Beowulf | AE | 140.434 | 29.106 | 4.841 |

This new result shows why treating rare original zero steps as *plaintext EA* is especially restrictive. A hypothetical Latin **G** exception is the nearest of these 87 finite source comparisons, yet still misses the original total count by **33.278 symbols** and is not selected by any historical author instruction. The English G control reproduces Agent4's previously reported 146/52.32 and joint z≈5.24 exactly. Rankings are conditional descriptive fits on an externally chosen set of source languages; they are not p-values for cipher identification. Even a better count fit would need an explicit source key/clock and predicted plaintext, so do not promote the winner into a decryption key.

## What changes when the creator used a different cipher in each visual chapter?

The global native-English EA-feedback discrepancy is **not** an all-chapters-at-once exclusion if separate visual chapters use distinct ciphers. The exact nine chapter divisions visible in original manuscript images (see the [original image atlas](../im-results/lp2-global-original-visual-section-map.md)) permit a stronger focused decision using the same locked source-language reference. Each printed word is assigned to its beginning physical page; same-page repeat events are counted without inventing ciphertext or missing key material.

| Original visual chapter | Original equal steps: total/start | Expected source-English EA: total/start | Exact original EA masks absent from native-English word reference |
| --- | ---: | ---: | ---: |
| pp0–2 | 4 / 2 | 4.26 / 0.27 | 0 |
| pp3–7 | 6 / 2 | 7.48 / 0.51 | 1 |
| pp8–14 | 9 / 2 | 10.87 / 0.73 | 1 |
| **pp15–22** | **10 / 0** | **12.011 / 0.797** | **0** |
| pp23–26 | 11 / 2 | 6.51 / 0.42 | 1 |
| pp27–32 | 13 / 5 | 8.97 / 0.61 | 2 |
| pp33–39 | 12 / 4 | 10.46 / 0.71 | 0 |
| pp40–53 | 20 / 6 | 20.53 / 1.38 | 0 |
| pp54–55 | 1 / 0 | 0.42 / 0.02 | 0 |

The **pp15–22 Fibonacci-square chapter** has 437 original printed words and 10 genuine equal-pair events; **no** marker occurs at a word start, while the reference predicts ~0.8. All ten repeated-rune sites admit a compatible EA location in the fixed English corpus. Thus this **specific chapter remains conditionally compatible** with the simple EA-encoded-exception model, unlike the strongest full-book word-start disagreement. The source-visible p15 Fibonacci/prime square offers an independently identifiable number generator in that same chapter. This narrows a possible intended human route to a *chapter-specific source-derived GF29 multiplier and feedback-state rule*. It does not provide the actual multiplier clock, initial state, or word rotation. The p54–55 comparison is far too small to select a mechanism. Do not infer decrypted EA letters from chapter-level compatibility alone.

## Research decision

Under the *specified* one-symbol-EA feedback architecture, **neither alternate native register nor whole-word reversal explains both independent manuscript observables**. These finite controls do not disprove GF29 ciphertext feedback with an additional source-selected transposition, changing word segmentation, an author-specific mixed register, or a different repeat-suppression architecture. A source-selected key, state/clock, or true plaintext anchor is still needed; do not infer 86 actual EA plaintext runes from ciphertext equality alone. No further ungrounded language variants should be fitted to these same two counts.

This report is an intermediate conditional gate, not an established LP2 decryption. The authoritative solution status remains [`results/README.md`](../results/README.md).
