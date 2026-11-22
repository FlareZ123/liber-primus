# Provisional cuneiform row-and-column instruction: an `UR` pointer

**Agent19, 22 November 2026. Classification: conditional original-source interpretation, unverified; no unknown LP2 plaintext or authentic key.** This note keeps a promising clue-driven extraction separate from the `results/` record. The first original, independently frozen numerical interpretation retrieves literal **U R**, a geographically relevant name to an ancient cuneiform text, but **the grid origin and exclusion of one GP value are not instructed in the artwork**. Direct use as a conventional Cicada cipher key fails on the original independent numbered items.

## Human-visible route and exact source coordinates

The repeated artifact on original physical LP2 pages 33–39 is the *same* two-row cuneiform numeral design. Its conventional sexagesimal readings are `17×60+13=1033` and `55×60+1=3301`. The seven physical pages containing that artistic motif have exact GP29 rune counts **[214,261,271,238,228,228,240]**. They sum to **1,680 = 60×28**, where the two dimensions have independent source anchors:

- **60** is the cuneiform script's number base and the permitted leading-digit range;
- **28** is the number of nonzero states in GP29, `29−1`, the multiplicative group order and the non-F rune count in the known GP cipher convention.

A player could therefore *hypothesize* arranging all seven complete pages, in publication/rune order, into **60 rows of 28 runes**. Each printed sexagesimal pair supplies a row and a column with no fitted indices. Both observed low digits 13 and1 fall inside the 28-column dimension, and both high digits 17 and55 fall inside the 60-row dimension. Treat the pairs as **one-based printed row/column coordinates**:

| Original inscription | GP29 tableau cell (row, col), one-based | Zero-based stream index | Original physical position | Exact original rune |
| --- | --- | --- | --- | --- |
| 1033, written (17,13) | (17,13) | 460 | p34, offset246 | **ᚢ = U** |
| 3301, written (55,1) | (55,1) | 1512 | p39, offset72 | **ᚱ = R** |

This produces **UR**, an ancient Mesopotamian city whose early written culture used cuneiform. A potential second clue is the pre-2014-known **Code of Ur-Nammu**: its first modern fragment, translated in 1952, preserved a prologue and **five identifiable laws**. The five numbered paragraphs on original pages36–38 make the historical source a naturally distinct candidate to investigate, though any semantic connection is unverified. For independent historical context see [Code of Ur-Nammu's discovery and surviving clauses](https://en.wikipedia.org/wiki/Code_of_Ur-Nammu), and the primary research bibliography cited there. Source paragraph word profiles are [30,20,25,19,28](../im-results/lp2-pp36-38-numbered-aphorism-crib-gate.md), while the commonly reproduced first five short law renderings have much shorter item word counts; **they are not the numbered paragraph plaintext under a verbatim word-preserving reading**.

**Later author-era meta-hint.** The [independently archived and signature-verified January 2016 Cicada message](../resources/cicada2016-4gq25.md) describes LP's words as a map and its numbers as a direction. That is historically relevant to considering a *number-directed* lookup, but was **not available to a May 2014 solver**, does not supply this grid's dimensions or indexing rule, and literally says **words** rather than the uninterrupted **runes** used here. Its specific warning to verify against false paths reinforces the provisional status; it cannot authenticate the two-letter output by itself.

## Immediate challenges and separate controls

**The strongest objection:** the cuneiform image begins *inside* physical p33, after an already-marked 91-rune prefix. The original's genuine typographic section starts at p33 offset91 and has 1,589 GP runes, **not 1,680**. Using the *whole seven-page visual block* is a legitimate but noncompulsory window choice. Likewise one-based rows and `28=29−1` are reasonable conventions, but the author did not write `60×28`, `UR`, or `Ur-Nammu` next to the cuneiform.

**Competing address conventions** using the same high and low digit values, GP29 data, grid shape and original source:

| Base convention | Rune output |
| --- | --- |
| Row0 / column0 | `IL` |
| Row0 / column1 | `AEOE` |
| Row1 / column0 | `OEG` |
| Row1 / column1 | **`UR`** |

The exact one-based `UR` output is **unique among 44** seven-consecutive-physical-page windows across LP2 whose lengths can contain both cell indices. This checks the exact source word pair against independently different source positions. It is **descriptive**, because the reading convention, semantic interpretation and attractive output were selected together. It is **not** a one-in-44 probability of authorship or a decisive proof of a key.

## Decisive original-cipher test of the most economical key hypothesis

Two source-directed key strings deserve a one-shot frozen test before the UR hypothesis recruits more speculative operations: `UR` itself (GP29 indices `[1,4]`) and the independently suggested proper name `URNAMMU` (indices `[1,4,9,24,19,19,1]`). Apply each as a repeating GP29 additive shift to the **complete original numbered item1 (139 runes)** and an independent **numbered item2 (91 runes)** with both historically used arithmetic directions, and also use the **exact p56 original plaintext-F-transparent** variant (literal F, no keystream consumption, *all* ciphertext-F branches enumerated rather than guessed).

The ordinary repeated-shift inverses give uniform-like normalized index-of-coincidence on the first item: `UR` **0.032739** under either sign, `URNAMMU` **0.031696 / 0.033469** under the two signs. The independent second item remains similarly cipher-like (`UR` **0.038828/0.040293**; `URNAMMU` **0.032723/0.037118**). No candidate yields native readable language.

The authentic F-transparent keys are **strictly impossible for the first complete original numbered item** because no allowed plaintext-F bypass/nonbypass history reaches its end. Under the `C = P + sign×K` convention, exhaustive first failure offsets (zero-based) are:

| Literal candidate key | sign = −1 | sign = +1 |
| --- | --- | --- |
| `UR` | position5 | position43 |
| `URNAMMU` | position6 | position40 |

The SFT plants both candidate keys on a complete 139-GP-rune source-native solved control with the **actual F transparency and no-advance rule**, then asserts that the identical inverse maintains at least one legal decryption throughout. This protects the original negative against a decoder that simply rejects all F-transparent inputs.

## Research decision

**Carry `UR` as a provisional, source-motivated address interpretation only.** It gives a potential historical search selector, particularly the 2011-accessible (pre-2014) editions of the Code of Ur-Nammu, but it does **not** yet deliver a cipher operation, validated plaintext, independent downstream prediction or author-authenticated pointer. Both low-complexity direct GP repeated-key consumers of the chosen word and its most obvious historic completion fail. Avoid fitting extra key operations to rescue the output.

A future stronger test would require an independently attested author-era reference or instruction choosing the 60×28 full-page register and one-based addressing, or a **frozen, complete original item1 decipherment** based on a source-derived text from Ur followed by genuine item2 prediction. The five-legal-maxim verbal match alone is insufficient.

**Read-only original-source reproducer:** [Node22 CommonJS SFT](../sims/lp2_cuneiform_60x28_ur_pointer_original_sft.cjs), [successful Windows CI](https://github.com/FlareZ123/liber-primus/actions/runs/45051997459). It asserts all original source counts, both exact cell glyphs/coordinates, the rival coordinate conventions, all 44 comparable windows, all five original receivers, both named keys under both signs, p56-F branch completeness, and native fully encrypted planted positives.
