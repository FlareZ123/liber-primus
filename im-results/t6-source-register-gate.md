# T6-derived register and 13-dot interval key gates

**Status:** reproducible negative result. No LP2 plaintext, authentic key, or complete cipher inverse recovered.

## Why these tests were motivated

The existing source reconstruction in [2016-image-dimensions-lag6-source-derivation.md](2016-image-dimensions-lag6-source-derivation.md) derives the affine map

\[
T_6(x)=24-2x\pmod{29}
\]

from the archived 2016 image dimensions and the selected p53–55 source block. The independent red-span triangle analysis identifies 15 as a primitive root modulo 29 ([red-span-triangle.md](red-span-triangle.md)). These facts permit a narrowly specified composition rather than a free key search.

The fixed point of \(T_6\) is 8 (Haegl). In shifted coordinates,

\[
T_6(x)-8=-2(x-8),\qquad -2=15^{13}\pmod{29}.
\]

The Ac anchor has GP index 24, and \(24-8=16=15^{24}\pmod{29}\). Therefore, **if** iteration of \(T_6\) is interpreted as the state update for the existing transparent-EA/log-15 model, its exponent key is fixed as

\[
K_i=24+13i\pmod{28}.
\]

This is a hypothesis about how the source-derived affine echo might enter the cipher; the source evidence does not establish that it is a key schedule.

A second candidate uses the same affine map as a 28-symbol ordering, with its fixed point Haegl reserved for zero-difference events. A third candidate tests the 13-dot punctuation intervals as a source-derived state/key sequence.

## Reproduction

Run:

```sh
node sims/t6_source_register_gate.cjs
```

The script reads the canonical original corpus, transcription, LP1 plaintext reference, and ink annotations. It asserts the original counts and includes an exact synthetic positive round-trip for the Haegl/base-28/3-to-2 transport.

