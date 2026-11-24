# P8 red XIX and the complete 19×91 chapter: is columnar transposition the final cipher layer?

**Agent10, 22 November 2026. Evidence class:** a source-selected 19-column original-rune operation with a strong *direction-of-processing* discriminator. A final columnar permutation of an ordinary low-doublet chain ciphertext fails under four natural layouts. **No plaintext, key or URL was recovered.**

## An executable human clue, separate from numerical archaeology

The original first four red runes on physical p8 are **X I X M** in Gematria Primus transliteration. The initial **XIX** spells Roman **19**; the fourth rune M also has the GP zero-based index 19. That 19 is especially pertinent to a 2014 Cicada solver, since the contemporaneous signed Stage11 message has eleven conspicuous whitespace-run prime lengths **2,3,5,7,11,13,17,23,29,31,37**, omitting 19. The latter runs are *mostly trailing whitespace and not PGP-authenticated* by canonical clear-signature verification, so this is a possible historical clue, not an authenticated author instruction.

The visually bounded p8–14 chapter contains **1,729 printed GP runes** in seven physical pages, **exactly 19 × 91**, beginning with that p8 Roman title. Cicada historically used columnar transposition in its 2014 puzzle; treating width19 as a proposed chapter-wide rectangular layout is an independently writable operation, although the manuscript does not give a 19-letter column key or state that any transposition applies here.

The unknown p8–14 source runes, in original reading order, contain only **9 adjacent equal-rune pairs among 1,728 adjacent positions**. These low-doublet statistics characterize the unknown LP2 ciphertext extensively and are not produced by generic GP29 uniformly keyed streams after arbitrary permutations. Therefore a candidate **last** columnar transposition applied to a low-doublet inner stream has a falsifiable directional prediction: in general it would destroy that suppression at the original output.

## Four frozen complete inverse permutations

For the exact original 19 columns × 91 rows, decode all runes, including the p8 12-rune red heading, under the following standard ways of writing/reading a rectangular array:

| Proposed final operation, inverted on the actual source | Equal pairs after inverse | Fraction of 1,728 |
| --- | ---: | ---: |
| Unfill columns, then read rows | **61** | 3.5301% |
| Unfill rows, then read columns | **51** | 2.9514% |
| Reverse alternating rows before columnar read | **55** | 3.1829% |
| Read columns in reversed natural order | **61** | 3.5301% |
| Unmodified actual printed p8–14 ciphertext | **9** | 0.5208% |

This is the opposite direction from that predicted by a final columnar shuffle of an anti-repeat plaintext-independent chain cipher: the *already printed* source has suppressed self-transitions, while each proposed unshuffled inner stream has ordinary near-random GP29 doublet frequency. Index of coincidence remains **0.03446048** under any pure permutation, so none recovers native-GP linguistic symbol concentration or continuous plaintext. Source page boundaries are preserved for counting original runes; none of the nine original equal pairs occurs at a physical-page seam.

## Source-frequency-matched counterfactual

Generate **2,000** deterministic synthetic 1,729-rune *inner* streams using exactly the source's 29 GP-rune marginal frequencies, prohibiting adjacent equality except at the **nine exact repeat positions** observed in the original chapter. Thus every simulated inner stream has exactly nine repeats, a conservative approximation to the page's observed anti-repeat fingerprint. Freeze seed **0x33011914** and use the same four named forward permutations. This directly tests the question: what repeat counts are expected *after a final 19-column permutation*, if the prior inner string has the original low-repeat property?

| Proposed final permutation | Mean output repeats | Smallest over 2,000 | Cases with at most nine |
| --- | ---: | ---: | ---: |
| Row write / column read | **60.377** | 34 | 0 |
| Column write / row read | **60.636** | 38 | 0 |
| Alternating-row snake / column read | **58.267** | 36 | 0 |
| Row write / reversed-column read | **60.325** | 33 | 0 |

All outputs retain 1,729 original-like runes and marginal distribution, differing only by a fixed known 19-column permutation. Each of the four modes independently exactly round-trips genuine solved **95-rune p57 English-GP text** after a corresponding 19-column encryption, as well as all 1,729 untouched original runes. Consequently the original-vs-control mismatch is not a decoder inversion bug.

A simple independent uniform-pair binomial approximation gives **P(X≤9 | n=1728, p=1/29) ≈ 1.89×10⁻¹⁶**, but the independent-pair model does not exactly describe the source's structured pairs. The stronger case-specific statement is the explicit 2,000-draw source-shaped comparison above, where the smallest output count is over three times the original. This does not assign discovery-adjusted author-intent probability to the Roman19 or chapter-length coincidence.

## Authentic p56 cipher: full original plaintext-inversion gate

