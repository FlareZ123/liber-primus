# Source-affine conditional exception channel on original LP2 p54–55

**Decision (14 November 2026, Agent 38; Director task #863):** A compact, lossless 29-symbol conditional-repeat codec satisfies exact 29→28 capacity accounting without a hidden bit or fitted escape mask. The source-motivated instantiation tested below **does not decrypt** original LP2 p54–55. It yields no continuous legible plaintext under any of 29 initial states. This retires this one affine predecessor-plaintext model, not all changing-state or compressive anti-repeat encoders.

## Independent selector and mechanism

Earlier original-cipher lag-six pairs suggested the affine transformation T(x)=(24−2x) mod29 (see Agent38 original-source memory). It has the fixed GP rune H=8 and a 28-cycle on all other GP indices, because -2≡27 has multiplicative order 28 mod29. That observation motivated a **single fixed** plaintext-state candidate, rather than a 29×29 search of arbitrary affine keys. The lag-six observation does not prove that Cicada used this mechanism: the map is a retrospective ciphertext motif.

Let P be GP29 plaintext and C ciphertext, with all arithmetic mod29. Choose the initial plain rune P0; the sender emits C0 under an initial offset (we fix C0=P0 for the zero-offset test). For i≥1:

    C[i] = C[i−1] + P[i] − T(P[i−1]).
    P[i] = T(P[i−1]) + C[i] − C[i−1].

This is an exact all-symbol bijection conditioned on prior P and C. For each prior plaintext state, **28** of the 29 next plaintext values produce a nonzero GP29 ciphertext step, whereas the **one exceptional value** P[i]=T(P[i−1]) produces the overt **repeat channel C[i]=C[i−1]**. The ciphertext itself contains the exceptional value; no latent flag is needed. Thus this differs fundamentally from the previously excluded fixed plaintext-rune repeat marker. It has no secret key; there are only 29 possible first-plain states.

The exact conditional map was tested over all 29³=24,389 predecessor-plaintext, predecessor-ciphertext and next-plaintext triples, checking the inverse and equivalence of ciphertext repeats to the conditional exception. This also proves the necessary capacity accounting.

## Original-source, frozen test

Use canonical source resources/liber-primus/lp2-corpus.json physical p54 (232) and p55 (76) continuously, **with no page reset** because their original text continues across the boundary. Their combined 308 original GP ciphertext runes occupy 66 genuine printed words, including a page-spanning word. The corresponding canonical original transcription lives in sections 53 and 54 of resources/lp2-transcription.txt, due to the runeless p50 gap. The independent source and canonical arrays agree exactly.

- Original physical p54–55 has **3 adjacent equal ciphertext runes** within the combined 308 runes. The codec reproduces them without adding mask information.
- For the **preselected zero-offset initial state P0=C0=A (GP index 24)**, direct inversion of all 308 originals produces an uninterpretable 66-word GP-rune text. It contains **0** exact entries of length ≥4 in the combined LP1, Gibran, and Shakespeare normalized native-GP word inventory across the **39** eligible original word slots.
- Granting all **29** possible P0 states increases that count to **only 1**, the standalone four-rune *RISE* at P0=U (index1). This remains uninterpretable and has no succeeding original-text confirmation. Every such candidate exactly re-encrypts, as a wrong-key reversible model must.
- The source-solved 95-rune p57 positive and native LP1/Gibran planted streams round-trip with the same inverse. Native reference occurrence of the conditional exception P[i]=T(P[i−1]) is 79/3955 for the LP1-derived GP stream and 1464/63113 for Gibran, versus 86/12,901 authentic within-page ciphertext repeats manuscript-wide. These rates are conditional diagnostics across nonidentical source spans, not formal exclusion probabilities.

**Reproducer and complete candidate readouts:** [sims/lp2_conditional_28step_exception_original_sft.cjs](../sims/lp2_conditional_28step_exception_original_sft.cjs). Run with Node 22 from the repository; it reads only committed source/control files, asserts all-state invertibility, checks the original printed-word alignment, and prints the complete original candidate for the frozen initial state and the best of the other 28 states. The mathematical and original-input checks were independently evaluated before committing the SFT; a standalone Node/CI run is not claimed.

## Causal decision

This construction closes the obvious source-affine **plaintext-dependent exceptional rune** path without requiring a side-channel hypothesis or repeated brute-force key searches. The significant unresolved direction is a different first-party selected state/operand or a source-given compression/framing rule; neither follows from the 28-cycle alone. Do not widen the affine coefficients, reset positions, 29-symbol permutations, or F-bypass masks merely to rescue the failed original readout. No unknown LP2 plaintext, source-authenticated key or final destination has been recovered.
