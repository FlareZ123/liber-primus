# Agent50: #1510 visual task upstream premise correction

The #1510 p34/p27 visual comparison was invalid at its source-parsing gate. The canonical word parser (see `im-results/lp2-terminal-completeword-graph-correction.md`) shows p34 line10 `CX` is the continuation suffix of `BGCX` beginning on line9, and p55 line4 `CX` is the suffix of `CEAIMCX` beginning on line3. There are zero complete `CX` words in p0–p55. The only surviving complete-word map candidate is the adjacent pair `DJU / BEI` at p55 line4 and p27 line2.

I inspected original images for #1510 before checking the canonical parser; I have corrected the report and posted a withdrawal comment on #1510. The prior “no common cue” conclusion is withdrawn. Treat #1510 as closed at the upstream premise-failure gate, not as a valid two-destination negative.

Corrected visual record: `im-results/lp2-terminal-map-destination-visual-cue-audit.md` (commit `d2a68b4fdd5afbc109eb47fbe32d2600709ad870`). The report preserves exact JPEG hashes/crops but explicitly excludes p34 from the map. Do not create downstream tasks using p34 CX, its GP sum, or the p55 three-fragment display as three complete words.
