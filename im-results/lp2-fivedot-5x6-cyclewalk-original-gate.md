# Complete 29-of-30, 5×6 five-dot fractionation inverse on original LP2

**Agent 13, 15 November 2026. Conditional original-cipher negative. No recovered unknown LP2 plaintext, original author-selected key, or final destination.**

## Human-visible rationale and competitor

The original p23–26 section carries five black dots at p23, a 16-GP-rune red heading and a total of **1,021 runes**; excluding that heading gives exactly **1,005 body runes = 201 groups of five**. Separately, the p40–53 floral section contains two five-berry groups, an eight-rune initial red heading and **3,000 body runes = 600 groups of five**. These physical boundaries and illustrations are established in [the source atlas](lp2-five-dot-chapter-body-quintet-source-gate.md). Because Gematria Primus contains **29 runes**, a 5×6 coordinate rectangle admits its entire alphabet with one spare cell.

A 5×5 classical Bifid with four transparent runes was previously examined under arbitrary secret alphabet squares in [the all-secret source gate](lp2-bifid25-allsecret-period2-exclusion.md); deterministic 3-/5-block GP27 Trifid has another independent existing exclusion [here](lp2-trifid27-allsecret-original-block-collision-gate.md). The present candidate is a distinct **mixed-radix 5×6 complete bijection**, allowing all 29 GP runes to participate in five-position fractionation without a transparent symbol. The five-dot image does not say to do this, and standard Bifid uses a *square*. It remains one authorially unconfirmed but economically specified operation.

## Full inverse, including the otherwise invalid cell

Assign each of GP indices 0..28 to one of the first 29 cells in row-major or column-major order of a 5×6 rectangle. Leave cell29 unused. In a block of five symbols, write the five rows (each 0..4) as a **five-digit base5 integer R**, and the five columns (each 0..5) as a **five-digit base6 integer C**. Compute

`v = 7776 R + C`,

then write v as **five base30 digits**. This is a mathematically exact permutation on the entire **30^5** block space, since its inverse separates R and C and reconstructs each row-column cell. To restrict it to the original 29-of-30 source alphabet, iterate the permutation (or the inverse permutation) until none of the five resulting digits is 29. This **cycle-walking** always terminates for input in the subset and preserves exact one-to-one invertibility. It requires no silently discarded overflow or additional channel.

The only tested forks are **two canonical row/column board orders × two transform directions**. The original red heading fixes both source quintet phases; there is no trained permutation, selected key, alphabet tuning, shifted page phase or edited original rune.

## Original ciphertext results

The [read-only Node.js 22/CommonJS SFT](../sims/lp2_fivedot_5x6_cyclewalk_bifid_original_sft.cjs) reads the canonical 12,956-rune original LP2 corpus, checks both exact heading/body lengths, decodes all 4,005 original body positions four times each, and re-encrypts every output exactly to its original ciphertext. The four inverse candidates give:

| Canonical coordinate fold | p23–26 body, 1,005 runes: IoC | p40–53 body, 3,000 runes: IoC |
| --- | ---: | ---: |
| Row-major inverse | **0.034285** | 0.034449 |
| Row-major forward | **0.034469** | 0.034419 |
| Column-major inverse | **0.034889** | 0.034472 |
| Column-major forward | **0.034362** | 0.034506 |

The unchanged original body values are 0.034305 and 0.034544 respectively. All candidates remain approximately uniform (1/29 = 0.034483). Native GP29 English controls independently drawn as contiguous source-length spans from Shakespeare, Gibran and Emerson, calibrated to the authentic solved **ING** and **IO** rune spellings, all have **IoC above 0.05** at both target lengths. Every source-native control tested also survives all four forward/inverse cycles and recovers its complete original plaintext, with no missing-value exceptions. The SFT prints the exact source-window counts and minimum English IoCs; this is a **language-register conditional** discriminator, not an unconditional proof that the unknown language must be modern English.

No variant reveals native English or a recognizable plaintext-bearing register on the 201 five-dot quintets or the 600 independent floral quintets. Original reencryption proves the candidate is implemented correctly; it does not prove historical use.

## Stronger natural option: the thirtieth cell is a word separator

The spare cell in a 5×6 board could be **SPACE**, giving 29 GP glyphs + one explicit separator as 30 direct plaintext/ciphertext symbols. This is a more human-plausible possibility than introducing cycle-walking, and, if used, it would permit a full reversible block fractionation to change the locations of printed word breaks. It directly addresses the LP2 singleton-word puzzle. The source remains permissive, however: neither the five-dot art nor an original Cicada instruction states that space should be the thirtieth symbol or that separators participate in the cipher.

The p23–26 1,005-rune chapter body has **220 complete source-printed words**, with no partial cross-boundary word at the red 16-rune heading cut. Interleave the original 220 GP words with the literal symbol29 and give its final chapter-closing punctuation one terminal separator. The resulting **1,225 = 245×5** unit stream fits exact five-site fractionation, with all 29 runes and the SPACE cell represented. Crucially, the cipher here is the full mixed-radix coordinate permutation on **all 30^5 states**. It requires **no cycle-walking**. The 30th cell as space and one ending delimiter are declared hypotheses, rather than historical instructions.

| Original p23–26 full30 five-rune inverse | Decoded literal SPACE cells | Longest decoded GP-only word | Decoded words ≥40 runes |
| --- | ---: | ---: | ---: |
| Row-major inverse | **53** | 88 | 7 |
| Row-major forward | **71** | 94 | 5 |
| Column-major inverse | **59** | 81 | 8 |
| Column-major forward | **61** | 72 | 11 |

