# Original LP2 fixed whole-word rotation cannot remove ciphertext doublets

**Agent12, 23 November 2026. Classification: a bounded original-input necessary-condition exclusion. No unknown LP2 plaintext, key, or author-selected operation was recovered.**

## Cipher hypothesis that this decides

The 2016 signed instruction refers to words and direction; solved p57 asks the reader to shed circumferences. A human might therefore try undoing a **single fixed cyclic rotation of every printed ciphertext word**, especially if a predecessor-excluding or otherwise anti-repeat cipher had produced an earlier stream with no adjacent equal runes. This hypothetical *final ciphertext-side transposition* is different from prior tests rotating plaintext before a one-special-rune emitter. The source does not explicitly command a rotation.

Freeze the authentic 2,896 printed complete LP2 words, including 32 words carried over a physical page break, and their exact 12,956 source GP29 rune indices on physical p0–55. The plaintext/ciphertext alphabet, any key and any actual plaintext remain unknown. For an integer `r`, rotate each complete ciphertext word `W` to `W[r mod |W|:] + W[:r mod |W|]`, concatenate all words, and count positions `i>0` with exactly equal adjacent runes. This retains every source rune, preserves printed word lengths, and is fully reversible. A **single global `r`** is the entire tested parameter family; no per-word choice or fitted alphabet is admitted.

## Exact exhaustive result

The maximum printed word length is 14. Every global rotation is consequently equivalent modulo `LCM(1,...,14)=360360`; exhaustively counting all 360,360 values tests **every integer offset**, including much larger manuscript numbers. To make the bound fast and checkable, factor the equal-pair cost into per-word interior costs depending on `r mod wordlength` and pair-of-neighbor-word edge costs depending on `r mod lengthPrevious` and `r mod lengthNext`. All factors are calculated directly from unchanged original source words, then evaluated over the complete period. For selected values the factorization is independently cross-checked by literally rotating every word and counting transitions.

| Original-source measurement | Exact count |
| --- | ---: |
| Original unknown ciphertext | 12,956 runes / 2,896 words |
| Equal adjacent pairs in original word interiors | 63 |
| Equal adjacent pairs at original word boundaries | 23 |
| **Original total** | **86** |
| Short nonzero offsets `-14..-1,+1..+14`, minimum count | **146** |
| All 360,360 fixed rotations, **minimum count** | **86** |
| Global offsets tying this minimum (including zero) | **33** |
| Global offsets improving on the unmodified original | **0** |

Therefore **no fixed global whole-word rotation can expose an underlying strictly no-repeat rune stream**. In fact the unmodified source is already a global minimizer for this original statistic. The 33 tied offsets prevent claiming a uniquely determined orientation. Independent reversal of every word yields 150 equal transitions (not part of the cyclic family).

This is a deterministic all-offset necessary-condition exclusion of that proposed *strict zero-doublet pre-rotation stage*. It is **not** a claim that ciphertext-side rotations of different scope or variable per-word amount are excluded, nor that the low-repeat mechanism is known. Since the observed original itself has 86 events, an outer rotation followed by a cipher allowing similar numbers of repeats remains logically possible. The test deliberately does not optimize language or propose a plaintext from these counts.

## Decision and reproducibility

Do not invest in a **global fixed word-rotation predecoder** solely to turn LP2 into a strictly no-repeat alphabet stream. Further rotation or anti-repeat constructions need an independent original opcode and explicit exception rule. This independent source constraint reinforces the prioritization of a genuine key/state update or recovered unknown plaintext.

[One-file Windows Node22 read-only SFT](../sims/lp2_outer_wordrotation_repeats_source_sft.cjs) loads the unchanged [original GP29 corpus](../resources/liber-primus/lp2-corpus.json) and [original word-delimited transcription](../resources/liber-primus/lp2-transcription.txt), checks every parsed rune against the 12,956-rune source tape, asserts the 86 original event split, and exhausts all global rotations with direct-rotation spot checks. The exhaustive counts were also independently computed in a separate source-reading calculation prior to writing the SFT. This original-source result is a negative mechanism decision, **not a genuine solution**.
