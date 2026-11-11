# p33–39 M7→C28 word-length walk

**Status:** Provisional navigation hypothesis; not plaintext.

This is a reproducible cross-round extraction, **not a Liber Primus plaintext recovery**. It connects the source-derived p32 order-seven map, the p33–39 illustrated section, the inclusive order-28 map, and the authenticated 2016 signed message. The output is route-like but fragmentary, and a broader control finds an adjacent-window alternative.

## Source-fixed inputs

- The p32 **22-word clause segmentation** is [7,15]. Its word 22 is AGBEO, with GP-prime sum 216 = 7×29 + 13; this supplies seed 13.
- This is distinct from the 26 printed rune-word segmentation used for the M7 word ordinals. The two parsers must not be conflated.
- The source row-major map is \(M_7=\begin{pmatrix}14&25\\25&28\end{pmatrix}\), with forward orbit from 13:
  \[
  13\to24\to19\to3\to6\to20\to17\to13.
  \]
- The p33 red title begins at local rune offset 91. In the printed-word transcription, that is exactly the boundary before one-based word 27. Use the title as the entry to the illustrated p33–39 passage; this is a section boundary, not independently established as a cipher reset.
- The inclusive p32 side map is \(C=M_{28}=\begin{pmatrix}14&28\\25&20\end{pmatrix}\), of projective order 28. The existing source-derived conjugacy is
  \[
  M_7\sim S C^4 S^{-1},\qquad S(x)=11x+8.
  \]
  Therefore the M7 seed 13 corresponds to inclusive-map coordinate \(S^{-1}(13)=11\).

## Seven-page word selection

Use the forward M7 orbit as one-based word ordinals, one word on each illustrated page. On p33, count from the red-title boundary; on p34–39, count from the physical page start.

| Page | Word ordinal | Selected GP word (transliteration) | Prime sum | Rune length |
|---:|---:|---|---:|---:|
| 33, after red title | 13 | EOA | 138 | 2 |
| 34 | 24 | EO | 41 | 1 |
| 35 | 19 | CSAOGWL | 279 | 7 |
| 36 | 3 | GYR | 131 | 3 |
| 37 | 6 | JSRATSNGT | 448 | 8 |
| 38 | 20 | IOI | 69 | 3 |
| 39 | 17 | GRIEO | 100 | 4 |
| **Total** | | | | **28** |

The selected word lengths are [2,1,7,3,8,3,4], summing exactly to the order of C.

## C28 walk and signed-message readout

Start at 11, the image of seed 13 under S⁻¹. Advance the forward C28 map by each selected word's rune length, in page order:

| Page word | C28 steps | Endpoint state | 1-based 2016 message word |
|---|---:|---:|---|
| p33 word 13 | 2 | 2 | The |
| p34 word 24 | 1 | 24 | road |
| p35 word 19 | 7 | 3 | path |
| p36 word 3 | 3 | 8 | the |
| p37 word 6 | 8 | 23 | the |
| p38 word 20 | 3 | 14 | way |
| p39 word 17 | 4 | 11 | Primus |

The endpoint states are [2,24,3,8,23,14,11]. Their total step count is 28, so the walk closes at its starting state 11. In the authenticated 45-token body of resources/historical/cicada2016-4gq25-outguess.asc, the one-based readout is:

**“The road path the the way Primus.”**

Including the initial word at state 11 gives the closed cycle:

Primus → The → road → path → the → the → way → Primus

The seven selected English words contain 26 letters. This matches the Latin alphabet size, but that equality is a checksum-like observation, not an independently prescribed decoding instruction.

## Controls and limits

1. **Within p33–39:** exhaust all 7 M7 orbit phases × 2 directions × 2 p33 boundary contracts (28 valid variants). Two variants make an exact 28-step C28 closure; only the source-selected forward phase-0 / red-title variant also selects all three non-forced route anchors road, path, and way.
2. **Fixed forward phase across all contiguous seven-page LP2 windows:** 48 windows have valid selected words; seven have total length 28. Only p33–39 selects all three non-forced anchors.
3. **Broader scan:** across 682 valid contiguous-window × M7-phase × direction × available-boundary variants, 51 close at 28 steps and two also select all three anchors. The source-selected p33–39 route is one; the other is the adjacent p34–40 window, phase 3, reverse, physical start. Its output is a different route-like sequence (path road way devoted Liber the the). Thus the extraction is not globally unique under this expanded family.

These are finite source-preserving controls, not formal p-values. In particular, Primus is forced at the end of any 28-step closed walk from state 11; the discriminating output words are road, path, and way.

## Separate first-clause M7 word-sum gate

The natural pointwise test on the seven-word first clause does **not** supply a second plaintext route. Its GP-prime sums are [73,125,267,613,191,184,14], residues [15,9,6,4,17,10,14], and forward M7 images [28,21,20,14,13,8,18]. These images do not form one M7 orbit. As p32 word ordinals, 28 is out of range for both the 22-word clause list and 26 printed-word list. As one-based positions in the 2016 message they read are meaning their way the the the, which echoes the message but is not a coherent instruction. The direct seven-step readings tested from the residues likewise lack a unique source-prescribed interpretation. Do not tune additional combinations without a new clue specifying the transition and target.

## Interpretation

The strongest reason to retain this candidate is the compact causal chain: the p32 word-22 remainder fixes seed 13; the order-seven map supplies seven ordinals; the visually marked seven-page cuneiform section supplies seven words; their lengths exactly exhaust the order-28 map; and the conjugate C28 walk selects route vocabulary from the authenticated 2016 message. This is a plausible human solve-path hypothesis for the 2016 instruction that words form a map and numbers give direction.

The missing instruction remains important: neither “word length means C28 step count” nor “C28 state means one-based token position in the signed message” is explicitly stated in the source. The adjacent-window alternative also weakens uniqueness. Treat this as a promising navigation lead requiring independent adversarial review and a source-derived continuation, **not** as recovered plaintext, a key, or the puzzle destination.

## Reproduction

Run from repository root:

    node sims/p33_39_m7_c28_wordlength_walk.cjs

The script checks the seed segmentation, M7/C28 projective conjugacy, red-title word boundary, exact selected words and sums, closed C28 path, signed-message token readout, and all finite controls above.

Related evidence: [p32 nested-map synthesis](tree-prime-canvas-partition.md), [p32 M7/2016 alignment](p32-m7-2016-word-fragment-alignment.md), and [section-clock boundary analysis](../workplace/lp2-section-clock-ambiguity.md).
