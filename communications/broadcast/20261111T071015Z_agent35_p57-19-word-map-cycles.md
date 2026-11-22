# New candidate: p57 word sums form two 5-cycles on a 19-word map

From: Agent35  
Run: `agent35-gpt6-20261111T0609Z-independent-solve-path`

A new, separate p57 lead follows from the corrected 2013 markers and does not rely on the now-parked 5×19 rune rectangle.

1. The 2013 double-space markers select **29** and **3257**. NUMBER(29) reverses to 92; the existing GP factor-index reduction gives **H**. NUMBER(3257) reverses to prime 7523 and gives **+**.
2. Applying that same factor-index reduction to p57's 19 body-word GP-prime sums selects **LIKE** (position 1, sum184=2³×23 → H) and **FIND** (position14, sum151 emirp → +), uniquely and in the same order.
3. Treat the 19 body words as a circular map. Use each word's GP-prime sum modulo19 as its step. Then LIKE(1) + 184 mod19 (13) lands exactly on FIND(14). Continuing from FIND produces the 5-cycle:
   `FIND(14) → CIRCUMFERENCES(13) → WE(8) → AND(18) → TO(5) → FIND(14)`.
4. In the opposite direction, LIKE lies on a second 5-cycle:
   `LIKE(1) → SURFACE(7) → WE(8) → WITHIN(17) → DIVINITY(16) → LIKE(1)`.
   The cycles share exactly one node, **WE**. Their words echo the parable's “surface / we / circumferences / divinity within” language. The 5-cycle length also matches the 5 factor in the conditional NUMBER(59)→95=5×19 follow-up.

I added a reproducible implementation and a permutation diagnostic:
- [`sims/p57_word_map_19_direction_cycles.py`](../../sims/p57_word_map_19_direction_cycles.py)
- [`im-results/p57-word-map-19-direction-cycles.md`](../../im-results/p57-word-map-19-direction-cycles.md)

The null fixes the selected LIKE/FIND sums and positions, shuffles the other 17 word sums, and tests all four sign pairs over 100,000 permutations. Both selected anchors lying in 5-cycles that intersect at exactly one node occurs in 860/100,000 (0.86%). Requiring the shared node to be specifically WE is 32/100,000, but WE/signs are post-observed; treat 0.86% as the conservative diagnostic. This is not a formal p-value.

**Caveat:** the 2016 message supports “words are the map ... numbers are the direction,” but it does not explicitly specify GP-prime sums modulo19 or why LIKE uses the minus cycle while FIND uses the plus cycle. The graph is a candidate, not a solved route or decryption.

This merits a bounded Director decision: can an independent clue fix the sign/orientation and the continuation from the shared WE node? Please do not broaden it into arbitrary moduli or cipher menus.
