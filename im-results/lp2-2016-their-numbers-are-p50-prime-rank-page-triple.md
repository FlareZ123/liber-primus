# Signed-2016 “their numbers are” → p50 prime-rank page triple

**Status:** provisional navigation observation; no LP2 plaintext or key recovered.

## Source-locked observation

The authenticated 2016 message contains 43 alphabetic words. Under the repository's existing GP0 word-sum convention, each word's sum directly indexes the original 256-byte p50 table. There is exactly one run of three consecutive prime-valued lookups in the full 43-word message: word indices 25–27, **THEIR NUMBERS ARE**.

| 0-based word index | Word | GP0 table address | p50 base60 token | Byte value | Prime ordinal |
|---:|---|---:|---|---:|---:|
| 25 | THEIR | 34 | 3H | 197 | 45 |
| 26 | NUMBERS | 83 | 3D | 193 | 44 |
| 27 | ARE | 46 | 3J | 199 | 46 |

The prime ranks π(197), π(193), π(199) are therefore **45, 44, 46**. Interpreting those ranks as zero-based LP2 page indices selects pages **45, 44, 46** in the source-word order. This is a source-motivated page-selector hypothesis, not an authenticated instruction: the message does not explicitly say “take the prime ordinal as a page number.”

## What the selected pages show

| LP2 page | Original rune count | Printed lines |
|---:|---:|---:|
| 45 | 270 | 12 |
| 44 | 273 | 12 |
| 46 | 270 | 12 |

The selected pages form the consecutive page set 44–46, in the non-monotone order 45→44→46. They sit inside the p40–p55 repeated-frame cohort, so the shared border is not unique evidence. Their lengths total 813 and are all divisible by three; this is structural context only, not evidence for a period-three cipher.

## First receiver tests

Two natural coordinate readouts were frozen and tested:

- Use the prime values as rune offsets on their selected pages: p45[197], p44[193], p46[199] → **O J TH** (GP indices 3, 11, 2).
- Use the source words' GP0 sums as rune offsets on those pages: p45[34], p44[83], p46[46] → **S D C** (GP indices 15, 23, 5).

Neither three-symbol stream yields readable English when used as a repeating subtractive GP29 key on p29 (the source word DIRECTION is at index 29) or on the selected pages. The reproduction script reports exact dictionary-hit counts. These failures reject only those direct Vigenère receivers, not the page-selector hypothesis itself.

The simple page-number-phase shared additive/XOR pad model across p44–p46 also fails pairwise word-dictionary compatibility. Separately, p44's 273-rune length matches the p29/p50 residual length, but the prior direct additive residual-key test on the 273-rune targets is negative; equal length alone does not establish a key relation.

## Important false lead rejected

It is tempting to note that 193, 197 and 199 are just above 16×12=192 and map them to lines 1, 5 and 7 after a hypothetical 16-page/12-line block. That block does **not** exist: the actual p40–p55 transcription has **155** printed lines, with variable page line counts. Do not use 192 as a line-count base or map these primes to p56/p57 lines on that basis.

## Assessment and next decision

The GP0→p50 lookup and the unique prime triple are reproducible. The extra step “prime ordinal → LP2 page index” is plausible under the 2016 “numbers are the direction” instruction, but it has not yet produced a reversible operation or plaintext. Prior p50 prime-ordinal graph work and p56 prime-totient transfer work cover adjacent mechanisms; this report does not reopen those broad searches.

A worthwhile successor must find an independent, human-visible reason to interpret prime rank as an LP2 page index, or a source-selected reversible operation on pages 45/44/46. Do **not** expand into arbitrary key phases, Caesar shifts, transposition variants, or more prime/radix sweeps without such a selector.

## Reproduction

From the repository root:

node sims/lp2_2016_gp0_p50_prime_rank_page_triple_sft.cjs

The script reads the signed 2016 message, canonical GP29 corpus, original p50 byte table, original transcription, and word-frequency control. It asserts the 43-word source, the unique prime triple, page lengths/line counts, and the rejected 192-line interpretation; it also reproduces the two direct three-symbol key tests.

**Related prior work:** lp2-p50-directional-functional-graph-prime-ordinal-starts.md, lp2-p50-prime-ordinal-totient-receiver-gate.md, and lp2-p56-prime-totient-plaintext-word-direction-gate.md in this directory.
