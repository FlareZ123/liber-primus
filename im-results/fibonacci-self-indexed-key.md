# Fibonacci-prime square as a self-indexed manuscript key

**Evidence class: bounded negative decryption hypothesis, with a working inverse and genuine-language planted control. Agent 1, 2026-11-10. No original LP2 plaintext or key recovered.**

## Independent clue and proposed mechanism

The precisely known LP2 page-15 spiral contains the 16 integers `abs(3301-p_(F_n+1))`, for 16 distinct Fibonacci indices, where `p_k` is the kth prime. This mathematical observation is **historical community prior art**, reproduced in [the consolidated square result](../results/fibonacci-prime-spiral.md). The present test asks a different, previously untested application of that construction: **do the 16 printed numbers, primes, Fibonacci ranks, or ordinal ranks point directly to rune positions or word positions elsewhere in the manuscript, forming a 16-rune periodic key?**

For each sixteen-index list, read in its known clockwise spiral order or in the square's printed row-major order. Interpret numeric positions as zero-based or one-based. Look up each indexed GP rune from one of four independent source sequences:

1. Entire unsolved LP2 rune stream, 12,956 runes.
2. Unsolved runes starting at physical LP2 page 16, directly after the square.
3. First rune of each of 2,896 canonical whole manuscript words.
4. Last rune of each canonical whole manuscript word.

Invalid out-of-bounds index combinations are excluded before fitting. Each extracted key is a fixed sixteen-rune vector `K`. The complete tested cipher family is

```text
P_i = (C_i + sign * K[(i+phase) mod 16]) mod 29
```

where `sign` is +1 or −1, `phase` is 0 through 15, and the key position is restarted at each physical page or is continuous across page boundaries. The original source transcript fixes all extraction choices; no key rune is learned by optimizing target plaintext.

There are **40 valid index/extraction combinations** and **2,560 scored cipher configurations** after all signs, phases and reset conventions. The distinct names `fibonacci:base0` and `rank:base1` can encode identical source positions because `F_n = rank−1`; the declared count includes these equivalent descriptions.

## Frozen training/holdout test

- Select the single highest decoded 29-symbol index of coincidence on **physical LP2 pages 16–18** (**800 runes**).
- Freeze its key source, index list, reading order, base, sign, rotation and reset behavior.
- Score the frozen candidate on **previously unfitted physical pages 19–22** (**944 runes**).
- Use the uniform independent 29-symbol reference `1/29 = 0.0344827586`; do not calibrate a postselected training maximum as a meaningful p-value.

| Observation | Value |
| --- | ---: |
| Best training key | `rank/row-major/after-square-runes/base1` |
| Equivalent key description | `fibonacci/row-major/after-square-runes/base0` |
| Sign / rotation / page reset | `+1` / `11` / yes |
| Best training IoC | **0.03557571965** |
| Frozen held-out IoC | **0.03460826428** |
| Uniform 29-way benchmark | **0.03448275862** |

All five leading training settings scored below 0.0356; their held-out scores ranged from 0.03444 to 0.03497. The fitted winner remains essentially flat on its independent continuation. It offers neither readable plaintext nor a general alphabet-frequency signature resembling GP-English.

**Exact planted positive:** choose one of the actual manuscript-extracted keys, `square/spiral/full-runes/base0`, mask independently sourced Shakespeare GP text with key phase 7 and no page resets, then use the inverse key/sign on the same physical-page layout. The test asserts an exact byte-for-byte GP-rune roundtrip, with held-out plaintext IoC **0.06450967881** and equal recovered IoC. This controls implementation and confirms that the same scoring function detects substantial English-like plaintext under the hypothesized mechanism. It is an exact synthetic demonstration, not proof of sensitivity to arbitrary linguistic registers.

## What is and is not excluded

The specific **literal 16-rune key retrieved by page-15 numbers from the original rune/whole-word sequences** fails to expose ordinary GP-English via a direct periodic mod-29 additive mask under the 2,560 tested settings. This does not exclude use of the page-15 numbers in a longer key schedule, a nonlinear cipher, a different readout source, secret key derivation, a hidden output permutation, non-English/intermediate text or a separate anti-repeat layer. The square itself remains a genuine prior-art mathematical clue with unknown cryptographic role.

## Reproduce

- [Complete standalone CommonJS runner](../sims/fibonacci_self_index_key.cjs), reusing the authenticated square construction and canonical cross-page word parser. Node.js 22; no external dependencies.
- [Successfully executed on-demand GitHub Actions run 42761414513](https://github.com/FlareZ123/liber-primus/actions/runs/42761414513), including all-page/whole-word source assertions and planted GP text roundtrip.
- Fixed inputs: [LP2 complete numeric corpus](../resources/liber-primus/lp2-corpus.json) and [rune-bearing transcript](../resources/lp2-transcription.txt).

**Next informative test:** derive an independently specified longer key traversal, state transition or invertible word encoding from authentic manuscript material, and demand both a forward model of the anti-repeat statistics and actual original ciphertext plaintext recovery. Unconstrained repetition of direct square-derived 16-rune candidate scans is low value.
