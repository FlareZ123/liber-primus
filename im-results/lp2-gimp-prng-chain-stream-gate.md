# GIMP Dissolve PRNG as an LP2 chain-step key: direct-stream gate

**Status (14 November 2026, Agent32/Agent27): both default and optional-legacy GLib one-dimensional interpretations are original-input negatives.** A recent external analysis describes the unsolved LP2 ciphertext as having 86 zero first-differences and an approximately flat distribution over the 28 nonzero differences. A separate recent image analysis identifies the p57 mayfly mask with GIMP Dissolve's seeded random field. Combining these observations suggests a testable key-source hypothesis: the GIMP field might supply the nonzero step stream. Three direct one-dimensional projections were originally tested using GLib's optional **2.0 legacy** PRNG mode. The re-executed original comparison below now also tests the actual GLib 2.38.2 **default 2.2** PRNG mode; all six fixed projections match only at chance. No plaintext or key was recovered.

## What is actually observed

Using the repository's canonical rune indices for pages 0–55, concatenated in physical page order:

- 12,956 unsolved runes produce 12,955 adjacent differences.
- The zero difference occurs 86 times.
- The 28 nonzero difference counts, in order 1–28, are:

459, 504, 440, 438, 446, 430, 470, 426, 510, 497, 455, 449, 504, 474, 470, 449, 404, 434, 474, 467, 463, 421, 486, 468, 467, 457, 476, 431

These counts reproduce the external Leo-Y-Zhang report exactly. One statistical correction is needed: conditional on the 12,869 nonzero differences, the expected count per nonzero value is **12,869 / 28 = 459.607**, not 447. The latter is the expectation for each of all 29 values before conditioning on the observed zero deficit. Against a uniform 28-bin null, the observed counts give χ² = **41.38**, df = 27, p ≈ **0.0378**. This is a mild departure from uniformity, not strong evidence that the 28 differences are an independently generated keystream.

Defining s[i] = C[i] − C[i−1] mod 29 is a descriptive identity, not by itself a cipher identification or a decryption. The zero-step deficit is a real structural observation; the “28-symbol chain keystream” remains a model until a source-derived key and reversible plaintext relation are found.

## Why the GIMP connection was worth one test

The recent SECRA image analysis reports that the p57 mayfly's sparse mask is reproduced by the historical GIMP Dissolve random field, with seed **314159265**, a **4096-entry row-seed table**, and row-specific GLib GRand streams. The GIMP 2.8.10 paint code explicitly dispatches GIMP_COMPOSITE_DISSOLVE with image x/y coordinates; the later operation implementation exposes the 4096 row seeds and per-pixel random draw. The [actual GLib 2.38.2 source](https://github.com/GNOME/glib/blob/2.38.2/glib/grand.c) explicitly defaults to `G_RANDOM_VERSION=2.2` (internal version **22**, MT expansion multiplier 1812433253) and only enables `G_RANDOM_VERSION=2.0` (internal version **20**, older 69069 multiplier) when requested through an environment variable. **The earlier comparison used version20 and incorrectly treated it as GIMP's default.** The historical GIMP 2.8 random field is reproduced under default version22 with first generated row seed **3721122731**, as independently checked in [the GIMP source reproducer](../sims/gimp_table_grid_cogeneration.cjs).

This gives a plausible visual source for a deterministic random field. It does **not** establish that LP2 text uses that field as a key. The following deliberately narrow tests ask whether its most direct 1-D forms are the observed 28-way step sequence.

## Frozen tests

The nonzero LP2 differences were compared, in their original order and with no offset search, using **both** historically supported GLib 2.38.2 configurations, default version22 and opt-in legacy version20, for the same three direct 28-way interpretations:

1. **Master-seed stream:** initialize GLib GRand with 314159265 in the declared version and draw `g_rand_int_range(1,29)` once per nonzero step. Version22 uses the actual GLib 2.2 rejection/modulo range algorithm; version20 uses its documented legacy floating-range algorithm.
2. **First dissolve-row stream:** generate the documented 4096 row seeds from the master generator, initialize a row generator from row seed 0, and draw g_rand_int_range(1, 29) left-to-right.
3. **Repeated row-seed table:** map the 4096 raw row seeds to 1–28 using the same GLib range scaling, then repeat the table to the required length.

The inverse additive direction was scored as the natural sign alternative. For each version, the script asserts its exact first eight master and first-row 32-bit output words, not merely the final near-chance match counts. No seed search, offset search, row search, or post-hoc permutation was performed.

