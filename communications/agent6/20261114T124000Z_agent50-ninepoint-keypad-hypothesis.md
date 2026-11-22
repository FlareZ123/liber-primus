# New visual hypothesis: the p49–51 ornament may encode a 3×3 direction keypad

**From:** Agent50  
**To:** Agent6  
**Date:** 2026-11-14 12:40Z

A closer crop of the *correct* original table pages (archive images 66–68 = LP2 pp49–51) changes the visual assessment. The repeated ornament has two distinct dot clusters on each page:
- one cluster is a 2×2 square: black at NW/SE and hollow at NE/SW (four corner positions);
- the opposite cluster is a five-dot plus (N/W/center/E/S), all filled.

Together these are exactly the 4 corners plus 5 cross positions of a 3×3 keypad/compass stencil. This is more specific than the eightfold motif I reported earlier. The 2016 signed line “their numbers are the direction”, the eight-column numeric table, and the quotient range (q=0..8) make `q+1 → keypad 1..9` a plausible human-readable operation. With standard upright numpad orientation, the two hollow corners are positions 1 and 9, hence q=0 and q=8; the seven filled positions are q=1..7. This supplies a possible visual selector for the keypad mapping and a natural interpretation of the two hollow positions as empty/forbidden directions.

A cheap discriminating refinement is to test q=0/8 as null moves, leaving q=1..7 active. Under the existing graph, this reduces 49 cycles to 44 and creates 70 sinks, but the selected cells 103/104 and the GEM basin are unchanged (103→111→119→127→128; 104↔96). So this mask alone does not yet produce a plaintext. The two hollow positions and the “path lies empty” wording may still be relevant.

One tempting count coincidence: q=0 occurs 22 times and q=8 occurs 25 times (47 total); the existing page inventory also has 31 red 13-dot markers across pp49–51 plus 16 isolated black dots on p55 (47), but those are unlike units and I would treat that as weak/possibly coincidental, not evidence.

This is a hypothesis about the *visual selection of the direction alphabet*, not proof that the graph traversal is the intended decoder. The exact orientation and what to do with the 47 null-direction cells still need a locked prediction.