# Agent38 — p29 quotient / cuneiform / DH cross-check (exploratory)

**Status: hypothesis, not a decryption.** This may be a new cross-source consistency relation; it needs an adversarial review before any dependent work.

## Reproducible calculation

Treat p29's 277 GP29 indices as descending coefficients over GF(29). Divide by the p39 red-triad polynomial (G=[15,5,27]) (the inverse of 15 is 2). The remainder is zero; the quotient (Q) has 275 coefficients.

The repeated Babylonian numeral motif is read as **1033** and **3301** in Cicada Notebook's cuneiform analysis (https://cicadanotebook.com/sessions/9.html). The 2013 signed BASE29 example explicitly gives 3301→3QO. The 2016 signed message's zero-based word 29 is **DIRECTION**, selecting p29.

Use only source-derived inputs:

| Input | Origin | (Q(x)) | p28 DH relation |
|---:|---|---:|---|
| 0 | p29 index (29\bmod29) | 5 | generator (g=5) |
| 18 | (1033\bmod29), also the least-significant BASE29 digit | 8 | public share (A=8) |
| 24 | (3301\bmod29), also the least-significant BASE29 digit | 25 | (g^2=25\equiv2=K\pmod{23}) |
| 21 | (1033\bmod23), p28 DH prime | 18 | (A-B=8-19=18\pmod{29}) |
| 12 | (3301\bmod23), p28 DH prime | 2 | shared secret (K=2) |

Thus the five evaluations are exactly ([5,8,25,18,2]), matching ([g,A,g^2,A-B,K]) with the stated modulus reductions. The p28 tuple is (p=23,g=5,a=6,A=8,B=19,K=2).

As a positive control, the p50 256-value sequence is also divisible by G, but its quotient at the same inputs is ([18,7,23,16,19]), not the DH vector. The p29 quotient's induced function on GF(29) has degree 28 and 20 distinct outputs; it is not a simple affine or permutation map.

## Strongest objection and gate

This is an exact numerical relation, but the choice of moduli, inputs and DH-derived output expressions may be post hoc. The quotient is high-degree and random-looking. It does **not** establish that polynomial evaluation is the intended operation or recover plaintext.

Cheap direct follow-ups did not turn it into a cipher: concatenated BASE29 digits ([1,6,18,3,26,24]) as a Vigenere key on the p29 body did not decode; a Q-derived 29-period key on p30 and the simple p28 DH multiplicative stream on p30 also failed. No plaintext/key recovery.

**Recommendation:** independently recompute the cuneiform reading and polynomial arithmetic, then demand one source-selected, locked prediction on a held-out artifact before creating dependent work. If that cannot be specified, retire this as a numerical coincidence/checksum observation. Do not reopen the already-rejected p50 RC4-key family documented in `im-results/lp2-p50-rc4-key-original-gate.md`.
