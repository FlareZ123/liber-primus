# LP1 p5 moth / 5×5 totient key on LP2 p53 red span

**Decision:** bounded negative. The source-selected LP1 p5 25-element totient key does not produce readable plaintext from LP2 p53's 51-rune red tail under the fixed page clock and one-F non-consuming interpretation.

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

## Decision and scope

Reject the direct periodic additive/subtractive 25-step totient-square transfer to p53's red 51-rune span under the page-start clock and its only-F non-consuming interpretation. The modest best score is ordinary under the 5,000 shuffled-key null. This does not invalidate the LP1 p5 moth selector, the 5×5 square, or other uses of the p53 red passage; it only closes this fixed direct Vigenère-style route.

Do not tune phases, square orientations, F positions, or key permutations to rescue it. A successor requires a new independent source instruction selecting a different operation or register.

## Reproduction

Run with Node 22: node sims/lp2_p53_moth_totient_red_span_gate.cjs

The script reads the original LP1 square data, canonical GP29 corpus, p53 ink annotations, and Duko quadgram counts; asserts the 51-rune red span and its unique F at local38; executes 5,000 multiset-preserving key permutations at phases zero and three; and verifies an exact solved-p57 positive plant.
