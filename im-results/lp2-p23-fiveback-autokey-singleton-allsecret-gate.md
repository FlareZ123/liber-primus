# Key-independent singleton obstruction to both signs of five-back plaintext autokey on original p23–26

**Agent 3, 15 November 2026. Status: bounded cipher-family exclusion on unmodified original runes. Zero original unknown plaintext/key recovered.** The p23 five-dot motif does not explicitly prescribe an autokey algorithm; this is one human-comprehensible reversible candidate selected by the motif's five count, known GP29 additive arithmetic and the source-visible 16-rune rubric boundary.

## Source selection and exact proposed inverse

Original physical LP2 p23 (archive `40.jpg`) begins with five ink dots and an independent **16-rune red heading**. From the first body rune at book offset **5,522** to the p26 terminal at **6,527**, the chapter contains **1,005 original GP29 runes = 201 blocks of five**, including all original page-spanning words. Canonical `lp2-corpus.json` and `lp2-transcription.txt` agree on the entire original 12,956-rune unknown stream and its 2,896 whole printed words. This source geometry was previously known; the present exact autokey obstruction is new within that source-defined target.

The two frozen, reversible candidates are the usual additive and subtractive *plaintext* autokey feedback at lag five, using original zero-based GP indices:

```text
C[t] = P[t] + K[t]     (mod 29), t = 0..4
C[t] = P[t] + s*P[t-5] (mod 29), t = 5..1004, s = +1 or -1
```

All five initial key symbols `K[0..4]` are arbitrary and **exhaustively permitted**. Every lane `t mod 5` depends only on its own initial plaintext `s=P[lane]`, equivalent to one of all 29 initial key choices `K[lane]=C[lane]-s`. Thus five independent 29-state searches exactly cover all **29^5 = 20,511,149** five-rune keys without a language model or approximate beam.

The original body has only five genuinely printed single-rune words, at local offsets **113, 177, 454, 469, 734**, with original ciphertext GP spellings **A, D, T, G, Y**, respectively. Literal one-rune source-native English has `A` (GP24), `I` (GP10) and archaic vocative `O` (GP3) as an intentionally generous permitted set. A second control even grants plaintext literal `F` (GP0), without assuming its verified p56 key-skip behavior applies here.

## Two-word impossibility before language scoring

The two source-printed singleton words at **p24 local rune257**, body `t=454`, and **p25 local rune267**, body `t=734`, lie in the same residue class `4 mod 5`. Exhausting the original plus-feedback recurrence analytically from a symbolic first plaintext value `z=P[4]` yields

```text
P[454] = z +  3 (mod29)
P[734] = z + 19 (mod29)
P[734] - P[454] = 16 (mod29), for every z in 0..28
```

Under the independently frozen minus-feedback rule, the same original ciphertext instead forces `P[454]=z+13`, `P[734]=z+1`, hence `P[734]−P[454] ≡17 (mod29)` for every initial key. **Neither 16 nor 17 can equal the modular difference of two native A/I/O singleton symbols; both remain impossible even granting literal F.** Hence the original pair rejects **all** initial five-symbol keys for either signed cipher. The entire five-lane all-secret candidate count, using all five independently source-printed singletons, is:

| Allowed one-rune plaintext | Lane 0 | Lane 1 | Lane 2 | Lane 3 | Lane 4 | Full five-key inverse |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| plus feedback, A/I/O | 29 | 29 | 3 | 3 | **0** | **Impossible** |
| plus feedback, F/A/I/O | 29 | 29 | 4 | 4 | **0** | **Impossible** |
| minus feedback, A/I/O | 29 | 29 | 3 | 3 | **0** | **Impossible** |
| minus feedback, F/A/I/O | 29 | 29 | 4 | 4 | **0** | **Impossible** |

These are exact finite counts, with no fitted phrase, language score, altered source word, key start or private initial-key restriction. The contradiction specifically uses **two separate physical pages** and the unaltered cross-page book order.

## Positive control and decision

A planted 1,005-rune GP29 stream repeats the **original independently clear p57 PARABLE** 95-rune tape, assigns the five original single-rune word positions native A/I/O symbols, and encrypts separately under **both feedback signs** with a five-symbol seed consisting of the first five known GP primes `[2,3,5,7,11]`. Each sign's own key-blind singleton sieve retains the true seed on every lane; each lane4 has **exactly one** survivor. Full plaintext inversion and forward re-encryption reconstruct all 1,005 planted positions precisely for both signs. This checks both the 29-state factorization and the original geometry; the cyclic plant is a cryptographic control, not an independently authored 1,005-rune literary text.

**Decision:** retire **both direct signs** of fixed-clock five-back GP29 plaintext-autokey transfer at the source-selected p23:16 reset **for unchanged A/I/O native single-rune words**. The five-dot artwork supplies a plausible block size, but no author-authenticated plaintext-autokey opcode, phase key, or word-break exception. This result does not exclude ciphertext feedback, moving key clocks, per-word resets, plaintext F bypass, nonlinear transducers, altered segmentation, or an alternative plaintext register. None may be added as a score-selected rescue to this rejected direct transfer. No original unknown text has been decrypted.

**Exact source-first CJS reproducer:** [sims/lp2_p23_fivedot_fiveback_plaintextautokey_sft.cjs](../sims/lp2_p23_fivedot_fiveback_plaintextautokey_sft.cjs). **Node22 manual run:** [GitHub Actions #43682819162](https://github.com/FlareZ123/liber-primus/actions/runs/43682819162), completed SUCCESS on 15 November 2026, logging both signs, every source-local singleton, exact surviving seed sets, both algebraic differences and both positive-plant reconstructions.
