# Original LP2 p15 Fibonacci square as a changing Hill key

**Decision (Agent 7, 13 November 2026):** The source-printed 4×4 square, interpreted as a matrix whose successive powers encrypt consecutive four-rune blocks, does not yield native-GP prose in the immediately following p16–22 passage. A separately framed p40–55 passage is also ciphertext-like under every declared variant. This closes a small but previously distinct *evolving-key* interpretation of the visual square. There is no recovered LP2 plaintext, genuine historical key or creator-authenticated cipher operation.

## Why this variant was worth checking

Physical LP2 p15, original scan 32.jpg, visibly gives the numeric square

```text
3258 3222 3152 3038
3278 3299 3298 2838
3288 3294 3296 2472
4516 1206  708 1820
```

followed by a hand-drawn infinity motif. The entries have an independently established Fibonacci-indexed-prime construction around 3301; the printed-square matrix reduced modulo29 is

```text
10  3 20 22
 1 22 21 25
11 17 19  7
21 17 12 22
```

and has nonzero determinant 17 in GF29. An ordinary direct Hill decoder using the same static matrix has already failed [the fixed-square gate](fibonacci-square-hill4-gate.md), including all eight geometric orientations. An infinity/continuation motif and Fibonacci context provide a modest **source-visible motivation** for asking about *powers* of the matrix instead. Neither original art nor a signed Cicada instruction specifies exponentiation; this experiment is therefore a **conditional architecture test**, never an authenticated proposed solution.

For each four-rune ciphertext vector `C_j`, test `P_j=(M^s)^j C_j mod29` in row/column convention, where `M` ranges over the **eight dihedral layouts** of the printed 4×4, `s=+1 or -1`, and `j` starts at zero or one. The block exponent either continues across the chosen set of pages or restarts at each physical page. When the latter choice produces 1–3 terminal runes, those runes are passed unchanged, with no guessed padding or deletions. These are **8×2×2×2 = 64 fully specified reversible models**, with fixed input and no fitted secret matrix, alphabet, shift or source offset. Unlike the already tested static Hill cipher, their nonidentity matrix changes every four-runic block.

## Original-input result

The **source-adjacent region is physical p16–22**, 1,744 ciphertext runes immediately after the printed square's page. The second declared region is p40–55, 3,316 source runes, including the intervening numeric p50 as a **zero-rune** physical page; its different ornamented section is a cross-section check, not a fresh blind holdout. No new original rune transcriptions or interpolated ciphertext were used.

| Stream / model | Whole-stream GP29 coincidence index |
| --- | ---: |
| Original p16–22 ciphertext | 0.0345095980 |
| **Best p16–22 powered-matrix model, all 64** | **0.0347622469** |
| Lowest p16–22 powered-matrix model | 0.0342266839 |
| Original p40–55 ciphertext | 0.0344628266 |
| **Best p40–55 powered-matrix model, all 64** | **0.0346422210** |
| Independently encoded Shakespeare GP-English control, length 1,744 | **0.0632905146** |
| Different Shakespeare GP-English control, length 3,316 | **0.0595707634** |
| Source-native solved physical p57 plaintext control, 95 runes | **0.0627099664** |

The best p16–22 choice uses orientation 1 (transpose of the printed matrix), negative exponent, **page reset** and first exponent 1. Its first 24 decrypted rune labels begin `NG Y I EO W X E G NG L H F I N A R X R TH I OE EA B P`; there is no coherent text. Its p40–55 value is **0.0344442686**, again near uniform. The natural source-row-major orientation is included, and no other candidate approaches the native GP control register. The original GP 29-way near-uniform baseline is `1/29 = 0.03448276`.

Implementation control is stronger than an arbitrary original re-encryption claim: the SFT encrypts an **independent 1,744-rune native-English GP window**, and the published 95-rune solved p57, with each of the 64 matrix-power schedules. All **64/64 original-segment-sized plants** and all **64/64 authentic p57 plants** then recover their full plaintext exactly when decoded under their source-known model. The original-cipher result remains negative: every actual model output retains approximately uniform symbol frequencies.

## Scope and research choice

This rejects **only** exact sequential powers of the printed-distance matrix under eight D4 orientations, either matrix direction, exponent origin 0/1, and the two defined page/block clocks, **for native GP-English plaintext in the tested original regions**. It does not exclude an independently specified time-varying *non-power* matrix, changing 29-symbol alphabet, F-transparent bypass, nonlinear state, a different encoding register, or a key that is genuinely supplied elsewhere. No source instruction selects these remaining freedoms, so increasing arbitrary parameters would repeat blind matrix fitting rather than advance the puzzle.

The experiment adds a changing-key test to the earlier fixed p15 Hill exclusion without changing the repository's established decryption status. **Do not repeat this powered-matrix family** absent original evidence of an additional state or consumer; seek a source-derived key or authentic unknown plaintext instead.

**Reproduce:** `node sims/p15_powered_hill4_sft.cjs` from the repository root on Node 22. The standalone CommonJS test reads `resources/liber-primus/lp2-corpus.json` and `resources/control/shakespeare_first300k.txt`, asserts every original and control length, square residue, GF29 inverse, 64 planted native round trips, and the original-input best scores. It writes no files and uses no external package.
