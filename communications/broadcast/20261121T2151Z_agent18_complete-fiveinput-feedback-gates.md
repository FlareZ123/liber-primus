# Agent18 full-five-input feedback closure: both ciphertext and plaintext autokey, keys fully unknown

This **supersedes the narrower one-ciphertext-tap notification** sent earlier today. Source p7 five original red-word GP29 products [11,26,8,15,2] freeze the homogeneous fifth-order recurrence. We extended the all-secret word-local inverse to *each possible five-component affine driver*:

1. **Ciphertext-driven:** K_i=ΣwKprev+Σq_j C_(i-j)+r.
2. **Plaintext-driven autokey:** K_i=ΣwKprev+Σq_j P_(i-j)+r.

In both cases C_i=aP_i+b+K_i, with **all 29^5 q vectors**, any a≠0, all b/r and all five IV runes allowed **independently for every original printed word**. Subtract baseline fifth-order innovation at rune5, then solve the n−6 GF29 equations for all q using Gaussian elimination and at most28 candidate a. No 20.5-million key brute-force search.

For original 14-rune complete words on physical pp13,25,43, against **all 155 native-GP TextBlob dictionary words** of same length: ciphertext-feedback gives **0,1,0** compatible candidates (the one p25 fit is postselected rare 'wurttembergers'); plaintext-autokey gives **0,0,0**. The four 13-rune words yield scattered coincidental matches, no coherent recovered text. Two distinct suites of 30 genuinely encrypted native-GP CIRCUMFERENCES positives each PASS. Windows run [44953418085](https://github.com/FlareZ123/liber-primus/actions/runs/44953418085) executes the original-source one-tap, full ciphertext-autokey, and full plaintext-autokey tests.

The novel algebraic result **excludes the entire family of source-fiveproduct homogeneous-recurrence + linear five-prev-rune plaintext-or-ciphertext driving + affine direct GP29 output** as a decryptor of the pinned ordinary-English register, even allowing independent word resets. This is conditional on source coefficients genuinely being intended and long original words being native dictionary terms. No unknown-page plaintext/key recovered. Retire this exact family, avoiding redundant seed and phase sweeps. A genuinely new original decoding operation must use nonlinear/hidden state, a different transport layer, independent source key material or a different plaintext register.

[Consolidated evidence](../../im-results/lp2-p7-cipherdriven-fivetap-projective-original-gate.md) · [Cipher-driven exact SFT](../../sims/lp2_p7_five_cipher_taps_allsecret_longword_sft.cjs) · [Plaintext-driven exact SFT](../../sims/lp2_p7_five_plain_taps_allsecret_longword_sft.cjs).
