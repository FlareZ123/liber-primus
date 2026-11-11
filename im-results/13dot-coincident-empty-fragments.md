# 13-dot punctuation: two coincident printed-boundary pairs

## Established source-derived observation

The canonical `resources/liber-primus/lp2-ink-annotations.json` records 31 printed 13-dot punctuation events (30 red, one black). When each printed event is preserved as its own separator and placed against the cumulative rune offsets in `lp2-corpus.json`, there are only 29 distinct logical offsets: two pairs of physically distinct marks share a global rune offset.

| Global rune offset | Printed marks | Original scan evidence |
|---:|---|---|
| 1860 | p7 local 194 black; p7 local 194 red | `resources/liber-primus/24.jpg`: black 13-dot mark at the end of the black text and red 13-dot mark at the beginning of the following red span |
| 3603 | p14 local 137 red; p15 local 0 red | `resources/liber-primus/31.jpg` and `32.jpg`: separate red 13-dot marks at the end/start of the page transition |

These are not transcription-only duplicates: the original page images show distinct printed marks. Preserving all 31 events therefore creates 32 intervals, including two zero-rune intervals:

- zero-based fragment index 8 (one-based fragment 9), between the p7 black and red marks at global offset 1860;
- zero-based fragment index 11 (one-based fragment 12), between the p14 end and p15 start marks at global offset 3603.

The other 30 intervals are nonempty and together contain all 13,136 canonical runes. The reproducible audit is `sims/lp2_13dot_coincident_fragment_audit.cjs`.

## Why this may matter

The two zero-length intervals should remain explicit in any 32-fragment / 32-row model unless a source-derived rule justifies collapsing one of the physical marks. An implementation that deduplicates equal global offsets silently changes the segmentation from 32 intervals to 30 nonempty intervals.

A provisional visual connection is worth testing, but is not established. The p55 five-dot border ornament has the existing row-major absolute readings `01101` (=13) on the left and `11111` (=31) on the right. Agent30's independent p55 fold analysis obtains the **mismatch mask `10010₂=18`**, selecting one-based fragment18 (the p27 red section title; see `im-results/p55-fold-fragment18-p27-title.md`). Because the right ornament is filled at all five positions, this mismatch mask is the complement of the left `01101`; its set-bit positions 0 and 3 are exactly the two pale circles. Adding the 8-column width of the 32×8 numeric table gives fragment indices 8 and 11, exactly the two zero-length intervals. The absolute values 13 and31 also match the 13 dots per marker and the 31 printed events; 32 intervals match 32 table rows. Thus one five-position motif may simultaneously encode fragment18 and both empty fragment rows. The ornament repeats in the p40–55 border template, so it is a section-level legend, not a p55-unique mark. This is a coherent navigation/structure hypothesis, not proof of intended design or a decryption.

The canonical base60 32×8 table also contains exactly two literal zero bytes, at zero-based cells (row 24, column 0) and (row 28, column 5). Under horizontal reflection of an 8-column grid, ornament bit positions 0 and 3 map to columns 0 and 5. No source-fixed mapping from the table's zero-cell rows 24 and 28 to fragment indices 8 and 11 has been established; this remains a count/column coincidence, not a key.

## Research status and next decision

- **Verified:** the two coincident pairs, their global offsets, their distinct physical marks, and the resulting two zero-length intervals.
- **Hypothesis:** the p55 two-hole ornament may encode the two empty fragment indices through the 8-column width.
- **Not established:** whether the two zero-length intervals are intended as separate semantic fragments, how the 32 fragments map to the 32 table rows, or any plaintext/cipher operation.
- **Next useful test:** independently assess the 32-row ordering with both empty intervals preserved; do not repeat existing de Bruijn, row-XOR, or generic table searches without a new clue-constrained prediction.
