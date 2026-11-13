# Cuneiform-bounded prime_echo interval: direct GP29 key gate

**Agent3 — 13 November 2026. Intermediate negative result; no plaintext recovered.**

## Why this was worth one bounded test

An independent reading of the repeated Babylonian-numeral motif on LP2 physical pages 33, 35, 38 and 39 gives the values **1033** and **3301**. The four motif placements and the marked p33–p39 interval are documented in [Cicada Notebook Session 09](https://cicadanotebook.com/sessions/9.html) and the later full-page correction in [Session 16](https://cicadanotebook.com/sessions/16.html). These are community transcriptions, not an author-issued cipher specification.

The repository's recovered 2013 CicadaOS source audit independently records that the original prime_echo program emits the 464 primes through 3301 and pauses at **1033** and **3301** ([source audit](2013-os-wisdom-folly-source-classification.md)). The two endpoints therefore select a concrete part of an existing Cicada artifact rather than an arbitrary prime range.

The primes after 1033 through 3301 inclusive are **1039…3301**, exactly **290 primes = 10 × 29**. This suggested a finite GP29 key stream. The solved manuscript's explicit prime/totient language motivates testing both p and Euler's φ(p)=p−1.


A separate cross-round check gives an exact length match: transferring the private exponents 6 and 15 from the signed 2013 DH example into the LP1-derived candidate group p=3299, g=7 yields 7^90 mod3299=1589, exactly the length of this marked section. The exponent transfer is hypothetical. Its direct base-29 shared-secret key and phase-90 stream consumers fail on this section; see the expanded [p15/floral register report](lp2-p15-red3299-floral-body-register.md) and its reproducer.

## Locked target and key construction

The target is the marked interval beginning at zero-based rune offset 91 of physical LP2 p33 and ending at the final rune of p39. The local corpus gives page lengths [214, 261, 271, 238, 228, 228, 240], hence the five motif-delimited block lengths [123, 261, 737, 228, 240], marker offsets [123, 384, 1121, 1349], and **1,589 runes** total. This is 5 complete 290-symbol key periods plus 139 runes.

The key is the 290-prime continuation after the 1033 pause through the 3301 pause, with no fitted phase or reordering. It is repeated continuously from the first rune of the marked interval. The tested GP29 consumers were:

1. Additive Vigenère using p mod 29, both signs.
2. Additive Vigenère using φ(p) mod 29, both signs.
3. Multiplicative GP29 inversion using p mod 29.
4. Affine GP29 inversion with multiplier p mod 29 and addend φ(p) mod 29.

No page reset, marker reset, key reversal, arbitrary phase, prime-gap transform, or parameter fitting was introduced.

## Results

All six invertible transforms pass exact synthetic positive-control roundtrips using the known p57 rune text. That verifies the arithmetic and inverse implementations, not the hypothesis.

| Consumer | IoC | Shakespeare-trained GP29 trigram score |
| --- | ---: | ---: |
| Raw marked ciphertext | 0.03434982 | −4.564663 |
| p additive, subtract | 0.03453053 | −4.619342 |
| p additive, add | 0.03434189 | **−4.516683** |
| φ(p) additive, subtract | 0.03453053 | −4.555312 |
| φ(p) additive, add | 0.03434189 | −4.609436 |
| p multiplicative inverse | 0.03461138 | −4.579784 |
| p/φ(p) affine inverse | 0.03445603 | −4.552548 |

For scale, the same trigram model scores the known solved p57 control at **−2.495429** and its Shakespeare training sample at **−2.194946**. The best candidate improves on raw ciphertext by only 0.048 nats/rune and remains far from either English control. Its decoded samples are not readable English. IoC likewise remains near the ciphertext baseline.

A φ(p)-as-multiplier variant is not a valid full-stream bijection: φ(p) mod 29 is zero at 10 of the 290 key positions. The tested affine orientation avoids that defect by using p as multiplier and φ(p) as addend.

## Decision

**Reject the direct 290-period additive, multiplicative and p/φ affine consumers on this marked interval.** The cuneiform-to-prime_echo endpoint connection remains an interesting source-selection hypothesis, but it does not by itself establish how the prime stream should be consumed. Do not extend this branch into prime gaps, fitted phases, marker/page resets, or arbitrary transpositions without a new independent clue.

This result does not exclude a different use of the 2013 artifact, a different cipher family, or another source-supplied key. It recovers no unknown plaintext and does not alter the established overall solution status.

## Reproduction

Run from the repository root:

    python3 sims/lp2_cuneiform_prime_echo_290_key_sft.py

The script reads the original LP2 corpus and pinned Shakespeare control, asserts the page/block counts and prime endpoints, tests all six inverses, and prints the full deterministic summaries and decoded samples. It also checks exact roundtrips against repeated solved-p57 text.

Related existing test: [full 464-prime periodic-key gate](../sims/prime_echo_464_periodic_key_sft.cjs). This experiment is distinct: it uses the cuneiform-selected 290-prime continuation and the marked p33–p39 interval rather than the phase-zero 464-prime stream over the full book.
