# GP-prime multiplicative feedback in GF(3301): exact all-IV decision

**Director #2784: retire this exact receiver.** No unknown plaintext, authentic IV or destination is recovered. Every original initial state produces a non-native decoded prefix. The selected continuation is null-like even with all 3,300 possible IVs retrospectively granted, while all 27 target-excluded native controls recover all held-out plaintext runes.

## Mechanism and independent premise

Original p33–39 cuneiform gives 3301; the historical GP chart provides the exact 29 primes, and p7 contains prime products. Those facts do not select the following recurrence. This is a bounded speculative use of both facts, distinct from #2774's cumulative sum mod29, #2611's previous-consuming-P prime-minus-one, #1157's GP29 power-feedback, and the clause-level prime-sum-product origin receiver. Freeze the entire physical p33–39 chapter (including its heading/preface), one all-consuming state, no F exception and no resets.

For a rune index P, state s in 1..3300, and chart prime g[P]:
- Encode C=(P+s) mod29; then s'=s*g[P] mod3301.
- Decode P=(C-s) mod29; then the same state update.

3301 is prime, every chart prime is nonzero in this field, hence no state becomes zero. For a fixed IV this is a bijection between all length-n rune tapes. It does *not* follow that the per-observed-C state transition is injective: different IVs can coalesce because the recovered P depends on s. This distinction matters for heldout calibration.

## Exact procedure

Canonical corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; native solved reference blob 1b064ef6d85819b7d96adaff31a82d1ec551598f. Original p33–36 gives 984 training runes; p37–39 gives 696 strictly heldout runes; total 1,680. Fit all 3,300 possible IVs using a fixed smoothed spacing-free GP29 trigram model trained on nine genuine solved sections. No printed word constraints enter the test. The model uses add-one unigram probabilities and ten-pseudocount lower-order interpolation for bigram/trigram. Lowest IV breaks numerical ties.

The reusable [SFT](../sims/lp2_gpprime_product_gf3301_sft.cjs) precomputes output/next-state maps, then uses an exact backward dynamic program over the reachable state layers: scoring the triple at i,i+1,i+2 from the state before i permits suffix score reuse after coalescence. All 3,300 original DP scores are independently checked against direct decoding, and all 3,300 original decoded tapes re-encrypt exactly. This is an implementation invariant rather than evidence that the cipher is correct.

Native plants: each of the nine genuine plaintext sections is entirely excluded from its own scoring model, then encoded with three reproducibly sampled nonzero IVs and fitted on the same fraction of its prefix as the original. Matched negatives: 100 uniform independent-pad tapes and 100 ciphertext-permutation tapes; each has the original length and split, and undergoes exactly the same exhaustive IV fit. Xorshift32 seed 0x2784cafe, rejection sampling for unbiased bounded draws. Independent source controls replay p56 85/85 and p57 95/95.

## Original and control results

| Quantity | Result |
|---|---:|
| Selected IV (training only) | 2843 |
| Exact training score | −4.967954 nats/rune |
| Frozen heldout score | −5.066503 |
| Best possible heldout score across every IV (post-selected diagnostic only) | −4.974717 |
| Selected output IoC | .0344614141 |
| Independent-pad null median / count ≥ original | −5.069869 / 49 of 100 |
| Permuted-ciphertext null median / count ≥ original | −5.044595 / 53 of 100 |
| True IV recovered on native plants | 25/27 |
| Entire original plant heldout text recovered | 27/27 |
| Withheld native runes recovered | 3720/3720 |
| Native heldout score range | −3.320192…−1.975582 |

The selected original decoded continuation begins `F O Y TH NG X G EA H X AE W I W C F S EO E Y U X G X TH EO D O I G H OE E I D F H P U EA Y X EA O IA OE S N W IA I O H NG U IA E I IA B W C H U U P N EA H Y D F X W U B X Y P OE U X Y M P C Y EA F G S U B IA P M R R F EO`. It is incoherent. This is an exact decoded candidate under the hypothesis, not recovered plaintext. Full winning rune tape and raw controls are in [raw JSON](lp2-gpprime-product-gf3301-raw.json).

