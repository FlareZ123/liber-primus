# p30–p38 cold-start source freeze and adjudication

**Agent3, 21 November 2026.** This is the source-first record for Director Issue #2000. The original supplied LP2 JPEGs map physical p30–p38 to archive images 47–55. The two initial observations were frozen before derived p30–p38 reports were opened.

## Two direct observations

1. **p33 has a distinctive two-part red layout.** Two enlarged red initials open separate text blocks on the same page; three black dots sit between the blocks, and a small cuneiform-like drawing appears below the second block. This could prompt a contemporary solver to treat the two text blocks as separate operands or stages, but the image does not label the initials as operators, specify a direction, or give a key/clock.

2. **p36–p38 carry a five-part numbered passage.** Red paragraph numbers 1–5 are distributed across these three pages, while the same small cuneiform-like emblem recurs at the top of the pages in this local sequence. The numbering gives an unambiguous order for the five text sections; it does not itself specify a cipher, key, or transformation. The p33 and p36–p38 motifs are recorded as distinct observations, not merged into a new cipher family.

## Post-freeze comparison with existing work

- `im-results/lp2-p33-prologue-original-reading-selector-gate.md` identifies the p33 first unit as 91 runes over five physical lines, terminated by a red 13-dot marker and the separated three-dot break; the next red rubric is eight runes. It tests the exact source-era 2014 Stage05 seven-place order `[0,6,2,5,1,4,3]` on the original 91-rune unit and obtains no instruction. The report explicitly finds no independent source telling a solver to apply that operation to p33.
- `im-results/lp2-p33-p39-original-three-dot-ellipsis-gate.md` establishes that p33's three black dots are a repeated section-divider motif also present on p39, not a page-specific numerical key or reset selector. The p33 cuneiform-like drawing is part of the existing p33–39 visual chapter, not a newly authenticated external text.
- `im-results/lp2-pp36-38-numbered-aphorism-crib-gate.md` freezes the five original paragraph rune/word boundaries and screens eight pre-2014 numbered didactic source editions. The longest length-only match is eight words; no qualifying source crib or original-cipher consequence exists.
- `im-results/lp2-p36-38-five-numbered-index-share-original-gate.md` tests literal first/last rune, nth-rune and word-index readings from labels 1–5, then a five-share GF(29) interpolation on the common 91-rune prefix. None yields an identifiable instruction or plaintext; the unequal paragraph lengths provide no source-authenticated share alignment.
- `im-results/2012-midi-chorus-p36-238-gate.md` tests the most plausible cross-round source clue: the 2012 signed “Chorus” and its 238-letter Blake text align in length with p36's 238 runes. Direct running-key mappings, both additive directions, and the historically fixed 2012 seven-column and 2014 fourteen-column orders all fail; the 49-word count match is not a shared key because the 2012 list is participant-specific. This is not a new operation to rerun.
- Existing cuneiform/numbered-passage reports already cover the obvious 1033/3301, prime, Base29, Hill, RSA, and wisdom/folly transfers. Their existence does not make the repeated emblem a source-selected key; no new family was opened.

## Decision

**Bounded negative; no new original-cipher test was justified.** The p33 red headings and three-dot break are real source structure, but the break is a repeated section divider and the known source-era seven-place reading is nonlinguistic. The p36–p38 numbered paragraphs have exact boundaries, but literal index readings, five-share interpolation, and historically motivated aphorism cribs do not produce a decoder. The 2012 Chorus length match is a plausible historical prompt, but its exact direct and source-fixed columnar consumers already fail.

The exact missing selector is a first-party instruction that maps the p33 red headings/three-dot or the cuneiform/numbered-passage structure to one reversible operation and fixes its operand, key, state clock, and unknown-text receiver. No such instruction is visible in the original scans or the checked first-party sources. No route meets the requirement of at least 50 contiguous coherent original GP29 plaintext runes, exact forward replay, and an untouched holdout. Retire this p30–p38 cold-start pass; do not reopen p32/p33 state packets, the p32 tree/square, or the excluded DH/H families.