| GLib PRNG version | Candidate | Exact matches | Inverse matches | Random expectation |
| --- | --- | ---: | ---: | ---: |
| **22, default** | Master-seed stream | **452** | **435** | 459.61 |
| **22, default** | First dissolve row | **478** | **497** | 459.61 |
| **22, default** | Repeated 4,096 row-seed table | **460** | **441** | 459.61 |
| 20, explicit legacy | Master-seed stream | 438 | 425 | 459.61 |
| 20, explicit legacy | First dissolve row | 456 | 460 | 459.61 |
| 20, explicit legacy | Repeated 4,096 row-seed table | 432 | 457 | 459.61 |

The standard deviation of a chance match count is about **21.05**. The default-generator maximum **497** is about **1.78** standard deviations above the chance expectation. Its corresponding direct match count is 478. The old legacy-mode six scores are within 1.64 standard deviations. Even the strongest default comparison agrees at only 497/12,869 nonzero positions; no tested sequence is consistent with an exact originating keystream. The fixed six-model version comparison is exploratory because no original Cicada clue selects this text-key role. The result gives no decrypted plaintext.

## Decision and scope

**Reject direct identity of the nonzero 28-way ciphertext-step stream with the six one-dimensional source-seeded sequences under the true historical generator and its opt-in legacy alternative.** The p57 dissolve fingerprint is a genuine image-generation clue, but these fixed streams do not recover LP2 plaintext. The prior legacy-only result was incomplete rather than an authenticated GIMP default-key failure.

**Two-dimensional original-glyph follow-up (14 November 2026, Agent31):** one additional fixed projection has now been tested. The original p55 scan includes all **76 glyph-bounding rectangles**. Taking each **geometric box center** as an unfit `(x,y)` selector for the GLib default-v22 row-seeded random field, all eight direct GP29 additive signed/byte interpretations give original p55 IoC **0.02947–0.03649**, the eight matching p54-word-carry **ciphertext-feedback** signed decoders remain **0.03193–0.03544**, and two nonzero-step residue/scale interpretations match only **1–4 of 75** source steps (chance **2.679**). A source-native 76-rune p57 positive plant decodes exactly. This specifically retires the fixed *center-sampled raw-field* hypothesis; no contemporary signed Cicada instruction names a pixel, cipher role, conversion, or page clock. Do not fit a coordinate, orientation, offset, window or PRNG state after observing text. [Source-exact report](lp2-p55-gimp-2d-glyphcenter-source-gate.md) · [Windows passed 43549875355](https://github.com/FlareZ123/liber-primus/actions/runs/43549875355).

This is an intermediate negative result, not an established LP2 mechanism; do not promote it to results/README.md. The direct 1-D variants should not be repeated.

## Reproduction

Run from the repository root:

node sims/lp2_gimp_prng_chain_stream_gate.cjs

[Passing original-input Windows/Node22 Actions run 43533073542](https://github.com/FlareZ123/liber-primus/actions/runs/43533073542). The script reads the canonical corpus, verifies the 12,956/12,955/86 input counts and the complete 28-bin difference histogram, implements **both** GLib 2.38.2 versions 20 and 22 with independently verified source vectors, generates each 4,096-word seed table, and asserts all **twelve** exact/inverse scores. Historical version22 is GLib's documented normal mode; version20 is an explicit legacy compatibility control.

## Sources

- [Leo-Y-Zhang, Liber Primus Analysis — chain-step report](https://github.com/Leo-Y-Zhang/LiberPrimusAnalysis/blob/main/docs/REPORT.md) — external step histogram and chain-cipher interpretation.
- [SECRA, Liber Primus strongest findings](https://secra.tech/research/liber-primus-strongest-findings) — external p57 GIMP Dissolve mask/seed analysis; used as a candidate source, not as proof of a cipher key.
- [GIMP 2.8.10 paint-funcs.c](https://github.com/GNOME/gimp/blob/GIMP_2_8_10/app/paint-funcs/paint-funcs.c#L3936-L3959) — historical Dissolve-mode dispatch and image coordinates.
- [GIMP Dissolve operation](https://github.com/GNOME/gimp/blob/master/app/operations/layer-modes/gimpoperationdissolve.c) — 4096 row seeds and per-pixel GRand draws.
- [GLib 2.38.2 grand.c](https://github.com/GNOME/glib/blob/2.38.2/glib/grand.c) — random-version-20 seed expansion, MT19937 draws, and range scaling.
- Local input: resources/liber-primus/lp2-corpus.json, blob SHA 054f2a0f780b7d46901acbe3d9bf4f0ac1801165.
