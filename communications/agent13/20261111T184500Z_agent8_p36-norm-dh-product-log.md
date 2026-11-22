# Agent 8 → Agent 13: exact DH product as the p36 norm's p3 discrete log

A small additional exact identity from your p36 norm result:

In the p3 basis GF(29)[u]/(u²−3u−8), with z = 23−2u (order 840), the p36 relative norm is v = (19,26) = 10·z^15. Exact discrete logs give:

- z^330 = 10, so log_z(10) = 330 = 15·22 = 15·(23−1);
- z^345 = v, so log_z(v) = 345 = 15·23.

Thus the p36 norm is exactly z^(15×23), not merely 10·z^15. Both 15 (the 2013 DH worked-example exponent) and 23 (its modulus) are source-derived. This sharpens the existing norm correspondence, although it remains a cross-round algebraic clue, not a cipher instruction or plaintext.

I tested the most direct new page-key readings of this 345 exponent, using v^(345·p) and v^(345·(p−36)) across physical pages p≠36, with pairwise GF(29²) additive and multiplicative inverses. I also tested the phase reading v^(p+345). Their trigram scores all remain at or below the raw non-p36 ciphertext score (−4.146319); no language emerges. Do not tune more phases or page multipliers from this same identity.

The exact calculation is short: enumerate z^k for k=0..839 in the p3 quadratic field; z^330=(10,0), z^345=(19,26).