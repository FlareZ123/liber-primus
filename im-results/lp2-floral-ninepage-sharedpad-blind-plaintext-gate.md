# Floral p40–48 common-pad inversion: continuous and physical two-dimensional clocks

**Agent18, 14 November 2026. An executable original-cipher attack, with complete recovered 2,079-rune positive and no authentic unknown LP2 plaintext.** The entire original p40–55 floral section reuses an identical printed border, motivating both a continuous page-start key and a distinct printed row/column key. Neither predicts the original prose: the first section documents the continuous-offset attack; the final section documents the exact two-dimensional posterior-predictive inverse. Prior checks examined direct source-value keys and five-position A/B lane consumers. This attack instead allows **all 231 individual secret GP29 additive pad symbols** to be completely unknown and independently arbitrary. It tries to *recover* those symbols jointly from the first nine original floral pages, p40–48, by assuming they were encrypted under **one identical position-aligned page-reset keystream**.

## Hypothesis and genuinely blind decoder

If each original p40–48 ciphertext rune is `C_page,t=(P_page,t+K_t) mod29` with the same unknown `K_t` at a given page-local offset, then the nine independently written native-GP plaintexts provide redundant information about the same pad. The shortest original page in this set is 231 runes, so freeze exactly the **first 231 original GP ciphertext runes of each of nine physical pages**. These 2,079 source runes are never altered, transposed, filtered, phase-fitted or sampled to find an interesting region.

Train a GP29 conditional trigram model from the first 120,000 GP rune symbols of the already pinned Shakespeare source, applying the standard longest-match digraphs and known GP Latin orthographic normalizations. Fix the 29-rune model and additive cipher. A Viterbi dynamic program searches *every possible 231-position key sequence* by maximizing the **sum of independent trigram likelihoods over all nine simultaneously decoded pages**. It represents the last two unknown pad symbols as 841 DP states and checks all 29 possible next symbols per state; no pad candidate, dictionary password or source plaintext is supplied. This is a **direct plaintext-recovery algorithm** in the specified reuse model.

A necessary key-invariant test precedes language fitting: when two pages reuse exactly the same additive pad, `C_pageA,t=C_pageB,t` if and only if `P_pageA,t=P_pageB,t`. For the nine original pages and 231 aligned positions there are 36×231=**8,316** inter-page equal-symbol opportunities. Repeated GP English letter statistics therefore survive the unknown key *exactly* in the pairwise equality count.

**Stronger algebraic reach of this invariant:** the equality identity also holds for **any arbitrary shared, positionwise secret 29-symbol permutation** `C_page,t=π_t(P_page,t)`, not just for field addition. Each `π_t` may be independently chosen from all **29!** permutations. The visible 323/8,316 equality rate is therefore a key-independent obstruction to *native-English-like plaintext under any common page-aligned one-to-one substitution*, without trying any secret alphabets at all. This is a reference-conditioned incompatibility, not a language-universal impossibility theorem. The Viterbi cipher recovery and its 231/231 positive specifically test the **additive subclass**, because one key per position becomes solvable by combining nine language-model signals.

## Original and positive results

| Fixed diagnostic | Original p40–48 | Nine genuine native-GP plaintexts, encrypted with one shared unknown random pad |
| --- | ---: | ---: |
| Aligned GP29 symbols | **9×231 = 2,079** | 2,079 |
| Same-position equal symbols over 36 page pairs | **323 / 8,316 (3.8841%)** | **502 / 8,316 (6.0366%)** |
| Blind Viterbi GP log likelihood, nats per decoded rune | **−3.425097** | **−2.392093** |
| True unknown pad recovered | No authentic candidate | **231/231 exactly** |
| Genuine plaintext recovered | **None** | **2,079/2,079 exactly** |
| Pooled IoC of optimized decoded original | **0.037475** | Native prose recovered exactly |

The complete source-original optimized outputs for all nine pages are printed by the SFT. They retain dense unnatural digraph and rune patterns and show no sustained native-GP prose. Their mean likelihood remains substantially poorer than the **blind native positive**, despite granting the Viterbi decoder an independent unknown pad rune at every position. The positive uses nine independent, nonoverlapping withheld Shakespeare-GP passages, not the training data, encrypts them with one pseudorandom 231-symbol GP29 pad, and the *identical blind decoder* restores all nine entire passages and every true secret pad symbol, without being given any part of it. Thus the algorithm has direct, demonstrated plaintext recovery power for the proposed architecture.

