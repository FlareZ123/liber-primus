# P50 perimeter rank transport composed with authentic p56 prime cipher

Exploratory two-layer original-cipher test, 25 November 2026, Agent2. No authenticated selection of the composition. Existing standalone rank transport ([report](lp2-p50-76rim-rank-transposition-p55.md)) and separately composed historical Atbash+3/prime cipher ([report](lp2-p55-2014-atbash3-p56-phi-layer-original-gate.md)) were negative. This test combines the size-selected 76-cell perimeter transport with the actual immediately adjacent solved p56 prime-minus-one/F-bypass mechanism, in both orders, using only the prior eight rank conventions and fixed cursor zero. It is distinct from the active #2842 whole-chapter prime-residue ordering: its permutation is selected by the printed 76-cell numerical table rather than the prime clock.

The native cipher is C=P+(prime[k]-1) mod29 for nonzero P, advancing k only in that case; P=0 emits 0 and holds k. Enumerate every inverse path, both orderings of the two layers, CW/CCW top-left anchored traversal, stable ascending/descending rank order, and direct/inverse rank permutation. Base59 and base60 give identical rank orders. The rank permutation acts on the linear tape; no claim is made about the printed separators as plaintext boundaries.

The frozen LP1-only Latin trigram score uses add-0.5 smoothing and excludes LP2 p56/p57 text. Compare the original best across all 16 models with 2,000 equal-multiset shuffled ring-value orders, maximizing across the same models and all F paths. Seed 0x330176, xorshift32 with modulo Fisher-Yates selection. Native p56 exact replay and three genuine 76-rune donor windows (p56 prefix, p57 prefix/suffix) validate the algebra. Controls overlap and are not independent samples; they establish candidate inclusion, not unique key identification.

## Executed result

- Original complete inverse paths across the 16 models: **9** (model/path multiplicity counted).
- Best score -9.613596507263944; CCW/asc/inverse, unrank-then-unphi. Best literal output: `BSRRASTHNGEAGYADWHAETHBRIALLMXEOGLDIFRLIAHGONWWLLGJLEOELIALWNGSTHIPJEOHHHJOEIUNOYOECTMMEYBE`.
- Native 76-rune donor scores: -8.392411, -8.570579, -8.517222. Authentic p56 replay 85/85.
- 48/48 source-native planted inverses retain exact true plaintext; 2 have a unique F path under the known planted model.
- Null feasible 1776/2000; 601/2000 maxima at least original, plus-one familywise p=0.3008495752123938; feasible-null median -9.656717001000935, 95th percentile -9.486789633241344.

**Decision:** no readable original plaintext or authenticated key. Retire this fixed composition as a candidate solution; do not optimize rank ties, prime cursor or additional layers without a new selector. The two source clues do not independently identify a layered mechanism. The result is finite and does not exclude other perimeter consumers.

[Reproducer](../sims/lp2_p50_perimeter_rank_prime_composition_sft.cjs). Executed exact core in connected V8 against canonical sources (blob SHAs 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, 2550eae357442912220e05dc51147523a61dd75a, 8ed037a6ddeef2b20a10bd6a84830e7cf9f43f7d); standalone Node wrapper not separately executed. Every complete original candidate is checked by exact forward replay, which is an implementation invariant rather than key evidence.
