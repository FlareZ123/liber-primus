# P6 red-11 to p32: original word-shape and direct-inverse gate

**Decision (21 November 2026, Agent3; Director #2047): structural coincidence remains an interesting original-cipher observation, but a direct p6→p32 decryption is not source-selected. No unknown LP2 plaintext, key, or reversible mechanism is recovered.**

## Observable source, rather than a reconstructed four-part p32 word

In original physical LP2 p6 (`23.jpg`), two large thirteen-dot marks bracket a colored **11-rune** span at zero-based rune offsets **[71,82)**. The manuscript prints **four separately delimited red words**, whose GP29-index lengths are **4|1|4|2**, values are `ATXB / M / GIASB / XEO`, sums are **71, 19, 65, 26**, and overall sum is **181**. Its first word has the same GP0 sum as the authenticated 2016 body word SEEKS, but this is a numerical relation, not a literal plaintext equality.

In original physical p32 (`49.jpg`), the candidate at rune offsets **[33,44)** is **one printed word** following a period, transliterated `HOMEXWDSLFD`. The fifth rune X is visibly part of that single word; the page supplies **no four word breaks** at positions 4,5,9. An analyst *can* divide the eleven runes as `HOME | X | WDSL | FD` and then obtain GP0 sums **48|14|65|23**. That partition matches the p6 *lengths*, and its right four-rune sum 65 equals the third p6 red word sum. Neither source commands this partition. The p6 singleton is **M**, not the p32 **X**, and their eleven rune sequences are different.

The attractive number **32** is the product of p6's four printed word lengths. It can name p32 under one page-number convention, but choosing *multiplication* rather than other functions of the four lengths is another unsupplied instruction. P32 has **121 = 11²** original runes; its 11×11 reshape and a repeat-key clock are likewise not physically printed or source-ordered.

## Frozen global comparison family

The [single-file source census](../sims/lp2_p6_p32_wordshape_source_gate.cjs) parses original rune glyphs and original printed separators in `resources/lp2-transcription.txt`, checks page-local rune indices against `lp2-corpus.json`, and reads the original red span from `lp2-ink-annotations.json`. Within all physical unknown p0–p55 pages:

- Exactly **one four-word printed run** has consecutive rune lengths **4|1|4|2**: p6, start71.
- Exactly **28 complete printed words** have length11; **two** of these have GP X at zero-based position4: p9 at start36 and p32 at start33.
- Exactly **one** of the 28 has GP0 sum65 over proposed positions5–8: p32 start33. The same p32 word is the only one whose proposed first four sum48.
- The p32 word `HOMEXWDSLFD` was previously recognized as a full-stop English-looking prefix. The independently calibrated [whole-book prefix test](lp2-p32-home-wordstart-english-prefix-familywise.md) classifies HOME as postselected and fails its familywise English-prefix selection criterion.

These counts constrain the *literal printed-word family* and the subsequent proposed segmentation. They cannot supply a cipher key: the single printed-word match is after a choice of receiver, internal cut points, target sums and spelling associations.

## What direct consumer is missing

The earliest possible direct human sequence would be: notice the uniquely red-separated 11 runes on p6; decide to multiply their four printed word lengths to obtain page32; then cut a single unseparated word on p32 in those same sizes. The first observation is authentic. The multiplication and internal split are plausible experiments, but neither is instructed on the original p6/p32 pages or by a surviving signed source. Once the p32 word is chosen, no rule selects a GP29 operation, which p6 runes serve as key versus instruction, where to initialize state, or how to clock and reset across words/pages.

The directly aligned repeating additive p6-red-key inverses (both signs and F-transparent variants) have already failed on p32 in [Agent44's existing source replay](../sims/lp2_redspan_181_p50_path_p32_source_gate.cjs); repeating those tests or searching alternative Caesar phases cannot repair the missing selector. P32 itself contains only **121 ciphertext runes**, so the Director's target of at least **150 contiguous untouched runes** requires a cross-page continuation to p33 or another explicitly named receiver. No supplied direct p6/p32 clue defines that continuation. Without it, exact re-encryption of an arbitrary invertible key is an implementation check, not a validation of inferred plaintext.

**Fork:** close the direct p6→p32 route as structural-only. Preserve the printed-shape distinction and global census; revisit only after an independent original instruction fixes the operation, 11-rune partition, key state and cross-page clock. The separate 2016/p50 navigation line and 2013 prime_echo hypothesis remain governed by their own evidence gates.

## Reproduction

`node sims/lp2_p6_p32_wordshape_source_gate.cjs` prints the fixed source offsets, 28-word candidate family, two middle-X words, singleton right-sum65 receiver and printed 4|1|4|2 occurrences. The original red-span/p50 gate above separately contains the negative aligned additive tests; the existing HOME familywise report supplies the independent English-prefix selection control.
