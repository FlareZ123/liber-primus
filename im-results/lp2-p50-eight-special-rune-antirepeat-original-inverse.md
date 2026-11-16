# LP2 256-cell tableau as a source-keyed eight-special-rune anti-repeat decoder

**16 November 2026, Agent16, Director Issue #1205. Classification: one complete source-byte-driven, GP29-lossless original-cipher negative. No unknown plaintext, key, or original escape interpretation recovered.** [Original-source CJS reproducer](../sims/lp2_p50_eight_gp_special_antirepeat_sft.cjs) · [executed 16 November manual CI](https://github.com/FlareZ123/liber-primus/actions/runs/43826967019). This is independent of earlier **one constant reserved rune** and **stationary source-alphabet permutations**; it preserves all 29 native symbols at every position through a **changing, source-byte-defined exceptional GP rune**.

## Hypothesis frozen from source layout

The original pp49–51 printed field is **32 rows × 8 two-character source cells**, conventionally rendered as **256 bytes** (radix60 is not authenticated). There are **exactly seven multiletter GP rune transliterations**: TH, EO, NG, OE, AE, IA, EA, indices **[2,12,21,22,25,27,28]**. The authentic solved-p56 F-interruption marks the additional distinguished rune F/index0, producing the fixed eight-class register **[F, TH, EO, NG, OE, AE, IA, EA]**. This selection was frozen before reading original decoded text. **Neither the 8-class grouping, byte orientation, nor table-to-rune mapping is authenticated Cicada instruction.** It is a source-constrained test, not an assertion of intended mechanism.

Read all 256 conventional bytes in original row-major order and clock once per **rune**, continuously across **55 rune-bearing p0–55 pages**, skipping zero-rune p50 and preserving all 2,896 original printed words including **32 cross-page carrying words**. For plaintext GP29 index `p`, byte `b=grid[i%256]`, and preceding current-page ciphertext rune `prev`, set the special plaintext marker `R=[0,2,12,21,22,25,27,28][b&7]`. Let `z=p-[p>R]` (0–27 for all `p≠R`). Define:

```text
if first rune on original physical page:
    C = (p + b) mod 29
else:
    Δ = 0                       if p = R
        1 + ((z + (b>>3)) mod28) otherwise
    C = (prev + Δ) mod29
```

The inverse is exact on every GP29 input: the page-first rune subtracts `b`; otherwise `Δ=(C-prev) mod29`. For `Δ=0`, return **R**. For `Δ≠0`, recover `z=(Δ-1-(b>>3)) mod28` and `p=z+[z≥R]`. Its special rune is a **repeated ciphertext rune**, a self-delimiting exception with no sidecar; its varying value depends on the original table rather than a fixed English letter. It need not uniformly suppress repeats for all arbitrary inputs, so the universal ≤86 doublet capacity lower bound does not apply to this unconstrained encoder. Every source rune and all 86 actual repeated locations are represented with **zero loss**.

## Original ciphertext and positive native-English tests

The [Node22 executable](../sims/lp2_p50_eight_gp_special_antirepeat_sft.cjs) checks the exact original 12,956 GP29 source rune sequence, 2,896 source-carried words, 256 printed table cells and first eight source bytes. It forward reencrpyts **12,956/12,956 original decoded runes exactly** and inverts **144 separate independently planted** full-length source-native Shakespeare, Gibran and Emerson word-length-matched plaintext streams, 48 per corpus. Source-native orthography is the independently calibrated full solved-LP1 and heldout solved-LP2 p57 implementation, not a dictionary guessed from the unknown LP2 original.

The two target original observations are (a) **86** same-page adjacent repeated-cipher runes and (b) **104/2,105** within-original-printed-word fifth-back equality opportunities. The source-shaped positive plants yield:

| Control / original | Cipher adjacent repeats | Within-word fifth-back equalities (out of 2,105) |
|---|---:|---:|
| **Untouched original LP2** | **86** | **104** |
| Shakespeare, 48 synthetic encryptions | **122.21** average (101–146) | **70.63** (53–106) |
| Gibran, 48 synthetic encryptions | **132.79** (102–156) | **72.02** (58–89) |
| Emerson, 48 synthetic encryptions | **131.40** (111–157) | **74.69** (61–90) |

The original direct inverse produces GP29 coincidence **0.0345130**, versus source-native English plaintext controls ≈**0.0601–0.0610**. It produces no readable sentence in the first 120 runes, and no coherent original plaintext. Thus this **frozen, complete table-derived key family** fails both native-plaintext inverse and the typical joint original repeat/lag-five signature. A rare exceptional English control reaching 104 lag-five events does not repair the inverse.

## Decision

This falsifies the **particular** eight-special-rune / low3 marker / high5 nonrepeat permutation / original 256-byte row-major clock, even though the entire construction is reversible and its low adjacent-repeat rate is substantially closer to the original than iid GP29. The original table has not been shown to carry exception data; here it was explicitly treated as a repeating secret schedule, and no authentic source instruction chooses that schedule. Do **not** infer that all changing-symbol anti-repeat machines are excluded. A viable replacement must explain **the exact original use of both numeral characters and punctuation**, produce a real readable unknown sentence, and reproduce the additional fifth-back recurrence effect on untouched original text. The previously found phase-zero leading-digit/equality enrichment is an interesting **source-conditioned association**, but is insufficient by itself to supply the missing decoder.
