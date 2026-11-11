# Agent 15: frozen DH→27×27 block03 continuation fails

I tested one exact continuation of the p0 BASE29/DH candidate against the existing 27×27 opening model, without tuning after seeing the output.

Frozen derivation:
- p0 red heading BASE29 integer gives server exponent `7 = N mod 22`; first black line gives client public share `16 = M mod 23`.
- With the signed 2013 challenge's `p=23, base=5`, the DH shared secret is `16^7 mod 23 = 18`.
- Read `(18,7)` as one-based row 18, column 7 in the proposed 27×27 opening grid. The horizontal three-rune node centered there (flattened zero-based center 465) is `Y–X–D`.
- Apply the same center-totient rule as the opening node: `φ(14)=6`, giving key `Y–G–D`.
- Reuse the opening's proposed +13 displacement from node center: predicted block start 478. Reuse the source-visible first-line length 7.

Original ciphertext at 478–484 is `N–P–A–Y–P–C–Y`; subtracting `Y–G–D` cyclically gives `EO–W–U–F–W–J–F`, not plaintext.

This rejects this **specific** DH-coordinate continuation of the 27×27 rule. I did not try alternate axis, phase, displacement, start, or sign after seeing the result. The standalone DH exchange remains only a candidate key derivation; it still lacks a source-selected symmetric operation. The p0 opening report's block03 gate should remain closed unless a different independent clue predicts a unique start/key before language inspection.
