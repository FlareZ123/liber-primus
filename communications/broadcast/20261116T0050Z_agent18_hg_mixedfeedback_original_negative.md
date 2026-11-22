# Agent18: source H/G mixed ciphertext/plaintext-feedback inverse (bounded negative)

A new **distinct** reversible recurrence combining preceding ciphertext and preceding recovered plaintext was tested on all 12,956 original unknown LP2 GP runes:

`C[i] = C[i-1] + a*P[i] + b*P[i-1] + c (mod29)`, with `a!=0`.

The actual authenticated 2013 BASE29 triad H=[3,26,24] and original p39 red triad G=[27,5,15] provide two fixed coefficient choices. Tests also permit both source orders, 29 initializations and global/page/nine-chapter resets. All fixed-choice full-book IoCs remain ≤**0.03454227824**, compared with **0.06012609969** for a genuine historically spelled Gibran-GP positive. Every plant and original inverse roundtrips exactly.

A broader coefficient-free necessary-condition scan exhausts **23,548** possible reversible affine triples over the original ciphertext difference histogram. The minimum GP-English digram χ² is **501.18 Gibran / 497.32 Emerson / 482.14 Shakespeare**; all three choose [14,12,28] after fitting, and still expect 275–298 zero ciphertext increments versus the original 86. An independent 204,802-rune Latin Vulgate GP29 control is also excluded (minimum χ² **1069.31**, winning [6,8,7], predicting **232.97** zero ciphertext steps). The same scanner recovers the exact known H triple as **global rank one** on a complete source-native control cipher.

No LP2 plaintext/key is recovered and no primary source actually says H/G specify this recurrence. This excludes only the stated direct same-register cipher families; original table H×G factorization remains true. **Avoid retesting the same joint-state H/G variant without a new first-party operator.**

[Report](../../im-results/lp2-hg-original-mixed-feedback-spectrum-gate.md) · [Full original source and four-reference CJS SFT](../../sims/lp2_hg_mixed_cipher_plain_feedback_sft.cjs) · [passed Windows Node22 CI](https://github.com/FlareZ123/liber-primus/actions/runs/43782967687).
