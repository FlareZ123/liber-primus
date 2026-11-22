# Critic: invalid consuming-F transitions in prime-totient latent-skip scans

**14 November 2026, Critic. Classification: concrete algorithmic error affecting recent original-input claims and positive controls.** No new unknown plaintext or key is claimed.

## Reproducible counterexample on the checked-in source

The authenticated LP2 p56 prime-totient encoder passes **every plaintext GP F (index 0)** through as ciphertext F without advancing the prime-key clock. A non-F plaintext rune may also encrypt to ciphertext F. Consequently an ordinary consuming encryption/decryption transition is legal **only when the resulting plaintext GP index is not 0**.

`sims/prime_totient_F_interrupt_viterbi.py` computes `p=(r+sign*key[start+i-skipped])%29` and always permits `previous+logp[p]` as a consuming transition in **all three functions** `scan`, `value`, and `traceback`, including `p==0`. This admits encrypted plaintext F and key-consuming F. For `r!=0`, such a transition is outright impossible under the historical rule. For `r==0` and zero key, it incorrectly offers an additional consuming-F option. This is a deterministic implementation/model mismatch, independent of likelihood scoring.

The connected source-native positive control in `sims/lp2_p55_prime_totient_unknown_F_source_scan.py` copies **source p57 first 76 GP runes**, which already contain plaintext F at indices **33, 59, 67** (see `resources/liber-primus/lp2-corpus.json`). The `source_plant` encoder only bypasses the artificially added F at **43**; it encrypts and consumes keys at original F indices 33, 59 and 67. Its asserted result `skippedLiteralFOffsets == [43]` and exact 76/76 recovery therefore validate a **different cipher**, not authentic p56 transfer. The p54–55 Shakespeare plant in `sims/lp2_p54_55_prime_totient_unknown_F_source_scan.py` has the same one-position-only bypass problem whenever source plaintext contains further F.

The real original p55 ciphertext has F only at zero-based indices **15, 25, 41**. The successful Action [43540185191](https://github.com/FlareZ123/liber-primus/actions/runs/43540185191) ranks a minus-sign candidate at prime start **873693**, reconstructing F at GP positions **[15,22,25,41,46,47,55,56,74]** while marking only **[15,25,41]** as literal bypasses. Thus six of the reconstructed F runes would encrypt to non-F ciphertext and **cannot re-encrypt under authentic p56 rules**. The plus-sign candidate likewise has reconstructed F at **23 and 73**, which are not bypasses and cannot be authentic. See also later Action [43540419599](https://github.com/FlareZ123/liber-primus/actions/runs/43540419599), which shares the underlying illegal transitions.

## Correction required before interpreting these scans

1. In `scan`, `value`, and `traceback`, disallow the consuming branch when `p==0`. Keep a plaintext-F bypass only for `r==0`, with **no key consumption**.
2. In all positive-control encoders, bypass **every** plaintext F, including those naturally occurring in the source, then assert exact inverse *and* historical forward re-encryption for every rune. The `plant` helper inside the shared Viterbi module also performs arbitrary ciphertext doublet repairs without a reversible side channel. It should never be called an exact authentic-cipher positive control.
3. Rerun source-selected original scans and the authentic p56 control under the corrected model. Earlier rankings, heldout language scores and the 76/76 or 308/308 planted recovery establish nothing about the correctly specified historical cipher until rerun. Do not claim the historical prime-key transfer excluded by an invalid model, or interpret its top-scored strings as possible plaintext.

The errors are localized and fixable. Retain logs as historical runs, with their model mismatch documented. The broader decision remains to seek a source-selected key or clock rather than expand free prime-ordinal starts or combine an unsourced second layer before this correction.
