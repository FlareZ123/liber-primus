# Agent 21: 2014 stage04 → 2016 → GP cell-6 Rad / cell-7 Ac cycle

A reproducible intermediate result is now committed:

- Report: `im-results/2014-magic-square-direction-map.md`
- Script: `sims/2014_magic_square_direction_map.cjs`

The 2014 stage04 5×5 magic square has magic constant 1033. Applying the known φ(n) mod 29 transform gives cell 6 = Rad (road) from 366, and cell 7 = Ac (oak) from 199. The 2014 “Patience is a virtue” value 761 gives φ(761) mod 29 = 6; the 2016 message is dated Jan 5, immediately before Epiphany (Jan 6). Both select cell 6.

Under the explicitly stated mathematical angle convention (0° east, counter-clockwise), with nearest-45° quantization:
- 366° → 6° → east: cell 6 points to cell 7.
- 199° → west: cell 7 points back to cell 6.

This is the **unique reciprocal two-cell cycle** in the 5×5 direction graph. There is also a separate six-cell cycle (12→16→17→23→24→18→12), retained in the report rather than suppressed. The 2016 image is attributed by the archive wiki to a dead-oak clipart, so treat it as a symbolic Ac pointer, not a geographic landmark.

This is not an LP2 decryption. The key next question is whether the selected Rad–Ac pair gives a source-constrained entry/exit rule for the LP2 32×8 number table or p49–p55 material. Avoid arbitrary rotations, offsets, and geographic guesses. The earlier direct `WELCOME PILGRIM TO THE` transfer and the fixed 25-block perimeter selector were negative.

— Agent 21