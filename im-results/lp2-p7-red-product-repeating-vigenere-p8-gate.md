# P7 five-red-word products as a repeating GP29 key for p8: original-body gate

**Agent 27, 21 November 2026. Classification: bounded original-input negative.** No unknown plaintext or key was recovered. This tests the simplest direct Vigenère interpretation of the exact five-value p7 red packet against the adjacent p8 body.

## Human-visible premise

Original p7 ends with five red printed words above five black dots. Their source-order GP29 rune sequences are:

~~~text
[23,3] | [22,16,2,25] | [5,7,11] | [14,28] | [6,28,19]
~~~

Taking each word's product modulo 29 gives the five-value vector:

~~~text
[11,26,8,15,2]
~~~

The next original page, p8, begins with a 12-rune red heading followed by a **243-rune black body**. The p7 packet therefore supplies a source-visible five-symbol key candidate for an adjacent receiver. A repeating GP29 additive/Vigenère stream is a recognizable, low-complexity operation, and Vigenère has a genuine earlier Cicada solve-path precedent. This does not establish that the p7 values are intended as a Vigenère key.

## Frozen receiver

Use the five p7 red-word products in printed order as the repeating key. Decrypt only the p8 black body (after its 12 red heading runes), starting at key position zero:

~~~text
P[i] = C[i] - K[i mod 5] (mod 29)
P[i] = C[i] + K[i mod 5] (mod 29)
~~~

Test both signs under:

1. **Ordinary clock:** every p8 body rune consumes a key symbol.
2. **Exact p56 plaintext-F-transparent rule:** plaintext F (GP29 index 0) passes through unchanged and does not consume a key symbol. A ciphertext F is ambiguous between transparent plaintext F and a non-F plaintext shifted to F; the reproducer exhaustively branches both explanations with dynamic programming. Non-F ciphertext positions that would decrypt to plaintext F are invalid. This is not the shortcut of skipping every ciphertext F.

No key phase, rotation, word/line reset, key reordering, second layer, or fitted parameter is used. The p8 red heading is not part of the target body and is not used as key material.

This is distinct from the existing p7→p8 red-product key-clock report, which tests geometric/additive clocks, polynomial consumers, and raw-page donor tapes, and from the 243-trit nonlinear-stream test, which uses feedback rather than a fixed repeating key.

## Results

The standalone Node 22 SFT is **sims/lp2_p7_red_product_repeating_vigenere_p8_gate.cjs**. It derives the five red words from the canonical transcription and ink annotations, asserts the original p7/p8 source spans, computes the products, verifies all 243 target runes, checks exact ordinary re-encryption, and tests planted clear-p57 positive controls under the exact transparent-F rule.

Scoring uses the repository's source-calibrated GP29 orthography encoder and the solved LP1 plaintext reference. A native-GP trigram model is trained on the reference; **710** original native-GP windows of exactly 243 runes provide the comparison distribution.

| Receiver | Key symbols consumed | IoC | Native-GP trigram mean log score |
|---|---:|---:|---:|
| Unchanged p8 body | — | 0.0340441452 | −10.7778556810 |
| Ordinary clock, subtraction | 243 | 0.0342822161 | −10.8409312532 |
| Ordinary clock, addition | 243 | 0.0334319627 | −10.8682793047 |

The 710 native-GP 243-rune windows have score range **−7.5814652309 to −6.8264385611**, with median **−7.1864324868**. The best ordinary-clock candidate remains more than **3.09** score units below even the weakest native window.

Under the exact p56 plaintext-F-transparent rule, **both signs have zero valid plaintext paths** for the original p8 ciphertext. This is stronger than a low language score: no plaintext sequence satisfies that exact key-clock rule. The same DP recovers planted p57 plaintext under both signs (1,656 and 1 candidate paths respectively), confirming that the ambiguity handling can recover valid transparent-F ciphertexts.

**Scoring limitation:** the model is calibrated on solved LP1 native-GP English. The ordinary-clock scores reject these exact receivers as native-GP English candidates; the exact transparent-clock result is an algebraic impossibility for this receiver regardless of language.

## Full-page continuous-clock alternatives

### Five-value key, source-selected rubric continuation (Agent3, #2600)

The [solved rubric continuity holdout](lp2-solved-red-title-body-emission-decision.md#section-holdout-internal-red-spans-and-exact-consuming-state-identifiability-2600) transfers the second KOAN/p56 same-mode rule to the already solved WELCOME internal red spans. For this specific existing p7 product key, a conditional full-page p8 inverse must consume the original 12-rune red heading before reaching the black text. Its heading contains no ciphertext F, so the consuming state is exactly j=12, phase2 modulo5. The previously tested black-only state0 is not reused.

Standard historical subtraction and the exact plaintext-F-transparent rule are fixed. The absolute-state lattice first becomes empty at physical p8 index **99** (black-body index87). Its only incoming state is **j=98**: the original C[99]=15 equals K[98 mod5]=15 and would decode to F, which by this model must pass through as ciphertext zero. Hence this is a direct algebraic obstruction independent of any English score or lexicon. The 255-rune clear-p57-derived native plant re-encodes exactly and retains its true path.

Reproducer: [rubric-state holdout SFT](../sims/lp2_rubric_continuous_state_holdout_sft.cjs), executed directly on the repository source bytes. This is one state selected by the solved rubric law, not an arbitrary key-phase sweep.

### Full unreduced product digits (Agent9)

Reducing each product modulo 29 discards all its upper digits. The unreduced GP0 products are `[69,17600,385,392,3192]`; writing each in base 29, most significant digit first, gives `[[2,11],[20,26,26],[13,8],[13,15],[3,23,2]]`. Their concatenation has **exactly 12 runes**, the adjacent p8 red-heading length. This selects a distinct literal 12-symbol key, not a fitted phase or permutation. It does not establish intentionality.

Use that key from the first p8 rune through all 255 runes, without reset. Ordinary subtraction gives heading `EOEADOERUJNGTINS`, IoC 0.0337810715; addition gives `TNGCTIAIAIAEBTYM`, IoC 0.0325459318. Both re-encrypt exactly, but neither yields readable heading or body. Under the exact plaintext-F-transparent rule, the reachable phase set becomes empty at zero-based rune 17 (subtraction) and 12 (addition). Both clear-p57 planted controls retain their true plaintext path. Thus retaining upper product digits does not rescue this direct repeating-key receiver. The SFT now includes these independent checks; no claim is made about other consumers.

## Decision

Retire the exact direct receiver **p7 red-word products [11,26,8,15,2] → period-5 GP29 additive/Vigenère key → p8 243-rune black body**, under the ordinary clock and exact p56 plaintext-F-transparent clock. The source-selected full-page phase2 continuation of the five-value key is also algebraically impossible, and the 12-digit full-product key likewise fails. Do not expand into arbitrary key phases, rotations, permutations, or state updates without a new first-party selector.

This does not refute other uses of the p7 five-point packet, its quartic structure, a nonperiodic key clock, or a different cipher on p8.

Reproduce from the repository root with:

~~~sh
node sims/lp2_p7_red_product_repeating_vigenere_p8_gate.cjs
~~~

Sources: **resources/liber-primus/lp2-corpus.json**; **resources/liber-primus/lp2-ink-annotations.json**; **resources/liber-primus/lp2-transcription.txt**; **resources/liber-primus/lp1-plaintext-reference.txt**; **sims/lp2_native_gp_source_orthography_sft.cjs**; the p7 source arithmetic is consolidated in **im-results/lp2-p7-p8-red-product-state-header-keyclock.md**.

