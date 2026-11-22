# Source-selected candidate: prime-totient multiplicative GP29 predecessor step

**Original Windows-latest Node22 CJS regression PASS**, run [45052316431](https://github.com/FlareZ123/liber-primus/actions/runs/45052316431) completed 22 November 2026 17:57:54 UTC. All four full-original and genuine-native planted checks passed. **Agent 8, 22 November 2026. Original LP2 p0–p55, 12,956 runes, unchanged. Decision: this concrete, reversible generator/prime-clocked candidate does not recover unknown plaintext.** The no-skip versions are mathematically lossless, so forward re-encryption alone would be a tautological success. Their independently evaluated output is flat. An unmodified solved-p56-style literal-F bypass cannot be added without colliding output symbols.

## Why this is an admissible finite experiment

The p7/p8 transition exposes two original GP29 residues **19 and 14** (the red terminal M on p7 and enlarged red X on p8), independently confirmed primitive generators of the multiplicative group GF29*. LP2 p56 genuinely uses a consecutive-prime **Euler-totient** keystream. The unknown pages have only **86 adjacent identical runes** in 12,956 ciphertext runes. These facts motivate testing one explicit multiplicative, ciphertext-predecessor-step cipher rather than another fitted Vigenere key. Neither historic source instructs joining them, and nothing proves this family was intended.

Freeze:
- GP29 canonical rune indices 0–28 and literal source order p0 through p55.
- Both source-visible generators `g=14` and `g=19`; two conventional multiplicative signs `s=±1`.
- The independent source-proven p56 totient source `k_i=g^φ(prime(i+1)) mod29=g^(prime(i+1)−1) mod29` with prime index beginning at 2, one prime step per original ciphertext rune, no resets, and no guessed key phase.
- Source glyph immediately prior to each rune is the feedback state, including original page transitions; the first predecessor is 0.

The reversible original-language hypothesis and its exact inverse are:

```text
C_i = C_(i−1) + s * k_i * (P_i+1)   (mod 29)
P_i = s * (C_i−C_(i−1)) * k_i^(−1) − 1   (mod 29)
```

Every generator value is nonzero and both generators have order 28, so `k_i^(−1)=k_i^27 mod29` exists at every original rune. The one-based plaintext ordinal is deliberately present so a zero ciphertext increment corresponds to rare GP **EA** (index28), a preexisting necessary condition discussed in [#2083](https://github.com/FlareZ123/liber-primus/issues/2083). This experiment uniquely tests the independently sourced `g^φ(prime)` key, instead of re-running generic unknown multipliers.

## Full-original inverse and untouched chapter controls

The exact script [`lp2_prime_generator_delta_step_original_sft.cjs`](../sims/lp2_prime_generator_delta_step_original_sft.cjs) reconstructs all 12,956 source runes from `resources/liber-primus/lp2-corpus.json`, generates the consecutive primes, and forward re-encrypts the outputs. It also plants the **real 95-rune solved p57 GP plaintext** under the candidate cipher and checks exact inversion.

| Candidate | Full-book native GP29 IoC | Top five /12,956 | p0–2 729-rune IoC | p16–21 1,613-rune IoC | p40–53 3,008-rune IoC | p54–55 308-rune IoC |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| g14, s+ | 0.03528878 | 2,453 | 0.03600823 | 0.03550479 | 0.03545871 | 0.03602098 |
| g14, s− | 0.03528878 | 2,453 | 0.03600823 | 0.03550479 | 0.03545871 | 0.03602098 |
| g19, s+ | 0.03525192 | 2,422 | 0.03475708 | 0.03548095 | 0.03528115 | 0.03388468 |
| g19, s− | 0.03525192 | 2,422 | 0.03475708 | 0.03548095 | 0.03528115 | 0.03388468 |

Original-p57 readable native-GP positive has **IoC 0.06270997**. No contiguous tested source chapter gives plausible native GP-English concentrations. The identical index-frequency scores under s± arise from `P_i+1` negation, which merely permutes the index alphabet; it is **not** confirmation of an intended key. All four whole-book outputs contain precisely **86 GP EA** because the source has 86 zero increments; even the entire unknown-page native-EA mask is fixed by this particular architecture. This mask already faces the source-language and lexical objections in #2083.

**Literal-F transparency obstruction:** The source-solved p56 rule emits F (index0) literally and does not consume its prime key. Trying to inherit that exact rule here is impossible without a new reserved-code or cyclewalking operation. For each fixed predecessor `b` and nonzero `k`, the 28 non-F plaintext values `1..28` under the above step map to all 29 possible ciphertext values **except `b+s*k`**. Thus, except in the single predecessor state `b=−s*k`, they include ciphertext F=0. That output then collides with plaintext-F's mandated literal ciphertext F=0. This is a *general injectivity obstruction* to the unaugmented combined law, for every nonzero key. On the complete original no-skip inverses, **423–448 non-F ciphertext positions would decode to plaintext F**, so this is also a concrete original-input incompatibility with a literal-F-only output channel. A special escape alphabet or altered step opcode would be a different cipher and needs an author-supplied selector.

## Research decision

This is a narrowly bounded, falsified composition of three real source features. It does not recover a new rune, an author-selected keystream, a new ciphertext decoder, or a final address. The full-original exact inverses show that the mathematically attractive prime-totient multiplicative step **does not yield prose**, while a direct p56 F-bypass transplant is mathematically noninjective. Prefer a truly new source-selected nonlocal operation or authentic external key over expanding g/exponent/phase menus after seeing these outputs. Preserve the general zero-step masking constraint separately from this rejected finite key.
