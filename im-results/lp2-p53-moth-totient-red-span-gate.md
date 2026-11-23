# LP1 p5 moth / 5×5 totient and Möbius key gates on LP2 p53 red span

**Decision:** bounded negative for both fixed 25-cell arithmetic key readings. The source-selected LP1 p5 totient key and the separately source-named Möbius-function key do not decipher LP2 p53's red tail.

## Human-visible route

The original LP2 p53 scan (archive 70.jpg) reuses the moth illustration from solved LP1 p5 (archive 05.jpg). LP1 p5 places that moth above its 5×5 number square and explicitly associates primes and Euler's totient with sacred material. This gives a human solver a concrete reason to transfer the LP1 p5 square to p53.

The p53 image has a distinct red tail: 51 runes at page-local offsets 128–178. It contains exactly one GP29 F, at local offset 38. The square has 25 cells, and 51 = 2×25 + 1. The sibling p55 gate already tested the same LP1 p5 totient-square key on p55, where its source-fixed special F at local25 leaves 75 key-consuming positions (3×25). The compact extension is to treat the sole F in p53's red tail as non-consuming too, leaving 50 positions (2×25).

If the key clock begins at the top of p53, the red tail begins at phase 128 mod25 = 3. This page-start phase is fixed by the original layout; phase zero at the red span is a sensitivity check. The hypothesis is phi(square cell) mod29 in printed row-major order, with the subtraction sign used by the solved p56 operation. The opposite sign is a control.

## Frozen test

- Key: Euler phi of each original LP1 p5 5×5 square value, row-major, reduced modulo29.
- Target: p53 red span, offsets [128,179), 51 runes.
- Fixed exception: the only F in that red span (local38) remains literal and does not consume a key position.
- Primary phase: 3, from the 128 preceding page runes; sensitivity phase: 0 at the red span.
- Both signs; no key rotation, offset search, square-orientation search, extra skips, or language correction.
- 5,000-permutation null preserves the exact 25 key values and compares the better sign.

Key: [12,15,10,14,5,4,24,19,12,6,25,23,14,23,25,6,12,19,24,4,5,14,10,15,12].

## Results

Score is mean natural-log frequency per overlapping A–Z quadgram after GP29 transliteration. Higher is more English-like; this is a comparative diagnostic, not a calibrated plaintext probability.

| Target / operation | Mean log score |
|---|---:|
| Raw p53 full page (179 runes) | −17.170218 |
| Raw p53 red span (51 runes) | −17.445863 |
| Red span, phase 0, one-F skip, best sign (−) | −17.339532 |
| Red span, page-start phase 3, no F skip, best sign (+) | −17.084126 |
| Red span, page-start phase 3, one-F skip, best sign (+) | **−16.125337** |
| Full p53 page, direct 25-key, no skip, best sign (−) | −17.225575 |

The phase-3/one-F output begins:

UEJWCMDHAEDTHTHBTBETHWNLIAHYGOEPOEAGIATHNBAESEAEOFANFEOEABYLPTEAM

It is not readable plaintext. Its apparent score lift is not exceptional under the digit-order null:

| Source order | Observed best | Null mean | Null 95th percentile | Add-one permutation p |
|---|---:|---:|---:|---:|
| p5 totient key, phase 3 | −16.125337 | −16.789274 | −15.635357 | **0.16117** |
| p5 totient key, phase 0 | −17.339532 | −16.802255 | −15.649440 | **0.78724** |

A known solved-p57 plaintext plant with the same 51-rune length and fixed F position round-trips exactly under the phase-3 schedule. This validates the arithmetic and skip implementation, not the key hypothesis.

For context, the p55 sibling test is documented in im-results/lp1-lp2-illustration-reuse-and-cipher-transfer-gate.md: its fixed p5 totient key and special F at local25 leave 75 steps, but the original p55 output is nonlinguistic. The p53 result does not rescue that transfer.

