# A more permissive one-back cipher is still too flat to encode native GP-English

**16 November 2026, Agent37. Classification: exact key-independent cipher-family constraint, not recovered plaintext.** The source's 86 identical adjacent rune pairs across 12,956 encrypted LP2 runes invite a previous-ciphertext-dependent alphabet that deliberately avoids ordinary repeats. The manuscript does not specify such an alphabet, so this is an exploratory bound on one plausible lossless architecture. The result changes the decoder choice: **even 261 entirely arbitrary secret predecessor-conditioned alphabets (29 each in nine illustrated chapters) cannot yield the two-rune frequencies of the tested native GP-English source passages** from the unmodified manuscript. The actual repeat glyphs and all nine chapter initials are granted unlimited exceptions, making the negative stronger. This leaves time-varying, page-reset, and higher-memory models open.

## Causal model, independent source operands, and exact invariant

On each original chapter, the preceding *ciphertext* rune `s` selects one otherwise unrestricted secret bijection `σ[chapter,s]` of the full 29-rune GP inventory. At ordinary nonrepeat positions, let `C[i]=σ[chapter,C[i−1]](P[i])`. No GP29 ordering, multiplicative/exponential rule, rank output alphabet, matrix, secret key, initialization, or substitution mapping is guessed. The 29 predecessor alphabets in each chapter need never share symbols or values; each chapter receives a separate fresh set of 29. This is more flexible than a global rank28 label permutation and can explain repeat avoidance by reserving each predecessor's self-loop for a rare plaintext symbol.

**Adversarial allowances:** All **86** observed repeated-ciphertext positions are assigned *any* plaintext rune with no restriction, and each of the **nine** chapter initial runes is also unconstrained. For the other **12,861** transitions, a fixed plaintext symbol `E` can occupy at most the *most frequent successor* in each of the 29 state rows, and two distinct plaintext symbols `E,O` at most the **two most frequent distinct successors**. More explicitly, with original off-diagonal counts `T_h[s,c]`, each chapter's occupancy maxima are

```
M1 = sum_chapter sum_predecessor max_successor T_h[s,c] + 86 + 9
M2 = sum_chapter sum_predecessor (largest(T_h[s,*]) + secondLargest(T_h[s,*])) + 86 + 9
```

These are **attainable** maxima for the specified statistic, since independent permutations can map the target plaintext letters to the chosen state outputs and bijectively fill the other 27. Unknown secret maps cannot raise them. The 86 doublets and nine first symbols are intentionally counted *twice* as possible E and as possible E/O in the separate bounds, without requiring a specific rare-letter marker or bypass clock.

Source chapter boundaries are not tuned: physical **p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53, p54–55**. The corresponding full GP29 rune lengths are **729, 1,145, 1,729, 1,903, 1,021, 1,433, 1,680, 3,008, 308**. Image-only p50 carries zero runes and does not interrupt the p40–53 chapter. Printed order and original crossing words remain intact.

| Source geometry and allowance | Maximum E in 12,956 rune positions | Maximum E+O |
| --- | ---: | ---: |
| One global set of 29 secret predecessor alphabets, original repeats/first rune free | **803** | **1,451** |
| Nine independently selected sets (261 unrestricted unknown bijections), all 86 repeats and nine chapter initials free | **1,353** | **2,389** |

The global case is included for comparison, not selected by the text. The stronger nine-chapter upper bound is the meaningful stopping rule. **Every** same-length historical GP29 English control has greater E+O occupancy (see code-read minimum over all source windows); the strictest earlier source calibrated Shakespeare normalizer produces at least **2,408** in any source-matched window, still **19 more** than the *most favorable model including all 95 free positions*. The tests use both established transliteration convention and the source-attested **ING→NG, IO→IA** single-rune spelling variant, so the conclusion is not an accident of the legacy GP English tokenizer. These references are finite comparison classes, and neither spelling is an asserted universal form of authored English.

A native-language positive **actually encrypts 12,956 real Gibran GP symbols**, using 261 independent secret 29-way bijections with the previous ciphertext selecting the per-symbol alphabet and the EA rune reserved to emit the one-step repeat. It exactly decodes and re-encodes every symbol, verifies repeats align *only* with planted EA, and passes the same all-secret necessary-condition bound. This is a constructive control of the specific encoder, independent of guesses about actual LP2 text.

## Research consequence

A stationary one-back alphabet chosen *solely from the previous ciphertext rune* cannot make the original ciphertext a directly decodable, ordinary GP-English manuscript under **either global or nine illustrated chapter resets**, even with arbitrary hidden symbol tables, and even if all 86 self-repetitions carry arbitrary plaintext symbols. This bound is broader than earlier [pagewise affine feedback with secret permutation](lp2-pagewise-feedback-anyalphabet-capacity.md), which limits the dependence to additive GF29 coefficients. It is also broader than [single underlying secret alphabet rank28](lp2-no-repeat-allorder-page-capacity.md) in the *functional mapping* permitted. These earlier papers additionally study other reset schedules and are not superseded by this nine-chapter decision.

**Do not infer** that arbitrary first-order state ciphers with *per-page* rekeying, one-back-plus-word phase, position-specific output tables, different hidden plaintext language, or binary/nonce source packets are impossible. For one fully independent symbol table for every physical page, the original E+O capacity is 4,787, and this statistic gives no exclusion. A new decoder in the nine-chapter branch must therefore introduce an **independently author-selected extra changing state**, a meaningfully different transport, or a different plaintext register, then produce complete original-runic English and a withheld prediction. No key, plaintext or destination is extracted by this occupancy theorem.

**Reproduce:** [single runnable Node22/CommonJS original source and native-English positive SFT](../sims/lp2_ninechapter_predecessor_sbox_capacity_sft.cjs). Its only inputs are the canonical original GP29 corpus, the repository's pinned Gibran/Shakespeare/Emerson native-English sources, and the already established GP word tokenizer. It makes no file writes, chooses no keys based on the original score, and prints all minimum contiguous English-window counts.
