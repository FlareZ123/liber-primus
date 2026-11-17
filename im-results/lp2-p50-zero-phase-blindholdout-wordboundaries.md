# p50 leading-zero repeat signal: independent clock-selection and word-boundary gate

**Agent 28, 17 November 2026. Classification: source-original, bounded statistical experiment. No recovered plaintext, cipher operation, key or destination.**

## Upstream premise and actual decision

The original p49–51 numeric display contains 256 two-character cells, 60 beginning with literal zero. An earlier source-bound experiment, [the full p50-tableau report](lp2-p50-raw-tableau-allsecret-gate.md), noticed that under a continuous, unreset original rune clock, the positions indexed by these 60 cells include **33 of 86** equal-adjacent-rune events, although only **3,025 of 12,901** positions are eligible. That source-natural phase-zero association has a 2.033 ratio and was found during extensive exploratory analysis. No first-party instruction names such a clock or uses the table to decrypt the runes.

The causal question here is narrower: **could the ciphertext's rare repeat events independently select the correct 256-cell clock?** If so, the table would supply an identifiable numerical state even before the missing plaintext key was known. A distinct objection is that the association could arise from original word boundaries rather than from a global stateful cipher.

The independent input is unchanged physical p0–55 original GP29 ciphertext, with no comparison across page breaks, the printed p50 tokens, and the authentic word/line punctuation from the canonical transcription. The reproducible [CommonJS SFT](../sims/lp2_p50_zero_phase_holdout_original_sft.cjs) asserts all 12,956 rune identities against the textual source. It reads the physically printed **first numeral**, so the candidate does not depend on the disputed base59/base60 conversion.

## Source-locked two-part test

The manuscript's nine visible art chapters give a non-keyed split: chapters p0–2, p3–7, p8–14, p15–22 as the **first four** and p23–26, p27–32, p33–39, p40–53, p54–55 as the **remaining five**. They contain 5,483 and 7,418 adjacent original within-page opportunities respectively. The first half contains 29 repeat events; the latter contains 57.

At the original source-natural phase zero:

| Original register | Repeats in zero-leading cells | Zero-leading opportunities | Repeats outside | Outside opportunities | Repeat-rate ratio |
| --- | ---: | ---: | ---: | ---: | ---: |
| First four chapters | **12** | 1,285 | 17 | 4,198 | **2.3061** |
| Last five chapters | **21** | 1,740 | 36 | 5,678 | **1.9035** |
| Entire source | **33** | 3,025 | 53 | 9,876 | **2.0328** |

The original phase preserves a positive excess in both chronological groups. This is a same-input split introduced after the original full-book association was recognized, so these halves are **not new independent confirmations or prospective statistical trials**. They do suggest that one art chapter alone does not account for the observed full-book excess.

To test the recoverability of the clock without privileging phase zero, the SFT scores **all 256 phase shifts using only the first four chapters**. Its fixed score is the positive standardized hypergeometric repeat-site excess, with the positions and original 60-cell zero mask fixed. The highest training phase is **152**, at **15/29** repeat events in zero-leading cells, rate ratio **3.4967** and standard score **3.6022**. On the untouched remaining five chapters, that blind selected phase gives **15/57**, ratio **1.1663**, score **0.5139**. The source-natural phase **0 ranks tenth of 256 on training**, with score **2.2870**, though its later score is **2.3941**. Blind repeat-site enrichment therefore **does not identify** the original table's physical clock under this two-part decision. This is a diagnostic of clock inference with few repeat events. It cannot exclude a true author-selected phase-zero guard if that guard was instructed separately.

## Word and line boundary objection

For the same source-natural phase zero, classify every adjacent within-page comparison by whether its intervening literal transcription crosses a printed word or line boundary. Both major subsets retain the leading-zero association:

| Original typography | Repeat events in zero-leading cells | Zero-leading eligible positions | All repeat events | All eligible positions | Relative repeat rate |
| --- | ---: | ---: | ---: | ---: | ---: |
| Within word, same line | **22** | 2,278 | 60 | 9,640 | **1.8710** |
| Across words, same line | **10** | 635 | 22 | 2,722 | **2.7388** |
| Within word, line break | 1 | 71 | 3 | 388 | **2.2324** |
| Across words, line break | 0 | 41 | 1 | 151 | 0 |

The two line-breaking cells contain too few events for inference. In the two well-populated conditions, the signal remains in the same direction. Plain word-gap placement alone therefore does not explain away the phase-zero excess. Again, these are partitions of the earlier same 86 events, without new experimental independence.

## Cryptanalytic consequence

The table's literal zero class is an unexplained statistical association with adjacent-equal events, not a standalone key or source-defined reverse transform. **53/86** original equality events fall outside the selected class, so that class cannot be an exclusive “repeat allowed” opcode. The full five-numeral-class × GP-difference test was already flat aside from zero differences in the prior report. This experiment adds two decision-relevant limits:

1. A solver **given only the original repeat stream** does not recover the physically natural phase under this chapter split; exploratory best-phase search overfits the first four chapters.
2. The numeric association persists on ordinary within-word and across-word positions, leaving a possible stateful collision-rate gate unresolved without any necessary word-gap artifact.

The next necessary input is a **creator-authenticated command** selecting the global table clock, a particular digit/byte guard, and a lossless inverse including its key. A method producing a fully coherent unknown page with independent re-encryption would supersede this statistical gate. Re-optimizing phases, masks or reading order on the same 86 events would not advance that requirement.

**Reproduction:** `node sims/lp2_p50_zero_phase_holdout_original_sft.cjs`, Node.js 22 CommonJS, read-only and Windows-compatible. The assertion set fixes every rune, page gap, mask exposure, chapter split, 256-phase training winner and boundary totals.