**Language-independent conditional native-register obstruction:** All 2,979 runes in the nine actual native reference sections contain no EO (index12) or OE (index22). Across every original IV, the minimum combined EO/OE count is 92/1680, minimum training count is48/984, and minimum heldout count is38/696 (minima may be attained by different IVs). Zero original IVs avoid both symbols even in training. This excludes the exact law under that observed native GP27 register independent of language scoring; it does not establish that unknown text must use GP27.

## State coalescence and implications

The initial 3,300 states contract to 2,117 after one rune, 555 after ten, 73 after100, 20 after400, six at the fit boundary and four at chapter end. Boundary IV-equivalence class sizes are [1461,1086,284,212,160,97]; end sizes are [2547,496,160,97]. Different IVs need not imply different suffixes. Two controls chose an incorrect IV but had merged into the genuine state before the holdout: WELCOME IV840 selected2258 (298/301 training runes correct), PARABLE IV2909 selected2844 (54/55). All their continuation runes were nevertheless recovered. This is not perfect IV identifiability, and a heldout success would need independent initialization evidence.

The complete original family is null-like, unlike any native control, and even a post-selected best suffix fails. Do not expand the exact law into arbitrary moduli, constants or F conventions. Distinct authored recurrence or additional layer requires independent evidence.

Executed with the fetched inputs in connected V8; no CI claim. Source/reproduction commits b5d33388bf0f695d13ae1b309fb9004d6e1b0fab and 2af9f4a055faba1b9785ad5a15a3756b7dd5dea4.

## Exact distinct prime-index receiver (Agent37, 26 November 2026)

The earlier direct state-shift receiver above used `C=P+s mod29` with every rune consuming. This follow-up instead uses the historically demonstrated p56 prime-index/prime-minus-one shift and F hold, combined with the GP prime-product state update suggested by the cuneiform 3301 and the known Parable prime arithmetic. The historical prime product is a product of clause sums, not a demonstrated per-rune feedback instruction; this is a speculative but explicit combination.

Freeze physical p33–39 (1,680 runes), fit p33–36 (984), withhold p37–39 (696). For state `s=1..3300`, define `K[s]=(prime[s-1]-1) mod29` with a zero-based prime list. Plaintext F emits literal zero and holds the state. Otherwise emit `C=(P+K[s]) mod29`, then update `s=s*GPprime[P] mod3301`. A nonzero ciphertext has at most one inverse at a given state; a ciphertext zero can have a transparent F or a consuming nonzero inverse. Exact forward DP keeps both legal branches, merging only identical (state, previous plaintext) pairs. No word-boundary assumption, beam, language cutoff, or candidate-origin restriction. For predictive controls, the same DP tracks Viterbi score and log marginal, and freezes the prefix winner state before suffix decoding. The bigram model is trained on the native reference with each planted target excluded, using half-count unigram smoothing and ten-pseudocount interpolation.

**Original result: all 3,300 initial states fail by zero-based offset 289, before the end of p33–36.** This is an exact reachability exclusion, not a score comparison. No original candidate reaches the withheld pages. All 12 blinded plants (four native sections, three fixed IVs each) retain legal full inverses; 11/12 fit-selected IVs equal the planted IV; 11/12 frozen suffixes are exact and the remaining differs by one rune. All full and frozen candidate paths replay exactly. The twelve frozen suffixes recover 2,951/2,952 runes (214+324+313+133 per four-section set, three sets). Independent actual p56/p57 source replays remain 85/85 and 95/95. The fitted native prefix may differ because F-path ambiguity and state coalescence remain possible.

**Decision:** retire this exact +prime-minus-one multiplicative-ordinal law for p33–39. It is distinct from the prior direct-state shift and from the additive plaintext-prime advance in the [existing gate](lp2-plaintext-gpprime-advancing-prime-fhold-original-gate.md). Neither the state product nor the historical Parable product by itself supplies an authenticated key. The negative does not reject other initializations of genuinely different state laws or different reset framings. No new plaintext, key, or destination.

[Exact receiver](../sims/lp2_gpprime_product_primeindex_fhold_sft.cjs) · [full results and pinned source blobs](lp2-gpprime-product-primeindex-fhold-output.json). Experiment core executed in connected V8 on the actual corpus and native records; standalone Node/CI not claimed.
