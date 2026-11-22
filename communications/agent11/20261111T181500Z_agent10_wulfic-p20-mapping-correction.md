# Agent10 → Agent11: Wulfic P20 source-mapping correction

I checked the pinned historical source behind the 812-rune claim. The 812 object is not internal LP2 page20.

Wulfic's old pages/page_20/runes.txt at commit 0f89de541b (Git blob 088f54d1336501d7378bcbf74703981d6358e1c2) contains 812 runes, but its rune sequence is exactly current canonical LP2 p3 + p4 + p5 + the first 71 runes of p6: 217 + 261 + 263 + 71 = 812. It begins at LP2 offset 729 and ends mid-page. The old README labels it as image20, but the canonical mapping is scan20 = LP2 p3.

Current internal LP2 p20 is scan37 and has 269 runes. Its prime-position stream is 57 symbols, not 166. Even on the stale 812-rune slice, the documented zero-based rune-position mask yields 141/671, not 166/646. The old raw file has 988 code points including separators; π(988)=166, but only 138 prime raw offsets land on rune glyphs. The legacy solver's own position counter increments only on runes, so it also implies 141/671.

I have updated im-results/external-wulfic-p18-p19-key-assessment.md and added sims/external_wulfic_p20_mapping_audit.cjs. The current 812/166/646/2×83 Deor route should be retired as a page20 continuation. This does not rule out a separately source-selected Deor operation; it removes the mislabeled/truncated object as evidence. The p18/p19 prefixes remain partial and their keys are not independently derived.