# P0 red-title crib: bounded exhaustive 32-bit generator inversion

**Agent1, 21 November 2026. Classification: finite original-cipher negative, conditional on the previously proposed p0 title. No new manuscript plaintext or authentic cipher is recovered.**

## Fixed, source-visible receiver and conditional plaintext

The actual LP2 physical p0 image prints a thirteen-GP-rune red heading as two words of lengths 8+5, followed by a large red thirteen-dot mark. The canonical original GP29 ciphertext indices are:

```text
[15,8,18,3,6,19,27,0 | 15,26,18,21,5]
```

A prior state/marker analysis selected candidate `EPIPHANY SEEKS`, the authenticated 2016 signed-message wording, but its three-column rise/key-order rule was recognized after the candidate title was known. **This is an assumed crib, not verified plaintext.** The candidate GP29 indices are:

```text
[18,13,10,13,8,24,9,26 | 15,18,18,5,15]
```

Thus a direct additive key generator would have to emit exactly one of the two residue streams, according to encryption sign:

```text
C−P mod29 = [26,24,8,19,27,24,18,3 | 0,8,0,16,19]
P−C mod29 = [ 3, 5,21,10, 2, 5,11,26 | 0,21,0,13,10]
```

This study asks whether the complete candidate 13-rune key is the direct modulo-29 output from **one small, standard, 32-bit seed state**. It requires all 13 symbols, without language scoring or alteration of the printed title. This is a finite comparison of known generators, **not a creator-selected cipher family**.

## Exhaustive search and result

Every one of the `2^32` possible unsigned 32-bit seeds was evaluated for the five LCGs and both signed/unsigned Java constructor interpretations. Marsaglia's `xorshift32(13,17,5)` tests every **nonzero** 32-bit state (zero is identically zero and cannot produce the title key). Both output phases, direct state and state after one generator step, were admitted. Both key signs were tested. The LCGs use arithmetic modulo `2^32`.

| Engine | Parameters | Emission functions examined | Exact 13-symbol matches |
|---|---|---|---:|
| Marsaglia xorshift32 | shifts 13,17,5 | unsigned state modulo29, two phases | **0** |
| ANSI-style LCG | `a=1103515245,c=12345` | four modes, two phases | **0** |
| Numerical Recipes LCG | `a=1664525,c=1013904223` | four modes, two phases | **0** |
| MSVC LCG | `a=214013,c=2531011` | four modes, two phases | **0** |
| Borland LCG | `a=22695477,c=1` | four modes, two phases | **0** |
| RANDU LCG | `a=65539,c=0` | four modes, two phases | **0** |
| Java `java.util.Random` | 48-bit state, `0x5deece66d`, `+11` | exact `nextInt(29)`, both signed/unsigned 32-bit initial seeds, two phases | **0** |

The four LCG output functions were `state % 29`, `((state >> 16) & 32767) % 29`, `(state >> 16) % 29`, `(state >> 24) % 29`. Java exact `nextInt(29)` includes its signed-overflow rejection path, rather than assuming every `next(31)` is accepted. A first-output filter skips full streams whose first residue cannot match either sign; this filter is logically necessary and does not discard any valid seed.

**Executable evidence:** [read-only C++17 SFT](../sims/lp2_p0_title_prng32_crib_sft.cpp). The `smoke` mode uses the first 65,536 seeds and synthetic planted-output checks; each named engine runs the full unsigned 32-bit state domain using an optional OpenMP speedup. The independent full-domain original xorshift / LCG / exact-Java local runs completed with zero hits before this shared source was committed. The combined C++17 file subsequently passed its synthetic controls and 65,536-seed-per-engine smoke in [successful Linux GCC CI run 44964006701](https://github.com/FlareZ123/liber-primus/actions/runs/44964006701). The combined file has not itself been run across all 2^32 seeds in CI.

## First-order generator-free extrapolation of the crib key

A separate exact GF(29) Berlekamp–Massey fit of the thirteen inferred `C−P` residues gives linear complexity **six** with characteristic polynomial:

```text
x^6 + 9x^5 + 13x^4 + 23x^3 + 22x^2 + 17x + 23  (mod 29).
```

This degree-six relation reproduces the entire 13-rune assumed key and generates the black-body key beginning `[14,22,10,4,11,26,7,3,20,16,12,7]` at offsets13…24. Holding the recurrence, sign and continuous page clock fixed yields an original p0 full-page decrypted GP29 IoC of **0.0360328741**; the following untouched four- and three-rune words read `BEAENG / EXS` in canonical transliteration, with no coherent prose. The minimal recurrence is **inferred from** thirteen assumed-key symbols, rather than selected by the original marker, and its body continuation fails. It is not a recovered cipher.

## Decision

The exact direct-key family above is excluded under the stated **candidate-crib assumption**, not a class of all PRNGs, all seed encodings, all 48-bit Java initial states, or any time-varying/steganographic ciphertext decoder. Most importantly, rejecting these generators neither validates nor refutes `EPIPHANY SEEKS` itself.

The remaining route with a causal path to unknown plaintext requires a **source-authored key-transition or reversible operator**, preferably one directly evidenced in the p0 marker, original 2014 materials, or another independently selected body receiver. Do not enlarge the seed hunt by tuning offsets, custom generator constants, or score thresholds without such a clue. The p0 red-title question remains open.
