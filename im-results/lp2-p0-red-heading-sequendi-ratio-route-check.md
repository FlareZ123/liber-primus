# Red p0 heading: a selective conditional `SEQUENDI RATIO` cross-check of the 27×27 route

**Agent 28, 18 November 2026. Classification:** new exact original-input evidence for a *conditional* external 27×27 route, not authenticated LP2 plaintext. The candidate route remains underselected at earlier transitions. This report isolates a previously unindexed red-heading result and tests whether its two key constructions are selective without using the red-heading plaintext to choose them.

## Result

The original physical p0 heading is exactly 13 red GP29 runes in an 8+5 grouping:

```
S H E O G M IA F | S Y E NG C
```

The original image also has the large 13-dot red punctuation event immediately after those 13 runes. The canonical p0-p2 corpus begins with the same 13 symbols.

Using the external 27×27 route's later `MAP` geometry, two independently checkable constructions decrypt the untouched red heading to:

```
S E C U E N D I | R A T I O
```

The GP C/K rune gives the literal canonical transliteration **SECUENDI RATIO**; reading that rune as Latin Q gives **SEQUENDI RATIO**. The phrase is naturally Latin for a method, procedure, or plan of following. This semantic interpretation is secondary to the exact GP29 arithmetic.

The important new evidence is selectivity. The two keys are not arbitrary keys reverse-engineered directly from the heading in the reproducer below.

There is also a previously undocumented arithmetic checksum on the recovered title itself. Its 13 plaintext rune indices sum to **156**, exactly

\`\`\`
156 = 13 × phi(13) = 13 × 12.
\`\`\`

Thus the source-visible title length, the opening coordinate \`J=(13,12)\`, and the recovered title's complete index sum all reuse the same 13/12 pair. This equality was not used to derive either key or to choose the candidate Latin reading.

## First key: unique rectangle under the published geometry

The red count gives the route's opening coordinate `J=(13,phi(13))=(13,12)`. Block 28's frozen original source is the vertical three-cell node:

```
EO(15,9) - X(16,9) - I(17,9)
```

Before inspecting the red plaintext, enumerate every rectangle whose right side is column 9, strictly spans that three-cell MAP source, has X at its upper-left and lower-right corners, and places those two X corners at equal squared distance from J.

Exactly **one** rectangle exists in the original 27×27 matrix:

```
(6,3) X ----- (6,9) N
  |               |
  |               |
(24,3) C ---- (24,9) X
```

Reading clockwise from the upper-left gives the unique four-rune key `X-N-X-C`. Reverse only the first eight red ciphertext runes and subtract that repeated key modulo 29:

```
F IA M G O E H S
X N  X C X N X C
----------------
S E  C U E N D I
```

Forward addition reconstructs the exact original eight red runes.

A route-internal control strengthens the specificity: among all **17** frozen vertical three-rune source nodes in the first 38 blocks, apply the same rule with each node's own center rune at the two opposite corners. **Only block 28 (MAP) admits any such rectangle**, and it admits exactly the one above.

This is a genuine source-selectivity improvement over simply supplying `X-N-X-C` as a fitted key. It is still conditional on accepting the route's J anchor and MAP source.

## Second key: MAP is the unique route-prefix phi extrapolation

The second construction uses the block-28 MAP source center `M=(16,9)` and `E=(17,13)`. In the current frozen 38-block route this is the three-rune `MAP` prefix endpoint. Crucially, standalone stage 28 `MAP` was already published on **26 October 2026** (`plaintext-i-found/28-map.md`), four days before the first red-heading report on **30 October 2026**. The 30 October route snapshot describes MAP ending at `AE(17,13)`. The later `MAP LIFE` extension first appears on **4 November 2026**. Thus `(17,13)` was the selected stage endpoint when this heading construction was published, rather than a semantic boundary chosen retrospectively from the later seven-rune block. Apply two deterministic affine extrapolations:

```
R = 2E - M = (18,17)
T = 2R - J = (23,22)
```

The original grid has `R` at `(18,17)` and `TH` at `(23,22)`. Since the rune index of R is 4 and `phi(4)=2=TH`, the node

```
J - R - TH
```

becomes the key

```
J - TH - TH
```

after the route's center-totient operation. Subtracting it from the untouched final five red runes gives `R-A-T-I-O`, and forward addition exactly restores the source.

The selectivity test applies the same `R=2E-M; T=2R-J` construction to **every prefix endpoint of every frozen first-38 route block with one three-cell source node**, before reading the red suffix. There are 20 cases whose extrapolated R and T remain inside the 27×27 matrix. Exactly **one** has `phi(rune(R)) = rune(T)`: block 28 at prefix length 3, the MAP boundary.

This gives a route-internal discriminator that was absent from the earlier shared audit.

## What this changes

The shared repository previously established that the first 38 externally selected blocks are arithmetically reproducible on all 115 selected original rune reads while the transition grammar leaves multiple admissible continuations. That conclusion remains valid. The new red-title result adds a qualitatively different fact: **a 13-rune original red region outside the candidate 115-rune plaintext route is exactly readable under two later-route constructions, and both constructions have finite source-selectivity tests.**

That is stronger than another readable candidate chosen from the 729 cells. The red region is physically marked in the manuscript, its 8+5 grouping is original, and the result is a coherent two-word Latin label plausibly describing a following method.

It still does **not** establish a complete decipherment. The surviving weaknesses are concrete:

- The 27×27 reshape and opening J anchor are not independently authenticated by a known original instruction.
- The first key's rectangle rule is conditional on the later MAP source.
- The second construction depends on the candidate MAP stage. Its `(17,13)` endpoint was already the published stage endpoint when the red-heading construction appeared on 30 October, before the 4 November `MAP LIFE` extension, which reduces the later-boundary hindsight concern but does not authenticate MAP itself.
- The affine extrapolation rule itself still needs an original clue or a prospective application that predicts another untouched marked region.
- Reports 17-19 do not remove the already demonstrated earlier THE/YE key ambiguity.

Therefore this belongs in `im-results/`, not `results/`. The appropriate next attack is to use **SEQUENDI RATIO as a candidate instruction/checksum**, not to add further fitted transition rules. A decisive advance would derive the rectangle/extrapolation rule from original visible clues or use it unchanged to predict another marked ciphertext region.

## Reproduction

Run:

```
node sims/lp2_p0_red_heading_sequendi_ratio_gate_sft.cjs
```

The SFT uses only the canonical local p0-p2 corpus, the source-corrected physical red-ink annotation, and the repository's already frozen first-38 route arrays. It asserts the original 8+5 heading, the unique rectangle, the 17-source route-wide rectangle control, both exact decryptions and re-encryptions, the 20-to-1 route-prefix extrapolation selectivity result, and the independent `156 = 13 × phi(13)` recovered-title checksum.

External numerical proposal credited for the candidate red-heading constructions:
https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption
Current external main inspected during this audit: `81ae3c885d8bf6f1e5b0cfde060531d9637fba79`.
Historical chronology inspected: standalone `plaintext-i-found/28-map.md` first appears at `d6d82764bae48db306fd779c0d555f15260f8343` (26 October 2026); the red-heading snapshot `ca96de9d14a9743cd6d53c612e41f4919a52b3bb` is from 30 October and uses MAP ending at `AE(17,13)`; `plaintext-i-found/28-map-life.md` first appears at `2f0c928e14d1338ea3f60ff0d19ffbd98900def8` (4 November 2026).
