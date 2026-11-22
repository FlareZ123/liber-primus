# Agent 48 handoff: p32 ring yields a constrained Möbius map

Sender: Agent 48  
Run: `agent48-gpt6-20261111T011659Z-source-frontier-6524fd1b10e9`

The p32 inner-5 perimeter gives more than the payload-length checksum. Its 16 prime values, clockwise, are:

`[67,47,19,89,53,89,107,61,37,109,107,79,41,107,17,107]`

The perimeter sum is **1,136**, exactly the byte length of the signed 2016 payload. Its four clockwise side sums are N=275, E=257, S=373, W=231. Reducing modulo29 and placing them in clockwise row-major order gives:

`M = [[14,25],[25,28]]`

This yields a Möbius map over GF(29):
`f(x) = (14x+25)/(25x+28)`.
Exact properties:
- trace 13; determinant 28 = -1 mod29
- projective order 7
- f(13)=24
- fixed points 22 and 25, whose sum is 18 mod29
- four 7-cycles and two fixed points on P¹(F29)

The cross-artifact constraints are unusually tight:
- 2016 image width 563 mod29 = 12 = 2014 magic-square centre 331 mod29
- 2016 image height 569 mod29 = 18 = 2014 magic constant 1033 mod29 = sum of Möbius fixed points
- 2016 image area 563×569 mod29 = 13 = p32 13-dot count = matrix trace
- 3301 mod29 = 24 = f(13)
- inner-ring sum 1136 = signed 2016 payload byte length

The projective line has 30 points (29 rune symbols plus infinity); the 13-dot punctuation as the extra point is a plausible correspondence, not established. The two fixed points are GP indices OE (22) and AE (25). The 7-cycle containing 13 is:
`13 → 24 → 19 → 3 → 6 → 20 → 17 → 13`.

Important negative results: direct f/f⁻¹ substitution, 2×2 Hill use of M/M⁻¹, period-7 additive orbit with red-13 resets, period-7 Möbius phase substitution, and direct period-16 ring-key uses do not recover plaintext. Treat M as a likely structural map/selector, not as a solved cipher.

Consolidated intermediate report: `im-results/tree-prime-canvas-partition.md` (latest commit `54520568`). The original-image direction-field discriminator is implemented in `sims/tree121_directional_field_sft.py` and exposed as manual workflow probe `tree-direction`; it has not yet been run on the original 2016 JPEG. Resampled p32/p55 tree proxies were not strongly aligned (p≈0.094 and 0.426).

Recommended next work: inspect the rune-meaning/word-map interpretation of the four 7-cycles and the fixed points, and determine whether the 13-dot mark has a source-grounded projective-infinity role. Agent 4 may be especially well placed to cross-check the 2014 square/MOBIUS connection; Agent 46/21 may integrate the p32 route. Do not repeat the direct substitution, Hill, or additive tests.
