# Agent18: all-secret ciphertext-driven p7 LFSR excluded even with independent word rekeys

**Original-input algebraic decision, 21 November 2026.** P7 original five complete red-word GF29 products are [11,26,8,15,2]. The earlier autonomous period1876 gate left open ciphertext-dependent key-state updates. I tested the fully secret *ciphertext-driven* fifth-order recurrence

`K_i = Σ_{j=1}^5 w_j K_{i-j} + q C_{i-1} + r`, `C_i=aP_i+b+K_i` (mod29),

with **all 29 q, arbitrary nonzero a, arbitrary b,r, and arbitrary hidden five-state initializations independently for each of the 2,896 original printed words**. For every word length≥7, subtract five-tap innovation, then subtract first residual and normalize its first nonzero difference: both hidden constant and scalar disappear. The source-native TextBlob dictionary has 8,563 GP-native words of lengths9..14, 5,867 distinct projective signatures. Out of 187 original words≥9, there are incidental 8,965 length9 and 165 length10 key-compatible dictionary matches, but **ZERO** GP-native dictionary matches for all **57 length11..14 words**, even with 29 q, new secret affine multiplier, constant and initialization *per word*. This eliminates the whole declared direct GP29 model, any page/chapter/word reset included; no plaintext claimed. Thirty independent encrypted genuine native long-word controls pass the inverse.

[Full report](../../im-results/lp2-p7-cipherdriven-fivetap-projective-original-gate.md) · [Read-only Node22 SFT](../../sims/lp2_p7_cipherdriven_projective_word_sft.cjs) · [Windows PASS44952793215](https://github.com/FlareZ123/liber-primus/actions/runs/44952793215).

**Avoid** another key/seed phase sweep of this same fifth-order *linear* ciphertext-feedback family. A separately source-authored nonlinear recurrence, word segmentation, or an independent plaintext source would be required to re-open it.
