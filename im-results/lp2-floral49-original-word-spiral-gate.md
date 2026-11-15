# Floral 735-word register and the period-original 7×7 magic square

**Agent 9, 15 November 2026. Intermediate source-constrained negative.** The original floral-framed physical LP2 pp40–55 have exactly **735 complete printed words**, or **15×49**. This supplies a possible word-level interface to the actual 2014 7×7 Cicada magic square. We tested direct GP29 numeric shifts and a matching square-spiral word permutation against all **3,316** original floral ciphertext runes. **No unknown plaintext, authentic key, or author-selected inverse was recovered.** An apparently positive spiral word-length effect fails an independent language-model discriminator and does not consistently reproduce in the register halves.

## Why a solver might try this

The shared floral borders delimit physical pp40–55, with exactly 15 rune-bearing pages because p50 is a numeric field. The period-original file [`cicada2014-openpuff-magic-squares.txt`](../resources/cicada2014-openpuff-magic-squares.txt) contains a **7×7 numerical square**, independently recovered from a genuine 2014 OpenPuff carrier. Every row of this source square sums to **1,033**, and its center is **331**. A source-defined historical square can plausibly tell a solver to put words in a square or to use its numbers as an operand; p15 independently depicts a central clockwise outward numeral spiral. These are *independent visible sources*. They do **not** contain an authenticated instruction to break the later text into 49-word units or to select a word order or additive key.

The canonical original [runic transcription](../resources/lp2-transcription.txt), parsed as complete words across source line and page breaks, contains **2,896 words / 12,956 runes** on pp0–55. Within the floral frame, the source gives **735 words / 3,316 runes** exactly. The physical p40–53 and p54–55 chapter split divides these 735 words **669 + 66**, so the 49-word blocking crosses a *genuine visibly printed chapter boundary* after 32 words of a 49-word block. This is a substantial independent objection to the hypothesized authorial 7×7 word framing; 735=15×49 alone is not compelling instruction evidence.

## Frozen original-input consumer

The [standalone Windows-compatible CommonJS SFT](../sims/lp2_floral49_magic_square_word_spiral_sft.cjs) reads untouched original GP29 rune IDs, 2014 square and three pre-existing prose control files and checks complete 55-page word/rune counts. One no-secret numeric candidate takes square cell `i mod49` and adds/subtracts that integer modulo29 to **every glyph of the corresponding complete printed word**, including the genuine chapter-carry punctuation contract. It checks two square orientations: printed row-major and column-major. All 735 words are covered with no orphan cells, free phase, crib, offset, key optimization or state reset.

| Fixed source-derived GP29 transport | Output 3,316-rune IoC |
| --- | ---: |
| Original source, no transport | **0.034462827** |
| Square row-major, add mod29 | 0.034489572 |
| Square column-major, add mod29 | 0.034457368 |
| Square row-major, subtract mod29 | 0.034407516 |
| Square column-major, subtract mod29 | 0.034451910 |

The direct transports retain a GP29 distribution around uniform **1/29 = 0.034482759** with no readable original unknown passage. The genuine source gives no indication to alter word starts or consume a secret state, so none of those changes was introduced to rescue the negative.

A separate word-order candidate applies the **same central clockwise outward 7×7 spiral as the p15 numeral form**, locally to every one of fifteen 49-word blocks; inverse and plain 7×7 transpose are fixed controls. Since the word lengths remain unchanged, a native sequential-prose plaintext, if restored by permutation, should show ordered natural-language word-length dependence. For nine classes (lengths 1,…,8 and 9+), the adjacent-word mutual information (nats) is:

| Source-defined word reading | Adjacent length MI |
| --- | ---: |
| Original printed word order | **0.043472627** |
| 7×7 row/column transpose | 0.047957746 |
| Center-out clockwise spiral | 0.046771171 |
| Inverse central spiral | **0.067691541** |

The inverse reading has a tempting within-this-family increase. In **20,000** fixed-seed exact-word-length-inventory shuffles its own upper-tail is `156/20001 = 0.00780`; allowing either spiral orientation raises the within-family tail to `302/20001 = 0.01510`. This is explicitly **postselection-sensitive** because source-number configurations, visual alignments and other operations were explored in earlier LP2 research. Neither p-value is a globally calibrated significance of a designed cipher.

## Independent language falsifier

Crucially, the inverse-spiral improvement does **not** survive a second pre-existing, independent word-length grammar metric. Train a fixed first-order GP-native-English transition likelihood ratio on the *Gibran* and *Emerson* corpus lengths, including source-verified single-rune ING/IO conventions, then evaluate the same 735 source word lengths without fitting or changing the trained model.

| Original LP2 floral input | Independent English length-transition log ratio (nats/transition) |
| --- | ---: |
| Printed original order | **−0.041242379** |
| Forward central spiral | −0.048864004 |
| Inverse central spiral | −0.039956660 |

The inverse reading's **−0.039956660** is still **worse** than the independently reshuffled exact-inventory null mean **−0.036612245**. Over **10,000** separately seeded shuffles, inverse score upper-tail is `6586/10001 = 0.65853`; either spiral orientation selected after the test gives `8481/10001 = 0.84812`. As an authentic prose control, **75 untouched Shakespeare source windows** of 735 words each average **−0.006156963** in their true order and **−0.016285590** after the same inverse square transport. These source-prose controls indicate the hypothesized word permutation actually harms known native sequential prose.

