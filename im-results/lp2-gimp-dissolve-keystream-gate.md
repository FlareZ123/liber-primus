# GIMP Dissolve PRNG as LP2 keystream: bounded original-input gate

**16 November 2026, Agent1. Status: the natural row-major GIMP seed/field readings do not decrypt LP2. No unknown plaintext or key recovered.**

## Question

A recent external analysis reports that the dotted insect illustration on LP2 p57 is consistent with GIMP's historical Dissolve operation and its fixed seed 314159265. The public GIMP implementation constructs a 4096-entry row-seed table, then generates per-pixel thresholds with g_rand_int_range(rand, 0, 255). See:

- External image analysis: https://secra.tech/research/liber-primus-strongest-findings
- GIMP Dissolve implementation: https://github.com/GNOME/gimp/blob/master/app/operations/gimpoperationdissolve.c
- GLib random implementation: https://github.com/GNOME/glib/blob/main/glib/grand.c

This suggests a bounded key-source hypothesis: perhaps the same reproducible GRand stream, or the actual 2-D dissolve field, supplies the GP29 key for unknown pages 0–55.

## Reproducible implementation

The script at sims/lp2_gimp_dissolve_keystream_gate.cjs reproduces GLib's MT19937 initialization and GLib 2.2 range reduction, then follows the GIMP structure:

1. Seed the base generator with 314159265.
2. Draw 4096 raw 32-bit row seeds.
3. For each row, instantiate a new generator from that row seed.
4. Generate the row-major pixel-threshold prefix with g_rand_int_range(0,255).
5. Reduce candidate key values modulo 29.
6. Test direct additive and chained additive decryption, with continuous and page-reset chain state, against the unchanged 12,956-rune pp0–55 corpus.

The implementation's first four row seeds are [3721122731, 618219707, 807213306, 3144837749]; the first 16 row-0 thresholds are [87, 10, 191, 6, 133, 152, 5, 71, 134, 199, 88, 235, 186, 95, 169, 95]. The latter sequence was independently compared against the local GLib C API and matched exactly.

## Results

The uniform GP29 index-of-coincidence baseline is 1/29 = 0.03448276.

| Seed-derived stream | Decryption | IoC |
|---|---|---:|
| Raw GRand outputs modulo 29 | Direct additive | 0.034464 |
| Raw GRand outputs modulo 29 | Chained additive, continuous | 0.034486 |
| Raw GRand outputs modulo 29 | Chained additive, page reset | 0.034483 |
| GIMP dissolve field, row-major prefix modulo 29 | Direct additive | 0.034503 |
| GIMP dissolve field, row-major prefix modulo 29 | Chained additive, continuous | 0.034486 |
| GIMP dissolve field, row-major prefix modulo 29 | Chained additive, page reset | 0.034486 |

The observed ciphertext-step/key coincidences are 426/12,956 for the raw GRand stream and 402/12,956 for the dissolve-field stream, versus approximately 447 expected under independent uniform GP29 values. None is a stream match. The decrypted samples remain non-linguistic; their IoCs are indistinguishable from a uniform 29-symbol sequence.

## Decision and scope

**Reject the natural row-major GIMP seed/field keystream hypothesis.** The test does not invalidate the external report's image-production fingerprint. It only rejects using the raw seeded GRand stream or the row-major prefix of its actual dissolve field, reduced modulo 29, as a direct or chained additive key.

The seed is a GIMP implementation default, not an independently established Cicada-selected key. No further offset search, arbitrary spatial sampling, alternative byte maps, or fitted transformations are justified without an original-source instruction selecting them. Retain the image-production observation as a possible clue, but do not treat it as recovered key material.

**Next useful direction:** prioritize source-authenticated key recovery or a reversible LP2 operation selected by the manuscript. Do not expand this GIMP branch absent a new selector.
