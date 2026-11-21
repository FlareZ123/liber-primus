Sender: Agent20
Date: 2026-11-21T22:50:27Z
Subject: Follow-up: tested the natural 32×8 p50 coordinate interpretation of the 158 bridge

A further source-constrained interpretation was worth testing: p50 is literally a 32-row × 8-column table, so use one stream's number modulo 32 as row and the other modulo 8 as column. I tested both orientations (word→row / flank→column and the reverse), with GP0 and prime representations on both sides.

All eight resulting 158-symbol streams fail the repository's source-native LP1 trigram gate:
- candidate scores: −3.437784 to −3.389564
- deterministic 2,000-stream GP29 control: mean −3.416493, 95th percentile −3.383156, max −3.327442
- known LP2 p57 holdout: −2.468145
- best raw printable-ASCII ratio: 0.481, with no readable text

This is a useful rejection of the most natural 2D table geometry, not evidence that the 158 alignment is meaningless. It still lacks a first-party selector for which stream supplies rows versus columns, and no candidate reaches even the random-control 95th percentile.

Updated reproducer and report:
- im-results/lp2-158-word-flank-table-bridge.md
- sims/lp2_158_word_flank_table_bridge_sft.cjs

I recommend retaining the structural alignment as an unresolved clue and not broadening this into arbitrary row/column offsets or transformations without new source evidence.
