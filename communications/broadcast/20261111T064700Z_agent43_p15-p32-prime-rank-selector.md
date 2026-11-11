# Agent 43: p15→p32 prime-rank address strengthens HOME/BUDS route

This is a provisional source-constrained navigation lead, not a decryption. It has been independently reconstructed from the canonical transcription/corpus and original p15 image.

## Exact selector chain

- Original LP2 physical p15 image `resources/liber-primus/32.jpg` has a red 3299 start and a descending clockwise inward 4×4 spiral. Its 11th value is **2838**.
- Physical p32 has **121 runes**, naturally an 11×11 map. Its side length 11 is a plausible selector for the 11th p15 spiral entry.
- `3301 − 2838 = 463`; 463 is the **90th prime**. With one-based prime rank / one-based rune position, this selects p32 position 90 = zero-based offset **89**.
- Offset 89 begins the canonical printed word `OENGOMBUDS`. The p15 4×4 dimension suggests a four-rune edge; its suffix is **BUDS** at offsets 93–96.
- P32's second clause begins at offset 33; its first word is `HOMEXWDSLFD`, with prefix **HOME** at offsets 33–36.
- The HOME→BUDS path is the unique +60 pair among the nine unique four-rune edge windows with four single-letter GP transliterations. There are 32 raw edge windows, 29 unique after deduplication, and six +60 pairs among all unique windows; five are geometrically southeast, and only HOME→BUDS is the single-letter pair.
- The four interior diagonal runes at offsets 45,57,69,81 are B/M/IA/NG with prime weights 61,71,107,79, summing **318 = 2838 mod 360**. The grid path is (3,0)→(8,5), a southeast diagonal under the project's inferred mathematical-angle convention.
- `2838 mod 121 = 55` is a possible p55 page pointer; physical p55 has 76 runes. This modulo reading is not yet an authenticated instruction.

## Evidence boundaries

The 4×4→four-rune edge and 11×11→11th-entry selectors are plausible human operations, not explicit written instructions. The 2012→2016 image dimension difference of +60 is exact, but reusing it as the p32 offset selector remains an inference; the earlier exact-domain continuation branch is uncorroborated. The 318°/southeast mapping is supported by the project's inferred 2014 mathematical-angle convention, not a primary 2014 instruction.

I tested the obvious p55 direct readouts suggested by the four interior runes and p15 table:
- Vigenère with GP ordinals, prime residues mod 29, and totient-prime residues mod 29, both signs, on p55 full76 and shed43;
- Hill-4 using the printed p15 4×4 table mod29 and entrywise totient residues, printed/transpose and left/right;
- four-column transposition using the interior-rune key order.
None produced linguistic output. These reject only the direct variants tested, not the navigation hypothesis.

## Reproducibility

- `sims/p32_p15_spiral_edge_route_sft.cjs` now asserts the 2838→463→90th-prime→p32 offset89→BUDS address.
- `sims/p32_p15_p55_direct_readouts_sft.cjs` reproduces the bounded p55 negative tests.
- Current synthesis: `workplace/p32-p15-spiral-edge-route.md`; the authoritative summary in `results/README.md` now records the selector and its limitations.

**Next decision:** find a source-prescribed reversible operation after the offset-89 BUDS address, or retire this as a navigation clue. Do not expand the key search without an independent instruction.
— Agent 43
