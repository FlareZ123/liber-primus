# Direct NEWBAS positional-radix and nonzero-step original-cipher gate

**Status: bounded original-cipher negative (13 November 2026).** This is a fixed, low-complexity *hypothesis* joining three pre-existing original-source observations. It recovered no unknown LP2 plaintext, authentic key, authenticated next operator, or destination. The exact original-input and positive-control implementation is [`sims/lp2_newbase_nonzero28_radix60_sft.cjs`](../sims/lp2_newbase_nonzero28_radix60_sft.cjs).

## Source evidence and admissible operations

The original p0 width563-associated word #6 begins with literal GP glyphs **NEWBAS** followed by **OE** (rather than E). The signed 2016 image measures **563×569**; source dimensions of the independently archived 2012 first image are **503×509**, differing by **60** after aligning shorter sides. Those are clues for a *candidate* radix, not a creator-authenticated `NEW BASE` instruction. The original pp49–51 32×8 alphanumeric table has conventional base60 and omit-`f` base59 interpretations. The full-book LP2 ciphertext has only 86 adjacent equal-rune events, so thirteen complete original rune-bearing pages have **no adjacent equal pair**.

We froze two simple, keyless, exact-numeral consumers before evaluating their outputs:

1. **Full-page direct GP29 positional numeral → base60 or base59:** treat original GP indices as one big-endian base29 number and convert to the fixed printed base alphabet, preserving the original page's rune length for any inverse. Test p0, p1, and their contiguous concatentation in source order. This differs from the older whole-*word* base-conversion exclusion in [the 2016 word-sum report](lp2-2016-image-first-two-wordsum-gate.md).
2. **Nonzero predecessor-difference GP28 positional numeral → base60 or base59:** on complete pages where every `(C_i−C_{i-1}) mod 29` is nonzero, retain the original first rune as an explicit IV and map each following step `d_i=(C_i−C_{i-1} mod 29)−1` into `0..27`. The resulting base28 digits constitute an exactly reversible ciphertext register: `C_i=(C_{i-1}+d_i+1) mod29`. Interpret the full page's `n−1` digits as one big-endian base28 integer, then display base60 or base59 digits. The only allowed zero-padding on inversion is the independently known source register width. No repeated original rune is erased, so the test is confined to the zero-doublet subset; the remaining 42 rune-bearing pages demand an unspecified escape/transport for their zero steps.

This delta28 hypothesis was constructed after observing the original doublet deficit. No authenticated Cicada text identifies the delta operation, IV or radix as the actual LP2 mechanism. These tests must remain conditional.

## Frozen original-input results

The source is the [canonical 58-page LP2 JSON](../resources/liber-primus/lp2-corpus.json), restricted to original unknown physical pages 0–55 (55 rune-bearing pages, 12,956 symbols). The two target alphabets are the conventional `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx` (base60), and that exact sequence with lowercase `f` omitted (base59).

| Original input and fixed page clock | Target | Output length | Uppercase A–Z | Other characters | Opening characters |
| --- | --- | ---: | ---: | ---: | --- |
| p0 full GP29 | base60 | 216 | 85 | 131 | `3fr52i3lBFN4g9gIlDUNdbFQHooAwAmI` |
| p1 full GP29 | base60 | 219 | 101 | 118 | `JHLdh95TTtGR5PjZsL3dwApEaGmG0` |
| p0+p1 full GP29 | base60 | 435 | 186 | 249 | `1OrYC8axTGGrwRHwfdj3DmtnVpZE` |
| p0 full GP29 | base59 | 217 | 101 | 116 | `2JB1QKJE0XEVZYKbceWJRRYKVVwO` |
| p1 full GP29 | base59 | 220 | 101 | 119 | `CjY6nKuBRc2ONrgacpp22RqCtBZ` |
| p0+p1 full GP29 | base59 | 436 | 208 | 228 | `ZHUigGbsM7CdANuGRF6xUWTJrV6` |

The **13 complete no-repeat pages** are physical **p5, p7, p13, p14, p15, p17, p28, p31, p37, p38, p40, p49, p53**. Their delta28→base60 output has **979 uppercase characters among 2,257**, and delta28→base59 has **999 uppercase among 2,268**. In each decoded page output, digits or lowercase letters remain interspersed. The base60 output of p5 begins `1rQmTAad9eVVrh5Kfuc3p93BEgoKtoTa`; the base59 output begins `18nXqceGJHUGn6BrhQBexiXsCauNW1`. Both preserve the exact original 263-rune p5 input through the IV, register-length metadata and inverse. Neither resembles readable GP-native uppercase English.

The standalone SFT asserts exact original-rune round trips for all thirteen delta28 pages, direct page-radix round trips, and native uppercase planted recovery of the authentic p57 `SHED OUR OWN CIRCUMFERENCES ... EMERGE` text under each base/rank construction. These are implementation checks. The candidate fails its plaintext criterion on authentic unknown original text regardless of those passes.

## Decision

Retire **only** the direct full-page GP29→base59/60 positional cast and the direct no-repeat page-local GP28-difference→base59/60 cast. These emit mixed alphanumeric outputs across every original test page. The result does not exclude a keyed stage before/after conversion, a different framing choice independently selected by a future source, or a lossless escape convention for the 86 global doublets. Those extensions currently have no original source selecting them, so scanning them would supply arbitrary degrees of freedom without a credible human solve path. The most valuable missing input remains an authored, reversible operation with its key, clock and endpoint fixed independently of the unknown ciphertext.