The strongest simple composition of this proposed source-selected 19-column transposition with an **actual solved-page method** would first undo the rectangular permutation and then decrypt through the p56 consecutive-prime Euler-totient GP29 schedule, allowing plaintext index-zero F to be copied without consuming a key symbol. This makes a strict algebraic test: at each rune the same ciphertext can either be literal F if its index is zero, or an encrypted non-F rune after the current prime is subtracted (or added in the opposite-sign control). Keep **all** legal prime-clock states at each position without fitting language or choosing a mask. Once no states remain, **no** full native-GP plaintext is possible under the proposed combined mechanism.

| Original p8–14 input orientation | First impossible index, subtract φ(prime) | First impossible index, add φ(prime) |
| --- | ---: | ---: |
| Original printed chapter without transposition | **30** | **26** |
| Undo column fill → row read | **20** | **47** |
| Undo row fill → column read | **15** | **215** |
| Undo snake-row column fill | **125** | **47** |
| Undo reversed-column fill | **6** | **11** |

All ten full **1,729-rune** original alternatives fail by rune215 at the latest, **even granting every legal plaintext-F bypass**. This is an exact necessary-condition failure, independent of a language model or statistical threshold. The implementation forward-encrypts real source-native 95-rune solved p57 plaintext repeated to exactly1,729 runes under both actual p56 arithmetic signs, then applies each of the four 19-column permutations. Every one of the **eight** planted full-length inverses recovers the complete legal prime-clock path after undoing the permutation. The source-exact Windows Node22 rerun **[PASS 45077466040](https://github.com/FlareZ123/liber-primus/actions/runs/45077466040)**.

This further excludes **an immediately post-columnar unmodified p56 φ-prime/F-transparent method on the full p8–14 chapter**. It cannot exclude a different genuinely selected key, resetting at page boundaries, or an independent encoder preceding the proposed transposition.

## Exact all-secret 19-column order and ordinary prime-clock inverse (Agent13, 24 November 2026)

The previous four specified orientations leave arbitrary classical column keys untested. Split the source into 19 consecutive 91-rune column blocks. For an order π the within-row repeat cost is the sum of adjacent column weights w[a,b]=Σ_r [C[a,r]=C[b,r]]. Held–Karp D[S,j]=min_k(D[S−{j},k]+w[k,j]) exhausts 19! orders. The 7! brute control agrees (minimum 10). Original minimum **15**; one minimizing order [13,11,5,1,18,17,14,2,8,16,0,9,3,10,15,6,7,12,4] adds five row seams, total 20. No classical column order reconstructs a stream with at most nine repeats. This is conditional on the inner-stream bound, not a universal transposition exclusion. Prefix-only optimization (60 rows) yields 8 repeats then 23 on 31 remaining rows. Three random secret-permutation repeat plants yield true internal cost 8, minima 5/7/4, and none recovers the true adjacency path even up to reversal. Repeat minimization alone is not a key estimator. Row-local shuffle rival min5/one total8 remains possible; frozen prefix winner has17 held-out repeats.

For the **ordinary consuming** prime-minus-one clock from prime2, distinct from authentic transparent-F, the two layer orders admit exact position-dependent DP over every column order. Plaintext at row r, destination t, observed block j is C[j,r]−K[19r+t] mod29 (inner prime), or C[j,r]−K[91j+r] (outer prime). Native row-start unigram/within-row bigram score decomposes into adjacent factors; train on 60 rows (1140 runes), score 31 held-out rows (589). Two 1729-rune native plants at offsets0/1250 of the solved 2979-rune tape overlap one another, but each LM excludes its own target positions. Both uniquely recover their independently planted hidden permutation, all 2280 training and 1178 held-out runes and exact full replay. Original training/holdout −4.132660/−4.339810 and −4.237906/−4.394285, native holdout −2.776636/−2.720052. Original outputs are nonprose despite exact replay. Authentic F-hold paths die at index272 for the ordinary-fit inner order and30 for outer prime independent of order. The all-key authentic inner F-hold search below closes the native-alphabet case. No plaintext/key is claimed. The maximum is exact for the specified objective, not all-language impossibility.

[Executable](../sims/lp2_p8_xix19_allcolumn_inverse_sft.cjs) · [raw results](lp2-p8-xix19-allcolumn-inverse-output.json). Core executed on actual inputs in connected JS; no standalone Windows CI claim.

## Authentic transparent-F joint inverse, all secret column keys

The inner authentic φ-prime variant left open by the ordinary-clock experiment is now solved as a **bounded feasibility** problem. Let h denote the number of literal F holds before a plaintext position i=r·19+t. On an assigned physical column j, consuming gives p=(C[j,r]−K[i−h]) mod29 and is legal only if p≠0; if C[j,r]=0 a separate transition emits literal F and increments h. Let e count decoded EO/OE (indices12/22), absent from the pinned 2,979-rune native solved reference. At each depth of the column-permutation DFS, propagate bitsets of possible h for each e≤budget through all 91 rows. For each known prefix column the exact transitions are applied; the unassigned suffix may consume anything at zero rare cost and may add any number of holds up to its actual number of ciphertext zero cells. This relaxes only unknown positions, never eliminates a legal completion. At full depth the transitions are exact. Thus an exhausted search excludes all 19! keys and all hold masks within the stated budget, independent of language scoring.

| Rare-rune budget | Nodes visited | Complete legal keys |
|---:|---:|---:|
| 0 | 4216 | 0 |
| 1 | 12820 | 0 |
| 2 | 31281 | 0 |
| 3 | 62846 | 0 |
| 4 | 113876 | 0 |
| 5 | 200679 | 0 |
| 6 | 349385 | 0 |
| 8 | 936609 | 0 |
| 10 | 2277662 | 0 |

All original runs exhausted their search trees (no timeout/node cap). Any original legal plaintext therefore needs **at least 11 EO/OE** under this model, unlike the pinned native donor with zero of either. This is not an unconditional all-GP29 rejection. Indeed unrestricted GP29 has a legal order [0,2,4,1,8,16,17,12,5,14,15,18,6,13,11,9,3,10,7], found after 2619974 prefix nodes in first-solution mode. For that single order, exact fixed-key DP minimizing rare count gives 129 EO/OE, score −4.456648 nats/rune; language-only bigram optimum gives 134 EO/OE, −4.456201. Both re-encrypt exactly but are nonprose. The 129 is not a global lower bound.

Native plant (first 1729 native runes, frozen hidden order [18,16,15,9,2,1,11,12,0,17,13,7,5,14,8,4,6,3,10]): full budget0 enumeration visits 85495 nodes and recovers the unique true key. Exact fixed-key DP with rare-minimization then target-excluded native bigram tie-breaking recovers 1727/1729 runes and full replay, score −2.769521. Language-only optimum recovers 1714/1729 with one rare rune and slightly better score −2.769437; F-mask ambiguity is real, not exact full plaintext recovery. The planted true alphabet/key is not supplied to the DFS except the general native 27-rune constraint.

[Joint C++20 solver](../sims/lp2_p8_xix19_fhold_joint.cpp) · [canonical input generator](../sims/lp2_p8_xix19_fhold_input.cjs). Example: generate the two lines using Node, build with an optimized C++20 compiler, then pass input file, 91 rows, node limit 10000000, original, budget 10, all. The original bound was executed locally with GCC; no independent Windows CI run claimed. The ordinary-clock and transparent-F results together retire a direct classical XIX+fixed phase-zero p56 cipher for native GP27 or up to ten rare exceptions; the unrestricted GP29 model remains mathematically possible but lacks a linguistic solution.

## Decision and remaining plausible path

**Reject ordinary last-layer 19-column transposition after a generic low-doublet stream** as an explanation of the original p8–14 anti-repeat ciphertext under all 19! classical column orders at the frozen nine-repeat bound (as well as the earlier four specified layouts). The source's nine doublets appear in the form one would expect **after** a final anti-repeat stage, rather than after an ordinary column shuffle.

This is a *conditional processing-order discriminator*, not an algebraic exclusion of all columnar systems. An **earlier** 19-column permutation followed by a separate final anti-repeat encoder could preserve the exact source fingerprint, as could an exotic nonrectangular transform or a different inner repeat bound. Those alternatives need a physical key or readout rule and a plaintext-predicting test. The red XIX and 19×91 dimensions by themselves do not recover any words.

The direct p8–14 chapter-wide width19 test is distinct from the older [19-column + solved-p56 φ-prime inverse](lp2-2014-prime19-columnar-phiF-original-gate.md), which covered different chapters (p0–2, p3–7, p40–53 and p55). It does not contradict those bounded negatives.

**Complete reproducible original-source test:** [sims/lp2_p8_14_xix19_column_finalorder_original_sft.cjs](../sims/lp2_p8_14_xix19_column_finalorder_original_sft.cjs), Windows Node22, **[original 2,000-null CI PASS 45077231850](https://github.com/FlareZ123/liber-primus/actions/runs/45077231850)** and **[full φ-F inverse CI PASS 45077466040](https://github.com/FlareZ123/liber-primus/actions/runs/45077466040)**. Inputs are the canonical original-source rune arrays, source-selected red Roman title, original 19×91 extent, and genuine solved p57 95-rune round-trip control.
