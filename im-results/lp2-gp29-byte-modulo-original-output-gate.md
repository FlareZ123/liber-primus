# Literal GP29 output of byte-modulo RNGs: original-source fingerprint

**Agent 21, 13 November 2026. Evidence classification:** finite source-shape transport exclusion. There is no recovered unknown plaintext, key or historical cipher. This is the natural-GP29 companion to the [GP28 predecessor-rank byte-modulo test](gp28-byte-modulo-original-gate.md), which studied a different output alphabet and clock.

## A cheap, mechanism-relevant question

The unsolved source has **12,956 GP29 rune indices**. In a direct byte-to-rune emitter, a naïve key generator draws a random octet and takes its remainder modulo29. Such an emitter has a fixed, measurable alphabet bias, independent of the secret PRNG seed. The full-octet range 0..255 emits indices 0..23 nine times per 256 possible bytes and indices **24..28 eight times per 256**. The historical GIMP Dissolve program supplies a distinct **0..254** byte range through `g_rand_int_range(0,255)`; that produces nine occurrences for indices 0..22 and eight for **23..28**. The latter is a source-linked byte producer through the externally measured p57 dot pattern, though there is **no original instruction to use GIMP's drawing RNG for text encryption**. The exact historical artwork source, separate GP29-GIMP key inverses and their negative results are [already documented](gimp-dissolve-source-pad-gate.md).

This test asks only whether the **observed ciphertext runes themselves** could be the raw, unrelabelled residues of those two byte ranges. It requires no seed or plaintext and grants all PRNG algorithms which emit independent uniform bytes. It is **not** a test of general `g_rand_int_range(0,29)` (unbiased), 16/32-bit modulo29, secret rune alphabet relabelings, additive pads, or separately changing states.

## Original input and finite result

Use the source GP alphabet in its printed 0..28 order, concatenating the 55 physical rune-bearing unknown pages p0–55 (runeless p50 omitted). The observed rune counts for indices 23..28, respectively, are `[439,482,445,448,470,460]`.

| Direct output rule | Underrepresented indices | Original low-bin count | Independent uniform-byte expectation | Exact binomial upper-tail |
| --- | --- | ---: | ---: | ---: |
| `byte % 29`, byte 0..255 | 24..28 (A, AE, Y, IA, EA) | **2,305 / 12,956** | **2,024.375** | **1.36 × 10⁻¹¹** |
| `byte % 29`, historical GIMP range 0..254 | 23..28 (D, A, AE, Y, IA, EA) | **2,744 / 12,956** | **2,438.776** | **7.53 × 10⁻¹²** |

Both observed groups are much **more** common than a byte-remainder emitter predicts. The upper-tail tests are exact for independent uniform input bytes, with the original symbol order frozen and no fitted category selection. The full 29-category source histogram has Pearson χ² **26.3617** against a uniform rune source, consistent with its previous broad flatness. That is a descriptive check; the independent-byte tests do not require observing readable English.

A soft same-rune suppression does little to remove this bias. For the 256-byte model, drawing a fresh candidate after a rejected repeat changes the stationary expected fraction of indices24..28 from **0.15625** (no rejection) to at most **0.15679** (every immediate repeat rejected), under the two straightforward models of a single obligatory redraw and redraw-until-accepted. The source's measured fraction is **0.17791**, so either repeat-handling variant remains incompatible with the literal frozen output model. These stationary calculations assume independent byte draws and source-independent redraw behavior; they do not cover a stateful or key-conditioned rejection process.

## What this changes

The original glyphs cannot reasonably be produced by **direct raw** `uniform 8-bit value % 29` or `GIMP range value % 29` in the original GP index order with an otherwise stationary byte source. Any viable design using those bytes must change the alphabet mapping, use an unbiased reduction, condition on state/letter, or encrypt/mask the residues again. A **secret 29-symbol permutation can choose five other rare source rune identities** and evade the fixed-bin test; arbitrary relabeling is explicitly outside the conclusion.

There is no source evidence selecting either direct emitter for the manuscript; the result matters primarily as a low-cost first discriminator for future byte-based generation proposals, before attempting billions of PRNG seeds.

**Reproducer:** [CommonJS original-source SFT](../sims/lp2_gp29_modbyte_output_fingerprint_sft.cjs). It reads the canonical GP29 corpus, asserts the source totals and low counts, independently enumerates both complete byte ranges to check multiplicities, computes each binomial tail from the original counts, and bounds two stationary soft-repeat redraw models. The numerical counts and exact tails were independently evaluated from the source corpus in separate JS/Python calculations. The CJS standalone script has been committed, not separately dispatched to CI.
