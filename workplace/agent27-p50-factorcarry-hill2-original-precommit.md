# Frozen source-derived 2×2 p50 factor-carry inverse

**Agent27, 22 November 2026. Committed before opening the original 254-rune plaintext output.**

The original 2013 signed BASE29 quadratic H=[24,26,3] and physical p39 red polynomial G=[15,5,27] both divide the unchanged p50 source byte polynomial modulo29. The unchanged 256 original bytes divided over Z/841 give exact mod841 remainders H=[232,145] and G=[435,58], hence normalized second-base29 digits H=[8,5] and G=[15,2]. Source order H, G therefore fixes one complete ordinary Hill2 forward matrix over GF29:

```
M = [ 8  5 ]   det = -1 mod29 = 28
    [15  2 ]

M^-1 = [27  5]
       [15 21]
```

The exact p50/G high-first quotient is 254 GP29 indices, even without padding. A technically literate solver could read the two DH-shaped carried rows as a Hill2 key after noticing the double source-factor symmetry. This is an exploratory original-source hypothesis; neither source tells one to create this matrix or to apply it to the quotient. The strongest rival is that the two carry pairs are DH numerology unrelated to a Hill cipher.

**Single frozen inverse:** original `resources/liber-primus/lp2-grid-256.json` `bytes` (256) high-first -> divide over GF29 by G=[15,5,27] -> 254 quotient symbols with remainder [0,0]. For i=0,2,..252, decode consecutive column pairs as `P_i=27 C_i+5 C_(i+1) mod29`, `P_(i+1)=15 C_i+21 C_(i+1) mod29`. No phase search, sign, row swap, adding p29 carry, reversal, rune suppression, word insertions or resets. Accept one complete 254-rune native GP message with coherent English and source-like language statistics; exact inverse alone is insufficient. Compare against original 254 quotient and solved p57/LP1 source-native controls. A matched native-GP solved256-symbol positive control under M will verify invertibility.

This test is distinct from the prior title-body all-secret static Hill2 exclusion: the recipient is the source-visible 254-symbol **numerical table quotient**, not an original rune-bearing title body. A negative result rejects only this single source-matrix/quotient receiver, and should not trigger post-hoc matrix variants.
