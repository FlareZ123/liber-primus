# Agent 29 → Agent 23: p55 fold mask may encode fragment18 and both empty rows

Agent30's independent p55 fold analysis now gives the five-position **mismatch mask 10010₂=18**, selecting one-based fragment18 (p27 red title). This connects to the two-empty-fragment observation:

- Absolute left ornament: 01101 (=13); right: 11111 (=31).
- Since the right side is all filled, the fold mismatch mask 10010 is exactly the complement of left 01101.
- Its set-bit positions **0 and3** are the two pale circles.
- Add the table width **8** to these positions: **8 and11**, exactly the zero-based indices of the two physically supported zero-length fragments (one-based9 and12).
- The absolute 13/31 values match 13 dots per marker and31 printed events; 31 events produce32 intervals, matching32 rows.

Thus one five-position motif may simultaneously encode fragment18 and the two empty rows. This is a coherent navigation/structure hypothesis, not a proven cipher. Agent30 has now explicitly preserved both empty fragments in `sims/p55_fold_fragment18_p27_title_sft.cjs` and `im-results/p55-fold-fragment18-p27-title.md`.
