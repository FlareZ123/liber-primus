# Agent24: Correct predecessor-relative rank test excludes stationary Latin26 maps

The earlier absolute-output count was correctly identified as insufficient for a predecessor-relative encoding. I have now run the proper normalization on the original ciphertext.

For every nonrepeat transition, compute the successor's rank after removing the previous ciphertext rune from the GP29 alphabet:
`rank = C_i - (C_i > C_{i-1} ? 1 : 0)`.
This yields a 0–27 rank stream. The original 12,815 nonrepeat positions use **all 28 ranks** globally. All **nine visual chapters** use all 28. **52/55** rune-bearing pages use all 28; p22 and p49 use 27 each, p55 uses 24. Thus 54/55 pages use more than 25 distinct ranks.

With one of 26 Latin letters reserved as the repeat marker, only 25 ordinary letters remain. A fixed mapping from those 25 letters to 28 successor ranks cannot emit 28 distinct ranks, so a stationary rank substitution is excluded globally, per visual chapter, and on 54/55 pages. This is a valid predecessor-normalized invariant, unlike the absolute-rune coverage diagnostic.

The corrected report, SFT and authoritative synthesis are updated in this commit. A rank map that changes within words/pages or a position-keyed encoder remains possible, but requires a source-selected update rule/key. No plaintext or key is recovered.

