# Ciphertext interarrival-addressed GP28 successor-rank inverse

**Agent 6, 25 November 2026.** A new public-state inverse motivated by the sparse adjacent-repeat channel and the authentic prime-index clock, not a source-selected historical mechanism. The original p40–53 receiver fails frozen continuation despite strong blind literary controls. A common arbitrary gap-key bijection is also inconsistent with the finite native-prose controls. No unknown plaintext or authentic key.

## Exact receiver

Work on the nine source chapter ranges at global offsets [0,729,1874,3612,5506,6527,7960,9640,12648,12956]. Transmit the first C of each chapter as IV. Before each next ciphertext symbol, let g be the distance between the two most recent occurrences of the *preceding* ciphertext symbol; if its occurrence is the first in this chapter, g=0. This state is publicly reconstructible from the ciphertext and is not the previous occurrence-*count* clock, MTF, fixed-period rank, or the running GP-prime-sum clock.

A repeated successor emits GP29 NG (index21); this hypothesis uses a naturally infrequent GP rune, with NG frequency .00608–.00837 in the three controls and a genuine NG/ING source convention. It does not follow from a first-party instruction. For all other runes, remove NG from the canonical GP29 plaintext alphabet to get rank q in [0,27]. Then

    C[i] = (C[i-1] + 1 + (q + K[g]) mod28) mod29
    q = ((C[i]-C[i-1]-1) mod29 - K[g]) mod28.

Update the gap from the actual new ciphertext after each physical emission, including repeats. All symbols consume; printed spaces are ignored. This is reversible for every possible K and therefore replay is a correctness check only. The exact gap definition (previous symbol's completed interarrival, not current symbol's prospective return) avoids circular key selection in encryption.

Two key families: (1) K[g] = a*(prime[g+1]-1)+b mod28 for all 28^2 a,b including zero (source-inspired but not authenticated); (2) independent arbitrary shift per observed gap g, chapter-private. The latter includes the first. Neither is the established sequential p56 F-hold prime clock.

## Original common-key all-bijection obstruction

For each gap g, count nonrepeat successor ranks in a histogram. Any fixed secret bijection at g merely permutes that histogram, so the sum of per-gap maxima is the exact maximum count of any chosen non-NG plaintext rune; summing the five largest counts gives an exact common five-symbol capacity. With all nine chapter resets but a common arbitrary rank map per gap, 12,947 plaintext sites (86 NG repeats, 182 nonrepeat gap states) permit at most **989 E and 3,927 combined E/O/S/R/A**. Gibran's 49,546 matched contiguous native windows require at least 1,415 E and 5,152 of those five, and Emerson's 308,381 windows require at least 1,490 and 5,147 respectively. This excludes the common key for this finite register, even if each gap has its own arbitrary rank permutation rather than an additive shift. A continuous-tape calculation is not needed for the nine-reset result.

Giving each chapter its own key removes this obstruction: p40–53 allows 381 E and 1,303 combined out of 3,007, above the corresponding finite native floors (301 and 1,133). Therefore a real chapter-private decoder is attempted rather than declaring that the common-map bound excludes all cases.

## Blind constructive inverse and frozen original continuation

Fit a smoothed GP29 trigram model only on pinned Shakespeare. The p40–53 physical range gives 3,007 candidate plaintext runes after its IV. Development is the first 2,000, and the last 1,007 are withheld from the parameter fit. For the prime-affine law exhaust every a,b. For arbitrary gap shifts, initialize per-state unigram maxima, optimize each state using all affected trigram terms, use 10 seeded annealed coordinate restarts with 20 sweeps, and freeze the highest development-score key. Unseen states use the fixed prime fallback. This finite heuristic does not certify the global optimum. Controls are separate contiguous Gibran and Emerson passages, independently seeded random gap keys and IVs, and the same lengths. Their underlying plaintext and key do not enter the fitting code.

| Case | Train nats/rune | Frozen held nats/rune | Held exact |
|---|---:|---:|---:|
| Random gap-key Gibran | -2.220331 | -2.471500 | 984/1007 |
| Random gap-key Emerson | -2.481382 | -2.669116 | 977/1007 |
| Prime-affine Gibran | -2.264121 | -2.198902 | exact parameters 5,11 |
| Prime-affine Emerson | -2.496735 | -2.502617 | exact parameters 9,19 |
| Original prime-affine | -6.187252 | -6.524511 | unknown |
| Original arbitrary gap shifts | -4.767545 | -6.487110 | unknown |

The random-key controls recover 118/140 and 114/132 used training states, 1969/2000 and 1977/2000 training plaintext runes, and 983/997 and 977/989 held runes at trained states or marker sites. This is good but imperfect calibration; sparse states account for significant errors. The original unrestricted shift winner produces no coherent continuation (e.g. `EOEOOMXSMXYNLAEIAIAIAPRRNGTHXRSWEAJIEOLTGEWNLWHXAOOENEACUJREAREAWWCEJBTHOENMMOEOIA`). The prime-affine winner a=11,b=0 is also nonprose. Exact replay of original and planted ciphertext passes by construction. Retire these specific predictive receivers absent a genuinely independent interarrival-address clue. Other gap definitions, alternate rare-symbol roles, chapter-private arbitrary bijections and changed segmentation remain outside the heuristic negative; no creator-selected mechanism.

## Reproduction

- [SFT](../sims/lp2_gap_addressed_rank28_inverse_sft.cjs), run `node sims/lp2_gap_addressed_rank28_inverse_sft.cjs` at repository root.
- [Executed output with source blob SHAs, per-chapter capacities, donor floors, controls and candidate](lp2-gap-addressed-rank28-output.json).
- Core executed in connected JavaScript V8, with the identical function serialized into a CommonJS wrapper; the wrapper itself was not separately executed under Node or CI. No unknown LP2 plaintext or key. The p40–53 holdout is within this fit only; that region has been exposed in collective research.
