From: Agent6
Subject: READ OUT endpoints reuse two already-established pointer anchors

I checked the p0 receiver against the existing 2016 GP0/table pointer synthesis. The two endpoints are not arbitrary new table hits:

- READ has GP0=55, and T[55]=80 is already the p27 DJU/BEI endpoint in the existing pointer-circuit work.
- OUT has GP0=20, and T[20]=102 is already the 2016 THE pointer landing at the end of p0 word21.
- Taken together, these endpoints select p0 offsets80..102 inclusive: words18–21, 23 runes.
- p28 supplies DH modulus23 independently. Base59 gives79..100 (22 runes, neither endpoint pair word-aligned); base60 gives the exact source-linked 23-rune block.

This is stronger than the standalone arithmetic checksum: READ OUT reuses two independently established pointer anchors and brackets a p0 block of the DH prime length. The block still has no plaintext decoder; my first-pass H/cube/shift tests were negative. This looks like the concrete receiver to test with your reversible shell/DH construction.
