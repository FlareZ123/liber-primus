# Historical GIMP Dissolve MT stream as direct GP29 key: original-input gate

**11 November 2026; Agent16. Bounded, source-motivated negative.** No unknown LP2 plaintext, authentic key, or historical cipher recovered.

## Independent premise and intended human route

The artwork/font pipeline has previously been linked to a historical GIMP Dissolve MT19937 generator. The repository's earlier [renderer/table source check](../sims/gimp_table_grid_cogeneration.cjs) reconstructs the historical seed **314159265**, the first generated per-row seed **3721122731**, and the exact first eight words from both MT streams. A solver recognizing the rendering process might test its generated words as a cipher key. Neither the artwork nor an authenticated Cicada source, however, actually directs that use or prescribes a GP29 clock.

That earlier script tested the generator against the 256-byte number table. The present distinct decision tests an uninterrupted **whole-book GP29 additive inverse on the original unknown ciphertext**. It is a finite new original-input gate, not an expansion of seed/offset searches.

## Frozen ciphertext experiment

Take the 55 unknown rune-bearing physical pages p0–p55 (p50 is the rune-free number table) in printed order, **12,956 GP29 symbols**. Two independently fixed MT seeds supply generated 32-bit words. Map every word to a GP29 shift either by its residue modulo29 or equal-width scaling floor(29 × word / 2^32). Under both signed additive directions, invert the original stream with one global clock and no skip, reset, or phase. These choices give exactly eight fixed variants.

| Fixed MT stream | GP mapping | Subtract-key decoded IoC | Add-key decoded IoC |
| --- | --- | ---: | ---: |
| master seed 314159265 | residue mod29 | 0.0344640394 | 0.0344627644 |
| master seed 314159265 | equal-width scaling | 0.0344888003 | 0.0344914694 |
| row0 seed 3721122731 | residue mod29 | 0.0344628835 | 0.0344657791 |
| row0 seed 3721122731 | equal-width scaling | 0.0344832118 | 0.0344990836 |

The original stream's IoC is **0.0344783979**. Two 12,956-rune windows of the repository's GP29-encoded Shakespeare control have IoCs **0.0595007131** and **0.0590028251**; all eight original outputs remain random-like and have nonlinguistic initial strings. No recovered plaintext.

The [reproducer](../sims/lp2_gimp_dissolve_gp29_original_sft.cjs) checks the first eight MT outputs from both historically pinned seeds, checks the full original source length and IoC, recovers an independently GP29-encoded Shakespeare positive plant under each of the eight candidate key conventions, verifies all original encryption/decryption round trips, and asserts each original output IoC. Wrong bijective keys also round-trip: their importance is implementation confidence, not historical identification.

## Decision and scope

Retire these **eight unskipped source-seeded GP29 additive models** for ordinary native-English plaintext. The known software default seed is an available clue candidate, with no independent authentication as an LP2 key. This experiment does not exclude a source-selected alternative clock, rejection transducer, non-additive map, different PRNG or separate per-page key. Do not extend into arbitrary seed, clock, phase or skip enumeration without a new author-visible selector. This is supporting research only; the established LP2 solution status is unchanged.
