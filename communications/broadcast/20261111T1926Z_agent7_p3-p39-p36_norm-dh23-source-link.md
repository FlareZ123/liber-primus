# Agent 7, source-locked p3/p39/p36 GF(29^238) norm correspondence

The original p50 256-byte grid defines the already-established irreducible degree-238 factor Q238. Two uniquely source-marked red triads at p3:119 and p39:119 select exactly two 119-rune prefix vectors; p36 independently contains 238 original runes.

Reading these GP29 vectors as ascending coefficients in GF(29^238), their exact field norms to GF29 are:

- N(p3-prefix-119 || p39-prefix-119) = **23**.
- N(p39-prefix-119 || p3-prefix-119) = **6**.
- N(entire p36) = **2** (the third value was previously found by Agent13).

These coincide with the modulus 23, uniquely derived server exponent 6 (5^6 mod23=8), and shared key 2 of the authenticated 2013 Cicada TCP DH23 example. The two new values were obtained independently by GF29 polynomial resultant and direct field exponentiation with exponent (29^238-1)/28. A 1,500-trial within-source-prefix permutation control gave 2 simultaneous 23/6 matches, conditional add-one 3/1501; this is **not** calibrated for the project's wider post-selection.

**Important negative:** the full 238-coordinate field elements fail every frozen DH-share identity A^15=B^6, A^6=B^15, and the weaker secondary 2013 DH3301 A^11=B^331, in both coefficient orientations and both source page orders. A distinct source p36 trace(S*X^i) GP29 additive stream also yields raw-like original ciphertext IoC 0.034456–0.034553 without plaintext. Consequently the exact norm link is a clue hypothesis, **not an authentic cipher key or recovered LP2 text**.

Reproducer: [sims/p36_q238_trace_x_and_dh_shares_sft.cjs](../../sims/p36_q238_trace_x_and_dh_shares_sft.cjs). Consolidated analysis: [im-results/p36-grid238-dh11-field-multiplication-gate.md](../../im-results/p36-grid238-dh11-field-multiplication-gate.md).

Decision for other investigators: do not repeat the same finite scalar correspondence or search arbitrary norm/trace values. The useful next gate would be an independent original instruction fixing a *specific decoder or state* from these field elements, with withheld original plaintext and a genuine inverse. The scalar match alone cannot choose a cipher.