The isolated `t6-register-gate` CI job passed in [workflow run 42899360469](https://github.com/FlareZ123/liber-primus/actions/runs/42899360469). The workflow's separate legacy `source-gate` job still fails at its existing word-count assertion (3316 actual versus 2896 expected) in `sims/2016_image_dimension_lag6_source_gate.cjs:581`; that failure occurs before the legacy job's own test and is independent of the new gate.

## Result A — T6/log-15 exponent clock

The primary decode uses the source-fixed \(K_i=24+13i\), resets the clock at original word starts, and carries the previous ciphertext rune across word and page boundaries. For each noninitial rune, a zero ciphertext difference emits EA; otherwise the plaintext index is \(\log_{15}(C_i-C_{i-1})-K_i\pmod{28}\). The first rune uses the direct 29-state initial rule.

| Clock / predecessor framing | IoC | Entropy (bits) | LP1-dictionary word hits | Hits of length ≥5 | EA outputs |
|---|---:|---:|---:|---:|---:|
| Word-reset / continuous predecessor (primary) | 0.035298 | 4.831264 | 49 | 0 | 86 |
| Book-continuous / continuous predecessor | 0.035263 | 4.831980 | 34 | 0 | 86 |
| Page-reset / page predecessor | 0.035262 | 4.832356 | 33 | 0 | 90 |

For scale, the LP1 plaintext reference has IoC **0.061330** and entropy **4.251950**; the uniform 29-symbol IoC is **0.034483**. The candidate outputs remain close to uniform and produce no long dictionary words. The page-reset version's four additional EA outputs are first-rune values, not extra transparent zero-difference events.

This is a new step-13 test, not the already-closed \(K_i=\text{phase}+i\) progressive-clock family. It nevertheless fails to produce plaintext and should not be repeated by scanning further phases or reset combinations.

## Result A2 — red-rune-event T6 clock

A further human-plausible clock is to let the source-derived T6 exponent state advance only when an original red rune is encountered, rather than at every ciphertext position. The unsolved pages contain **213 red runes**. With the same source-fixed phase and step, the candidate is

\[
K_i=24+13A_i\pmod{28},
\]

where \(A_i\) is either the number of red events seen or the cumulative GP index of those red runes. I tested both update timings (the current red rune advances the state before or after its own decode) and three source-visible reset conventions: no reset, reset at word starts, or reset at thirteen-dot boundaries. The annotation has 28 unsolved thirteen-dot events but 26 unique global reset positions because two pairs coincide.

All **12** bounded variants fail:

| Event accumulator | Reset | Update timing | IoC | Entropy | LP1-dictionary hits | Hits ≥5 |
|---|---|---|---:|---:|---:|---:|
| Count | Global | After current rune | 0.035291 | 4.831410 | 35 | 0 |
| Count | Global | Before current rune | 0.035285 | 4.831521 | 36 | 0 |
| Count | Word | After current rune | 0.035313 | 4.830939 | 38 | 0 |
| Count | Word | Before current rune | 0.035315 | 4.830906 | 37 | 0 |
| Count | 13-dot | After current rune | 0.035271 | 4.831801 | 39 | 0 |
| Count | 13-dot | Before current rune | 0.035271 | 4.831814 | 38 | 0 |
| Red GP value | Global | After current rune | 0.035290 | 4.831404 | 36 | 0 |
| Red GP value | Global | Before current rune | 0.035282 | 4.831564 | 37 | 0 |
| Red GP value | Word | After current rune | 0.035311 | 4.830988 | 37 | 0 |
| Red GP value | Word | Before current rune | 0.035308 | 4.831047 | 36 | 0 |
| Red GP value | 13-dot | After current rune | 0.035294 | 4.831331 | 40 | 0 |
| Red GP value | 13-dot | Before current rune | 0.035296 | 4.831275 | 40 | 0 |

The range is near the random 29-symbol IoC \(1/29=0.034483\), far from the LP1 plaintext reference IoC 0.061330; none produces a five-rune dictionary match. This is a distinct red-event clock from the already-tested per-position progressive counter and from the piecewise interval-length keys. It is a negative for these exact source-derived event clocks, not evidence that red ink is irrelevant.

## Result B — Haegl marker, T6 orbit, and 3-to-2 seven-bit packing

Starting with previous state Ac (index 24), define \(d_i=C_i-C_{i-1}\pmod{29}\). If \(d_i=0\), record a Haegl marker. Otherwise map

\[
y_i=8-2d_i\pmod{29}
\]

to its rank in the 28-cycle of \(T_6\) beginning at Ac. This gives a reversible 29-to-28 intermediate when marker positions are retained. The orbit is

```
24, 5, 14, 25, 3, 18, 17, 19, 15, 23, 7, 10, 4, 16,
21, 11, 2, 20, 13, 27, 28, 26, 1, 22, 9, 6, 12, 0
```

On the original 12,956 runes this produces exactly **86 markers** and **12,870 base-28 digits**, or 4,290 triples. The exact length and divisibility motivate a 3-digit base-28 to 2-byte seven-bit transport: \(28^3=21,952\), with valid 14-bit payloads below \(2^{14}=16,384\).

That transport fails:

- **1,089 / 4,290** triples exceed the 14-bit range (25.385%), leaving only 3,201 valid groups and 6,402 bytes.
- The invalid fraction is essentially the uniform base-28 expectation, **25.364%**.
- The printable fraction among the surviving bytes is **74.024%**, close to the random seven-bit expectation \(95/128=74.219\%\).

The source-framed five-clause interval at global offsets 8805–9357 is 553 runes, starts at phase 36 modulo 79 and at a global triple boundary, and contains one repeat. Its 552 remaining digits form 184 triples, of which **36 are invalid**. Among 20 eligible windows with the same length, start modulo 3, start modulo 79, and divisible-by-three post-marker length, this frame ranks **2nd** (one window scores 32; one other ties at 36). This is not a unique or statistically decisive confirmation of the transport.

The synthetic positive control encodes 8,580 seeded seven-bit bytes, inserts 86 markers, and recovers every byte and marker exactly. Thus the negative original result is not caused by a broken inverse or packing implementation.

## Result C — 13-dot interval states

The original ink annotations contain 31 thirteen-dot events: 28 on unsolved pages and three on the solved tail. They partition the full release into 32 red-rune-count intervals:

```
13, 0, 16, 0, 3, 0, 11, 0, 0, 14, 12, 0, 9, 11, 0, 16,
0, 19, 0, 10, 0, 8, 0, 3, 0, 59, 9, 0, 5, 0, 7, 0
```

The first 28 values sum to 213 red runes; the final four solved-tail intervals are \([5,0,7,0]\), summing to 12. The unsolved-only truncation has 29 intervals because its final interval after the last unsolved mark is empty of red runes.

The script tests these source values as:
- constant per-interval \(K_j=L_j\bmod28\);
- cumulative per-interval increments;
- a repeating 32-symbol key and its cumulative form;
- the corresponding full-ciphertext interval lengths, direct and cumulative.

It also preserves the exact full and unsolved interval-length vectors in its JSON output. All tested outputs remain near-uniform (IoC approximately 0.03526–0.03531) and yield **zero** LP1-dictionary matches of length five or greater. The repeating direct red-count schedule produces one such hit, which is insufficient evidence and does not improve the distribution.

These simple interval-length interpretations are rejected as direct EA/log-15 keys. The 13-dot boundaries may still constrain a more complex 32-row/8-column state, but that mapping must be independently motivated rather than selected by score.

## Current interpretation and next useful work

1. Do not promote any of these candidates to `results/`; they are negative intermediate tests.
2. Do not repeat the step-13 phase/reset family, fixed T6-orbit 3-to-2 seven-bit packing, or direct/cumulative 13-dot interval-length keys.
3. Preserve the useful source facts: the T6 fixed point and orbit; the exact 86-marker/12,870-digit accounting; the five-clause 553-rune framing; and the 32 red-rune interval vector.
4. A next attempt should connect the 13-dot interval state to an independently specified use of the original 32×8 table or another source-derived non-GP register. It must predict a lossless inverse on original offsets and retain the 86 marker positions; a generic radix conversion or synthetic-key round-trip alone is not progress.

**Conclusion:** these experiments establish no plaintext. They eliminate several newly motivated, reproducible interpretations of the T6 and 13-dot source structures while leaving the broader hidden-state/lossless-inverse problem open.
