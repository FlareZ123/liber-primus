# Q-cubic as an actual three-register additive keystream: exhaustive original-source negative

**Agent22, 23 November 2026.** Source-motivated candidate cipher, exhaustive all-private-IV original computation and solved-native positive controls; **no LP2 unknown plaintext, authentic cipher opcode or source-selected key recovered**. This is a bounded exclusion of a precise three-register architecture, not a conclusion about all Q-polynomial uses.

## A physically motivated, reversible decoder

The exact original source facts are documented in [p28/p33/p29 cubic syndrome](lp2-p28-p33-p29-dh-cubic-syndrome-gate.md) and [p29 printed word packet](lp2-p29-dhframe-p28-exact-inner-original-gate.md). The original p39 red triple `[27,5,15]` and p29 terminal operands constrain the GF29 polynomial

```
Q(X) = 15X³ + 18X² + 12X + 6
     = 15(X−3)(X−24)² mod29.
```

An economical historical cipher interpretation is to use Q as the characteristic polynomial of a three-register linear-feedback keystream. Because `15^{-1}=2 mod29`, the precisely specified recurrence is

```
k[n+3] = 22*k[n+2] + 5*k[n+1] + 17*k[n] (mod29).
P[n]   = C[n] − k[n] (mod29); C[n] = P[n] + k[n] (mod29).
```

The 2013 authentic miniature DH tuple and p29's first complete word `[K,p,a]=[2,23,6]` suggest one visible initial state. We **do not require that crib to be true**: every possible initial state `(k0,k1,k2)∈GF29³` is tested. Q's nonzero constant implies invertible three-register evolution, so every stream phase is also covered by some IV. Changing the mask's scalar and sign merely changes the IV; changing the output by any global nonzero affine GP29 substitution preserves index of coincidence (IoC). Therefore this exhaustion encompasses all unknown initial states, phases, affine output gain/offset and mask signs *within this same additive GF29 LFSR architecture*. Independent per-page IVs are granted; the pages do not have to use the same seed.

No authenticated 2014 or later Cicada source explicitly says to turn Q into a feedback polynomial. The operation is a period-executable candidate motivated by the actual polynomial, rather than a claimed historical solve instruction.

## Original untouched targets and complete outcome

The input consists of original physical p28 all 269 runes, p29's **printed-word-aligned** `[3:272]` middle 269 runes, and p33 all 214 runes. The p29 choice preserves the exact 3|269|2|3 source frame, without moving a word boundary or changing a rune. The 29³=24,389 IVs are searched **separately for each**.

| Original target | Best decoded IoC across all 24,389 IVs | Seed attaining maximum | IVs with IoC ≥0.045 | IVs with IoC ≥0.05 |
|---|---:|---|---:|---:|
| p28 (269 runes) | 0.03911668423680852 | [6,4,28] | 0 | 0 |
| p29 original interior (269) | 0.03972701548021972 | [5,16,3] | 0 | 0 |
| p33 (214 runes) | 0.04159536659207582 | [8,14,14] | 0 | 0 |

The literal first-word DH IV `[2,23,6]` produces p28 IoC 0.03428951895, p29 interior 0.03403983798, and p33 0.03330261946. None of the three targets has one plausible extended native-GP English readout under this class. The maximum-score values themselves were computed on ciphertext and must not be described as authenticated source keys.

**Original solved-source positive.** The actual clear-text p57 GP29 95-rune PARABLE register is cycled in fixed order only to build 269/269/214-rune correctly formed native-GP controls. Their true IoCs are 0.06891194585, 0.06927259613, 0.06721951648. Masking with the actual p29 first-word IV `[2,23,6]` gives cipher IoCs 0.03390112634, 0.03406758031, 0.03650563819; the inverse recovers **269/269, 269/269, 214/214** original control runes with their elevated native IoCs. These controls establish correct arithmetic and that plausible prose is not mechanically suppressed by the decoder; they are repeating native phrases, not independent literary-plaintext distribution estimates.

The original data fail the straightforward interpretation of Q as an additive page-stream generator **for ordinary GP-native prose**, even granting the entire secret IV space. This does not constrain a Q-polynomial checksum, convolution, variable-length code, nonlinear plaintext feedback, different message register, altered word segmentation, or externally supplied state transitions. Such variants need independent physical instructions before more compute is warranted.

## Exact reproduction

[Node.js 22/CommonJS one-file SFT](../sims/lp2_p29_dh_q_cubic_lfsr_allstates_sft.cjs) reads the checked-in original `resources/liber-primus/lp2-corpus.json`, asserts source p29 and p39 operands, enumerates every triple, outputs each exact maximum, and checks source-native encryption/decryption. It has no dependencies beyond Node.js. [Actual Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45188942112).

**Next causal decision:** before resurrecting Q as a cryptographic primitive, find one first-party clue that specifies *its consumer* and whether the polynomial is an encoder/generator/checksum. A different unmotivated sign, Caesar phase or IV search is mathematically subsumed here.
