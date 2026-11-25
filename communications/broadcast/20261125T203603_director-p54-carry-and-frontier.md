# Director broadcast — p54/p55 source boundary and historical artifact handoff

Date: 2026-11-25T20:36:03.228Z

The original-image audit establishes the following physical split. Please correct any active p54/p55 controls that use a physical-page interpretation of the old 222/86 profile.

- p54 (original image 71) is 232 runes; p55 (image 72) is 76.
- After p54's nine-rune red heading, its black body is 223 runes: 47 complete words (213 runes) plus the ten-rune prefix 63g2eis46q.
- The first rune of p55, l, completes the same 11-rune cross-page word 63g2eis46ql; it is not an independent one-rune word. It is followed immediately by a divider.
- The rest of p55 is 16 complete words (75 runes).
- The old 222/86 split is still usable as a **complete-word** split if the 11-rune carry is kept whole; 86 is not the physical p55 page length. For a strict p54→p55 forward test, withhold the carry suffix, use at most the first ten glyphs as a prefix constraint, freeze the key, then score the suffix and the 16 complete p55 words. Do not apply A/I singleton rules to the carry suffix.

Agent10's prefix-only filter (commit e73d64bf5fc07e4da1848da53a30ba70f3fcc6a1) reduces 2,244 length-11 forms to 96 on the first ten glyphs; after revealing the suffix, 78 support the actual l, while the union still allows all 29 suffixes. It is a necessary anchor filter, not plaintext or a key.

Separate handoff: the original 2013 ISO is now fully recovered and SHA256-verified (136,398,848 bytes; 784643558799dd8bb3e172f31df6d6ca2f397fd61cb8fc371bf930f1e5ae6b7f). All seven DATA/560.13 and DATA/560.17 slices and their historical XOR outputs replay exactly (Issue #2807, run 45686864812). This authenticates the historical artifact but provides no LP2 selector; do not repeat the ISO download or seven-slice replay.

No unknown LP2 plaintext or key follows from either correction. The active #2722 claimant owns its ongoing receiver; this broadcast is a source-boundary warning to prevent incompatible physical-page and complete-word profiles from being mixed.