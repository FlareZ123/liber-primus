# The original p50 table cannot be a stationary cumulative-step GP29 alphabet

**Agent8, 15 November 2026. Classification:** original-ciphertext all-secret inverse obstruction, with direct source-key failure and independent 122-window language controls. No authenticated unknown-page plaintext, secret key, cipher or destination recovered.

## Source-selected solve path and its missing assumption

The 256 original p49–51 table tokens align at global manuscript phase zero with the rare adjacent-rune repetitions, particularly in the table cells whose printed first digit is 0. The independent [nine-chapter association](lp2-p50-raw-tableau-allsecret-gate.md) motivates testing a **feedback or running-sum cipher**, a materially different target from the previous direct GP29 substitution tests.

Let C be the original rune index and D its observable change from the previous published rune, modulo29. At the first rune of each physical page, preserve the published initial state. At every other original position i, take D_i=(C_i-C_(i-1)) mod29. The table cell selected is at **book-global pair-start index (i−1) modulo256**. Physical page leaders still consume global clock positions. This yields 12,901 original differences including 86 zero steps.

An executable source-key inverse is P_i=D_i−B_i (mod29) where B_i is the conditional base60 table byte modulo29; also test P_i=D_i+B_i. A stronger unknown-secret test permits *any independent permutation of all 29 rune identities* at each stationary selector value. Five selectors are fixed before inspection of the original plaintext:

- The exact **256** printed table phases, each with its own arbitrary secret codebook.
- The same phase with a **separate, arbitrary secret codebook in each of nine original illustrated chapters** (2,303 occupied phase-and-chapter alphabets). A chapter-local phase reset is only a one-to-one relabeling of the phase alphabet groups and gives the identical statistic.
- The **161** distinct conventional base60 byte values.
- The **29** byte residue classes modulo29.
- The **five** *literally printed first digits* (0,1,2,3,4), with no assumption about numerical radix.

For any fixed selector, arbitrary bijections preserve exactly which emitted differences are equal. Thus the same-selector pair-collision statistic is a **key-independent necessary condition** for recovering ordinary GP29 prose. For each selector value s and rune x, count n(s,x). The ratio of the sum over s,x of n(s,x)(n(s,x)−1) to the sum over s of n(s)(n(s)−1) is invariant under every possible secret alphabet, even when all 256 alphabets differ.

## Entire 56-page original result

All original runes are read from the canonical transcription, preserving the original 55 page leaders. Values shown are original same-selector equal pairs / original within-selector eligible pairs, using unordered pairs consistently in numerator and denominator.

| Stationary selector | Arbitrary hidden codebooks | Original pair counts | Original invariant Q |
| --- | ---: | ---: | ---: |
| 256 table phases | 256 | 11,355 / 318,683 | **0.035631019** |
| Nine chapters × 256 source phases | 2,303 occupied | 1,423 / 39,331 | **0.036180112** |
| Actual conditional base60 byte | 161 | 22,944 / 641,510 | **0.035765616** |
| Byte modulo29 | 29 | 120,638 / 3,399,829 | **0.035483549** |
| Literal printed first digit | 5 | 654,964 / 18,551,875 | **0.035304464** |

Use the original source-native GP29 orthography, including single-rune ING and IO, on pinned Shakespeare (33), Gibran (9), Emerson (49), and Latin Vulgate (31) source windows. Every window contains 12,956 native runes, with **the same 55 page-leader positions excluded**, leaving 12,901 candidate original-layout plaintext runes. A full source-native window is taken every 6,478 symbols, including the final available window.

Across **122 windows**, the *lowest* Q for each corresponding plaintext clock is:

| 256 phases | Nine chapter-specific phases | 161 bytes | 29 residues | Five printed digits |
| ---: | ---: | ---: | ---: | ---: |
| **0.056962562** | **0.057181358** | **0.057606273** | **0.057638781** | **0.057788283** |

Every original Q is below **all 122** matched-native window Q values. An independently unknown secret codebook per phase cannot raise it: this is an exact invariant. **None of these five stationary cumulative-step codebook families can explain the original ciphertext as ordinary native GP29 English/Latin** under the frozen clock and unchanged word alignment, regardless of all key choices. An evolving key/state, insertion and removal of symbols, a non-GP intermediate, a different language or another phase rule is outside this test.

The direct source-key inversion also fails. The p50 original canonical byte hash is **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**. Without fitting a phase, the direct D−B inverse yields GP29 IoC **0.034472743835**; D+B yields **0.034465557324**. Neither decodes original words. Both precisely re-encode the 12,901 original differences, which validates the algebra but supplies no genuine decryption.

## Exact positive control and research decision

For each of the five selector arrangements, the reproducer assigns seeded independent secret 29-symbol permutations to the selector values, with native GP EA (index28) mapped to **zero modular step**. The remaining 28 native plaintext symbols map bijectively to nonzero steps. This generates an ordinary source-native GP text encrypted as a cumulative cipher with an intentionally rare adjacent-repeat mechanism. The actual inverse recovers all **12,956** planted source-native runes, including the original page leaders, and the same-secret-key conditional Q is preserved **exactly**. Thus the original source's low doublet count does not conceal a genuine stationary GP29 language distribution from this test.

**Decision:** the existing printed-zero/doublet association survives as an intriguing clue; the proposed **stationary cumulative GP29 codebooks** are exhausted at the all-key level. An independently signaled state-change, skip convention or plaintext transformation is needed before any related key search can plausibly recover text. The source currently gives no original instruction selecting such a mechanism.

[Single-file CommonJS Node22 original and planted test](../sims/lp2_p50_step256_allsecret_cumulative_sft.cjs) · [Manual Windows workflow](../.github/workflows/lp2-p50-step256-allsecret-manual.yml). All inputs come from the repository's stable original corpus and pinned language controls.
