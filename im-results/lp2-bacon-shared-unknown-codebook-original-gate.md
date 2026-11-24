# Shared five-bit partition with an arbitrary output substitution: original inversion

**24 November 2026 — original-input negative; complete planted-key recovery.** No unknown LP2 plaintext or key. The two previously tested five-site Bacon routes (p23–26 and p40–53) allowed arbitrary binary rune colors but fixed the historical code-to-letter order. This study removes that last restriction, granting a completely secret injective assignment of any 26 of the 32 five-bit codes to Latin letters. It tests whether the same binary color and arbitrary codebook can produce readable text on both source-derived bodies, and tries to recover a private codebook for the stronger original training section.

## Source and frozen inverse

The prior source-motivated [p23–26 Bacon gate](../sims/lp2_p23_26_bacon24_exhaustive_sft.cjs) removes the 16-rune introductory span, leaving 1,005 runes (201 consecutive quintets). The [p40–53 floral gate](../sims/lp2_p40_flower_bacon_allsecret_sft.cjs) removes the eight red opening runes, leaving 3,000 runes (600 consecutive quintets). These are conditional groupings; the manuscript does not explicitly prescribe shared Bacon colors or a common secret codebook.

For unknown bit assignment B:GP29→{0,1}, take five consecutive original rune identities, form the MSB-first integer and read a secret injective partial map from 32 integers to 26 Latin letters. Reverse bit order and global complement merely permute code labels and are already covered by the unknown map. Fix B(0)=0 to quotient complement symmetry: **2^28=268,435,456** distinct color partitions. Runes inside a color class are homophonic carrier choices; the plaintext alone does not reconstruct their arbitrary choices, so the plant is an extraction control rather than a bijective rune-level forward inverse.

Train on p40–53 only. An injective map must use at most 26 different observed codes. A broad empirical gate grants every sliding 600-letter window of the repository's Gibran, Emerson and Shakespeare Latin controls: 20–26 distinct letters, maximum single-letter count ≤104, ordered equal-pair sum 19,828–28,912. This range is descriptive, not a theorem about all English. The separately evaluated 201-letter envelope is 17–26 distinct, max ≤45, ordered equal pairs 2,038–3,684. A common injective codebook further requires the union of training and holdout codes to have size ≤26, a deterministic bound.

The compiled core precomputes code contributions for two 14-bit halves of each key and ORs the contributions. It enumerates every pair, stops presence scans only after 27 codes appear, and tests full histograms on survivors. SIMD/ordinary presence paths were checked against direct decoding on 10,000 keys per input; complement leaves the histogram and all code equalities unchanged.

## Exact original outcome

| Stage | Complement-quotiented keys |
|---|---:|
| Total | 268,435,456 |
| At most 26 observed training codes | 155,515 |
| Also at least 20 observed training codes | 152,726 |
| Also at most 104 occurrences of any code | 2 |
| Also within training equal-pair envelope | 2 |
| Shared 26-code union on withheld p23–26 | **0** |

The two training candidates are 209830276 and 536657522. Each uses 26 codes on training; their respective maximum counts are 99 and 92, ordered equal-pair sums 23,014 and 25,458. The withheld section contains 27 and 29 distinct codes respectively; unions are 28 and 29. Thus even an independent 26-code injective substitution for the holdout cannot repair either trained binary assignment.

We also fit arbitrary unknown output-letter permutations for each training survivor using fixed-seed annealing (28×18,000 swaps; Latin quadgram model trained on all three historical controls excluding the exact positive-control windows). The best scores are −13.81498 and −13.53382 mean log quadgram; their decoded text begins `FIISWEEVILSEISVENKMRTWTWTDLENETRCEEDSNEGRYVWLQXOEOHESEBPEGPEUNRY` and `DDILOEFLICEEETAENASOINESEPKINASFRIAIQETLUKHREENWEHIETNOBUILDARW`. Neither produces coherent text; the withheld outputs have respectively five and three unmapped occurrences. The heuristic substitution step is not an all-permutation upper bound.

Training repetition pairs at lengths 2,3,4,5 for the two candidates are (691,54,3,0) and (879,70,7,0). No original candidate reaches the planted control's (1619,368,63,21). This is an additional substitution-invariant diagnostic, not an English impossibility theorem.

## Independent positive extraction and recovery

Generate a hidden balanced 29→2 assignment (canonical key **415888584**) and arbitrary injective 26-of-32 codebook using Python Random(3301). Encode a 600-letter actual Gibran window (offset5000) and a distinct 201-letter Emerson window (offset5000) by randomized matching rune colors, suppressing immediate carrier repeats. Exact direct extraction recovers all 801 letters. The exhaustive key attack finds 1,002 training survivors and 372 surviving the joint gate. Ranking **only the training input** by descending lexicographic (bigram, trigram, quadgram, fivegram repeated-pair count) selects the planted key uniquely first; the nearest rival has 1,338 bigram pairs versus the true key's 1,619. The fixed-seed unknown-codebook annealer independently recovers **600/600 training and 201/201 withheld letters** without using either plaintext for its language model. True-key mean log quadgram is −9.28251. This demonstrates actual key recovery on the specified hidden-color, arbitrary-codebook architecture, rather than just testing a known encoder.

## Decision and reproducibility

Retire **shared stationary binary-color + injective arbitrary 26-letter codebook** under the two frozen quintet framings and ordinary Latin empirical envelope. No original key or text. This does not exclude noninjective codebooks (multiple codes per plaintext letter), variable color by position, a different framing, non-Latin register, or an additional transform. Do not search alternative labels for these exact two trained colors; their holdout alphabet-size contradiction is invariant under every relabeling.

- [C++ all-key core](../sims/lp2_bacon_shared_unknown_codebook.cpp)
- [Python source/control/ranking SFT](../sims/lp2_bacon_shared_unknown_codebook_sft.py), with the exact corpus FNV-1a checks 521294b1/01cbd53f, every-window envelope and planted key assertion. Pass the compiled core executable to the script.
- [Unknown substitution SFT](../sims/lp2_bacon_shared_codebook_substitution_sft.cjs).

The original and positive all-key sweeps actually ran on local GCC C++17/OpenMP/AVX512 (4 threads; original approximately 2 s after compilation); the substitution optimizer and control-envelope computations ran in the connected JavaScript runtime. No CI run is claimed. The repository wrappers reconstruct those inputs/operations; the locally executed core and connected JS computation supplied the values reported here.