In all variants 1,225 original source units round-trip exactly. Original printed text contains **220 separated words, maximum 14 GP runes per word**, whereas the four inverses imply 54–71 GP word runs of mean **16–22 runes**, with many implausibly long 40–94 rune runs. That is a direct grammar obstruction under ordinary word-spaced GP English, even allowing encrypted spaces to move. On planted source-native English words with the *same original word lengths* and one separator per word, every full30 inverse recovers the complete **1,225-symbol** plaintext and spaces. The forward plant's output separator counts, printed by the [reproducer](../sims/lp2_fivedot_space30_wordshift_original_sft.cjs), provide a matched positive contrast rather than a general proof about every possible plaintext register.

The original printed source could in principle encode a non-English, compressed, or already encrypted intermediate; the test excludes only this precise canonical full30 direct transformation. Since the four direct inverses give no coherent original plaintext, **a new original key selector or different typed operation is still required**. Preserving spaces as a literal thirtieth cell introduces a distinct, more realistic hypothesis than discarding a forbidden cell, so future work should not conflate these two exclusions.

## The original 2013 poster as a candidate 30-cell board (Agent20, 15 November)

The actual 2013 Gematria Primus reference drawing, recovered during the historical 2013 Twitter/audio XOR stage, lists **15 GP symbols in its left table and 14 in its right**, leaving a visible empty position opposite the fifteenth left row. Each table has three *attribute* columns (rune, transliteration, prime); those are not three additional symbol positions. The original illustration is therefore naturally a **15×2 symbol arrangement with one blank**. A historically documented 2014 *solver-devised* rearrangement stacked the left and right alphabet columns into a 29-long list and reversed position for the known LP1 WARNING; it is evidence of a valid contemporary table manipulation, **not an authenticated instruction from the creator to fold a 5×6 board**. Historical illustration and distinction: [2014 participant walkthrough](https://embeddedsw.net/doc/Openpuff_for_experts_Cicada_3301_recruitment_puzzle_2014.pdf), [2013 image as circulated](https://uncovering-cicada.wikia.com/wiki/ONION_2_with_3_JPGs,_3_outguesses,_RUNES_and_PGP_signed_CIPHERTEXT_IN_5_GRAMS).

A single affordable original-input conditional test uses the most literal **row-preserving** fold: take each consecutive three source table rows, read left-to-right, and place the six cells in one row of a 5×6 rectangle. In GP index order the resulting board is

`0 15 1 16 2 17 / 3 18 4 19 5 20 / 6 21 7 22 8 23 / 9 24 10 25 11 26 / 12 27 13 28 14 SPACE`.

No symbol mapping, cell position or row order is scored against the original manuscript. This board is structurally different from the two canonical 5×6 orders tested above. Preserve p23's original 16-rune red heading and the subsequent 1,005 GP runes. Insert one explicit 30th-symbol SPACE after each of the 220 printed body words (including the terminal stop), giving 1,225 source symbols, exactly 245 five-symbol groups. Apply precisely the existing full-30 **mixed-radix Bifid fold** under each of its two inverse directions, keeping that chart order fixed.

| Source-chart 5×6 original-input read | Decoded SPACE symbols | Max decoded GP-only word | Words ≥40 runes | GP-only IoC |
| --- | ---: | ---: | ---: | ---: |
| Bifid inverse | **49** | **91** | **12** | **0.0346446664** |
| Bifid forward | **51** | **104** | **9** | **0.0353074790** |

The *actual printed input* has 220 words with maximum 14 runes. Each full 1,225-symbol candidate round-trips exactly under the opposite transform. Independently constructed source-native GP English controls with **ING/IO** spellings and the same authentic word-length geometry round-trip losslessly through both directions. The outputs retain nearly uniform symbol frequencies and long space-free runs; neither yields direct ordinary GP English. [Source-fixed CommonJS SFT](../sims/lp2_2013_gp_visual_fiveby6_source_sft.cjs) · [successful original-input manual CI 43668829655](https://github.com/FlareZ123/liber-primus/actions/runs/43668829655).

**Source-selector result:** the illustration itself selects 29 rune identities, their prime values, the 15+14 split and a bottom-right vacant table slot. It **does not select** grouping every three visible rows, a 5×6 coordinate board, the SPACE interpretation, a Bifid operation, one transform direction or the p23 recipient. Even a different visually plausible grouping of the same 15 rows would give a different keyed board. Thus the 2013 visual is a concrete *candidate key source* but cannot, by itself, supply the unique complete decoder required by Director #981. This conditional direct-original negative does not prohibit another source-chosen grid or a multi-layer register.

## Decision and next causal input

Retire the **four source-fixed, lossless 29-of-30 cycle-walked variants** and the **four full 29-plus-SPACE variants** as direct native-English inverses. Preserve the source-visible five-dot artwork and the 1005/3000 divisibility; neither selects a unique keyed 5×6 grid or explains how a 2014 player would apply cycle-walking. The one additional original-2013 source-row board fold also fails as a direct GP-English inverse, and the original chart does not specify its Bifid consumer. Other secret squares, different plaintext registers, altered segmentation, position-varying keys and layered mechanisms are outside the test.

An authentic source-supplied coordinate square, key or cross-page receiver is needed before another phase/key search is warranted. This finding provides a narrow exclusion rather than additional unknown plaintext.
