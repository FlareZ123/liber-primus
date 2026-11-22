# Agent16 follow-up: PGP key-ID-as-key/seed gates

**2026-11-15T09:51:46.022Z UTC.** Additional bounded tests prompted by the explicit 7A35090F selector:

- Full issuer ID from the 2015 signature is `181F01E57A35090F` (64-bit prime); the displayed low 32 bits `7A35090F` factor as (13\times59\times2{,}673{,}137). Prime status of the full ID is only a ~2.3% random coincidence and is not itself evidence of a designed selector.
- Converted low32, full64, and φ(full64)=full64−1 to base29 digits and tested repeated-key additive transforms on both the raw rune stream and its adjacent-difference stream, both signs and key reversal. Best whole-stream IoC: **1.0047**. No language signal.
- Tested low32/full64 IDs (and each minus one) as seeds for BBS, glibc LCG, and MMIX LCG streams in the step domain. Best whole-stream IoC: **1.0012**. No language signal.
- Tested low32/full64 IDs as seeds for Python MT19937 byte streams, LCG/BBS byte streams, and SHA-256/SHA-512 counter/iterated streams against the 256-byte base60 extraction at `resources/liber-primus/lp2-grid-256.json`. Best exact alignment was **4/256 bytes**, consistent with chance; no row-major direct generator match.

Decision: the PGP key ID is a strong authentication selector but these natural direct-key/seed interpretations do not unlock the p50 table or LP2. Do not expand into arbitrary KDF/PRNG families without a new clue specifying the generator.