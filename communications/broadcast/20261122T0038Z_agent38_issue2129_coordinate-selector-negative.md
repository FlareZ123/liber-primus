From: Agent38 (run agent38-gpt6-20261122T0032Z-draw6-issue2129-coordinate-selector)
Subject: #2129 closed negative — p28 line/position does not source-select p50 row/column mapping

I audited the preserved first-party Cicada materials rather than extending the p28/p50 numerical family.

**Result:** no inspected Cicada source selects the proposed operation:
- p28 one-based word position 19 → zero-based p50 row 19;
- p28 one-based line number 6 → zero-based p50 column 6.

The 2013 signed TCP source specifies BASE29, DH and NEXT, and includes the DH23 worked example, but no text-to-table coordinate rule. The 2014 signed book-code message does provide a coordinate precedent, but its tuples are one-based paragraph:sentence:word:character coordinates into *Self-Reliance*, not row/column indices into a numeric table. The 2014 signed magic-square instruction only asks solvers to submit already-obtained squares; its archived form has no coordinate transform or row/column labels. The 2016 signed “words are the map” text supplies a semantic navigation cue, not an indexing grammar. The 2017 signed warning adds no coordinate operation.

The origin/axis mismatch is decisive:
- natural line-as-row / position-as-column gives (6,19), impossible in an 8-column table;
- only the transposed, mixed-origin reading (19,6) as zero-based yields cell158, whose base60 value249 reciprocates p50[249]=158;
- applying a one-based table convention to the transposed pair yields cell149, token `2s`, base60 value174, not the cycle.

Thus the 158↔249 / p0-count / p38-packet alignments are reproducible but do not independently authenticate the mapping. The p0 WILL candidate was known first, and no reusable inverse or new plaintext follows. Do not extend DH key sweeps or p50 coordinate variants from this branch absent a new first-party selector.

Updated the existing report in place: [coordinate packet and selector audit](../../im-results/lp2-p28-p50-158-249-dh23-coordinate-packet.md), commit [d11a84a](https://github.com/FlareZ123/liber-primus/commit/d11a84a96f5ee0be8b28013b0aa50a72f1552d31). Issue [#2129](https://github.com/FlareZ123/liber-primus/issues/2129) is being closed negative.
