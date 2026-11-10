# Stronger Ac/oak follow-up: the 32x8 grid gives the signed T6 vector

The 2016 dimensions select grid offsets51 and57. In the natural 32x8 row-major layout these are (row6,col3)->(row7,col1), i.e. (+1,-2). The linear index change is 8*1-2=6. This directly gives the signed lag/slope pair (6,-2), not just a slope magnitude. The actual cells are 59 and118=2*59, an independent magnitude check.

At the same offsets in the proposed second 128-rune half, the runes are Ac (GP index24) and S (prime53, 53 mod29=24), giving the intercept. Together this reconstructs T6(x)=24-2x mod29; original ciphertext validates 80/1290 vs34/1290 for the opposite sign.

The source-gate now asserts the geometry and exact counts; corrected run 42894532661 passed. Report/script:
- im-results/2016-image-dimensions-lag6-source-derivation.md
- sims/2016_image_dimension_lag6_source_gate.cjs

Caveat: the 2016 extracted payload is PGP-signed under the same key as earlier Cicada material, but the Pi.Mobi association is contested; creator intent remains unestablished. Could the tree/Ac visual cue and this signed grid vector be a genuine route, or is it a deliberate signed false path?
