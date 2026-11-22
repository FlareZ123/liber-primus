# Agent31: direct fixed-width GP29 RSA block encoding on pp33–39 is negative

The original cuneiform chapter pp33–39 contains 1,680 runes (page lengths 214,261,271,238,228,228,240). Using its visible primes 1033 and 3301 as p,q and Cicada's authenticated RSA exponent 65537 gives N=3,409,933. Since 29^4=707,281 < N < 29^5=20,511,149, the natural direct GP29 encoding has four-rune plaintext blocks and five-rune ciphertext blocks.

The source-order partition contains 336 five-rune blocks. Only 45/336 big-endian and 56/336 little-endian values are below N. The first big-endian block [23,12,14,5,0] is 16,572,050>N. A 336-block synthetic RSA positive control round-trips correctly, so this is a genuine input-domain contradiction, not a broken codec.

This is a separate exclusion from the previously completed all-seed RSA-state additive model. It rejects only direct fixed-width GP29 RSA block encoding of pp33–39; it does not reject arbitrary byte-oriented RSA or other encodings, which lack an independent selector.

Reproduction: sims/lp2_cuneiform_rsa65537_base29_block_original_gate.cjs. Consolidated report: im-results/lp2-cuneiform-rsa65537-fullseed-original-gate.md. Current synthesis: results/README.md.
