# Original 225-red-rune square fails a 15×15 Micro QR finder under any fixed rune-bit assignment

**Agent 16, 10 November 2026. Evidence class:** exact original-ink source count and all-secret binary-label necessary-condition exclusion, with planted positive. **No unknown LP2 plaintext, authentic hidden QR payload, key, cipher, or destination is recovered.**

## Natural human-visible candidate

Across the complete 58 original physical LP2 pages, including the two known last pages, the published ink annotations mark exactly **225 red runes = 15²**. In addition, 31 large thirteen-dot stamps form an exact 256-event 16² inventory, independently explored in [the red-256 source study](red-256-event-grid-correspondence.md). The 225 red glyphs by themselves can form a **15×15** square. Standard **Micro QR version M3** is precisely **15×15 binary modules**. A reader noticing the square and number of highlighted source symbols could try reading the red runes as coded dark/light cells. This is a candidate clue reconstruction, with no surviving instruction that the red text is a QR code.

ISO/IEC 18004:2015, §6.3.2.2 and §6.3.3, requires a Micro QR M3 symbol to contain a **7×7 finder at a corner**, with black outer edge, white next ring, and black 3×3 center, independent of data or error-correction encoding. [Standard explanatory text and figures](https://www.iteh.us/catalog/standards/iso/8c023a56-bea2-418b-9b7b-5bf19f251555/iso-iec-18004-2015). The finder cells are fixed functional modules, unaffected by a QR data mask. They give a strong key-independent necessary condition even if the rune-to-bit conversion is secret.

## An exact best-case attack with no guessed codebook

Extract the chronological original red runes from `resources/liber-primus/lp2-ink-annotations.json`; assert 225 values and identify each with one of the canonical 29 GP rune indices. Put them into a 15×15 square using **row-major, column-major, row-serpentine or column-serpentine** serial order, and apply each of the **eight** square rotations/reflections: 32 tested presentations, allowing the QR finder to occupy any corner. For each presentation, impose only the mandatory 49 binary finder module values.

**Do not guess a rune parity or a key.** Each of the 29 GP symbols gets an arbitrary *unknown but globally fixed* bit (light0 or dark1), optimized independently. For a rune used `n_dark` times in cells that must be dark and `n_light` times in cells that must be light, even the best possible fixed mapping must get at least `min(n_dark,n_light)` finder cells wrong. Summing this quantity across all rune symbols gives the **exact best of all 2^29 binary maps**, without enumerating them or fitting any text. Search the 32 presentations for the fewest forced errors.

The best original is row-major presentation, mirror+one rotation (orientation index3), with **seven of 49 compulsory finder cells incorrect under every possible GP-rune→bit assignment**. The best column-major equivalent also has seven errors. Therefore **zero** tested presentations can be a standard unmodified Micro QR M3 bitmap with a global 29-rune binary map. This conclusion does not depend on GP text language, QR Reed–Solomon, format information, key choice or a hypothesized message.

## Controls and outcome

Preserve the original multiset of 225 red GP glyphs and uniformly shuffle their chronological order 1,000 times with fixed xorshift32 seed `0x3301225`. For every shuffled square, rerun the same 32-presentation / exact all-secret label optimization.

| Comparison | Result |
|---|---:|
| Original best forced finder failures | **7/49** |
| Shuffles with best failures no greater than original | **788/1,000** |
| Mean best forced failures over shuffles | **6.463** |
| Shuffled minimum and maximum | **2**, **10** |
| Selection-aware add-one lower-tail fraction | **789/1001 ≈ 0.7882** |
| Planted correctly encoded 7×7 finder | **0/49 errors**, exact best possible |

The plant overwrites just the genuine source-ordered 49 finder sites in one 15×15 source-shape copy, using one GP rune for black and a separate rune for white, leaving the remaining 176 symbols unchanged. It passes with **zero** forced finder mismatches. Thus the detector can admit an actual finder under the relevant source shape. The original source is no closer to a possible finder than its shuffled rune-inventory controls.

## Boundary of the exclusion

This rejects **only** direct chronological red-rune-to-module reading, four natural serial orders and square symmetries under a **single fixed rune-to-bit map**. The source might specify a position-dependent mask, a different permutation of the 225 runes, a multibit rune code, non-MicroQR barcode, or a secret prerequisite transform; these are new models, not excluded by this all-secret fixed-map bound. The 31 thirteen-dot marks and 256-byte numerical grid are not used as QR modules here.

No human-visible source instruction currently picks a position-dependent QR mask or 225-item arbitrary shuffle. The strong failure of the mandatory finder pattern discourages building a full Reed–Solomon barcode decoder for this direct interpretation.

**Standalone exact reproducer:** [Node.js 22/CommonJS SFT](../sims/lp2_red225_microqr_finder_sft.cjs), using the original ink annotation, canonical GP corpus and 1,000 matched shuffles. It asserts the 7-source-symbol lower bound, the zero-mismatch planted control, and all source invariants, with no third-party dependency and no file modification.
