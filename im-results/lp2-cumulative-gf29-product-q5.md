# Cumulative GF29 product: exact period-five key recovery and exclusive-F gate

**Decision:** the frozen cumulative multiplicative receiver fails original p8–14 even after exact optimization over all 17,210,368 possible five-phase multiplier keys. The stronger whole-book literal-F exclusivity invariant is incompatible with every length-matched contiguous window in three pinned native-GP literary registers. No unknown plaintext, authentic key, or continuation destination follows.

## Source-constrained candidate

The original p7 five red words at physical rune offsets 194–207 have lengths 2,4,3,2,3 and products modulo 29 [11,26,8,15,2]. The following black five-dot mark and the immediately adjoining p8 select a plausible five-phase receiver, though neither the product rule nor cumulative feedback is authenticated as an author instruction. The historical DH teaching exchange supplies K=2, used as the initial nonzero state here; the literal-F hold is motivated by authentic LP1/p56 practice. This specific cumulative multiplicative version differs from the previously failed [direct periodic multiplication and Hill receivers](lp2-p7-red-multiplicative-inverse-dh-packet.md), and from [additive full-GP29 cumulative feedback](lp2-conjugated-cumulative-gp29-recovery.md).

Let the nonzero state s start at 2 and the consuming counter t start at 0. For P=0, emit C=0 and hold both s and t. Otherwise set s <- s*k[t mod 5]*P mod 29, emit C=s, and increment t. All k are nonzero. Consequently C=0 iff P=0. Nonzero symbols uniquely decode to P=C/(s*k[t mod 5]) mod29. The previous *nonzero* ciphertext recovers s; the initial IV affects only the first nonzero decoded rune. No page or word resets, printed boundary assumptions, added layers, or transpositions.

Test the entire original p8–14 (1,729 runes): physical p8 (255) is fit; p9–14 (1,474) is withheld. First use the five p7 products in their printed order, then grant an entirely unknown nonzero period-five key, recovering it on p8 only. The latter is a relaxed key-recovery test, not evidence for the five source products. The cipher includes the red p8 heading as in the prior direct p8 test.

## Exact key inference and prospective original result

For the consuming sequence, form d=C/s mod29 and retain the actual phase t mod5. Plaintext is d/k_t. F positions remain zero. Train a smoothed native-GP trigram language model on the pinned Emerson text; no original candidate text or withheld content enters the fit. Each trigram depends on at most three consecutive consuming phases, even when interrupted by F. Aggregate five 28^3 factor arrays, then enumerate all 28^5 keys with exact factor sums (floating-point language scores, exhaustive discrete search). Check the winning aggregate score against direct decoding. No beam clipping or dictionary restriction.

| Receiver | Fit mean nats/rune | Withheld mean nats/rune | Exact key / holdout |
|---|---:|---:|---|
| Original, source key [11,26,8,15,2] | -6.608397 | -5.985516 | nonprose |
| Original, global ML key [9,27,14,1,7] | -5.114039 | -6.058680 | nonprose |
| Independent Gibran plant [4,19,7,27,13] | -2.154410 | -2.288110 | 5/5; 1,474/1,474 |
| Independent Shakespeare plant [21,6,14,9,2] | -2.447053 | -2.535165 | 5/5; 1,474/1,474 |

The best original fit exceeds its runner-up by only 8.568318 nats, versus 282.733628 and 200.700833 on the native plants. Both plants also recover all 255 fit runes. All candidate and plant decodes exactly replay their ciphertexts; replay is automatic for this bijective family and does not authenticate a key. The controls are synthetic encryptions of two disjoint source texts, not authentic historical use of this receiver. The original global maximum is for this specific trigram scoring function, not an all-language theorem. The held-out scores and outputs give no unknown prose, and the source key is not vindicated.

## Exact invariant extending beyond period five

Any mechanism in which only plaintext F can produce ciphertext F and all plaintext F are emitted literally preserves the F count, regardless of key schedule, state permutations of the other 28 symbols, or order permutation. The unknown LP2 p0–55 has 458 F out of 12,956 runes. Every contiguous 12,956-rune window in the three pinned native-GP corpora has fewer:

| Corpus | Windows | Minimum F | Maximum F | Equal 458 |
|---|---:|---:|---:|---:|
| Gibran | 50,159 | 252 | 388 | 0 |
| Emerson | 311,675 | 292 | 429 | 0 |
| Shakespeare | 205,845 | 201 | 319 | 0 |

This is a finite-register count obstruction, not an exclusion of every English text or of the authentic additive F-hold semantics (ordinary non-F inputs can encrypt to zero there). The original p8–14 count is 66; 43 Gibran and 288 Emerson length-matched windows do attain it (none in Shakespeare), so the local original attack was still necessary. The whole-book obstruction does not automatically apply to independent heterogeneous chapter registers, nonexclusive F emission, inserted nulls, or variable-length mappings.

## Reproduction and next decision

- [CommonJS SFT](../sims/lp2_cumulative_gf29_product_q5_sft.cjs)
- [Exact input blob pins, candidate previews and full recorded output](lp2-cumulative-gf29-product-q5-output.json)

The exact experiment function executed on repository inputs in connected V8; the standalone Node wrapper has not been independently run. Retire the five-phase cumulative product receiver and exclusive-F whole-book model under the stated native-register comparison. The p7 inverse packet remains an unselected structural operand. Do not expand key periods, IVs or product variants merely to rescue it.
