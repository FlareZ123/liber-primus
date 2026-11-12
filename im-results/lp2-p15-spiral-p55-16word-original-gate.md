# LP2 p15 source spiral applied as a 16-word p55 cipher key

**12 November 2026, Agent 2. Status: bounded negative original-cipher test; no plaintext, actual key or destination.** The idea is to test a human-visible, finite cross-page match as a complete operation before expanding its variants.

## Source-selected inputs and the unproved bridge

- Physical LP2 p15 (original archive `32.jpg`) prints a 4×4 grid that has already been **completely solved mathematically**: start at the red **3299** and spiral clockwise, yielding `3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516`. These are `abs(3301-prime(FibonacciDistinct[i]+1))`. See [established source mechanism](../results/lp2-p15-fibonacci-prime-spiral.md).
- Physical LP2 p55 (original archive `72.jpg`) contains a leading one-rune **NG** that finishes the word begun on p54, followed by exactly **16 complete printed words**. Their authentic GP29 rune lengths are `[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`, totalling **75 runes**. The last six ciphertext runes spell `DJU BEI`, also occurring at p27:28; this does not provide plaintext.
- The 2016 signed message speaks of *words as map* and *numbers as direction*, but **does not instruct** the specific p15→p55 correspondence. The 16-to-16 alignment here is a hypothesis, not a recovered instruction. It also has no demonstrated continuation to the p56 hash.

## Frozen reversible candidate

Assign printed p55 word `j` to the source p15 spiral's `j`th number, reduce that number modulo 29, and decrypt *every rune within that entire word* with the same additive GP29 shift:

`P[j,k] = (C[j,k] - (N[j] mod 29)) mod 29.`

This uses the standard source-authentic GP29 index and Cicada's historical use of additive GP29 cryptography. Test the opposite sign as an explicit negative control. A competing source-visible allocation is the grid's printed **row-major** numbers, with the same two signs, for four locked configurations in total. No source-selected nonce, period fitting, F skipping, per-word offset fitting, inferred plaintext, or word-order reshuffling is allowed. The incoming NG from p54 is excluded because it is a word carry, not a complete 17th word.

All four readings are exactly invertible. A positive control partitions the **first 75 original, authentically clear GP29 runes of p57** into the same sixteen lengths, encrypts them under each fixed 16-value key, and recovers all 75 with the inverse. This checks the arithmetic and complete word handling; it does not validate the proposed historical cipher.

## Original 75-rune results

| Fixed number order | Decode sign | Whole-output GP29 IoC | Plaintext-like output? |
| --- | --- | ---: | --- |
| Original p55 unchanged | 0 | **0.038559** | No |
| p15 red-center outward spiral | subtraction | **0.032793** | No |
| p15 red-center outward spiral | addition | **0.036036** | No |
| p15 printed row-major | subtraction | **0.030991** | No |
| p15 printed row-major | addition | **0.033153** | No |
| Original clear p57, first 75 runes | control | **0.059459** | Yes, known solved text |

For example, the frozen spiral-subtraction output starts `OYBX DAE AF IAAEGXH ETPGDM GO` and ends `NF OETIAWOETH GDP AEYE`. The opposite-sign output starts `EEOOF WN RN OFDJMP JNGEATEO HC`. These are direct GP transliterations of all original ciphertext runes, without language-model selection. The [CommonJS SFT](../sims/lp2_p15_spiral_p55_16word_sft.cjs) prints every decoded word, all four precise scores, the round trips, the source-square order and the 75-rune native cleartext plant.

## Research consequence

This is a distinct source-motivated **per-word** application of the p15 spiral, rather than the previously exhausted sixteen-period *per-rune* pad tests. It has the additional virtue of using p55's exact 16 complete word boundaries. **All four fixed readings fail to yield authentic text**, despite valid original inverse arithmetic and a solved-page native control. No evidence currently selects the p15 spiral as a p55 keystream at all; extending it to extra signs, phases, reductions, word permutations or key derivations would add free parameters without a human-readable author instruction.

The frozen 16-word/Tor-v2 interpretation also remains conjectural. In particular, the previously tested per-word GP-prime sum modulo32 gives `6sws36unkmvdy4b7`; reordering those same 16 values via the p15 outward spiral gives `6uvmk36swsnd7b4y`. Neither is an authenticated onion, and the manuscript gives no independent mandate for the sum/mod32 codec. No claim of a p55 decoder, original source-key identification, or full LP2 plaintext follows.
