# An original GP29 prime-field chain-cipher inversion from 18 p15 anchors

**Agent 3, 22 November 2026. An actual reversible, source-sized key-recovery attempt; no original plaintext.** This new attack investigates the distinctive low doublet rate through an operation natural for the 29-symbol GP alphabet: encode each next cipher rune as a **nonzero discrete-logarithm difference in the multiplicative group modulo 29**, reserving zero difference for the last, rare GP rune EA. An original p15 chapter key search has no English-like inverse under the natural p50 degree16 recurrence reduced modulo the group order28. A complete native-GP planted cryptogram recovers the exact correct hidden key at **rank 2** among more than 800,000 algebraic candidates.

[Source-exact Windows Node22 SFT](../sims/lp2_p15_dh28_r16_chapter_key_recovery_sft.cjs) · [successful Actions 44988762153](https://github.com/FlareZ123/liber-primus/actions/runs/44988762153).

## Creator-visible motivation and one precise reversible model

The canonical GP alphabet has exactly **29** runes. The multiplicative group of the field GF(29) contains **28 nonzero values** and is cyclic. Starting with generator 2, its nonzero outputs are a permutation of 1..28. The remaining value zero can be handled explicitly as an exceptional last GP rune, ᛠ / EA. In independently clear LP2 p57, this rune occurs **zero of 95** times. The original unsolved full-book ciphertext has **86 within-physical-page equal adjacent pairs across 12,901 transitions**, i.e., only **0.67%** of transitions. A reserved rare-EA plaintext rune can causally produce such an anti-doublet cipher, unlike a standard additive key stream that leaves a uniform 1/29 doublet probability.

The proposed chain operation is reversible:

`delta_i = (C_i−C_(i−1)) mod29`

`P_i = EA` if `delta_i=0`; otherwise `log_2(delta_i) = sigma(P_i)+K_i mod28`, where sigma is **any fixed secret permutation** of the other 28 plaintext GP symbols. The inverse is `C_i = C_(i−1)+2^{(sigma(P_i)+K_i) mod28} mod29`, with `C_i=C_(i−1)` for exceptional EA. Changing primitive root merely multiplies every exponent by an invertible residue mod28 and can be absorbed into the arbitrary hidden alphabet and full source-key state, so testing generator2 is not a hidden parameter fit.

A source-side 16-stage candidate K uses the original 256-cell table's complementary GF29 degree16 factor

`R16=[13,20,26,12,6,2,13,26,6,26,11,7,15,11,17,25,1]`,

with recurrence coefficients interpreted modulo **28**, the field's multiplicative group order. That last reduction is a specific speculative operation: **no first-party Cicada instruction identifies R16, this DH28 cipher, or an EA exception**. The exact model is nevertheless mathematically definite and directly recovers plaintext if its hidden state is identified.

## Full original chapter seed recovery, not a brute-force guess

The original p15–22 source prints **1,903** encrypted runes over **437** words, including **18 genuine one-rune words**. Every such one-rune ciphertext has a **nonzero preceding delta**, so all eighteen give an exact A-or-I GP-native cryptogram constraint with **two unknown secret alphabet values** and **sixteen unknown ring-state values**. The 16 printed-order source coefficient rows at the first 16 anchors are independently invertible modulo **4 and 7**, so the complete 28-state reconstruction runs over the Chinese remainder decomposition Z28 ≅ Z4×Z7. It does not assume GF(28), which is not a field.

For each of **131,072** label assignments (first singleton labelled A without loss), solve the remaining two equations simultaneously in Z4 and Z7, enumerating all singular solutions, reconstruct all sixteen ring-state elements, and keep distinct hidden sigma(A), sigma(I). **56,136** complete original chapter secret-key solutions survive these exact 18 equations. Every such key has an exact full-rune decryption, with EA at each of the **10 chapter-local zero differences**.

Then rank every complete key using index of coincidence after key subtraction on a prospectively fixed **268** scattered original nonzero-step positions. Decode the **1,500 highest-ranked** over the entire 1,903-rune original chapter and measure their 28-symbol collision rate without knowing the secret alphabet. The best full-chapter candidate reaches only **0.0364634750**, close to the flat 28-way baseline **1/28 ≈ 0.0357142857**. No source-native plaintext paragraph, independently selected key, or readable operation is recovered. The full-chapter language scoring applies to the 1,500 screened keys, and **not** to all 56,136 feasible keys; this is a high-recall empirical candidate search rather than an all-key impossibility theorem.

## Native GP positive controls and exact reverse

Using the true 95-rune independently solved p57 as a repeating source, plant a complete 1,903-rune GP plaintext with alternating actual A/I at the original eighteen singleton word locations. Introduce rare GP EA at twelve 151-step positions, one of which is overridden by an A/I anchor, so exactly **11 zero-delta** exceptions remain. Choose the unknown source ring seed `x_j=(3+7j) mod28` and the hidden bijective alphabet `sigma(p)=11p+3 mod28` (11 is a unit modulo28). Starting with cipher rune 9, encrypt every following native GP rune through primitive-root differences.

The same 131,072-label original input solver generates **813,960** admissible planted keys. Its full-chapter scoring recovers the **exact planted sixteen-element seed at rank 2**, with true native-GP index of coincidence **0.0721345051**; the top overfitted fake has **0.0728451954**. The positive planted cipher has **11** doublets. The positive test additionally asserts the literal inverse of every rune using the recovered actual state and the inverse of the known planted alphabet; it recovers **all 1,902** plaintext runes after the arbitrary initial chain character exactly. Rank2 demonstrates recovery sensitivity but also that the current index-of-coincidence rank is not fully specific.

No claim is made that repeating p57 simulates independent long-form natural-language text. It supplies a source-native *known-positive verification* of the rare-exception encoder and complete algebraic solver.

## Decision

The nonzero-step field-group cipher **does provide a simple reversible explanation for rare adjacent repetitions** and is worth distinguishing from conventional additive mod29 or fixed 28-way ciphertext substitutions. The source R16 module-28 finite chapter-key reading **does not** provide actual original p15–22 plaintext under the exact 18-anchor constraints and language ranking. Original sample-leading candidates remain near-uniform, unlike the native-GP planted source.

An even simpler source table as a direct **repeated period256 exponent pad** was tested separately, for all **256** circular phases, both additive signs and four original clock rules (whole-book rune, physical-page rune, whole-book word, and nonzero-delta rank). All original full-book nonzero-step decoded IoCs remain at most **0.0358198130**, again near uniform28 baseline. The best single p15–22 local IoC among these clock variants was **0.0363046061**, not a readable plaintext. This independent direct-source check excludes the most obvious use of the original 256-cell table as an exponent key for this DH28 construction; a secret 28-way dynamic pad remains unconstrained by it.

If this route reopens, it needs **a verifiable external author-selected 28-way keystream**, or an authenticated clue identifying the exceptional rune and recurrence. Varying generators or unselected R16 seeds cannot independently supply such evidence. The low doublet rate itself remains an observed fact, not proof the true creator implemented the field group.

**Run** `node sims/lp2_p15_dh28_r16_chapter_key_recovery_sft.cjs`. Inputs: unaltered `lp2-corpus.json` and source `lp2-transcription.txt`. The independent period256 direct-key phase census was computed against `lp2-grid-256.json` on the full original 12,956-runic tape. The full source and original input are retained for reproduction. [Windows job for calibrated source-key test](https://github.com/FlareZ123/liber-primus/actions/runs/44988762153).
