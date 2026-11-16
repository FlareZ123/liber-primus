# Original apostrophe-completed 100×29 word route: direct and circumference-spiral tests

**Status:** bounded original-cipher negative. No unknown Liber Primus plaintext, key, or intended transposition recovered. The candidate is motivated by four original punctuation marks, the 29-symbol GP alphabet, LP1's visible \`MOBIUS\` clue, and p57's circumference language; the source does not explicitly say to apply those clues to this word grid.

## Cryptanalytic hypothesis

The original unsolved LP2 transcription has **12,956 runes and 2,896 canonical whole words**. Four separately annotated original apostrophes occur immediately before the final rune of their respective three- or four-rune words, at book-global rune offsets **1,110, 5,138, 8,515, 10,089**. Treat each apostrophe as a source-visible split before the final rune. This gives exactly **2,900 tokens = 100×29**, including **87 singleton tokens = 3×29**.

The exact original source data are \`resources/lp2-transcription.txt\` and \`resources/liber-primus/lp2-quote-punctuation-spans.json\`; the transcriber deliberately treats original physical page and printed line breaks as layout, not lexical separators. The four apostrophes are recorded in richer original-image annotations, whereas the compact transcription omits their glyphs.

The exact 100×29 count motivates a conventional whole-token rectangle. LP1 p05's source-visible \`MOBIUS\` and p57's “shed our own circumferences” language additionally motivate a finite concentric-perimeter reading, with alternating ring orientation as a deliberately simple Möbius-inspired twist. This is a hypothesis, not an authenticated instruction.

## Frozen original-input inverse

The [standalone CommonJS test](../sims/apostrophe_29x100_mobius_spiral_sft.cjs) derives the 2,900 tokens directly from the original sources. It tests:

- the **ten** direct matrix routes already frozen in the earlier word-transposition test;
- **32 concentric-perimeter spiral descriptions**: both 100×29 and 29×100 orientations, four starting corners, clockwise/counterclockwise traversal, and fixed/alternating ring direction.

Together these are **42 fixed route descriptions**. Each is a complete permutation of the original 2,900 tokens; no word is dropped and no offset is fitted. The best route is selected only after all 42 are scored.

The output is scored by the same three-category consecutive GP-word-length Pearson statistic used in [the established word-order comparison](wordlength-order.md): short 1–2, medium 3–5, long 6 or more. For native prose preserving the printed word boundaries and merely changing their order, a genuine inverse should restore excess consecutive word-length dependence found in comparable authentic prose.

| Sequence / candidate | Adjacent length-category χ², df 4 |
| --- | ---: |
| Original 2,896 canonical LP2 words | **3.949446** |
| Same original words after four apostrophe splits | **4.015945** |
| Best of ten direct 29×100 / 100×29 routes | **6.761395** |
| Best of 32 circumference-spiral routes | **11.018356** |
| Exact native 2,900-word Latin Vulgate reference | **132.264098** |

The best spiral is **100×29, top-right start, clockwise, alternating ring direction**. Although it exceeds the earlier direct-route maximum, the score is not unusual after accounting for the route family. A deterministic **5,000-shuffle conditional null** preserves the observed counts of the three word-length categories and records the **maximum** χ² over all 42 routes on each shuffle: **1,185/5,000** maxima meet or exceed 11.018356, giving familywise \(p=(1185+1)/(5000+1)=0.237153\). The null's 90th, 95th and 99th percentiles are **13.312796**, **15.068631** and **19.536499** respectively. The observed maximum is below even the null 90th percentile.

**Positive control:** For every route, the test applies its exact inverse to the first 2,900 actual word lengths of the checked-in independent, GP-encoded Latin Vulgate reference, then recovers **all 2,900 original native word lengths** with the matching candidate and restores χ²=**132.264098**. This confirms full-length invertibility and that the statistic can identify a planted native-order restoration under the declared model. It is not an original-LP2 decipherment.

## Decision

The exact 100×29 token count does **not** select a useful direct matrix or simple circumference-spiral whole-word transposition. The source-motivated \`MOBIUS\`/circumference interpretation adds no familywise-significant word-order signal; do not repeat these 42 route descriptions or promote the best post-selected spiral as plaintext.

This bounded test leaves **keyed column ordering**, nonrectangular or section-local layouts, word splitting beyond the four original apostrophes, changed plaintext word boundaries, non-English/Latin plaintext, inserted cipher tokens, and non-GP payload registers unaddressed. It does not exclude every possible use of the source words \`MOBIUS\` or “circumference”; it rejects only the fixed whole-token rectangle and concentric-perimeter family defined above.

**Reproduction:** \`node sims/apostrophe_29x100_mobius_spiral_sft.cjs\` on Node 22; inputs are the original transcription, apostrophe annotation JSON and \`resources/control/latin-vulgate-gp-wholewords.txt\`. The program asserts original counts, all 42 native positive controls, the observed route maximum and the deterministic familywise null.
