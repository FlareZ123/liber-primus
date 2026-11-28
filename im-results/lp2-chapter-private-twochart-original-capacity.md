# Chapter-private two-output differential alphabets: one large original section is a keyless obstruction

**Agent 31 · 28 November 2026 · intermediate cryptanalytic constraint, not plaintext recovery.**

## Decision and causal scope

Physical LP2 pages **p40–p53** contain **3,008 original GP29 runes** in **13 nonempty JPEG pages** (the numeric p50 has no runes). Even if an encoder selects between **two completely secret, arbitrary output alphabets independently at every rune** and resets the predecessor at every physical page boundary, it cannot turn any of the three pinned, same-length native-English reference windows into these original ciphertext differences. The obstruction survives arbitrary pre-encryption reordering of the 3,008 plaintext runes, not merely a fixed word order, because the decisive statistic is a single-rune count. It does **not** reject all English, all rank28 encoders, a 3-or-more-output chart, a changed source spelling, variable-length coding, within-page accumulator skips, or a private new alphabet on each page. No unknown original plaintext, authentic key or decoder was found.

### Why this is a human-plausible model, not an author's proven method

The source visibly marks nine large illustrated chapters (p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53, p54–55). Previous fixed chapter-alphabet tests rejected a stationary map, while a two-state or two-output evolving alphabet could naturally be tested to explain LP2's deficit of repeated adjacent glyphs. We grant **independent unknown maps to each chapter**, and unrestricted per-rune, even noncausal choice between the two maps. This is a bounded *necessary-condition exclusion*, not evidence that Cicada used difference coding.

## Original-source, lossless bound

For every rune after the first on each source page set `D[i] = (C[i] - C[i-1]) mod 29`. Suppose an unknown native plaintext rune `x` can emit at most two such residual symbols, no matter how its hidden state switches. The set of all original physical residuals assigned to `x` can then occupy no more than the two most frequent `D` bins. On p40–53 the original **2,995** within-page residuals have highest counts **123** (GP index 23) and **122** (GP index 7), so **at most 245** occurrences of any one plaintext rune can be consumed. Grant all **13** page-initial runes as completely unconstrained arbitrary values, all assigned adversarially to that same plaintext letter. Then even an arbitrary rearrangement cannot encode more than **245+13 = 258** copies of one rune in the original 3,008-symbol section. This does not use the chart's bijectivity, the identity of the most frequent plaintext letter, word boundaries, alignment, a language scorer, or a proposed secret key.

## Complete finite-reference decision

The existing three donor files were GP-normalized using the repository's *documented* longest-token transliteration and K/Q→C, V→U, Z→S equivalences. Every contiguous 3,008-rune window was tested; each line below reports the **minimum** across the complete file of the count of its single most frequent native GP rune. To avoid a spelling choice driving this narrow bound, repeat all windows under three predefined renderings: (a) legacy `ING→NG`, `IO→IA`, (b) greedy longest-match only, (c) letter-spelled Latin without GP digraphs. Repeat each with full file and with book matter removed (Gutenberg header/license for Gibran/Emerson; standalone speaker and scene headers for Shakespeare). Trimming does not create any new source material.

| Native donor | Legacy full / body | Greedy full / body | Letter-spelled full / body |
|---|---:|---:|---:|
| Gibran, *The Prophet* | 304 / 304 | 301 / 301 | 324 / 326 |
| Shakespeare (first 300k text characters) | **260 / 266** | 271 / 271 | 284 / 290 |
| Emerson, *Essays, First Series* | 301 / 301 | 297 / 297 | 306 / 306 |

**All 18 complete window families exceed 258**, including Shakespeare's weakest margin of **two native runes** (260−258). This is deterministic for these three finite donors; it must not be generalized into a proof about every author-composed passage. The Shakespeare raw-text margin is narrow; removing speaker labels or using either alternative spelling increases it, but neither adjustment is needed to obtain the raw bound.

## Extra word-order-independent and order-dependent controls

An independently exact weighted-box optimization on the **2,969** within-page residual trigrams finds maximum **10** occurrences inside any **2×2×2** choice of GP output-symbol supports; the same algorithm gives **21** for **3×3×3**. Two independent full-length donor tests using matched original page boundary masks give minimum maximum native-trigram counts **27/15/15** (Gibran/Shakespeare/Emerson), so the two-chart hypothesis also fails the stricter order-preserving trigram test. For three charts, the same source windows do have necessary-condition survivors: **0 / 11,655 / 5,898** from **59,485 / 214,099 / 318,320** windows respectively. These are not decryption candidates or sufficient tests. The two-chart conclusion does not rely on this trigram gate.

The theorem permits chart switches on *every* consuming symbol, including source-private schedules, unknown initial states and unknown mappings. It also permits all page initials to carry any plaintext character. The all-secret source test is checked by a constructive native-English plant: two independently shuffled 29-way alphabets and independently chosen page initials, with per-rune state switching and exact inversion of all **2,995** consuming positions. A positive plant is a functional control, not evidence for the manuscript's mechanism.

## Research choice

Do not allocate further key searches to a **single or two-output, one-symbol-per-native-rune chapter-private predecessor-difference alphabet** on p40–53. A continuation must justify **at least three possible residual outputs for the same frequent plaintext rune**, or give an independent source-selected alphabet reset more often than pages, an accumulator law that skips physical F, variable-length or different symbol representation, or a non-prose content hypothesis. For three charts the box test remains inconclusive; it does **not** warrant an unconstrained three-chart key search. This excludes a plausible decoder family but does not by itself recover any part of LP2.

**Reproduce:** `node sims/lp2_chapter_private_twochart_capacity_sft.cjs` from repository root, with only the three tracked donor texts and the original `lp2-corpus.json`. The exact tensor optimizer, native sliding counts, alternative source normalizers, 39 boundary masks and plant were run in connected V8 against these pinned files; the standalone Node entrypoint should be rerun on checkout before treating the wrapper as separately verified.
