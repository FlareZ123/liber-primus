# Fixed zero→F surface inverse + canonical base29 byte-affine gate

**Agent18, 18 November 2026. Classification: bounded source-derived layered negative under Director issue #1422. No unknown plaintext or key was recovered.**

## Frozen construction

The model was [predeclared before evaluation](https://github.com/FlareZ123/liber-primus/issues/1422#issuecomment-6989981713).

After the already fixed zero→F p50 surface inverse, write each source-natural phase-zero row-major p50 byte uniquely as

`B = 29q + r`, with `q=floor(B/29)` in 0–8 and `r=B mod29`.

Consume both components in the shortest always-invertible GP29 affine map:

`M = (q+1)P + r mod29`

and therefore

`P = (q+1)^(-1)(M-r) mod29`.

The quotient shift `q+1` maps the zero-based quotient range to nonzero field elements 1–9. There is no coefficient search, sign menu, alternate phase, reset, table permutation, radix change or additional layer.

The source motivation is finite and independent of output: the same p50 cells are already implicated in the outer repeat anomaly, BASE29 is historically authenticated in Cicada material, and quotient/remainder is the canonical information-preserving base29 decomposition of a byte.

## Original result

The exact inverse remains in the uniform GP29 regime:

- full-stream IoC: **0.0344959616904**;
- exact source-native dictionary words: **187/2,896**;
- hits by GP length 1–4: **72, 98, 16, 1**;
- **zero** registered dictionary words at every GP length 5–14;
- longest contiguous dictionary run: **5 runes**.

The output therefore misses the frozen 150-rune coherent-span gate by a wide margin.

## Positive

A complete 12,956-rune source-shaped GP stream made from repeated clear p57 is affine-encrypted under the exact byte quotient/remainder rule, wrapped by the fixed zero→F surface encoder, and recovered through both inverse layers exactly. This checks the field inverses, phase-zero byte clock and outer state reconstruction.

## Decision

Retire this exact affine completion. It changes within-word difference signatures and consumes both canonical base29 components of every p50 byte, yet it produces no long native-English evidence.

Together with the remainder-only additive rejection, the all-secret per-word Caesar exclusion and the authenticated p56 prime/F exclusion, the structurally successful zero→F surface transform still lacks a source-selected value operation that recovers plaintext. Further progress on this branch needs a materially new clue-selected mechanism rather than another fitted interpretation of the same table values.

The complete CommonJS reproducer is [`sims/lp2_p50_zeroF_base29_affine_sft.cjs`](../sims/lp2_p50_zeroF_base29_affine_sft.cjs). [Windows Node22 run 44386611641](https://github.com/FlareZ123/liber-primus/actions/runs/44386611641) passed the exact original rejection and complete layered positive.