An explicit exploratory **location-sensitivity check** also reveals instability: inverse MI on the first **343 words = 7 blocks** gives a within-subset shuffle upper-tail near **0.533**, while the last **392 words = 8 blocks** gives about **0.045**. Both samples are much smaller and the cut was inspected after the full effect, so the second tail cannot be upgraded to an independent discovery. With the legitimate chapter boundary cutting through a block, the previously attractive length-MI signal is insufficient to guide a decoder.

## Exact all-secret 7×7 value-class obstruction

The historical 7×7 square is **centrosymmetric** and has only **24 distinct integer values** among 49 cells. A much more generous cipher family gives each numeric value an *arbitrary secret 29-symbol bijection*, applying its alphabet to every rune of the corresponding whole word. Each occurrence of the same printed numeric value must preserve **all equality relationships** between its plaintext runes, regardless of which of the 29! alphabets was chosen. No GP key needs to be guessed for this test.

Two sharing scopes cover the apparent source-based consumer:

1. **Book-shared:** one arbitrary 29! substitution for each of 24 distinct square values, reused across all fifteen aligned 49-word blocks. Exact original equal-rune pairs are **16,308 / 479,830 eligible ordered rune pairs = 0.0339870371**.
2. **Fresh block keys:** entirely new independent alphabets for each of the 24 values in **each** of fifteen 49-word blocks, allowing 360 arbitrary complete 29-symbol bijections. Original within-group equal-rune pairs are **958 / 32,490 = 0.0294859957**.

The equal-pair counts are mathematically invariant under every secret key in the declared models. The all-original SFT also checks the invariance on an independently GP-English planted passage, under actual source-number shifts with and without a fresh secret per-block rotation.

For an original-word-length-exact positive-control comparison, draw one authentic GP-transcribed reference word independently for each of the **735 original length slots**, with source-native historical ligatures (`ING` as `NG`, and `IO` as `IA`). Perform **400 source-length-matched draws each** from three pinned English literary corpora, plus an independently sourced GP-native Latin Vulgate complete-word corpus, using frozen PRNG seeds and measuring the same source-indexed 24-value groups. No native words are chosen to fit the manuscript's glyphs. Results from **1,600** complete matched-register controls:

| GP-native source | Book-shared class collision rate, lowest / mean | Per-49-block fresh-key class collision rate, lowest / mean | Trials at or below original, either scope |
| --- | ---: | ---: | ---: |
| Gibran, 400 | 0.056157 / 0.059140 | 0.046784 / 0.051053 | **0/400** |
| Emerson, 400 | 0.057383 / 0.060214 | 0.047091 / 0.052308 | **0/400** |
| Shakespeare, 400 | 0.057095 / 0.059397 | 0.046845 / 0.052106 | **0/400** |
| **Latin Vulgate, 400** | **0.071446 / 0.074079** | **0.058356 / 0.062566** | **0/400** |
| **Unchanged LP2 floral ciphertext** | **0.033987** | **0.029486** | |

This is a **key-independent original-cipher incompatibility** for the specified native-English, preserved-word-boundary family. Granting separate completely secret bijections **every block**, while preserving only the source square's repeated-value equality constraints, still cannot reconcile the original coincidence deficit with any of the 1,200 matched controls. It does not prove English impossible under a changing-within-word alphabet, a changed plaintext register, ciphertext-dependent word breaks, or an arbitrary one-time pad. The source never explicitly instructs using the 2014 numbers as 2014 LP2 word-wise substitution classes.

The exact finite equality counts, independent class-wise arbitrary-substitution positive, all four reference control minima, and the earlier word-spiral results passed together in [successful Node22 original-input workflow **43728036974**](https://github.com/FlareZ123/liber-primus/actions/runs/43728036974).

## Decision and reuse

**Retire the exact direct square-number word shifts, center-out spiral word permutation, and every value-class GP29 bijection shared by a 49-word block or the entire floral section as source-native-English LP2 plaintext recovery routes.** The numerical `735=15×49` may remain a noteworthy cross-source alignment, but its causal hypothesis fails the genuine p54 text-boundary check and the independent language decoder-gate. Do not expand this into arbitrary square orientations, fitted phases, unrelated source texts, additional hand-tuned numeric parameters or a high-entropy key hunt without a first-party instruction selecting the recipient, operation and word count.

A materially useful reopening requires a dated Cicada-author instruction naming the **7×7 square** as an LP2 *word*-register tool, or an independently authenticated plaintext/known-key prediction that a frozen 49-word consumer reproduces on untouched original ciphertext. This report is a scoped bounded negative; [`results/README.md`](../results/README.md) continues to correctly record **all 56 unknown pages unsolved**.

**Reproduce:** `sims/lp2_floral49_magic_square_word_spiral_sft.cjs` runs as a read-only Node.js 22 program with no third-party dependencies; all original source assertions, deterministic shuffles and independent corpus scores passed in [GitHub Actions original-source run **43728036974**](https://github.com/FlareZ123/liber-primus/actions/runs/43728036974). The finite previously sampled first7/last8 sensitivity results were evaluated separately under the same clipping and original parser and do not change the decision.
