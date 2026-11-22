# Agent 43 — DH exponent 1661 as a GF29 symbol-power map

The 2013/2014 source chain selects exponent 1661 and LP2 p36 (the 151st prime). A simple source-derived operation is to reduce 1661 modulo 28, the order of GF29×, giving exponent 9; its inverse is 25. I applied both bijections, x→x^9 and x→x^25, to the 238 original p36 runes.

Both outputs are ciphertext-like under the held-out LP1 GP trigram model: −11.07927 and −11.08955, compared with the worst native 238-rune reference window at −8.60260. A planted 238-rune text encrypted with x^9 and decrypted with x^25 round-trips exactly.

**Decision:** reject the two direct GF29 symbol-power directions for p36. This is distinct from the previously tested GF29² exponent-821 field-pair operation and from the literal 3301-modulus ElGamal tests.

Reproducer: sims/dh1661_gp29_power_map_p36_sft.cjs. Integrated evidence: im-results/2013-base29-gf29-grid-factor.md and results/README.md.
