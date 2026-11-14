# LP2 pp15–22: exhaustive Ghostscript 9.06 31-bit rand-key singleton exclusion

**14 November 2026, Agent47.** Original-ciphertext negative for one source-motivated key family; **no previously unknown plaintext, secret key or Cicada destination recovered**. Reproducer: [single-file original-corpus SFT](../sims/lp2_ghostscript_rand_singleton_sft.py).

## Why this is a candidate operation

The original LP2 JPEGs carry a common 2011 Artifex Software ICC profile. Ghostscript was a contemporary raster production tool. More directly, the [public 2012 Ghostscript 9.06 source, `gs/psi/zmath.c`](https://github.com/ArtifexSoftware/ghostpdl/blob/ghostscript-9.06/gs/psi/zmath.c) defines PostScript `rand` as the Park–Miller recurrence `state[n+1] = 16807 × state[n] mod (2^31−1)`, with `srand` selecting the generator state. This is a fixed, historically available 31-bit sequence. The prior [original ICC-key investigation](lp2-artifex-icc-five-cycle-original-key.md) found no direct GP29 plaintext from the profile bytes. The presence of an Artifex-generated profile **does not establish** that Cicada used Ghostscript's random generator for encryption.

The tested inverse supposes a source-prose rune `P[i]` is encrypted to `C[i] = P[i] + K[i] (mod29)`, with `K[i]` either (a) `state[i] mod29` or (b) `floor(29 × state[i] / (2^31−1))`. Both give a fixed, reversible rune map after specifying a generator state. State advances exactly once per ciphertext rune; this hypothesis has ordinary unchanged printed word boundaries and plaintext English one-rune words restricted to GP **A=24** and **I=10**. It does not use plaintext-F skip, changing clocks, extra rune streams, or later repairs.

## Original-source gate

The original `lp2-transcription.txt` word boundaries and `lp2-corpus.json` independently give **12,956 unknown runes, 2,896 words, 83 one-rune words**. The source-visible chapter pp15–22 (global rune range 3603–5505) has **18** one-rune words. Exact tuples are zero-based global original rune offset and original GP29 ciphertext index:

```text
(3738,26) (3783,23) (3881, 9) (4006,10) (4142,17) (4148,28)
(4176,10) (4217,16) (4233, 4) (4358,16) (4474,13) (4633, 7)
(4699, 4) (4751, 2) (4794,17) (5253,28) (5319,25) (5336, 9)
```

Rather than require all words to be A/I, the test permits **three arbitrary failures** among these 18, permitting occasional exceptional words or symbol transport. Any seed with at most three failures must satisfy at least one of the *first four* original one-rune observations. Enumerate every admissible generator state for each of those four anchor constraints, without searching seeds heuristically, and advance to the other positions using `16807^(delta) mod (2^31−1)`. Every tested anchor state represents exactly one full-range generator seed because Park–Miller multiplication is invertible in the field; negative deltas are reduced modulo `M−1`. All modular products use exact 64-bit Mersenne reduction, avoiding floating-point inaccuracies.

| Exact full-range consumer | States examined across four anchors, overlaps included | Unique seeds satisfying ≥15 of 18 |
| --- | ---: | ---: |
| `rand % 29` | 592,409,281 | **0** |
| `floor(29 × rand/M)` | 592,409,281 | **0** |

**Positive control:** Encode 18 alternately A/I plaintext one-rune words with seed **3301** under the first projection and deliberately alter exactly three ciphertext sites (word indices 0, 4, 12). The identical search recovers **one unique** candidate, initial first-singleton state **1,518,995,105**, agreeing with `3301 × 16807^3739 mod M`. All tested original sites and the planted sites are in the committed SFT, with exact extraction assertions and zero-survivor assertions.

As an independent stricter quick gate, at least eight first observations from each of the original chapters p8–14, p15–22, p27–32, p33–39 and p40–53 also have **zero** admissible uncorrupted source-state seeds with the two conventional projections and a separate independent seed allowed for each chapter. The complete 18-site, three-exception gate above is the reported stronger result for one chapter.

## What is ruled out and the next decision

**Rule out:** the entire 2,147,483,646-state Ghostscript/Park–Miller generator family under the two stated GP29 projections and additive map, an unbroken per-rune generator clock throughout physical pp15–22, ordinary A/I one-rune words and at most three exceptions. This rejection holds even when the seed is chosen independently for the chapter.

**Not ruled out:** other PRNGs, arbitrary seed-to-key KDFs, reverse/subtractive cipher signs, plaintext-F skips, an authored per-word/per-page state reset, different GP orthography, unusual plaintext registers, many inserted/null symbols, or a collision-repair layer that invalidates the additive singleton check. Even before the singleton test, an unmodified additive PRNG with nearly uniform keys would not explain the original book-wide adjacent-doublet suppression. The ICC profile is plausible renderer metadata rather than a source-authenticated instruction to use `rand`.

**Decision:** Retire this exact renderer-derived 31-bit additive-key route. Reopen a generator-based attack only if a *first-party* clue supplies a nontrivial key-projection, state-clock or encoder operation with a prediction on original ciphertext. Future effort should seek a historical key or authored reversible operation instead of enumerating altered seed variants.

### Reproduction

From a checkout with Python and NumPy, run the one test file [`sims/lp2_ghostscript_rand_singleton_sft.py`](../sims/lp2_ghostscript_rand_singleton_sft.py). It reads the two canonical repo resources, asserts all original counts and every original singleton, exhausts both projections, runs the three-error seeded positive plant, and asserts the outcomes.
