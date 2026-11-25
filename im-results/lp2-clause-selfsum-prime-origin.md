# Clause self-keyed GP-prime origin: exact original inverse

## Decision

No plaintext under this specific self-key rule exists for the first complete 141-rune p0 black-body clause, independently of lexicon, true word segmentation, language, or score. The rule also lacks unique inversion on one of three constructed native p57 controls. Do not extend it by selecting alternate offsets, moduli, or signs after seeing the original failure.

## Independent source motivation and hypothesis

The 2013 original 761.MP3 TXXX tag preserves the three Latin Parable clauses and the independently supplied product 1,595,277,641. Their native GP-prime sums are 1259, 1031, 1229, as established in [the source checksum inverse](lp2-latin-renderer-collision-gate.md). The 2016 signed words/map/numbers/direction message motivates treating a GP number as a location. The actual p56 cipher consumes successive prime-minus-one shifts, with literal plaintext F bypass.

**Exploratory receiver only:** independently encode each complete printed period-delimited clause P at zero-based prime cursor o = sum(GP-prime(P)). A nonzero P emits C=(P+(prime[o]-1)) mod29, advancing o; literal F emits zero and does not advance. No modulus on the origin, no other key, no use of printed word boundaries. The source does not specify self-keying, a clause reset, or this indexing convention. This differs from #1210 (previous decoded word moves a finite cyclic pointer) and previous fixed-origin p56 transfers. The source-side checksum is independently real; its use as an origin is conjecture.

## Exact inverse

For n runes the origin belongs to [2n,109n]. Enumerate every integer in that closed interval; at every nonzero C the non-F inverse is uniquely determined by the current prime, except that a zero plaintext is invalid on a consuming transition. At every zero C retain both a literal F hold and any legal nonzero consuming inverse. Track the partial prime sum; discard a path only if its sum plus [2r,109r] for r remaining runes cannot reach its own starting origin. At the final rune keep exactly the fixed points. Every retained candidate re-encrypts exactly. No key/origin tuning, state cap, word model, or plaintext score.

Source: corrected transcription blob f7b534a33edeb212d427329798438325307463d7; corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165. The eight original dollar-delimited sections contain 729,1145,1738,1894,1021,1433,1680,3316 runes. p0 first period follows the actual red13 title; the next complete black-body clause has 141 runes. Its source offset is 13 inclusive to154 exclusive.

## Results

Actual known p56 native cipher regression: 85/85 rune replay, 84 consuming primes at origin0. This validates the clock separately from the speculative self-key construction.

| Input | Length | Self-key exact candidates | Origins |
|---|---:|---:|---|
| Constructed p57 first clause | 30 | 2 (includes true) | true 1259 plus an alternative |
| Constructed p57 second clause | 30 | 1 (true) | 1031 |
| Constructed p57 third clause | 28 | 1 (true) | 1229 |
| Original p0 first black-body clause | 141 | 0 | none |
| Original next complete clause | 121 | 3 | 6281, 6439, 6526 |
| Original next complete clause | 22 | 1 | 1312 |

First constructed control has an explicit collision: genuine LICETHEINSTARTUNNELNGTOTHESURFACE and TAEOXDRIAEAOTHIAEXJSEOBBOEPAEOEJHROHPRP are two different native-rune sequences producing the same ciphertext under their own sums. This proves that the mechanism is not generally uniquely invertible without an additional constraint. The only candidate in the 22-rune original is UASHAEDWRLPAXEMEALYXORDNG. The three 121-rune outputs are nonprose; no original meaningful continuation or new key. These latter intervals are diagnostics, not successful withheld plaintext predictions.

Reproducer: [CJS SFT](../sims/lp2_clause_selfsum_prime_origin_sft.cjs). Exact core and p56 regression executed in connected V8 on the pinned remote inputs; standalone Node wrapper and Windows CI not separately executed. The no-path conclusion is mathematical within the declared rule; it does not reject other uses of GP-prime sums, other clause definitions or other clocks. No new unknown LP2 plaintext, authentic key or destination.
