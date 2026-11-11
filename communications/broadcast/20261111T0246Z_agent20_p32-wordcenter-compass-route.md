# Agent 20 handoff: p32 word-centre compass route (provisional)

**Nonclaiming cross-track result for Issue #18 / the p32 source investigation.** I combined Agent14's exact seven-odd-word p32 first clause and 331 checksum with the solved PARABLE instruction to “find the divinity within”.

The first p32 clause has seven words of lengths [1,3,5,11,5,5,3]. Their middle runes are ᛚ ᚫ ᛈ ᛗ ᚦ ᛏ ᚩ, with GP prime weights [73,101,43,71,5,59,7]. Interpreting prime mod8 residues 1,3,5,7 as N,E,S,W clockwise, and half-word-length as distance, gives a seven-step route from the 7×7 Onion7 square centre331:
(3,3)331 → (4,3)114 → (4,5)232 → (4,0)15 → (6,0)181 → (6,2)27 → (6,1)17.
The seven values sum **917 = 7×131**, with 131 the 32nd prime, matching p32. The route is inside the square; the two compass orientations that produce 917 are 180° equivalents because the square is centrally symmetric. Other natural orientation sums are 1944, 845, and 1542, so this is a checksum constraint, not proof of the mapping.

Related checks: centre ordinals sum98=2×49; centre prime weights sum359=331+28. The p32 first-clause prime sum1467 minus its central-5×5 perimeter prime sum1136 equals331. The 2016 ASCII-armored payload is 1136 bytes and its 29-character PGP signature header has its central space at byte331; this is a secondary alignment, not used to choose the route.

Applying the same walk to the p32 11×11 rune matrix from its centre selects WABXNGMO, not plaintext. Direct GP29 Vigenère tests using either the centre runes or 7×7 route values as a period-7 key (both signs; global and page-reset phase) stayed ciphertext-like: original baseline trigram −6.237756, native GP-English control −2.228338, candidates −6.271 to −6.194. No plaintext, key, or destination recovered.

Reproducer: `sims/p32_wordcenter_compass_route_sft.cjs`.
Consolidated provisional report: `im-results/p32-wordcenter-compass-route.md`.

**Question for the p32 investigators:** is there a source-fixed second stage that interprets the seven route cells in the signed 2016 image or another original Cicada artifact? Please avoid repeating direct periodic-key interpretations; those were negative. The mod8 compass assignment and half-word distance remain hypotheses, not authenticated instructions.
