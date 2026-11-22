# P7 DH shared secret as a mod-23 exponential key stream for p8: original-body gate

**Agent 27, 22 November 2026. Classification: bounded original-input negative.** No unknown plaintext or key was recovered. This tests a direct use of the p7 DH packet on the adjacent p8 body.

## Human-visible premise

The five p7 red words produce GP29 products [11,26,8,15,2]. The p7 source reconstruction identifies the DH parameters **p=23, g=5, shared secret K=2**. The p8 page has a 12-rune red heading followed by a **243-rune black body**. Since 5 has multiplicative order 22 modulo 23 and 243 = 11 × (23 − 1) + 1, a human solver who recognizes the p7 DH exchange could reasonably test its shared secret and generator as a periodic additive stream over the immediately following p8 body.

The exact stream is frozen as k[i] = 2 × 5^i mod 23, with both GP29 additive signs. The p8 red heading is excluded. The exact p56 plaintext-F-transparent clock is also tested.

## Frozen receiver and controls

The reproducer derives the p7 red words from the canonical transcription and ink annotations, asserts their source spans and products, then obtains p=23 from the first rune of red word 1, g=5 from the first rune of red word 3, and K=2 from the fifth red-word product. It verifies that 5 has order 22 modulo 23 and that the generated key stream repeats after 22 symbols.

The exact p56 transparent-F rule uses ambiguity DP: plaintext F passes through without consuming a key symbol; ciphertext F branches between that case and a non-F plaintext shifted to F. Non-F ciphertext positions that would decrypt to plaintext F are rejected. Planted clear-p57 controls are checked under both signs.

## Results

The standalone Node 22 SFT is **sims/lp2_p7_dh23_exponential_stream_p8_gate.cjs**. Scoring uses the repository's source-calibrated GP29 encoder and solved LP1 plaintext reference, with a native-GP trigram model compared against **710** original windows of exactly 243 runes.

| Receiver | Native-GP trigram mean log score |
|---|---:|
| Unchanged p8 body | −10.7778556810 |
| Ordinary clock, subtraction | −10.7562332094 |
| Ordinary clock, addition | −10.7193537795 |

The native 243-rune LP1 windows have score range **−7.5814652309 to −6.8264385611**, median **−7.1864324868**. The best ordinary-clock candidate remains more than **3.13** score units below the weakest native window.

Under the exact p56 plaintext-F-transparent rule, **both signs have zero valid plaintext paths** for the original p8 ciphertext. This is an algebraic impossibility for this receiver, not merely a poor language score. The same DP recovers planted p57 plaintext under both signs (93 and 288 candidate paths), validating the ambiguity handling.

**Scoring limitation:** the ordinary-clock scores reject this exact receiver as a native-GP English candidate; the transparent-clock result is language-independent for this exact key schedule. Neither result excludes another language or a different cipher.

## Decision

Retire the exact receiver **p7 DH tuple (23,5,2) → k[i]=2×5^i mod23 → additive GP29 decryption of p8's 243-rune body**, under the ordinary clock and exact p56 plaintext-F-transparent clock. Do not rescue it with arbitrary phase, drops, offsets, or alternative moduli.

This does not refute other uses of the p7 DH tuple, the five-point quartic, or a different p8 operation. It removes the simplest direct DH-generator stream as the p8 body receiver.

Reproduce with:

~~~sh
node sims/lp2_p7_dh23_exponential_stream_p8_gate.cjs
~~~

Sources: **resources/liber-primus/lp2-corpus.json**; **resources/liber-primus/lp2-ink-annotations.json**; **resources/liber-primus/lp2-transcription.txt**; **resources/liber-primus/lp1-plaintext-reference.txt**; **sims/lp2_native_gp_source_orthography_sft.cjs**; p7 DH reconstruction: **im-results/lp2-p7-red-circulant-dh-original-inverse.md**.
