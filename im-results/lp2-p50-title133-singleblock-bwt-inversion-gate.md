# LP2 p50 numeric table: standard one-block BWT cannot invert the printed stream

**Status, 18 November 2026:** bounded original-source cryptanalytic exclusion; **no unknown plaintext or recovered key**. This investigation addresses a different input from Director Issue #1477: the actual physical p49–51 256-cell numerical table, not the 729-rune historical first-chapter prime-difference stream.

## Causal source premise and competing route

The dated May 2014 LP2 distribution HTML prints \`<title>133</title>\` and \`<div id="331">\`, while historically solved Cicada 2014 stages used bzip2 (whose Burrows–Wheeler block transform requires a primary row). The physical LP2 table printed across pp49–51 comprises precisely 256 two-glyph numerical cells. Integer 133 is a valid zero-based row in a 256-symbol BWT block. A human might therefore try using the standard cyclic BWT inverse directly on the original table, then look for plaintext, an executable instruction, or an independently usable key.

The strongest competing explanation is that the HTML numbers are web-page identifiers and the table is a different binary object. Neither the HTML nor manuscript instructs BWT on this table, so a positive result would need substantial independent content. The direct-input BWT test is nonetheless affordable and its invertibility has a **language-independent necessary condition**.

## Exact original input and finite test

Input: \`resources/liber-primus/lp2-grid-256.json\` whose frozen base-60 256-byte SHA-256 is \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`; 161 distinct original printed tokens. Preserve the exact 256 tokens and their duplicates. Evaluate both the conventional 60-character alphabet and its alternative radix-59 alphabet with the unused \`f\` removed. Use exactly four source-visible traversals: printed row-major, column-major, row serpentine and column serpentine. No unknown key, chosen transform row, arbitrary padding, sentinel, or invented preprocessor is permitted.

For each 256-symbol last column \`L\`, construct stable LF by cumulative sorted-token occurrence ranks, and enumerate every cycle. A single full-length primitive circular BWT of 256 symbols requires **one LF cycle of length 256**. Periodic-string exceptions cannot rescue this corpus: a string of period \`d\` dividing 256 with \`d<256\` has at most 128 distinct symbols, but the BWT preserves the input multiset, and the observed last-column candidate has 161 distinct symbols.

| Exact traversal | Stable LF cycle lengths | Cycle holding row 133 |
| --- | --- | ---: |
| Printed row-major | 188, 24, 16, 12, 7, 3, 3, 2, 1 | 16 |
| Column-major | 140, 50, 33, 15, 13, 5 | 50 |
| Row serpentine | 112, 66, 43, 16, 12, 5, 2 | 66 |
| Column serpentine | 96, 80, 37, 36, 4, 2, 1 | 80 |

**Both radix conventions give identical LF cycle decompositions.** They preserve relative token ordering and equality, which is all LF uses. Under printed row-major interpretation, row 132 (a one-based reading of 133) belongs to the 188-cycle, while \`331 mod 256 = 75\` belongs to the 12-cycle. Neither has a 256-cycle. Standard repeated LF inversion at row 133 produces only a 16-symbol periodic string repeated 16 times, which is **not** a valid reconstruction of the original 161-distinct-symbol table. A circular BWT forward transform of that hypothetical output fails to reproduce the original last column and primary row.

An independently encoded and decoded nonperiodic 54-symbol plaintext plant passes exact forward/inverse BWT and has a single 54-cycle. The complete source-input reproducible program is [\`sims/lp2_p50_bwt_lf_cycle_sft.cjs\`](../sims/lp2_p50_bwt_lf_cycle_sft.cjs), running on Node.js 22 with native modules.

## Decision

**Reject the direct hypothesis** that the source table, under any tested printed traversal, is a standard single-block, keyless BWT last column whose historical primary row was \`133\`. The exact obstruction precedes English scoring and applies whether the printed numerals use radix 59 or 60. The attractive 16-byte cycle at row 133 is a property of attempting to invert an invalid BWT column, not an authenticated AES key or recovered 2014 decoder.

This result does **not** exclude preprocessed/token-remapped table data, separate BWT blocks, secret sentinels, other source-selected traversals or other historical bzip2 stages. None is independently selected by the known 2014 HTML. The still-active Director #1477 addresses a distinct 729-rune input and is unaffected.

No unknown-page LP2 plaintext or Cicada continuation was recovered.