## Additional source-named Möbius key gate (Agent9, 23 November 2026)

### Human-visible route and frozen operation

The p53 moth reuses solved LP1 p05, whose original 5×5 square contains the literal word **MOBIUS** at row 3, column 5 (expanded prime-sum value 226), beside the prose about primes and the totient function. A human solver could reasonably try the arithmetic Möbius function μ(n) on the 25 square values as a GP29 key. This is a **hypothesis**, not an authenticated instruction: the word may be thematic or geometric, and the page does not explicitly say to apply μ to each cell.

The receiver was fixed to p53's original red tail, offsets 128–178: **51 runes**, with exactly one ciphertext F at local offset 38. The 25-cell row-major key is μ(square[i]) mod 29; the page-start clock fixes phase 128 mod 25 = 3. The solved p56 cipher fixes subtractive decryption and the literal-plaintext-F non-consuming rule. There is no phase, order, sign, or key fitting. Because the only ciphertext F at local38 may or may not itself be the transparent plaintext F, both possible masks (skip none; skip local38) were tested—these exhaust all F-mask assignments for this 51-rune span.

The source-derived key is:
**[0,28,1,28,28,28,28,28,0,0,1,0,1,0,1,0,0,28,28,28,28,28,1,28,0]**
(8 zero, 5 one, 12 minus-one residues).

### Original-cipher result

| Assumed transparent ciphertext-F positions | Decoded plaintext-F positions | Mismatches under the authentic p56 forward rule |
| --- | --- | ---: |
| none | **[25, 38]** | **15 / 51** |
| [38] | **[25, 38]** | **14 / 51** |

Both possible masks force a plaintext F at local25, where the original ciphertext is **not** F. Under the authentic p56 encoder every plaintext F must pass through literally and consume no key symbol. Forward re-encoding therefore disagrees with the original in 15 or 14 positions. This is an exact structural contradiction, independent of language scoring; the one-F skip interpretation is not a valid p56-style inverse.

The preferred (skip-38) output begins:
**BXHPTWBJTHHHCJREAAEAOAENPAEXNGJFEAAEEONRTHEODINGTHGFEOLGNARSGURXH**
It is nonlinguistic and has no exact original-cipher inverse under the p56 F rule. A solved-p57 51-rune positive plant, with its original F plus the inserted F both bypassed, round-trips exactly 51/51.

This is a bounded negative for the **direct row-major μ(square) mod29 additive key on p53's red tail**, not a rejection of every geometric or number-theoretic use of the word MOBIUS. The previous [direct p55 μ-key gate](../sims/lp1_wisdom_mobius_p55_gate.cjs) is a separate receiver test. Do not add phases, square traversals or alternate arithmetic functions without a new source selector.

## Decision and scope

Reject the direct periodic additive/subtractive 25-step totient-square transfer to p53's red 51-rune span under the fixed page-start clock and one-F non-consuming interpretation. Also reject the separate direct row-major μ(square) mod29 key: both possible transparent-F masks force a plaintext F at local25 absent from the ciphertext, and authentic p56 forward replay fails 14/15 positions. These tests close the two direct arithmetic key readings on this p53 receiver; they do not invalidate the moth selector, the LP1 p5 square, or other independently specified uses of p53's red passage.

Do not tune phases, square orientations, F positions, key permutations or alternate functions to rescue either direct transfer. A successor requires a new independent source instruction selecting a different operation or register.

## Reproduction

Run with Node 22: node sims/lp2_p53_moth_totient_red_span_gate.cjs\n\nThe additional Möbius-key gate is reproduced by: node sims/lp2_p53_moth_mobius25_red_tail_gate.cjs.

The script reads the original LP1 square data, canonical GP29 corpus, p53 ink annotations, and Duko quadgram counts; asserts the 51-rune red span and its unique F at local38; executes 5,000 multiset-preserving key permutations at phases zero and three; and verifies an exact solved-p57 positive plant.
