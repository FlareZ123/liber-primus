# Original LP2 p15 Fibonacci square as a changing Hill key

**Decision (Agent 7, 13 November 2026; Agent 9 Fibonacci-exponent extension, 27 November 2026):** The source-printed 4×4 square, interpreted as a matrix whose successive powers encrypt consecutive four-rune blocks, does not yield native-GP prose in the immediately following p16–22 passage. A separately framed p40–55 passage is also ciphertext-like under every declared variant. The distinct Fibonacci-exponent clock also fails: 0/4,704 full transparent-F inversions on pp16–22, and ordinary-clock phase selection recovers both hidden native controls but no original prose. These results close the two specified *evolving-key* interpretations of the visual square. There is no recovered LP2 plaintext, genuine historical key or creator-authenticated cipher operation.

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

## Fibonacci-exponent matrix clock: complete phase search (Agent 9, 27 November)

The numerical graphic independently selects Fibonacci ordinals in the documented construction of the p15 square. A different receiver from integer block powers is therefore (C_b=M^{F_{b+q}}P_b\pmod{29}), using the actual Fibonacci sequence (including its repeated initial 1). The phase (q) is secret; signs and transpose are granted. The two fixed bases are the printed distance matrix above and the independently reconstructed signed matrix (last row [8,12,12,22], other rows unchanged). The prime-indexed graphic and infinity mark motivate Fibonacci powers, but no creator instruction selects this receiver or a block phase. This is an exploratory original-input attack, not an authored instruction.

The exact multiplicative orders are 101040 for the printed matrix and 812 for the signed matrix, checked by exponentiation and every distinct prime factor. The Fibonacci sequence modulo those orders has periods 840 and 336 respectively, by return to pair (0,1). Thus the complete phase spaces under both signs and transpose contain **4(840+336)=4,704** schedules. Both source-era natural origins (F0 and the first unprinted F17) are included. Freeze the physical p16–22 input (1,744 runes, 65 visible zero/F glyphs) and the continuous four-rune frame.

**Transparent-F variant.** The sender holds each plaintext zero at its original physical position, concatenates the nonzero plaintext runes into complete groups of four, applies the specified powered Hill matrix, and scatters the four outputs back to their consuming positions. A consumed ciphertext zero can be confused with a literal hold. The exact inverse retains every four-position consumption choice and branches only at visible zeros. After each block it retains every reachable original cursor; the next matrix depends only on the block ordinal and fixed phase. Decode a complete block by its exact inverse and discard it only if a consuming plaintext component is zero. Success requires all nonheld input to fall into complete blocks; remaining visible zeroes may be held. No scores, beam limits, dictionary or hidden placement oracle are used in the original feasibility gate.

| Base / transpose / sign | Complete original schedules | Furthest completed-block cursor |
| --- | ---: | ---: |
| printed / no / + | 0/840 | 297 |
| printed / no / − | 0/840 | 395 |
| printed / yes / + | 0/840 | 430 |
| printed / yes / − | 0/840 | 388 |
| signed / no / + | 0/336 | 563 |
| signed / no / − | 0/336 | 344 |
| signed / yes / + | 0/336 | 391 |
| signed / yes / − | 0/336 | 429 |

Zero of 4,704 complete original inversions; largest reachable cursor width7. In every case extinction occurs more than 1,180 physical runes before the end, so granting an arbitrary terminal partial block would not repair the result. All 24 planted literal-F controls (eight base/direction variants at three origins; 1,741 runes with 49 held zeros, 1,692 consumed) retain the correct feasibility history. These controls establish feasibility calibration, not unique held-F plaintext recovery.

**Ordinary-consuming unknown-phase attack.** Train a smoothed native-GP trigram model on the first half of the pinned Gibran text (greedy GP digraphs, C/K, U/V, S/Z, QU→CW; Latin encoding of the full archived file, including its framing). Two disjoint 1,744-rune control windows lie in the other half. Encrypt with concealed variant/phase pairs (0,137) and (6,211); rank all 4,704 inverses using only the first 872 runes. Both controls recover the exact planted phase and all 1,744 plaintext runes, with held mean log probabilities −2.05093 and −2.19000. The best original prefix-selected schedule is printed / no transpose / negative / phase236, with prefix −3.83926 and held −3.96802. Its initial decoded labels read `TNGLXDFYEONEUOEGNGWUEOCBCDXEAYRNJEACWWNOEOEEATHEUGYAEJTEISREATBXYAYWAELLOEEG...`; no sustained prose. Exact forward replay is an implementation invariant, not evidence for that key. This is a calibrated finite negative for ordinary consumption, not a language-independent impossibility.

[Standalone CommonJS core](../sims/lp2_p15_fibonacci_exponent_hill_agent9.cjs) · [Complete raw output](lp2-p15-fibonacci-exponent-hill-agent9-output.json). Exact fetched core executed in connected V8 twice; outputs matched after the printed-matrix prime-factor assertion was corrected from 29 to 421. Node wrapper not separately executed. Corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; Gibran blob df260a07d56bf5998d40a6360b6132c35c252d10. No unknown plaintext or authentic key recovered; do not repeat arbitrary Fibonacci phase/power sweeps.

## Scope and research choice

The first experiment rejects **only** exact sequential powers of the printed-distance matrix under eight D4 orientations, either matrix direction, exponent origin 0/1, and the two defined page/block clocks, **for native GP-English plaintext in the tested original regions**. It does not exclude an independently specified time-varying *non-power* matrix, changing 29-symbol alphabet, F-transparent bypass, nonlinear state, a different encoding register, or a key that is genuinely supplied elsewhere. No source instruction selects these remaining freedoms, so increasing arbitrary parameters would repeat blind matrix fitting rather than advance the puzzle.

The Fibonacci-clock experiment further excludes the specific continuous printed/signed powers under all cyclic phases and literal-F holds. Neither experiment identifies a historical sender. Together these experiments add changing-key tests to the earlier fixed p15 Hill exclusion without changing the repository's established decryption status. **Do not repeat this powered-matrix family** absent original evidence of an additional state or consumer; seek a source-derived key or authentic unknown plaintext instead.

**Reproduce:** `node sims/p15_powered_hill4_sft.cjs` from the repository root on Node 22. The standalone CommonJS test reads `resources/liber-primus/lp2-corpus.json` and `resources/control/shakespeare_first300k.txt`, asserts every original and control length, square residue, GF29 inverse, 64 planted native round trips, and the original-input best scores. It writes no files and uses no external package.
