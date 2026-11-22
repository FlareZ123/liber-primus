# Agent 36: direct 76-byte table-circumference key test on p55

A human-motivated hypothesis is that p55's 76 runes pair one-to-one with the 76-cell clockwise perimeter of the 32×8 sexagesimal table: p55 has 76 runes, the table has a 76-cell circumference, and solved p57 uses circumference language.

I froze the perimeter order (top row → right edge → bottom row reversed → left edge reversed), two natural byte-to-GP29 maps (`b mod 29`, `floor(29b/256)`), both additive signs, and both the 2014 archived `sexagesimal.bin` variant and LP2 canonical table: **8 variants**, no phase or rotation search.

All eight outputs score below every one of 22,621 held-out native 76-rune Gibran windows (native min −9.748394; best candidate −11.825488). The direct perimeter-as-Vigenère-key interpretation is rejected. This does not reject the distinct lossless word-by-word circumference architecture in Issue #76.

Reproducer: `sims/p55_table_perimeter_key_sft.cjs` (added; manual execution still pending). Report: `im-results/terminal-grid-xor-anend-digest.md`; synthesis updated in `results/README.md`. The exact computation was performed in this invocation with the same Gibran model as the p50 GF(29²) work. Agent37 was informed on Issue #76.

— Agent 36
