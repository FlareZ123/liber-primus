# Signed-2013 affine 28-cycle keyed by the original 256-cell LP2 grid

**Agent 49, 15 November 2026. Classification: source-motivated, exact, bounded negative.** The authenticated 2013 DH worked example produces an invertible 28-cycle on original GP29 symbols, but the simple p50-table-keyed full-book realization returns no coherent GP prose. This is neither a recovered key nor a claim that Cicada intended this operation.

## Source-to-operation argument

The signed 2013 Cicada DH example has server public **8** and shared secret **2**, recovered exactly in [the source bridge](lp2-2013-signed-dh6-lag6-original-source-bridge.md). Applied to the later 29-rune alphabet, they define the affine map

```text
T(x) = 8 - 2*(x-8)  (mod 29) = 24-2*x (mod29).
```

It has fixed point 8 (GP **H**) and multiplier −2 of multiplicative order **28** modulo29; consequently every one of the other 28 GP29 symbols belongs to a **single reversible 28-cycle**. The T operator is also the prior original word-local lag-six ciphertext echo at 80/1,290 eligible positions, a relationship first published elsewhere. These are independent source objects; transporting a worked 2013 DH map into the later book remains a hypothesis.

The original physical pp49–51 32×8 numeral table conditionally yields exactly **256 bytes**, a natural finite source of per-rune exponents. This test freezes a particularly simple complete hypothesis: `C_i=T^(k_i)(P_i)`, with each key exponent `k_i=byte[i mod256] mod28`. Try both algebraic directions and both conventional clocks, one beginning at rune0 globally or one resetting to byte0 at the beginning of each physical page. Original physical p50 has zero GP runes; it advances no clock. No phase tuning, sign switching per word, editorial word segmentation, unknown seed or cipher-register fitting occurs.

The complete inverse, for any rune `C`, is `P=8+(-2)^(-k)*(C-8) mod29`; at the H fixed point the letter remains H for every key. This is a fully reversible **29-symbol** cipher, with no artificial escape character.

## Direct original-cipher outputs

Read all **12,956 original unknown runes** on physical pp0–55 in exact page order, with original printed p50 table unchanged. The four directly source-selected decryptions have:

| Table clock | Inverse exponent | Decoded original GP29 IoC |
| --- | --- | ---: |
| Global book start | `-k` | **0.034527359710** |
| Global book start | `+k` | **0.034479363041** |
| Physical page reset | `-k` | **0.034455007233** |
| Physical page reset | `+k` | **0.034469461047** |

The original ciphertext IoC is **0.034478397865**. Each candidate remains indistinguishable from the approximately uniform **1/29 = 0.034482758621** register and produces unrecognizable GP letter sequences; the first 20 runes for the global, negative-exponent decoder are `C H B NG R U E R A N L TH B R A D U Y A P`. The independently readable p57 sample has IoC above **0.06**, providing a source-native contrast. These values reject the four fixed direct GP plaintext interpretations. They do not rule out a later unknown second cipher layer, but there is no separate author-side clue to add one.

**Reversibility controls:** for all four source-timed models, reapply the exact forward T powers to the decoded original and recover every one of the **12,956/12,956** input runes. Additionally use the original **95 solved p57 runes** repeated to populate each authentic original page length, including the runeless p50, encrypt that complete **12,956-rune** native-GP plant under the identical table powers and recover **all 12,956/12,956 native runes** for each model. The SFT asserts the entire original source rune count, p55 terminal 76-rune page, exact 28-cycle, signed original constants, fixed original IoCs, every original roundtrip and all native plants.

## Decision

Retire the **literal 2013 signed affine T-cycle powered by the original row-major grid bytes as a direct LP2 GP rune cipher**, for both algebraic directions and the two natural reset origins. A future model must point to independently recognizable instructions selecting a different exponent schedule or operation before consuming more compute. The original lag-six 80/1,290 observation and 2013 DH→red-triad/p50 factor relationships remain real but do not by themselves yield a reversible LP2 decoder.

[Single-file Windows Node22 SFT](../sims/lp2_2013_dh_t28_grid_exponent_original_sft.cjs) · [passing on-original Windows CI](https://github.com/FlareZ123/liber-primus/actions/runs/43661235699). This report belongs in supporting evidence only. The authoritative results synthesis and manuscript's unsolved status remain unchanged.
