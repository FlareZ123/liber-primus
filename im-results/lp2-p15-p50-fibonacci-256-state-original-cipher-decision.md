# Fibonacci spiral and 256-byte table as a finite GP29 state generator

**Agent6, 22 November 2026. Classification: one clue-constrained negative original-cipher inverse, not a recovered key or plaintext.**

## Concrete puzzle-maker hypothesis

The **source-authenticated p15 4×4 spiral** indexes Fibonacci ordinals `1,2,3,5,8,13,21,34,55,89,144,233,377,610,987` (the first marked index0 is represented in the printed opening). Later original physical p49–51 contains exactly **256** base60-byte-valued cells in a **32×8** panel. A period-available **lagged Fibonacci** generator is a natural, low-description-length operation that could link these two numerical sources and feed an evolving ciphertext key.

**Freeze an actual derivation rather than hunt lag pairs:** the *largest two Fibonacci ordinals that both fit within a 256-position circular state* are **144 and 233**. Initialize the state from all 256 original table bytes, untouched, in row-major order. Starting at index256, use

```
K[n] = (K[n-144] + K[n-233]) mod m
```

for `m=256` (the original byte register) or `m=29` (native Gematria Primus arithmetic). Decrypt the entire **1,613-rune** original p16–21 runic section (the six pages immediately after the p15 spiral), with a continuous clock across original page/word breaks, from zero phase using `P=C−(K mod29)`. The opposite sign is the only symmetry control. The original source does **not** expressly instruct using the p50 table as this generator's seed. This is a bounded historical mechanism hypothesis.

## Fixed original ciphertext outcomes

| State arithmetic | Cipher sign | Combined 1,613-rune IoC | Pagewise IoC p16–p21 |
|---|---|---:|---|
| 256-byte, add lags144/233 mod256 | `C−K` | **0.034697** | .03402, .03396, .03570, .03444, .03432, .03536 |
| 256-byte, add lags144/233 mod256 | `C+K` | **0.034501** | .03329, .03687, .03466, .03455, .03282, .03399 |
| GP29, add lags144/233 mod29 | `C−K` | **0.034372** | .03405, .03426, .03472, .03291, .03423, .03351 |
| GP29, add lags144/233 mod29 | `C+K` | **0.034521** | .03303, .03480, .03481, .03529, .03429, .03536 |

All outputs remain uniform-like and linguistically incoherent, throughout the intact source 1,613-rune receiver. Genuine independent solved clear p57 has IoC **0.062710**; the frozen source-derived state and exact inverse recover all 95 planted real p57 GP runes, serving as an implementation positive. Even the **first 256 runes of original p16** already use the unmodified p50 bytes before the recurrence can influence the stream, and cannot be rescued merely by choosing different lag coefficients. A new cipher mode or independent key rule would be a different hypothesis.

Reproducibility: [single runnable Node22/CJS original-corpus test](../sims/lp2_p15_fibonacci_p50_256state_original_inverse_sft.cjs). It asserts all original page lengths and the original table-byte range, logs every full-page output statistic/preview, and verifies synthetic GP29 positive/negative replay.

## Full 29-symbol low-repeat inverse using the same state

The original unresolved ciphertext has only **86 repeated adjacent runes** across 12,956 characters; a direct additive keystream need not explain that unusually small rate. One reversible, human-simple candidate uses a **29-position circular alphabet** and a 28-branch next-rune selection. For each source rune, let `delta=(C[i]-C[i-1]) mod29`, using the **actual final original p15 rune** as p16's initial predecessor. Decode:

```
if delta == 0: P[i] = 28    // rare GP-native EA rune sentinel
else:          P[i] = (delta - 1 +/- (K[i] mod 28)) mod 28
```

The 28 nonzero circular distances encode all GP indices0–27 bijectively; the zero-distance step alone represents GP index28 (EA). No discarded symbols, per-position substitutions or guessed repeat masks. The inverse is exact for all 29 original rune classes, preserves all original word/page clock positions, and reproduces the complete 1,613-rune untouched source when reencrypted. The **9 observed equal-adjacent events** in p16–21 become exactly **9 decoded EA sentinels** by construction. A genuine solved-p57 GP95 plant roundtrips in both directions. This is a transparent test of a compact anti-repeat decoder, *not an independently authored declaration that EA must be the reserved class*.

With the **same p15 F144/F233 state and original p50 table byte seed**, all four original whole-receiver outputs still fail:

| GP rotor state and arithmetic | Full 1,613-rune decoded IoC |
|---|---:|
| GF(256)-byte state, `delta−1−K` | **0.035292498** |
| GF(256)-byte state, `delta−1+K` | **0.035187120** |
| GP29 state, `delta−1−K` | **0.035464795** |
| GP29 state, `delta−1+K` | **0.035479410** |

No coherent source-native plaintext emerges. This new first-order nonrepeat-aware consumer escapes the older *stationary predecessor S-box* assumptions by carrying a source-derived evolving key, but fails the untouched source data. The only apparent fit, the exact preserved count of nine repeat sentinels, is an unavoidable identity of the chosen bijection and gives zero evidence that its ordinary 1–28 outputs are correctly decoded.

## Decision

Retire this **specific** p15-maximal-Fibonacci-state seeded original-p50 additive inverse. An author-chosen cipher generator remains unknown. The same source-derived register was also given a **full reversible 28-neighbor circular decoding model** consistent with the rare adjacent-repeats; all four original outputs fail. This is eight finite direct original-cipher failures under two mechanisms, with positive replay. It provides no reason to extend the model by searching more lag pairs, phases, output maps or page resets.
