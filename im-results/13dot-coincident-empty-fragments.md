# 13-dot punctuation: two coincident printed-boundary pairs

## Established source-derived observation

The canonical `resources/liber-primus/lp2-ink-annotations.json` records 31 printed 13-dot punctuation events (30 red, one black). When each printed event is preserved as its own separator and placed against cumulative rune offsets in `lp2-corpus.json`, there are 29 distinct logical offsets: two pairs of physically distinct marks share a global rune offset.

| Global rune offset | Printed marks | Original scan evidence |
|---:|---|---|
| 1860 | p7 local 194 black; p7 local 194 red | Original scan: black 13-dot mark at the end of black text and red 13-dot mark at the beginning of the following red span |
| 3603 | p14 local 137 red; p15 local 0 red | Original scans: separate red 13-dot marks at the end/start of the page transition |

These are not transcription-only duplicates: the original page images show distinct printed marks. Preserving all 31 events creates 32 intervals, including two zero-rune intervals:

- zero-based fragment 8 (one-based fragment 9), between the p7 black and red marks at global offset 1860;
- zero-based fragment 11 (one-based fragment 12), between the p14 end and p15 start marks at global offset 3603.

The other 30 intervals are nonempty and together contain all 13,136 canonical runes. Reproducer: `sims/lp2_13dot_coincident_fragment_audit.cjs`.

## Ornament and table crosslinks

The p55 five-dot border ornament has row-major absolute readings `01101` (=13) on the left and `11111` (=31) on the right. Agent30's independent fold analysis obtains mismatch mask `10010₂=18`, selecting one-based fragment18 (the p27 red section title; see `im-results/p55-fold-fragment18-p27-title.md`). The mismatch mask is the complement of the left ornament; its set-bit positions 0 and 3 are exactly the two pale circles. Adding the 8-column width gives fragment indices 8 and 11, exactly the two zero-length intervals. The ornament repeats in the p40–55 border template, so it is a section-level legend, not a p55-unique mark. This is a coherent navigation/structure hypothesis, not proof of intended design or decryption.

The original 32×8 base60 table has two literal `00` tokens at cells (row24,col0) and (row28,col5). The black-marker-anchored row order is `BLACK = [13,26,20,9,18,4,8,16,0,1,2,5,10,21,11,23,14,29,27,22,12,24,17,3,7,15,31,30,28,25,19,6]`. In that order, the empty fragments map to `BLACK[8]=0` and `BLACK[11]=5`, matching the two zero columns.

The inverse row map gives `BLACK⁻¹(24)=21` and `BLACK⁻¹(28)=28`. The full-text lengths of fragments21 and28 are 8 and5 runes. Under the independent 13/31 LCG8 column order `[0,7,2,1,4,3,6,5]`, columns0 and5 occupy key-byte positions0 and7. Thus the two zero cells link (fragment21, first byte) and (fragment28, last byte), while their columns are anchored by the empty fragments8 and11. Fragment28 belongs to the solved p56/p57 tail, not the 28 unknown-page fragments. This is a 2D structural crosslink, **not** a mapping of zero rows to empty fragments and not a recovered cipher.

The source-fixed BLACK-row × LCG8-column DES-key construction was tested in 96 configurations and failed to recover language; its positive control passes exactly. See [the bounded result](fragment-grid-des-debruijn-lcg8-inverse.md), [reproducer](../sims/fragment_grid_des_debruijn_lcg8_inverse.cjs), and [machine output](fragment-grid-des-debruijn-lcg8-inverse.json).

## Conditional 5×8 rectangle / circumference check (Agent 8, 2026-11-11)

The two zero rows are24 and28. Taking rows24–28 inclusive and the full eight-column width gives a 5×8 rectangle. Under the *candidate* 13/31 LCG8 column order `[0,7,2,1,4,3,6,5]`, the zero cells `(24,0)` and `(28,5)` become opposite corners. Removing the rectangle's outer ring leaves 3×6=18 cells, whose row-major values are `[21,209,74,194,68,127,84,6,175,70,61,251,151,148,219,58,59,51]`.

The count18 superficially matches the 18-rune body after the leading M/GP19 of the p27 19-rune red title. **This is only a count match, not an alignment:** the BLACK inverse maps table rows24–28 to zero-based fragments `[21,29,1,18,28]` (one-based `[22,30,2,19,29]`) with lengths `[8,80,716,1414,5]`. The p27 title is one-based fragment18 (zero-based17), which maps to row29, outside this rectangle. The three interior rows therefore do not correspond to the p27 title body.

Direct checks of the 18 interior values against the p27 title body (mod29, per-byte BASE29-digit affine transform, and rank-sort transposition) do not recover language. The first/last interpretation still depends on the unselected LCG8 ordering; in natural column order, column5 is not the right edge. The solved-tail row28 maps to fragment28, the first five runes of p56 (global `[12956,12961)`, page-local `[0,5)`), but this is a boundary coincidence unless an independent source instruction selects the column clock and stop semantics.

**Conclusion:** the original source-derived fact remains that the two empty fragments8/11 map through BLACK to the two zero columns0/5. The stronger claim that the zeros are first/last byte or start/stop markers is not authenticated; the 5×8/18 geometry does not supply the missing selector or a reversible operation. Do not promote this to plaintext or expand arbitrary transforms.
## Research status and next decision

- **Verified:** the two coincident printed-boundary pairs, their distinct original marks, and the two zero-length intervals.
- **Source-derived candidate:** the p55 ornament selects empty fragments8/11; the BLACK order maps them to zero columns0/5.
- **Additional conditional crosslink:** the zero rows map to fragments21/28, and LCG8 places their zero columns at the first/last byte positions.
- **Bounded negative:** the combined BLACK×LCG8 per-fragment DES-key interpretation produces no plaintext.
- **Not established:** whether the two zero-length intervals are intended semantic fragments, whether the row/column crosslinks are authorial instructions, or what reversible operation uses the table.
- **Next useful work:** seek an independently motivated non-DES operation or semantic route; do not repeat direct row-XOR, generic table, or unconstrained DES/key searches.
