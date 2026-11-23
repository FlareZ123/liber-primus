# Historical GIMP Dissolve seed transferred to the unsolved LP2 rune stream

**Agent1, 23 November 2026.** **Negative for one precisely defined historical-software key transfer; no LP2 plaintext/key recovered.** This is a new cross-medium source lead, independent of the already exhausted prime/totient keys and p13 Crab Canon route.

## Independent reason to try the fixed stream

[SECRA's 15 October 2026 original-image reconstruction](https://secra.tech/research/liber-primus-strongest-findings/) reports that the dotted mayfly on the authentic **clear p57** page is consistent with the deterministic **legacy GIMP Dissolve** algorithm. Its image-registration search tested 268,435,456 configurations, used disjoint image heldouts and reported 93.9% heldout F1 and 96.0% full-image F1. This is substantial evidence of **the illustration's rendering pipeline** rather than a cipher instruction. [Original measurement data](https://secra.tech/research/liber-primus-strongest-findings/evidence/index.html).

Legacy GIMP's source contains the literal line **`g_rand_new_with_seed (314159265)`** and prepopulates a 4,096-entry random-row seed table using `g_rand_int`. The [historically documented C source](https://mail.gnome.org/archives/commits-list/2017-February/msg00316.html), [later source excerpt](https://fossies.org/linux/gimp/app/operations/layer-modes/gimpoperationdissolve.c) and [source provenance in SECRA](https://secra.tech/research/liber-primus-strongest-findings/evidence/index.html) agree. The number **314159265 is a default in GIMP's code**, hence finding it in a recreated page57 rendering is **not evidence that Cicada specifically chose the number as a GP29 cipher key**.

Nonetheless the original author's use of this actual generator, if it extends from the illustrated page to the text, could supply a deterministic keystream with zero guessed secret bits. The smallest such cross-medium transfer is to consume `g_rand_int` MT19937 32-bit words directly as a GP29 additive mask, reducing each output integer mod29. No screenshot-tone fitting or guessed cipher language chooses the key. The **first** generated 32-bit integer controls the **first unknown rune p0**, with only two start conventions tested: one continuous generator across 12,956 unknown runes, or the same seed at every original physical page, and the two arithmetic signs `P=C±K mod29`. The separately claimed p57 **raster-derived, per-pixel two-level** threshold generator is *not* the direct serial MT output used in this test. Other pixel flattenings and offsets are outside this one source-specified hypothesis.

## Exact original-input result

The frozen single-file implementation uses the standard 624-word MT19937 state and GLib's unsigned `g_rand_int` output order. It was independently matched against **the first 12 actual GLib2.0 C-library outputs** for seed314159265, beginning `3721122731, 618219707, 807213306, 3144837749`. That genuinely verifies the historic primitive instead of substituting a different JavaScript RNG.

The `resources/liber-primus/lp2-corpus.json` source contains the **12,956 unmodified runes** on original unknown pages p0–55, with p50 rune-free, preserved in exactly original order. The direct additive inverses give:

| Fixed GIMP raw-MT clock and sign | Full original GP29 IoC |
| --- | ---: |
| Continuous, `P=C−K` | **0.03446403937728731** |
| Continuous, `P=C+K` | **0.03446276439128534** |
| Each original physical page re-seeds, `P=C−K` | **0.034486190769601806** |
| Each original physical page re-seeds, `P=C+K` | **0.03451120194360296** |

All four original candidate decodings remain indistinguishable from 1/29 (**0.03448276**) on this first-order language control; their full p0 beginnings are nonprose. Every full original candidate was re-encrypted with the inverse sign and reproduced the **same 12,956 original rune values** exactly. A planted original-solved 95-rune p57 GP29 native positive recovered every rune correctly with this same implementation and both key-start conventions. These controls test decoder correctness; they do not authenticate the proposed cipher.

## One separately source-motivated differential receiver

The independent September 2026 ciphertext analysis and exact original corpus document only **86 adjacent equal rune events** in 12,901 within-page steps. This makes a one-step ciphertext **difference** a motivated way to turn the original anti-repeat tape into an input register; the original manuscript still gives no explicit command to combine it with GIMP. Freeze the same historical default MT stream, zero external predecessor on p0, continuous cross-page previous-ciphertext state or a page-local predecessor reset to zero, and the same ± GP29 additive mask. The proposed inverse is `P_i=(C_i−C_(i−1)±(MT_i mod29)) mod29`; the forward recurrence is exact and reversible. No seed, key phase, decimal-digit selection or output-tuned reset is searched.

The test scores **all 12,901 original intra-page destination plaintext runes** after omitting the 55 unconstrained physical-page first symbols, but retains every original rune in full reversible reencryption.

| Fixed GIMP-MT ciphertext difference receiver | Original within-page GP29 IoC |
| --- | ---: |
| Continuous stream, minus | **0.034483715882850256** |
| Continuous stream, plus | **0.03449473600087488** |
| Page-seeded stream, minus | **0.03446573758779591** |
| Page-seeded stream, plus | **0.03451331517477463** |

The source p0 opening is nonprose under all choices, beginning `BAOEXFUATUGNGPOOTIUTHOUOEISTHCCAEAHEOJSEYNGMAXOEAGTDWANGAXEO...` in the fixed minus case. The same test confirms complete forward reencryption on **all original 12,956 runes** and exact recovery of a planted **95-rune solved p57 native GP29** stream. This materially distinct source-selected *differential* family fails to reveal GP-native unknown plaintext, even though it allows a running ciphertext state. It does not rule out a different key source, nonlinear state, non-GP register, or genuine separate anti-repeat side information.

## Decision

Reject the **first-raw-GIMP-output `mod29` fixed additive and ciphertext-differential streams** with book-continuous or page-reset starts and either sign. The historically recognizable software **art-production fingerprint is distinct from an authored instruction to encrypt 2014 runes**; its default seed carries no independent cryptographic significance. This bounded attempt produced no coherent original unknown LP2 native prose, key, source-heldout message or final link.

If an independently recovered period XCF project shows **a native-layer selection and byte field that directly serves as text key**, that specific new artifact could justify a different source-typed test. In its absence, do not launch raster-offset, pixel-channel, PRNG seed, cipher-phase or alternate modulus sweeps merely because GIMP Dissolve matches page57's artwork.

Reproducible read-only [Node22 CommonJS SFT](../sims/lp2_gimp_dissolve_mt_seed_direct_additive_original_sft.cjs), [manual Windows Actions run 45194042022](https://github.com/FlareZ123/liber-primus/actions/runs/45194042022).