The original equality count is itself a key-independent mismatch to two independent native references: only **323** of 8,316 aligned original positions agree, compared with **502** for the equally shaped withheld Shakespeare native positive. A distinct **Gibran, *The Prophet*** GP29 control, drawn as nine nonoverlapping 231-rune windows from positions `500+462j` (j=0..8) after the same frozen GP transliteration, independently gives **458/8,316 = 5.5075%** symbol matches, without encryption or any fitted key. Its manuscript-shaped native register also exceeds the original's 323/8,316 under the shared-bijection invariant. It excludes a universal claim that the floral pages obviously share a *standard native-English page-reset pad*. It is not a universal distribution-free impossibility proof for every possible language or GP transliteration; atypically flat plaintext could have a comparable equality count. The original-page score is a direct language-likelihood comparison, not a familywise p-value for unbounded register hunting.

## Reproduction, interpretation and next decision

The [single-file CJS original-source SFT](../sims/lp2_flower_ninepage_sharedpad_viterbi_sft.cjs) reads the pinned unchanged GP29 corpus and fixed Shakespeare reference, asserts every chosen page and source prefix length, implements the full 841-state Viterbi, prints all nine reconstructed openings, and verifies every positive key and rune. It passed **Windows Node.js 22 [CI run 43640557271](https://github.com/FlareZ123/liber-primus/actions/runs/43640557271)** with *231/231* pad and *2,079/2,079* positive plaintext recovery.

**Decision:** common page-start additive keystream across the nine identical-floral original p40–48 pages does **not** yield authentic GP29-English plaintext even under a fully free, jointly recovered 231-rune key. No historical Cicada author text actually prescribes pad reuse or an additive cipher, and the reused border is only a possible human clue. This negative closes this *one particular source-selected reusable-key architecture*, while permitting different page keys, distinct clocks, different plaintext registers and unobserved cipher state. Continuing with arbitrary shifted page phases would need a distinct original instruction. Authentic unknown LP2 plaintext remains unrecovered.


## Physical row × rune-column shared pad (Agent48, 24 November)

The preceding continuous-offset gate does not address a common key addressed by **physical line ordinal and rune ordinal within that line**, a distinct visible book-coordinate clock. No arbitrary page phases, key orders, shifts, transpositions, or red-title edits are introduced. The original shared floral template is a motivation, not proof of key reuse; the coordinates are transcription ordinals, not measured pixel locations.

The fixed model is `C[p,r,j]=(P[p,r,j]+K[r,j]) mod29`. Each physical row has its own entirely arbitrary key, with independent uniform GP29 priors at every cell. The original transcription is reconstructed exactly against all 55 source rune-bearing pages and 594 rune lines. The nine-page source contains 2,408 runes; p40–45 are development (1,593), p46–48 are untouched prediction (815). Row widths across the nine pages are [24,25,26,25,25,25,24,24,24,25,24,24]. The shorter p40 page and all differing line lengths are retained without padding or truncation.

The frozen GP model uses only the first 120,000 GP29 runes of the repository-pinned Shakespeare text. It uses smoothed unigrams, bigrams, and trigram conditionals with 20 bigram-prior pseudocounts. Each line starts with unigram/bigram probabilities; no cross-line transitions are imposed. The exact forward recursion retains the last two key symbols, sums over every preceding key symbol and applies a uniform key prior. Row products yield marginal ciphertext evidence Z. The predictive log-likelihood ratio per held-out rune is

`[log Z(C40:48) − log Z(C40:45) + 815 log29] / 815`.

This integrates over training-key uncertainty, rather than retrospectively fitting a key to the holdout. A separate exact max-product Viterbi key learned on p40–45 is frozen before decoding p46–48. Unobserved tail coordinates remain arbitrary under the hard key; marginal prediction treats them uniformly.

| Original or planted input | Aligned equal pairs (9,154 total) | Predictive gain (nats/rune) | Frozen MAP holdout score | Exact recovered holdout runes |
| --- | ---: | ---: | ---: | ---: |
| Withheld Shakespeare (offset125000) | 575 | +0.899115 | −2.573898 | 776/815 |
| Gibran (offset4000) | 569 | +0.993755 | −2.516962 | 779/815 |
| Emerson (offset5000) | 525 | +0.857574 | −2.724182 | 758/815 |
| Independent uniform-pad null | 344 | −0.946550 | −5.342551 | not applicable |
| Original p40–48 | **342** | **−0.993762** | **−5.294860** | no authentic plaintext |

The original training log evidence is −5880.133097267337 and all-nine-page log evidence −9434.395523411478. Exact original MAP output starts `E N P R EA H H T G C J N E C IA Y R B L I NG`, with no coherent prose. The independent plants recover clear passages and have positive posterior predictive gains despite finite training and the deliberately independent cell keys. True planted keys round-trip all source-shaped runes; every candidate original key also round-trips by bijection, which is an implementation check only.

The coordinate-equality statistic is additionally invariant under arbitrary shared bijections at each physical (row,column) and cannot decrease under a shared deterministic noninjective map. Original 342/9,154 versus 525–575 for the three fixed native plants therefore disfavors that larger deterministic family under these particular native comparisons. It is not an all-English bound or discovery-wide p-value.

**Decision:** retire the direct shared physical-coordinate additive pad alongside the earlier continuous-offset model. Neither clock selects a reproducible original-language inverse. The results do not establish independent page keys or exclude altered text geometry, genuinely source-selected new state laws, or other registers. Do not expand arbitrary coordinate alignments solely to rescue reuse.

[Read-only CommonJS SFT](../sims/lp2_floral_physical_2d_sharedpad_predictive_sft.cjs), prospectively frozen at [4df8061](https://github.com/FlareZ123/liber-primus/commit/4df806140449bb9bc9dc6902de0dc300dcf88cbe). Executed the exact committed script against exact fetched corpus, transcription and three donor files in the connected JavaScript runtime using a file/path/assert shim; 72.3 seconds, all assertions passed. No separate Node/CI execution is claimed.

## Authentic latent plaintext-F hold extension (Agent48, 24 November)

The historical LP1/p56 convention permits plaintext F to emit ciphertext F without advancing the consuming key. A ciphertext zero may instead be the encryption of a non-F rune, so no particular hold assignment may be presumed. For each physical row, enumerate every subset of each page's ciphertext F positions as holds, delete exactly those positions, and compare the remaining consuming columns. The same key at a consuming row/column forces equality of aligned consuming plaintext and ciphertext; arbitrary shared deterministic noninjective mappings cannot reduce equality. Jointly maximize the sum of all pairwise equality counts over all nine page masks, rather than independently maximizing each pair. The bound is exact for the relaxed alignment model; some masks attaining it may not admit an actual additive key, making it conservative.

Frozen source rows have 7,15,11,3,10,6,5,9,9,6,15,8 ciphertext F positions. Their exhaustive maximizing counts are 42,33,38,31,38,27,33,36,33,35,33,20, summing to **399**, versus 342 without holds. Fixed native donor plants after removing genuine plaintext F have 574,604,507 matches (Shakespeare, Gibran, Emerson). Across 100 deterministic original-shape donor offsets per source, minima/medians/maxima are 486/542/612, 496/562/616, 501/569/646. Every one of the 300 controls exceeds even the original optimized ceiling. A small genuine hold/encrypted-zero control attains true score 12, with exhaustive relaxed ceiling 18 confirmed by independent Cartesian enumeration. These are reference-conditioned observations, not independent statistical replicates or a universal impossibility theorem.

**Decision:** retire this common physical-row/consuming-column model under the authenticated F-hold rule as well. No authentic unknown plaintext or key; distinct page keys and independently justified alternative state clocks remain open. [Frozen SFT](../sims/lp2_floral_physical_2d_fhold_equality_ceiling_sft.cjs), [commit 3961116](https://github.com/FlareZ123/liber-primus/commit/3961116d8f42581e1200debc4c2c63e755c5d4e6). Exact committed script executed against exact fetched source in connected JS runtime, 1.465 seconds, all assertions passed; no separate Node CI claimed.
