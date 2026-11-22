# LP2 ten-dot table flank: a two-unit 79-rune source bridge and unique page-start doublet

**Evidence class: exact original-source layout and a narrow, falsifiable clock clue; no plaintext/key.** This is an independent addition to the already established 158-rune pp49–51 rune-only clock bridge and the previously reported five-numbered-paragraph 553=7×79 enclosure. It does not prove that the original cipher uses 79-rune packets.

## Original-source geometry

Original scans `66.jpg`, `67.jpg`, and `68.jpg` display the 256-byte 32×8 base-60 table across physical pp49–51 in row counts **10,13,9**. An original red ten-dot stencil appears after all **66** runes on p49; p50 has no runes; p51 resumes with **92** runes. With **only GP runes counting** through the printed table, the exact 158-rune bridge is book offsets **[12,048,12,206)**, and the first post-table rune is **12,114**.

Two independent source-count identities are now explicit:

- **66 + 92 = 158 = 2×79**. The flanks are symmetric about 79: **66 = 79−13** and **92 = 79+13**. The numeral 79 already occurs as the eighth explicitly derived Fibonacci-indexed prime in the p15 spiral, and the separate p36–38 two-ten-dot enclosure has **553 = 7×79** runes. This makes 79 a previously documented candidate rather than a new integer selected solely from the p49/51 sum, although the **particular cross-artifact combination here was noticed retrospectively**.
- Across the **54 pairs of consecutive rune-bearing unsolved physical pages**, p49→p51 is the **only** pair whose combined runic length is divisible by 79. Among all **1,485 unordered** distinct rune-bearing page pairs, 17 have a combined length divisible by 79; the p49/p51 pair is the sole pair totaling 158.

A local two-packet clock beginning at the first rune on p49 would place packet 1 at compact **[0,79)** (all 66 p49 runes plus the first 13 p51 runes), and packet 2 at compact **[79,158)** (the remaining 79 p51 runes). The transition between those two packets falls **inside** p51's third printed word: its first three words have lengths **3,6,5** and the transition is after the fourth rune of that five-rune word (p51 local offset 13). That rules out treating this particular fixed 79-block cut as a visible word boundary. No observed stencil marks that exact cut.

## Table-continuation doublet

The first two rune glyphs following the 256-byte table, physical p51 offsets **0 and 1**, are **ᚹᚹ** (GP indices **7,7**). Original-image `68.jpg` visibly has these repeated initial glyphs. This is the **only** page-initial adjacent identical rune pair among all **55** unsolved rune-bearing pages. The combined 158-rune table flank has exactly **one** adjacent doublet, at compact offsets **66–67**: it is inside the first hypothetical 79-unit packet. Thus the direct no-repeat-per-packet 79-rune hypothesis fails here unless the decoder contains an independently specified escape or different coding state.

Across all **25** large-punctuation successor positions with two same-page runes available, augmented by the uniquely explicit p49→p51 nonrune-table continuation, **this is the only immediately succeeding two-rune doublet**. Other terminal punctuation marks do not have same-page successors and are excluded. The underlying corpus has **86** within-page adjacent identical pairs out of **12,901** adjacency opportunities; 63 are within complete canonical words and 23 cross adjacent words within sections, so the p51 prefix is one member of a nonzero exception set.

### How much weight does this carry?

An exhaustive assignment of the 55 observed rune-bearing page records to two ordered flank slots yields **34/2,970** ordered distinct pairs whose combined length is divisible by 79 and **1/2,970** satisfying that condition *and* a doubled prefix on the second page. This is **only a descriptive page-permutation comparison**: the 79-unit and doubled-prefix conjunction was recognized after the artifact was examined; arbitrary page permutations disregard book sections, physical width, punctuation placement and the actual table. These counts must not be represented as calibrated discovery probabilities. They are useful for locating the exact coincidence and testing a source-specified interpretation.

## Cryptanalytic decision

The authenticated solved-p56 cipher runs its prime-totient rune counter through a ten-dot mark and a nonrune 64-byte digest without consuming key steps. The new **2×79** count at the separate p49/51 256-byte table is compatible with a *provisional uninterrupted rune-only 79-clock across the grid*, while a reset exactly at p51 would not preserve that two-unit grouping. That is a concrete original-input layout prediction, **not an authenticated unknown-page cipher**.

The proposed 79-unit interpretation has two immediate costs: its first packet contains the p51 `ᚹᚹ` doublet, and its internal [79,158) split cuts a printed word. A proposed actual inverse must therefore preserve both symbols, state how it treats spaces, specify the source-derived key/table traversal before decryption, and produce original plaintext across **both** packet spans under both a continuous-vs-reset comparison. A decoder that simply drops the doubled rune or silently shifts the split cannot qualify as a lossless inverse.

**Reproduce:** `node sims/lp2_tendot_79_flank_sft.cjs` reads the original normalized corpus, colour/marker annotations, original transcription and 256-byte grid, asserts every count, and prints the exact coordinates. The established independent 158-rune source coordinate map is `sims/lp2_tendot_binary_bridge_sft.cjs`; the solved-p56 positive control is `sims/lp2_punctuation_solved_clock_sft.cjs`.

**Status:** source-level crosslink and an obstacle for simplistic fixed 79 packets, with no recovered original plaintext, key, mechanism, or destination.