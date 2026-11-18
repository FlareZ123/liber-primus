# LP2 p55: source-moth 5x5 Bifid test against the conditional 53-rune crib

**Agent 13, 18 November 2026.** Bounded original-input nonlinear-cipher test. **No p55 plaintext, authentic key, or continuation recovered.**

## Human-solve-path hypothesis

The original LP1 p05 image and LP2 p55 image repeat the moth illustration. The p05 image also contains a 5x5 numeric magic square preserved in the contemporaneous 2014 source material. Original p55 contains 76 GP29 runes; its first rune completes a word carried from p54, leaving a 75-rune body. That body is exactly three 25-rune blocks, and the full p55 page uses exactly 25 of the 29 GP symbols.

A solver seeing a repeated moth, a source-linked 5x5 square, a 25-symbol ciphertext alphabet, and a 75-rune body could reasonably try a standard **Bifid fractionation cipher**. This is a compact nonlinear coordinate-recombination operation, not another additive key or linear recurrence.

The strongest rival is that the repeated moth links illustrations or themes rather than cipher keys, while the 25-symbol support and 75-rune count are incidental. Neither original page says “Bifid,” defines a 25-symbol plaintext alphabet, or specifies how the numeric square should order that alphabet. The test therefore freezes one simple source-derived interpretation rather than treating the visual match as proof.

## Frozen key and operation

Inputs are the canonical original GP29 p55 indices in resources/liber-primus/lp2-corpus.json and the original 2014 5x5 square in resources/cicada2014-openpuff-magic-squares.txt.

1. Use the third 5x5 square, the one associated with the LP1 p05 moth page.
2. Sort its 25 cells by numeric value ascending; break equal-value ties by original row-major cell position. The square has 13 distinct numeric values, so the tie rule is material and explicitly fixed.
3. Map the 25 GP symbols observed on p55, in canonical GP29 index order, to those 25 ranked cell positions. The resulting row-major GP25 square is:

~~~text
L   H   A   G   J
IA  P   R   OE  F
S   E   TH  M   B
U   D   C   X   EA
EO  W   AE  I   NG
~~~

The cell-rank order is [9,15,12,7,17,3,21,1,23,4,20,6,18,10,14,11,13,0,24,8,16,2,22,5,19].

Use standard Bifid with period 25. Encryption concatenates the block's row coordinates followed by its column coordinates and reads the stream in pairs. Decryption interleaves ciphertext row/column coordinates, splits the resulting stream into two equal halves, and pairs corresponding values. No alphabet permutation, key rotation, period sweep, salt, or post-decryption repair is fitted.

Two source-natural page clocks are checked: the physical 76-rune p55 page, and the 75-rune new body after excluding the incoming p54 carry. Period 25 is fixed by the 5x5 square; the 75-rune body is exactly three periods.

## Original results

The 2014 eyewitness record proposes **ENLIGHTENMENT AWAITS THOSE** at p55 offsets 23–45. A separate participant proposed **MULTIBRANCHED** for the 13-rune tree word; combining it with “AWAITS THOSE” is only an analytical alternative, not an authenticated sentence. The second, moth-linked candidate is the 30-rune LP1 passage **THE TOTIENT FUNCTION IS SACRED ALL THINGS** at p55 offsets 46–75. Neither plaintext proposal is author-verified.

The frozen Bifid inverse yields:

| Original input | 53-rune crib | Exact rune matches |
| --- | --- | ---: |
| Physical p55, 76 runes | ENLIGHTENMENT + moth-linked 30-rune passage | **1/53** |
| Physical p55, 76 runes | MULTIBRANCHED + moth-linked 30-rune passage | **0/53** |
| p55 new body, 75 runes | ENLIGHTENMENT + moth-linked 30-rune passage | **1/53** |
| p55 new body, 75 runes | MULTIBRANCHED + moth-linked 30-rune passage | **0/53** |

The 25-symbol ciphertext support omits GP29 indices **3, 9, 16, 26** (O, N, T, Y). A standard 25-symbol Bifid square emits plaintext from that same 25-symbol alphabet. The first combined crib contains **15** occurrences outside it; the alternative combined crib contains **12**. Thus neither proposed 53-rune phrase is representable in this standard GP25 Bifid model without adding a separate, unselected alphabet-collapse or escape layer.

For the physical-page clock, the first 23 decrypted GP transliterations are:

~~~text
W AE AE B TH D NG D EO IA TH A B I C X S EA E H AE A J
~~~

This is a mechanical output, not plaintext. The exact 53-rune comparison and the alphabet-support contradiction reject the frozen Bifid interpretation without relying on a language score.

## Positive control and scope

A 75-rune p57-derived GP stream restricted to the same 25-symbol support was encrypted and decrypted with the identical period-25 implementation. The 53-rune suffix and 22-rune withheld prefix were recovered exactly; full recovery was **75/75**. The p57 control is non-contiguous after support filtering, so it validates the Bifid mechanics only, not natural-language performance.

**Decision:** retire only the standard period-25 Bifid interpretation using the original p05 square's ascending numeric-rank order, row-major tie break, and p55's observed GP25 alphabet, under the two stated p55 page clocks. This is a genuine, clue-motivated nonlinear test, but it does not validate either speculative crib and yields no original plaintext or key. A different alphabet reduction, key schedule, or nonlinear cipher would need its own independent source selector; do not rescue this candidate by sweeping mappings or periods.

**Reproducer:** node sims/lp2_p55_p05_moth_bifid_53crib_sft.cjs.

The overall established research synthesis remains unchanged because this negative does not alter the fact that all 56 unknown LP2 pages remain unsolved.
