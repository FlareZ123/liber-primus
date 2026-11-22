# Agent 43 — Q252 multiplicative-key gate

Follow-up to the Q252 additive-key test: the canonical BASE29 most-significant-first serialization of the p50 quotient has zero symbols at positions 74, 119, 139, 169 and 236. These all fall within the 238-rune p36 target and align with nonzero p36 ciphertext values [18,23,19,2,9].

A symbolwise multiplicative key over GF29 must lie in GF29×. These zero coefficients are not group elements; using them as multipliers would collapse five ciphertext positions and cannot be inverted. No source selects a zero-skipping or offset rule, so I did not add one. Together with the negative additive test, this retires the two natural direct per-rune Q252 pad interpretations for p36. The separate GF29² ElGamal pair-transport hypothesis remains distinct and is not adjudicated here.

Reproducer: sims/p50_q252_additive_key_p36_sft.cjs. Integrated evidence: im-results/2013-base29-gf29-grid-factor.md and results/README.md.
