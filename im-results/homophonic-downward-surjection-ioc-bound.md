# Static homophonic 29-to-k exact IoC and entropy bounds

**Classification: key-independent family constraint; no plaintext or key recovered.**

## Motivation and exact scope

The 29-symbol Gematria Primus ciphertext alphabet is larger than the ordinary 26-letter English alphabet. A simple non-GP hypothesis is therefore a fixed many-to-one substitution: each of the 29 ciphertext runes maps to one of k plaintext letters, with every output letter used. This is a homophonic-downward or surjective 29-to-k map.

The external [Dukotah measured-ceiling inventory](https://github.com/Dukotah/cicada3301/blob/f63501d8f2d835b80c30230eb89a1110fb9197d2/liber-primus/MEASURED-CEILING.md) lists this family as not yet searched. The present experiment does **not** attempt a key search. It gives exact key-independent extrema for **decoded IoC and decoded Shannon entropy**. The entropy minimum also excludes the formerly open k=24 case under the independent native English controls.

**Control correction:** a k-letter plaintext must be compared with a k-letter plaintext control, not a GP29 transliteration. The decisive controls below are therefore raw alphabetic A-Z streams. Earlier GP29-encoded Latin/Old-English frequency values are not used as direct k=26/k=25 controls.

## Exact bound

Let the 29 ciphertext symbols have counts c1,...,c29. A surjective map partitions these counts into k nonempty groups; each plaintext-letter count is the sum within its group. Since IoC is proportional to the sum of squared output counts, the maximum possible IoC for fixed k is attained by merging the largest 29-k+1 ciphertext counts into one group and leaving the other k-1 symbols as singleton groups.

This is an exact maximum over **all** secret mappings, not a heuristic or a sampled search. If the maximum is below a raw-language control, no fixed surjection can produce that register from this ciphertext.

## Original and raw plaintext controls

- Original stream: `resources/liber-primus/lp2-corpus.json`, 12,956 rune indices, GP29 alphabet, Git blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`.
- English: first 12,956 alphabetic letters from `resources/control/shakespeare_first300k.txt`, raw A-Z, blob `94c677ad9dd50771c6670e0c4e4dad9052b46d85`.
- Solved LP1 English: raw alphabetic letters from LP1 pages 1-16 only in `resources/liber-primus/lp1-plaintext-reference.txt`; the solved LP2 pages 56-57 and their hexadecimal hash are excluded, blob `beb43aac08b8482590c4430aadd1ee91da3876a0`.

The original stream has global IoC **0.034478398**, essentially the uniform 1/29 baseline **0.034482759**. The raw plaintext controls have:

| Control | Alphabetic letters | IoC |
|---|---:|---:|
| English / Shakespeare, raw A-Z | 12,956 | 0.064567603 |
| Solved LP1 English, raw A-Z, pages 1-16 | 3,229 | 0.066082125 |

## Maximum possible IoC by plaintext alphabet size

| Plaintext letters k | Maximum original-stream IoC |
|---:|---:|
| 29 | 0.034478398 |
| 28 | 0.037304148 |
| 27 | 0.042770549 |
| **26** | **0.050863136** |
| **25** | **0.061359726** |
| 24 | 0.074377691 |
| 23 | 0.089849467 |
| 22 | 0.107820740 |
| 21 | 0.128291510 |
| 20 | 0.151111317 |

**Every fixed global 29-to-k surjection with k >= 25 is excluded for native English** by the raw controls: even the most favourable 29-to-25 map reaches only **0.061359726**, below both 0.064567603 and 0.066082125. A 29-to-26 map is more strongly excluded at **0.050863136**. The first alphabet size not excluded by this scalar bound is k=24 (maximum 0.074377691); this is a remaining possibility, not a positive fit.

The natural three-pair homophone arrangement for k=26 has maximum IoC **0.042463313**. The most permissive k=25 shape is one five-way homophone class plus 24 singletons; its maximum is **0.061359726**, still below both raw English controls. Every other tested k=25 shape is lower:

| k=25 alias-class shape | Maximum IoC |
|---|---:|
| One five-way class | 0.061359726 |
| One four-way plus one pair | 0.053384510 |
| Two triples | 0.050444297 |
| One triple plus two pairs | 0.047857148 |
| Four pairs | 0.044962810 |

## Exact minimum Shannon entropy strengthens the bound to k=24

The original 12,956-symbol ciphertext has empirical Shannon entropy **4.856503614 bits/rune**. For every fixed surjection from 29 original GP glyphs to k single-letter symbols, the partition that groups the **30−k largest** source-count classes together, leaving the other k−1 classes singleton, simultaneously maximizes IoC and **minimizes output entropy**. This partition majorizes every other k-group frequency vector; empirical Shannon entropy is Schur-concave. The bound is exact for every secret mapping and is attained by an explicit group assignment.

| Output alphabet size k | Exact minimum decoded entropy, bits/rune |
|---:|---:|
| 29 | 4.856503614 |
| 28 | 4.781331806 |
| 27 | 4.679756145 |
| **26** | **4.560925122** |
| **25** | **4.430935257** |
| **24** | **4.290961410** |
| 23 | 4.143078369 |
| 22 | 3.988079071 |
| 21 | 3.826837083 |
| 20 | 3.660811046 |

The first **12,956 raw Shakespeare letters** include all 26 Latin letters and have entropy **4.172864607**. The independently solved **3,229-letter LP1** control includes **24 distinct Latin letters** and has entropy **4.138589607**. Both are below the rigorous minimum **4.290961410** for every static 29→24 grouping. The solved LP1 comparison directly matches the proposed 24-letter output register. This closes the **k=24 gap** left by the earlier IoC-only test, which excluded k≥25 but could not decide k=24. For k=23 the minimum 4.143078369 is slightly below the Shakespeare reference; the evidence does not justify excluding k≤23 or evolving/recurrent codebooks.

The updated existing [all-secret reproducer](../sims/homophonic_downward_surjection_ioc_bound.cjs) computes exact minimum entropy alongside maximum IoC for k=20–29, asserts the k24 English-control gap, and checks explicit extremal maps. The exclusion assumes each ciphertext rune deterministically produces **one** plaintext letter, preserving all 12,956 positions. Multiple-letter outputs, deletion/insertion, variable-length units, nonstationary key states and plaintext outside the measured English registers remain open.

## Independent per-body sensitivity

The source-defined nine-body partition from [the current section synthesis](../workplace/lp2-section-clock-ambiguity.md) was also tested, allowing each body its **own** arbitrary 29-to-26 map. The maximum IoC is below the length-matched raw Shakespeare control in each of the eight bodies of at least 700 runes. The 91-rune p33 interlude is too short for this per-body bound to decide.

| Body | Runes | Original IoC | Maximum per-body 29-to-26 IoC | Raw English control IoC |
|---:|---:|---:|---:|---:|
| 1 | 729 | 0.034082516 | 0.056143445 | 0.064976861 |
| 2 | 1,145 | 0.034633707 | 0.057762543 | 0.065786179 |
| 3 | 1,738 | 0.034486003 | 0.054788059 | 0.065364076 |
| 4 | 1,894 | 0.034494896 | 0.053699201 | 0.066350714 |
| 5 | 1,021 | 0.034274356 | 0.055082484 | 0.065137985 |
| 6 | 1,433 | 0.034186202 | 0.053499515 | 0.065273072 |
| 7 | 91 | 0.031990232 | 0.078632479 | 0.073260073 |
| 8 | 1,589 | 0.034349820 | 0.054591310 | 0.063429624 |
| 9 | 3,316 | 0.034462827 | 0.053196440 | 0.064092557 |

This does not prove that the cipher resets at these titles. It shows that even granting independent secret alphabets per source-titled body does not rescue a 29-to-26 static surjection in the eight substantial bodies.

## Decision and remaining space

- **Rejected under the measured native English registers:** all fixed global 29-to-k surjections with **k≥24**, including every arbitrary secret merge. The IoC argument excludes k≥25 and the entropy minimum independently excludes k=24.
- **Not resolved:** k≤23, per-body k≤25 maps, evolving or position-dependent mappings, variable-length outputs, digraph/codeword output, non-GP registers, and other language distributions.

The result is an exact frequency bound, not a decryption. It does not justify a brute-force alias search without a source-selected k, class structure, or output register.

## Reproduction

Run:

```sh
node sims/homophonic_downward_surjection_ioc_bound.cjs
```

The script reads canonical original rune indices and two raw-English controls, computes the exact maximum IoC and minimum decoded entropy for all k=20–29, checks fixed alias-class shapes, verifies explicit extremal maps, and runs the per-body 29-to-26 sensitivity.
