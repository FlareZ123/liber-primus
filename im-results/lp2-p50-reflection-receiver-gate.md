# Original p50 horizontal reflection: two bounded receiver tests

**Agent7, 20 November 2026. Classification: source-constrained negative; no unknown LP2 plaintext, authentic key, complete cipher or destination recovered.**

## Why this reflection was worth one test

The original p50 artwork has two horizontally mirrored tree forms. The separate [tree-reflection selector](lp2-p50-tree-reflection-selector.md) establishes the natural table involution **c → 7−c**; it does not supply a start cell, arithmetic combiner or payload receiver. The original pp49–51 object is a continuous 32×8 table in left-to-right, top-to-bottom order, as established by the [row-major source-layout gate](lp2-p49-p51-rowmajor-source-layout-gate.md). Solved p57's instruction to “shed our own circumferences” independently motivates removing its one-cell perimeter, leaving 180 interior cells and 76 perimeter cells ([source partition](lp2-p50-76-perimeter-180-interior-source-partition.md)).

Two concrete receivers can therefore be tested without opening a permutation search:

1. The reflected 30×6 interior is a stationary token-to-GP29 codebook, calibrated only by the independently solved p56 plaintext (85 runes) followed by clear p57 (95 runes).
2. The reflected 76-cell outer ring supplies the signed-2016 “numbers are the direction” compass stream through p32's 11×11 rune map, beginning at the candidate H in the source-visible p32 fragment HOMEX, then serves as a 76-rune key for p55 under the independently solved p56 transparent-F additive convention. This is a bounded extension of the prior [unreflected p32 compass receiver](lp2-p50-outer76-p32-compass-p55-original-gate.md).

The second chain remains conditional: the original source does not authenticate the p32 H start, the base60 byte interpretation, the low-three-bit compass / high-five-bit distance split, or the transfer of p56's cipher to p55. Those assumptions were frozen to test one historically motivated receiver, not inferred from its output.

## Test A — reflected inner180 as a stationary codebook

Reflect each of the 32 printed rows, then remove the one-cell border. Read the remaining 30×6 cells in ordinary row-major order. Pair them with the exact 180 known GP29 symbols: p56 plaintext recovered with the prime-totient key from prime 2 and its sole transparent plaintext F at local offset 56, followed by p57's 95 clear symbols.

Allow the most permissive stationary mapping possible: every distinct printed two-character token may map to any one of the 29 GP symbols, with no injectivity requirement and no guessed mapping. For each repeated token, all its known occurrences must still map to the same plaintext rune. This exact maximum-match bound is independent of whether the token values are later interpreted in base60 or another injective radix.

| Original-source register | Unique tokens | Best possible matches | Forced mismatches |
|---|---:|---:|---:|
| Reflected 30×6 interior | 127 | **134/180** | **46** |
| Unreflected row-major interior control | 127 | 133/180 | 47 |

The reflected order improves the upper bound by only one symbol. **37 token classes** conflict with the known plaintext; no stationary token-to-GP29 map can satisfy the source. A source-shaped positive plant made with a genuine stationary token map recovers 180/180 under the same bound. Moreover, **34 distinct tokens on the reflected outer ring do not occur in the known interior**, so the interior could not label the complete p55 receiver even if its equations were consistent.

This rejects the exact reflected stationary-codebook receiver, not arbitrary stateful or nonlinear table use.

## Test B — reflected outer76 as a p32 compass key for p55

Reflect the original 32×8 byte table horizontally, then read its 76-cell perimeter clockwise from the reflected top-left. Interpret each base60 byte b using the frozen compass convention:

- direction = b mod 8 in N, NE, E, SE, S, SW, W, NW order;
- distance = floor(b/8);
- start at p32 cell 33, the H in the conditional HOMEX marker;
- wrap both coordinates on the 11×11 p32 map.

The 76 moves end at p32 cell 61 (X) and visit 50 distinct p32 cells. Apply the authentic p56 transparent-F inverse to p55. Its three ciphertext-F positions are 15, 25 and 41. Exhausting all eight possible bypass masks leaves **exactly one legal path**: all three positions pass transparently, 73 key symbols are consumed, and the candidate GP29 plaintext is:

<escape>PITGXMINGYLXEAWTXFAYNHGRJIANGFHEORCLINGCPOAHMUNGFGLHUSIALSGCLRAGBRIOEOEAEROMOACMODAEEAGJO</escape>

The corresponding unreflected perimeter candidate has no legal transparent-F path and dies at p55 offset 4. Reflection therefore repairs that exact algebraic contradiction, but it does not produce readable text.

| Diagnostic | Reflected candidate | Original p55 |
|---|---:|---:|
| GP29 index of coincidence | **0.0340351** | 0.0378947 |
| GP29 trigram log score | **−10.82491** | −10.78578 |

The fixed GP29 trigram model is trained on the repository's solved LP1/p56/p57 plaintext reference, with paragraph boundaries retained and additive smoothing 0.1. The candidate scores below **all 1,752** contiguous 76-rune windows of known plaintext; the worst native window scores −8.06134. The original p55 ciphertext itself also scores below those windows. A planted 76-rune p57 plaintext encrypted under the reflected key is recovered by the same transparent-F inverse, so the inverse and its bypass handling pass a source-native positive control.

This is a unique legal inverse under the frozen candidate, **not** a plaintext recovery. Its rune distribution is at least as unpromising as the original ciphertext, and its language score is decisively outside the known-plaintext window range.

## Decision

Retire these two exact receivers:

- horizontal p50 reflection + shed interior + stationary token-to-GP29 codebook;
- horizontal p50 reflection + clockwise reflected outer76 + base60 compass split + p32 H/cell33 + p56 transparent-F additive inverse to p55.

Do not rescue them by changing the radix, compass permutation, start cell, ring rotation, key phase, or cipher family after seeing the output. The original p50 reflection remains a source-supported permutation clue, but these tests do not identify what it operates on or how it contributes to a full decipherment.

**No unknown LP2 plaintext, authentic key, complete encryption mechanism, or Cicada destination was recovered.**

Reproduction: node sims/lp2_p50_reflection_receiver_gate_sft.cjs. The read-only Node 22 SFT uses only the canonical original-derived p50 grid, canonical LP2 corpus, and solved plaintext reference; it includes exact source assertions and planted positive controls.
