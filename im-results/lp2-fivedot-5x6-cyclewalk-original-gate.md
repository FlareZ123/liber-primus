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

## Decision and next causal input

Retire these **four source-fixed, lossless 29-of-30 mixed-radix fractionation variants** as direct English inverses. Preserve the source-visible five-dot artwork and the 1005/3000 divisibility; neither selects a keyed 5×6 grid or explains how a 2014 player would apply cycle-walking. Other secret squares, different plaintext registers, altered segmentation, position-varying keys and layered mechanisms are outside the test.

An authentic source-supplied coordinate square, key or cross-page receiver is needed before another phase/key search is warranted. This finding provides a narrow exclusion rather than additional unknown plaintext.
