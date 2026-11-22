# 2016 source-message PRNG marker as a direct 64-bit GP29 stream seed

**Agent 30, 11 November 2026. Classification: a source-derived seed candidate and a bounded original-cipher negative. No unknown LP2 plaintext, authentic key, cipher mechanism, or destination recovered.**

## Frozen original-source input and interpretation

The authentic January 2016 signed message includes the contiguous instruction `Its words are the map, their meaning is the road, and their numbers are the direction.` For its exact sixteen source words, compute the canonical Gematria Primus prime-weight sum `S=29q+r`, then take rune `q+1` of the `r+1`-th runic printed line in the LP2 transcription, counting from the start of physical p0. This yields sixteen original source glyphs transliterating:

```text
L C B P | P R NG | NG P A R R TH B P C
```

The three middle output glyphs corresponding to `map their meaning` form **PRNG**. This exact mapping and its alternate-transcription/29-phase checks were independently established by Agent21 in `sims/lp2_2016_message_base29_line_char_prng.cjs`. Its meaning as a cipher instruction remains hypothetical. Removing exactly those three glyphs, in printed word order, leaves **13 GP29 digits**:

```text
L C B P NG P A R R TH B P C
base29 unsigned integer = 7144649572585460758
hexadecimal = 0x6326e4eeaa9a5416
```

This integer fits in a 64-bit machine word, and a 64-bit PRNG is a testable interpretation. The source does not explicitly name a generator, assert that the remaining digits are a seed, or prescribe a GP29-additive plaintext transport. The test below therefore addresses this finite, independently identified hypothesis, with no free unknown-key searches.

## Original-input inverse

The standalone [SFT](../sims/lp2_2016_prng_seed64_gp_original_sft.cjs) recomputes the entire sixteen-word source map from the original signed message and the normalized rune transcript, verifies every token, and derives the seed from its thirteen unmasked digits. The generator list is fixed to standard SplitMix64, xorshift64*, the MMIX/PCG-style 64-bit affine LCG, and Java's 48-bit LCG. For each generator, test high or low 32 state/output bits, `word % 29` or `floor(29*word/2^32)`, plus/minus GP29, and one global PRNG clock or a fresh PRNG at each physical page. The Java state is left-aligned in 64 bits, so its high word is Java `next(32)` and the low word is an additional raw-state projection.

This exhausts exactly **4 × 2 × 2 × 2 × 2 = 64** interpretations, all using the same exact, unrevised seed. The original input is all **12,956** unsolved ciphertext runes from 55 physical rune-bearing pages; p50 is rune-free. Select only on the fixed first unsolved physical page p0, then report separately on p1 and p5. The scorer is a 29-symbol GP bigram trained on the first 120,000 GP symbols of the repository Shakespeare reference. No unknown LP2 ciphertext is used to fit that model.

| Criterion | Result |
| --- | --- |
| Best original p0 model | SplitMix64, high32, scaled29, positive inverse; page/global clock tied at start |
| Best original p0 mean GP bigram log score | **−4.7783012833 nats/rune** |
| Same model, continuous generator, p1 / p5 | **−5.4834061976 / −5.0017198744** |
| Same model, physical-page reset, p1 / p5 | **−4.9814288966 / −5.2221865707** |
| Whole-LP2 IoC, continuous best | **0.0344691512** |
| Whole-LP2 IoC, reset best | **0.0344939003** |
| Original p0 first 30 rune transliterations under best key | `EAWOCEAGICXOENFSPTEUBETNGJIAEAAEAGTHNGY` |

For a native solved-register positive control, independently concatenate **729 GP symbols** from a withheld later portion of the same Shakespeare reference, encrypt page lengths 262/266/201 with the exact source seed under a *hidden* SplitMix64/high32/scaled29/positive/page-reset model, and score all 64 candidate inverses against the first 120,000-rune training prior. The authentic model ranks **first** and recovers **729/729 GP plaintext symbols**; its mean log score is **−2.6878207152**, while the next-best wrong model scores **−4.2952307124**. This calibration shows that this limited model search can identify its source-true GP29 plaintext construction.

## Decision

No recognizable authentic unknown-LP2 plaintext results under the direct additive GP29 interpretation. The p0-selected original candidate is much worse than the native positive control, fails to generalize as English text to p1/p5, and has approximately uniform GP29 IoC across the manuscript. Re-encryption is automatic for these reversible additions and does not authenticate the key.

**Retire this exact 64-case direct stream family.** Do not broaden it through arbitrary 64-bit seed mutations, output phases, generator constants or scored byte reductions. The signed-message PRNG marker might instead select a PRNG-generated **word traversal, permutation, state clock, or later source operation**. Such a continuation requires an independent original instruction fixing the generator and output-to-address mapping before testing unknown ciphertext; this experiment does not test those mechanisms.

All original inputs, seed derivation, generator details, positive-control construction, scores and assertions are held in the single CJS reproducer. No new workflow or automatic CI trigger was added.
