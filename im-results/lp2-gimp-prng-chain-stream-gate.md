# GIMP Dissolve PRNG as an LP2 chain-step key: direct-stream gate

**Status (12 November 2026, Agent32): direct one-dimensional interpretations rejected.** A recent external analysis describes the unsolved LP2 ciphertext as having 86 zero first-differences and an approximately flat distribution over the 28 nonzero differences. A separate recent image analysis identifies the p57 mayfly mask with GIMP Dissolve's seeded random field. Combining these observations suggests a testable key-source hypothesis: the GIMP field might supply the nonzero step stream. Three source-natural one-dimensional projections were tested against the original LP2 corpus; all match only at chance. No plaintext or key was recovered.

## What is actually observed

Using the repository's canonical rune indices for pages 0–55, concatenated in physical page order:

- 12,956 unsolved runes produce 12,955 adjacent differences.
- The zero difference occurs 86 times.
- The 28 nonzero difference counts, in order 1–28, are:

459, 504, 440, 438, 446, 430, 470, 426, 510, 497, 455, 449, 504, 474, 470, 449, 404, 434, 474, 467, 463, 421, 486, 468, 467, 457, 476, 431

These counts reproduce the external Leo-Y-Zhang report exactly. One statistical correction is needed: conditional on the 12,869 nonzero differences, the expected count per nonzero value is **12,869 / 28 = 459.607**, not 447. The latter is the expectation for each of all 29 values before conditioning on the observed zero deficit. Against a uniform 28-bin null, the observed counts give χ² = **41.38**, df = 27, p ≈ **0.0378**. This is a mild departure from uniformity, not strong evidence that the 28 differences are an independently generated keystream.

Defining s[i] = C[i] − C[i−1] mod 29 is a descriptive identity, not by itself a cipher identification or a decryption. The zero-step deficit is a real structural observation; the “28-symbol chain keystream” remains a model until a source-derived key and reversible plaintext relation are found.

## Why the GIMP connection was worth one test

The recent SECRA image analysis reports that the p57 mayfly's sparse mask is reproduced by the historical GIMP Dissolve random field, with seed **314159265**, a **4096-entry row-seed table**, and row-specific GLib GRand streams. The GIMP 2.8.10 paint code explicitly dispatches GIMP_COMPOSITE_DISSOLVE with image x/y coordinates; the later operation implementation exposes the 4096 row seeds and per-pixel random draw. GLib 2.38.2 documents the contemporaneous GRand random-version-20 generator and range mapping.

This gives a plausible visual source for a deterministic random field. It does **not** establish that LP2 text uses that field as a key. The following deliberately narrow tests ask whether its most direct 1-D forms are the observed 28-way step sequence.

## Frozen tests

The nonzero LP2 differences were compared, in their original order and with no offset search, to these source-natural 28-way streams:

1. **Master-seed stream:** initialize GLib GRand random-version 20 with 314159265 and draw g_rand_int_range(1, 29) once per nonzero step.
2. **First dissolve-row stream:** generate the documented 4096 row seeds from the master generator, initialize a row generator from row seed 0, and draw g_rand_int_range(1, 29) left-to-right.
3. **Repeated row-seed table:** map the 4096 raw row seeds to 1–28 using the same GLib range scaling, then repeat the table to the required length.

The inverse additive direction was scored as the natural sign alternative. No seed search, offset search, row search, or post-hoc permutation was performed.

| Candidate | Exact matches | Inverse matches | Random expectation |
| --- | ---: | ---: | ---: |
| Master-seed stream | 438 | 425 | 459.61 |
| First dissolve row | 456 | 460 | 459.61 |
| Repeated 4096 row-seed table | 432 | 457 | 459.61 |

The standard deviation of a chance match count is about **21.05**. All six scores are within 1.64 standard deviations of chance. None is remotely consistent with a recovered key stream.

## Independent direct GP29-key interpretation (Agent27, 13 November 2026)

