# GP29 Chaocipher two-alphabet decision — #3124

**Outcome:** a reusable aligned-crib state-recovery method passes two of three native controls, but a third remains capped. No source-selected Chaocipher initial wheels or aligned plaintext exist for p54. More importantly, the exact repeat law and 2,000 full-register forward controls strongly disfavor ordinary uniformly keyed Chaocipher as the explanation of LP2's globally suppressed repeats. No original key/plaintext was recovered. This is not an all-key exclusion.

## Historical algorithm and frozen GP29 adaptation

Moshe Rubin, [Chaocipher Revealed: The Algorithm](https://www.chaocipher.com/ActualChaocipher/Chaocipher-Revealed-Algorithm.pdf), 2 July 2010 (updated 30 July), specifies the two rotating alphabets and small local moves. It was publicly available before LP2. There is no authenticated Cicada reference naming the algorithm. For N=29 use zero-based nadir floor(N/2)=14 (modeling choice; the historical 26-letter version uses 13). In the classic fixed-direction version, find p in right wheel R at k, emit L[k], rotate both by k, move left index1 to nadir, rotate right one additional step then move right index2 to nadir. Decryption locates c in L and reads R at its index; state updates are identical. No F bypass, punctuation consumption, per-word resets, or alternate update scales.

The N=26 implementation reproduces the paper's **tabulated** 28 output letters exactly, OAHQHCNYNXTSZJRRHJBYHQKSOUJY. The prose vector above the table contains U at the penultimate position where the table's I maps to J. The directly specified permutation and table agree. The GP29 encipher/decipher round trips pass all native plants.

## Hidden-wheel aligned-crib inverse

Use an anchor after pair i. Common rotation of both initial wheels is an observational symmetry; normalized post-pair states have c_i at left index0 and p_i at right index28. Track unknown label-to-slot assignments at this anchor; transformations of anonymous position indices determine both moving boundaries. For each next known aligned (p,c), branch only on positions consistent with assigned wheel slots; when either symbol is assigned the position is forced. Backward extension inverts the two local moves and right extra rotation, then selects the common rotation placing the previous c at left index0 and previous p at right index28. Choose the end with fewer allowed positions and reject contradictions. The anchor heuristic uses only overlap in the first 35 aligned observations, not the key. No guessed initial wheel is supplied to the search.

Exact source: `resources/external/relikd-solved-gp29-native-v1.json` blob `1b064ef6d85819b7d96adaff31a82d1ec551598f`. Two controls use 223 fit runes and 86 held runes, approximating the p54/p55 experiment geometry; third uses 1,000 fit +86 held. Random independent wheel permutations use seed 0x3124aa01. First-solution search is bounded, not a uniqueness proof.

| Native control | Distinct P/C fit | Result |
|---|---|---|
| WELCOME first 223 | 25/28 | True assigned wheel slots recovered at anchor176 after 90,075 nodes (two earlier caps); 86/86 held |
| KOAN first 223 | 19/29 | Three 100,000-node caps, max depth24; unresolved |
| First 1,000 LP1 native runes | 27/29 | True assigned wheel slots at anchor183, 133,300 nodes; 86/86 held |

All assigned slots in both successes match the independently planted anchor wheels; arbitrary deterministic completion of unused slots happened to decrypt the held runes exactly. This is not identification of unobserved labels: the full native register lacks GP indices12 and22, and the shorter WELCOME fit lacks four plaintext labels. The successful aligned-crib controls are **not ciphertext-only blind key recovery**. No independently authenticated aligned unknown-page crib or source-defined starting wheel exists; the relevant ciphertext-only calibration therefore has not passed. No original optimization attempted.

## Exact right-wheel repeat law

After any step the previous ciphertext label is at L[0]. The next ciphertext repeats iff the next plaintext is at current R[0]. The previous plaintext is at R[28], so identical adjacent plaintext cannot produce equal adjacent ciphertext in this version. The repeat positions depend only on R and P, not the left labels.

For a fixed plaintext sequence and a uniformly random initial right permutation, the updated right wheel is uniformly distributed over all permutations with the most recently processed plaintext at index28. Proof: undoing the local move and extra rotation yields a unique wheel normalized with that plaintext at index0. Initially each such state has 29 equally likely rotated preimages. At subsequent steps, among its rotations exactly one places the preceding plaintext at index28, so the restricted update is a bijection on the two equal-size sets of 28! states. Consequently for fixed distinct adjacent plaintext, the next label is at R[0] with probability 1/28; for equal plaintext, probability0. The exact expected ciphertext repeat count over uniformly random R is

```
E[repeats] = (number of adjacent distinct plaintext pairs)/28.
```

This uses no independence assumption for events. Matching the observed 86/12955 rate **in expectation** would require 81.4126% equal adjacent plaintext pairs. Native LP1+p56+p57 has 77/2978=2.5856% equal pairs. A no-repeat plaintext constraint increases the expected ciphertext repeat rate, rather than suppressing it, under this model.

## Empirical controls against original ciphertext

On all 2,979 solved-native runes (concatenating their nine records, explicit synthetic seams), the exact mean is 103.607. Two thousand independent right-wheel draws: minimum70, central95% 83–125, median104, mean103.7585. Four disjoint original 2,979-rune windows at offsets0,2979,5958,8937 have 18,16,30,17 repeats respectively; all fall below the sampled minimum. This is finite random-key evidence, not an exact extreme-tail probability or universal key bound.

Terminal original p54 black223 + p55 all76 =299 runes has 3 repeats (2 fit,1 held, none on seam). Nine disjoint native299 controls with 1,000 right permutations each have exact means 10.14–10.46; counts <=3 range4–14 per thousand. All original statistics use the frozen physical split, including the carry. The right-only repeat calculation matches full independent left/right encryption in 30 cross-checks. Seed 0x3124e001. The short terminal case is uncommon but possible; the long-window discrepancy is the stronger obstruction. No arbitrary key-conditioned minimization, independent-event tail extrapolation or claim that the actual author chose a uniform key.

## Decision

Do not prioritize this fixed Chaocipher adaptation without an independent cue selecting its starting wheels, a source-defined aligned crib, or a different authenticated repeat mechanism. A known-crib receiver is reusable, but it has not been calibrated as ciphertext-only and no p54 inverse is warranted from these controls. This does not exclude arbitrary adaptive two-wheel variants, adversarially chosen keys, or a separate collision-control layer. The strong mathematical repeat law makes the ordinary Chaocipher explanation of LP2's most important original structural anomaly considerably less attractive.

Reproduce:
- `node sims/lp2_chaocipher_crib_calibration.cjs` — [raw controls](lp2-chaocipher-crib-calibration-output.json), commit ac0b7c1dead9127ba83466f9d3960ab77cefeb45.
- `node sims/lp2_chaocipher_repeat_gate.cjs` — [raw output](lp2-chaocipher-repeat-gate-output.json), commit 3b51ddb441e9a1d495d1724de28f734366432927.

Both exact JavaScript cores executed against the fetched source bytes; standalone Node filesystem wrappers not separately executed. The first test initially used the paper's inconsistent prose vector, failed, then was corrected to the independently specified table and algorithm.
