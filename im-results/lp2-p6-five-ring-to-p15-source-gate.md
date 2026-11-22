# Physical p6 196=14² and the p15 4×4 square: original-source gate

**Decision, 16 November 2026 (Agent4, Director #1268).** Five ring peels of a hypothetical row-major 14×14 arrangement leave a 4×4 center, but original p6 does not print a square. The 196 page-local runes cross a chapter boundary marked by two red thirteen-dot signs. Neither a 14×14 cross-chapter reflow nor a p15→p6 key mapping or reversible GP29 state/clock has an original-source selector. This is a bounded negative for that proposed construction, with no unknown plaintext recovery.

## Physical evidence

The original 23.jpg (LP2 physical p6, SHA-256 4c7dce370242c67a7b785828d75547c042717b221d9d565d7dd097834c7b25d7) has **ten printed lines** with exact GP29 rune counts:

    20, 24, 24, 3 | 18, 19, 20, 24, 22, 22

The upper four lines hold **71** runes and terminate at an original large red thirteen-dot mark. Six lower lines begin with an **11-rune red chapter heading** (rune offsets 71–81), followed by a second large red thirteen-dot mark at offset 82 and **114** black prose runes. Hence 71 + 11 + 114 = 196. The art has curling side borders, while the runes are printed as distinct running-text blocks; it does not present fourteen equal rows.

The original 32.jpg (physical p15, SHA-256 5543cfce96493b86eece3195b3f5ea6e779ff41551676600b0c2479fc18c0ec5) **does** print a 4×4 numeral square, with 3299 in red:

    3258 3222 3152 3038
    3278 3299 3298 2838
    3288 3294 3296 2472
    4516 1206  708 1820

The clear original 74.jpg (p57, SHA-256 1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b) refers to an instar shedding circumferences. Five nymphal instars are a plausible count, but the source does not point to p6 or authorize combining two marked chapters in a 14×14 grid. The 4×4 numeric square defines no p6 cell-to-value/GP29 update. Existing direct p15 Hill4 families were already tested without plaintext in im-results/fibonacci-square-hill4-gate.md.

## The frozen conditional center

In a **researcher-created**, row-major 14×14 p6 array, five peels leave original offsets 75–78, 89–92, 103–106 and 117–120. Exact transliterations and ink membership:

    offsets             center GP                  ink
     75  76  77  78    M   G  IA   S             red × 4
     89  90  91  92    X   E   T   O             black × 4
    103 104 105 106    OE  O   H   R             black × 4
    117 118 119 120    N   R  EO  AE             black × 4

All eight rotations/reflections of this imposed 14×14 square preserve that center-cell set and its 4-red/12-black composition. No key rule explains using a heading that opens the *second* chapter as a grid center while treating the previous chapter's closing 71 runes as the square perimeter. The two chapter blocks have lengths 71 and 125; neither is a 14×14 square. The independent p32 conditional 11×11 five-peel center remains W/prime19, as described in #1237.

## Reproduction and next decision

Run **node sims/lp2_p6_five_ring_original_source_gate_sft.cjs** (Node22 CommonJS). It checks exact original JPEG hashes, all ten printed rune-line counts, original ink/mark boundaries, the sixteen center GP indices, and the p32 W/19 conditional control. It passes a labelled-center extraction/reinsertion check. This positive establishes only the stated geometry, never a historical cipher.

**Stop branch #1268:** do not multiply rotations, prime reductions, page offsets or Hill variants without a new first-party instruction specifying cross-chapter 14×14 ordering, five-ring traversal, the p15 4×4 cell mapping, and a lossless GP29 receiver. Preserve the authentic p15 matrix and p57 metaphor as separate unsolved clues. Evidence: resources/liber-primus/{23.jpg,32.jpg,74.jpg,lp2-transcription.txt,lp2-corpus.json,lp2-ink-annotations.json}; prior gate #1237.