The same historically source-reproduced GIMP field has a separate, straightforward cryptographic use which the 28-way step comparison above did not address: take its 32-bit output as a **29-way GP rune keystream**, then use a one-to-one additive cipher `C = P ± K (mod 29)` with no ciphertext feedback or deleted symbols. The source supplies seed **314159265**; the possible initial generator states tested are the master GLib GRand state and the first genuine Dissolve row seed **1428665816**. A third control cycles through the exact **4,096** underlying random-table words. No seed search or fitted offset is used. The image supplies neither a rule linking text to this generator nor a required GP29 projection, so the experiment freezes both standard 32-bit-to-29 reductions: GLib's scaled range and unsigned integer modulo 29.

These are **3 streams × 2 page/global clocks × 2 reductions × 2 signs = 24** fully reversible, source-seeded original-cipher inverses, measured on all **12,956** unmodified unknown LP2 runes. All outputs retain IoC within **0.0344453793–0.0345189710**, essentially the uniform GP29 baseline `1/29≈0.03448276`; even the highest candidate contains no recognizable GP-native passage. Repeated 4,096-entry table and direct-master modes coincide under page reset where pages have fewer than 4,096 runes, as expected from their common initial stream. The best candidate is master-seed, per-page reset, scaled GP29 projection, positive inverse, IoC **0.0345189710**. A known solved-p57 native-GP plant repeated to the full exact source length recovers **12,956/12,956** runes under these keys, while every original inverse exactly re-encrypts. This rejects only a **direct additive** GP29 use of this documented PRNG; it does not support trying arbitrary variants of the historical seed.

The standalone [GP29 direct-key SFT](../sims/lp2_gimp_pi29_source_key_sft.cjs) (passing [original-input Windows Actions run 43530202473](https://github.com/FlareZ123/liber-primus/actions/runs/43530202473)) reconstructs all 24 outputs from the shared original corpus and implements the same historical GRand engine as the separate 28-way step test. It contains exact maximum/minimum IoC assertions and a GP-native planted inverse. **Result: no recovered unknown-page plaintext, key, or authenticated text-key instruction.**

## Decision and scope

**Reject the direct 1-D GIMP-PRNG-to-chain-step key hypothesis and its direct 29-way additive variant under the 24 documented source-seeded readings.** The p57 dissolve fingerprint is a genuine image-generation clue, but these direct streams do not decrypt LP2.

A two-dimensional sample of the GIMP field at rune pixel coordinates was not run. The sources currently provide no rule selecting a rune's sample pixel (center, edge, first ink pixel, etc.) or establishing that the text was keyed from the same field. Choosing such a mapping after seeing ciphertext would introduce an unconstrained parameter and fail the Director's source-to-plaintext criterion. Do not launch coordinate sweeps unless an independent clue fixes that mapping.

This is an intermediate negative result, not an established LP2 mechanism; do not promote it to results/README.md. The direct 1-D variants should not be repeated.

## Reproduction

Run from the repository root:

node sims/lp2_gimp_prng_chain_stream_gate.cjs

The script reads the canonical corpus, verifies the 12,956/12,955/86 input counts, implements GLib 2.38.2 GRand random-version 20, generates the GIMP seed table, and emits the six exact-match scores.

## Sources

- [Leo-Y-Zhang, Liber Primus Analysis — chain-step report](https://github.com/Leo-Y-Zhang/LiberPrimusAnalysis/blob/main/docs/REPORT.md) — external step histogram and chain-cipher interpretation.
- [SECRA, Liber Primus strongest findings](https://secra.tech/research/liber-primus-strongest-findings) — external p57 GIMP Dissolve mask/seed analysis; used as a candidate source, not as proof of a cipher key.
- [GIMP 2.8.10 paint-funcs.c](https://github.com/GNOME/gimp/blob/GIMP_2_8_10/app/paint-funcs/paint-funcs.c#L3936-L3959) — historical Dissolve-mode dispatch and image coordinates.
- [GIMP Dissolve operation](https://github.com/GNOME/gimp/blob/master/app/operations/layer-modes/gimpoperationdissolve.c) — 4096 row seeds and per-pixel GRand draws.
- [GLib 2.38.2 grand.c](https://github.com/GNOME/glib/blob/2.38.2/glib/grand.c) — random-version-20 seed expansion, MT19937 draws, and range scaling.
- Local input: resources/liber-primus/lp2-corpus.json, blob SHA 054f2a0f780b7d46901acbe3d9bf4f0ac1801165.
