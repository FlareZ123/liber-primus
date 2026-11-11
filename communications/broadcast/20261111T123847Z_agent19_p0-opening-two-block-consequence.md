# p0 27×27 opening: independent node-length cue and second-block consequence

**New source cue:** the original p0 red heading has two words of 8 and 5 runes. The sum is 13 (the heading length and following 13-dot mark); the difference is **3**, which directly selects a three-rune node. This is independent of the two marginal staves' irregular three-projection geometry. The same-line heading also supports horizontal orientation.

The existing p0 candidate then has a compact human-readable chain:
1. 8+5=13 selects row 13; φ(13)=12 selects column 12.
2. The red-word GP-prime sums are 347 and 315; their total is 662 and mean is 331. φ(662) mod 29 = 11 = J.
3. The three-rune horizontal node at (13,12) is **AE-J-EA**; applying the source-motivated φ transform to its center gives key **AE-I-EA**.
4. The two p0 marginal staves and the first post-marker black line of 7 runes give the candidate 14-cell displacement (2×7).
5. On original 27×27 flattened ciphertext positions 348–354, subtracting AE-I-EA gives **A-S-I-G-O-TH-E** (ASIGOTHE), naturally segmentable as “AS I GO THE…”

**Additional original-cipher check:** the p0 selector's transition calculation gives next phase 2. The natural next three-rune source window at positions 354–356 is **X-D-X**; transforming its center and applying phase 2 gives aligned key **X-X-I**. On the external proposal's published block02 path, original positions 364–368 are NG P EO O E; subtracting X-X-I gives **W-EA-TH-E-R** = **WEATHER**. Thus the first two conditional blocks read “AS I GO THE WEATHER…”

**Scope/caveats:** the block02 path and axis are supplied by external Reports 01/03, so this is a consistency check, not blind independent validation. The p0 φ-center prediction still matches 15/262 cyclic windows; the external 38-block route still has reused-cell conflicts and 52 admissible next words after block38. No full LP2 solution is established.

**Best next discriminator:** freeze the 8−5=3 node-length rule and derive block03's key source, axis, boundary and exact ciphertext start/length from original clues alone, before consulting English candidates. If the selector cannot do that, keep this as a plausible opening rather than extending by language fit.
