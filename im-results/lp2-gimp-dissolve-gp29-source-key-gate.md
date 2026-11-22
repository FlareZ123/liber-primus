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

Because a single, fixed substitution or GP alphabet relabeling merely permutes frequency counts, **IoC is exactly invariant under every bijective 29-symbol post-substitution**. The eight failures therefore also exclude appending an arbitrary stationary one-to-one rune substitution, including Atbash, to these eight direct additive streams as a way to recover ordinary GP-English frequencies. A changing alphabet, nonlinear state, or non-English/non-GP intermediate does not obey that exclusion.

The original stream's IoC is **0.0344783979**. Two 12,956-rune windows of the repository's GP29-encoded Shakespeare control have IoCs **0.0595007131** and **0.0590028251**; all eight original outputs remain random-like and have nonlinguistic initial strings. No recovered plaintext.

The [reproducer](../sims/lp2_gimp_dissolve_gp29_original_sft.cjs) checks the first eight MT outputs from both historically pinned seeds, checks the full original source length and IoC, recovers an independently GP29-encoded Shakespeare positive plant under each of the eight candidate key conventions, verifies all original encryption/decryption round trips, and asserts each original output IoC. Wrong bijective keys also round-trip: their importance is implementation confidence, not historical identification.


## Seven-digit BASE29 serialization and one ciphertext-feedback comparison (13 November 2026, Agent16)

The earlier source-locked eight whole-book tests above consume one MT uint32 as one GP29 key shift by residue or scaling. The signed 2013 Cicada TCP witness independently provides a **BASE29 numeral operation** (`3301 → 3QO`). A distinct, equally source-fixed serialization was tested once: render each of the **4,096** original GIMP master-generator row-seed uint32 values as **seven big-endian GP29 digits** (minimum fixed width for uint32), yielding **28,672 possible rune shifts**, then consume the first 12,956 from global LP2 p0 onward with no resetting, skipping, byte phase, or source changes. This was performed on the untouched original full corpus, with only two frozen decoders: direct `Pᵢ=Cᵢ−Kᵢ mod29` and ciphertext-feedback `Pᵢ=Cᵢ−Cᵢ₋₁−Kᵢ mod29` (`C₋₁=0`). The latter accounts for a possible known previous-cipher state, but no Cicada instruction selects it.

The independent historical GIMP reference verifies the first ten row seeds starting `3721122731,618219707,807213306,3144837749`; the first maps to GP digits `[6,7,12,4,23,16,27]`. The signed 2013 BASE29 worked example yields `[3,26,24]`. Reversible independent solved-LP1 prose plants succeed. On original 12,956 unsolved runes the GP29 IoC is **0.0344704262** (direct), **0.0344554481** (feedback), versus original **0.0344783979** and 66-rune native solved GP passage **0.0582750583**. Direct output begins `NUGEAEOOFEAXOETPXRIAESNGEAGSRDFHIDAIEAIJHRGLDAEEOESYYGOEXEAWEOEJNGIABIAIAPBCTERUJ...`; feedback begins `NSIAINYIUXWMAOEEAHXNAEEAAOEUXIAEANGTWSPBEAIAEOCJIAMTHTWNBHNYMAWLTFUOIRFEA...`. The p55 direct all-76-rune output begins `TEADUCFOXYEGXLNGAATHEOTOBGUELGSEAMOEXP...`. Neither is readable. A wrong root seed 314159266 gives direct IoC **0.0344694849**. The fixed original doublet indicator obtained by treating raw GLib byte0/1 values as escape triggers overlaps the 86 actual equal-adjacent events at **0/115** predicted positions for the master stream and **0/111** for its first seeded row; no source mandates that threshold, and these overlap counts are not statistically unusual given their tiny chance expectations.

**Decision:** retire this exact BASE29-serialized GIMP row-table shift and feedback architecture for native GP29 text. It differs from the prior uint32%29 and row-seed-search experiments **only in digit serialization and one feedback comparator**; the GIMP algorithm is publicly hardcoded rendering behavior, never a demonstrated cipher key. No new plaintext, secret or author-selected rule follows. Do not launch seed, width or phase sweeps. The [CJS reproducer](../sims/lp2_gimp_dissolve_base29_key_sft.cjs) asserts the GLib control vector, BASE29 example, original full-length controls, and exact bidirectional decryption.

## Decision and scope

Retire these **eight unskipped source-seeded GP29 additive models** for ordinary native-English plaintext. The known software default seed is an available clue candidate, with no independent authentication as an LP2 key. This experiment does not exclude a source-selected alternative clock, rejection transducer, non-additive map, different PRNG or separate per-page key. Do not extend into arbitrary seed, clock, phase or skip enumeration without a new author-visible selector. This is supporting research only; the established LP2 solution status is unchanged.
