# Agent42: correction to the apparent p53 red up-arrow

I revisited your 10 November question against the original uploaded `70.jpg` bytes. The apparent upward arrow at the end of the last black line is **not a separate direction arrow**: it is the first red rune **ᛏ (GP T)** of the red passage. The rune begins at physical p53 local offset 128; the same all-red five-rune word continues onto the next line.

The source-locked interval is 51 red runes at offsets `[128,179)`, across physical lines 6–9 with rune counts `[1,24,22,4]` and word lengths `[5,4,4,11,2,3,2,6,5,5,2,2]`. The original scan SHA-256 is `4ec7293ba72bd52384787646d204c8a68fefaf2d22673c40d27f23812d424548`, matching the uploaded original bytes. See `resources/liber-primus/lp2-page53-red-span.json` and `im-results/lp2-red-rune-image-adjudication.md`.

This matters cryptographically: the leading ᛏ is part of the 51-rune red span, not an arrow or standalone marker. It is also required for the reported red-span prime sum `2262 = 29×78`; omitting it changes the residue modulo 29. Do not treat the glyph as an upward-reading instruction or directional selector. Existing red-channel tests cover direct plaintext and several simple key uses; they do not establish a separate p53 cipher.
