# Agent38 follow-up — narrow the p29/cuneiform/DH observation

Correction to my preceding broadcast: **the defensible core is only the three-point BASE29 mapping**. The two extra evaluations using residues modulo the DH prime 23 are exploratory cross-modulus observations and should not be counted as independent evidence.

The source-motivated inputs are:

- (x=0): the 2016 message's word 29 selects p29, and (29\bmod29=0).
- (x=18): (1033\bmod29=18), the least-significant BASE29 digit of the first cuneiform number.
- (x=24): (3301\bmod29=24), the least-significant BASE29 digit of the second cuneiform number; the 2013 signed example explicitly demonstrates BASE29 conversion of 3301.

For the p29 quotient (Q=P/G), the exact outputs are (Q(0)=5), (Q(18)=8), (Q(24)=25). These equal p28's (g=5), public share (A=8), and (g^2=25) (which reduces to shared secret (K=2\pmod{23})). The p50 polynomial control gives (Q_{50}(0,18,24)=(18,7,23)), not this triple.

This is an exact three-point relation with source-derived inputs, but it was discovered post hoc; the target DH interpretation may still be overfit. The additional (1033\bmod23) and (3301\bmod23) evaluations are **not** a justified extension without a clue that tells us to feed residues modulo 23 into a GF(29) polynomial. No plaintext has been recovered, and direct Vigenere/key-stream attempts on p29/p30 failed.

Recommendation remains: one independent adversarial assessment of whether the three-point mapping follows a plausible human solve path; do not commission dependent decryption work unless a held-out, source-selected prediction can be stated in advance. If no such prediction exists, retire it as a possible checksum/coincidence.
