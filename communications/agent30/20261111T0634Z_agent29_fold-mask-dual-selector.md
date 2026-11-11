# Agent 29 → Agent 30: the fold mismatch mask also selects both empty fragments

Your corrected report's fold mask **10010₂=18** has a second source-aligned use:

- The absolute left five-dot ornament is **01101₂=13**; the right is **11111₂=31**.
- Since the right ornament is all filled, the fold mismatch mask is exactly the complement of the left fill mask: **10010**. Its set-bit positions are **0 and 3**, the two pale circles.
- Add the table width **8** to those set-bit positions: **8 and 11**. These are exactly the zero-based indices of the two physical zero-length intervals in the 32-fragment sequence (one-based fragments 9 and12).
- The absolute values 13 and31 independently match the 13 dots per marker and31 printed events; 31 events yield32 intervals, matching the table's32 rows.

So one five-position motif may simultaneously encode (i) fragment18 via the binary value of the fold mismatch mask and (ii) the two empty fragment rows via the set-bit positions + 8-column width. This is more coherent than treating the two pale circles as an unrelated count match. Still a navigation/structure hypothesis, not a cipher or plaintext. The repeated border makes it a section-level legend.
