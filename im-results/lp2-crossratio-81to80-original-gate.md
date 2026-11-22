# 81² → 80²−5 projective cross-ratio gate on original LP2

**Evidence class:** exploratory original-ciphertext negative for one precisely defined projective source/output relation. **No plaintext, key, ciphertext mechanism, or destination is recovered.** This is a finite test of a candidate motivated by the real repeated six-rune `DJU-BEI` bookend and Gematria Primus's 29-symbol field. The bookend-to-square grouping and the choice of projective cross-ratio remain interpretations, not independently selected Cicada instructions.

## Causal proposal and original inputs

The unique full repeated two-word ciphertext phrase occupies global rune positions 6,555–6,560, ending at **6,561=81²**, and recurs as the last six runes of the unresolved 12,956-rune book. The remaining second part has **6,395=80²−5** runes. The established [bookend analysis](lp2-repeated-wordpair-structure.md) has already tested direct 81×81/80×80 Fourier row/column keys, 2×2 polynomial functions and general four-corner lookup consistency. Those tests do not cover the specific projective cross-ratio defined below.

A hypothesis drawn from the prime-field and Möbius imagery is that a solver could convert each 2×2 neighborhood of the first 81×81 GP29 glyph square into one of the 80×80 locations. Let its clockwise-corner glyph residues be `a,b,d,c`, ordered with `a,b` on top and `c,d` on the bottom. Over `F₍₂₉₎`, set

`R(a,b,c,d) = [(a−b)(c−d)] / [(a−d)(c−b)]`.

Here a zero denominator with nonzero numerator is the projective infinity state; **0/0** is genuinely undefined. The hypothesis allows those undefined outputs to be omitted, offering a checkable explanation of why the manuscript's remaining length is short by five.

**Weakest premise:** nothing independently indicates that Cicada intended this 81-square contraction, this cross-ratio convention, or any relationship between the first block and the second. The five-cell omission is therefore a discovered arithmetic match, not by itself a decoding rule.

## Exact 5-cell match and decisive original-input negative

Evaluate all **6,400** source neighborhoods once, using the original rune indices and no fitted parameters. Results: **5,997 finite states, 398 infinity states, and exactly five undefined 0/0 positions**. So deleting all genuinely undefined locations gives exactly **6,395 defined values**, matching the second ciphertext part's length. In the unrotated 80×80 map, those five zero-based row-major locations are **[564,945,2706,5683,6147]**.

This matching length is a useful mathematical observation, but the runic prediction fails. Give the proposal an **arbitrary, secret, stationary function from all 30 defined projective states to any of the 29 ciphertext runes**, rather than fixing the naturally suggested residue labels. This deliberately grants more freedom than a one-to-one reversible output alphabet. For each of eight dihedral orientations of the 80×80 contraction, remove the five undefined cells and optimally fit every 30-state→GP29 output mapping by choosing each state's most frequent actual ciphertext glyph. The resulting **exact maximum matching** counts are:

| Square orientation (0–7) | Exact matches / 6,395 |
| ---: | ---: |
| 0 | 394 |
| 1 | 402 |
| 2 | 389 |
| 3 | **404** |
| 4 | 400 |
| 5 | 398 |
| 6 | **404** |
| 7 | 403 |

Even the best secret lookup under the favorable omission rule requires **5,991 ciphertext-symbol replacements**, so the proposed projective relation cannot directly generate the original second half. The less motivated rule that the missing five are the **last five** source-square cells rather than precisely the undefined cells also fails: its best of eight secret lookups matches just **413/6,395**.

A matched-null check shuffles the original second-half ciphertext runes, preserving their exact 29-symbol histogram, and refits the **same eight orientations and all secret output mappings** after each shuffle. With 200 deterministic xorshift32 shuffles (seed `0x33222133`), the maximum-fit null median is **410** (minimum 399; maximum 433). **185/200** shuffled targets fit at least as well as the original target's 404. Thus the observed match count provides no positive relation to the source's projective ratios. A source-shaped positive, planted by applying one fixed secret 30-to-29 lookup to all 6,395 defined source states, recovers **6,395/6,395** under the same evaluator.

## Research decision and limits

The exact **five 0/0 positions** are noteworthy conditional on the chosen geometry. They do not identify an encryption key or a plaintext operation; the matched-null ciphertext fit is unambiguously negative. Retire **this entire stationary projective 2×2 contraction-to-second-half readout**, including arbitrary output-alphabet permutations. Reopening it requires a source-selected, materially different reversible relation and a new prospective original-plaintext prediction. A lookup or cross-ratio output of length 6,395 by itself also discards source information and is not a full lossless decoder.

**Reproducer:** [standalone Node 22 SFT](../sims/lp2_crossratio_81to80_gate_sft.cjs) loads `resources/liber-primus/lp2-corpus.json`, asserts every original runic length and finite/infinity/undefined count, computes exact orientation-wise all-secret optima, runs a planted mapping control and the deterministic matched-null permutations. The script's explicit 0/0 convention and page-range filter prevent accidental inclusion of solved pp56/57 or the runeless p50.
