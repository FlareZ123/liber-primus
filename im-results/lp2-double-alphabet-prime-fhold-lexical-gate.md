# Two independent secret GP29 alphabets around the authentic prime clock

**Agent 3, 25 November 2026.** Exact conditional exclusions for two independently secret global permutations. No unknown LP2 plaintext or authentic key recovered. This is a different operation from the [inner-only](lp2-inner-alphabet-prime-fhold-exact-gate.md), [outer-only](lp2-outer-alphabet-prime-fhold-spacingfree.md), [permuted shift residues](lp2-prime-residue-permutation-fhold-spacingfree.md) and [single conjugated alphabet](lp2-p56-globalconjugation-two-longword-allsecret-original-gate.md) hypotheses.

## Explicit source transfer and graph inverse

Let S and T be independent bijections of GP29. Non-F plaintext P emits C=T(S(P)+sign*(prime_j−1) mod29), advancing j once. Literal plaintext F emits ciphertext F without advancing. The observed F may instead be a consuming emission. The known p56 prime-clock and LP1 alphabet transformations motivate the test, but no authentic LP2 clue selects two independent secret alphabets. The rival is a different representation or operation.

For a candidate lexical word, set x_p=S(p) and y_c=T⁻¹(c). Each consuming position gives y_c−x_p=sign*k_j (mod29); transparent F requires C=0 and gives no equation. The two sets of 29 variables each satisfy a separate all-different constraint. Simultaneous negation of both alphabets exchanges arithmetic signs, so solving positive sign with arbitrary independent permutations covers negative too. Global translation is gauge freedom; normalize x_0=0.

Use a weighted rollback disjoint-set graph. Relative potentials are fixed in each connected component. Each component holds two 29-bit residue masks, one per alphabet. Union shifts the masks by the required modular offset; cycle disagreement or an intersection on either same-side mask is an exact contradiction. Disconnected-component translations can be completed by a two-mask exact-cover search; isolated variables can then fill unused values independently. The original branches below die before component completion, so the negative needs only exact necessary constraints.

Every earlier F-hold count from zero through the preceding visible ciphertext F count is granted independently for each selected word. This is a superset of the genuine hidden-clock paths. The lexical register is the pinned TextBlob dictionary plus native solved spellings and independent Shakespeare, Gibran and Emerson GP conversions; identical GP tapes are deduplicated. There are 867 12-rune, 422 13-rune and 173 14-rune forms. Original parse preserves 12,956 runes and 2,896 groups.

## Page-reset original result

At historical first-prime resets on each physical page, sort the seven intact original groups of length 13–14 by the number of locally consistent candidate traces. Only the first three are required:

| Original word index | Page | Local offset | Length | Locally consistent traces |
|---:|---:|---:|---:|---:|
| 833 | 16 | 0 | 13 | 228 |
| 1353 | 25 | 46 | 14 | 254 |
| 2341 | 43 | 37 | 14 | 532 |

228 first-group traces and 555 two-group traces survive; all 295,260 attempted third-group extensions fail. In total 353,400 graph extensions are visited, no cap hit. Consequently no shared pair of secret permutations can map all three selected groups into the stated finite register under this page-reset clock and literal F. This excludes the full (29!)² raw key space under those lexical premises, including both arithmetic signs.

## Illustrated-chapter reset original result

The initial seven-longest-anchor search and a larger 25-anchor naive DFS both reached the 30-million-extension cap; neither is evidence of impossibility. An exact bitset join over pair-compatible traces eliminates the cap. Among the 25 intact original groups of length 12–14, take the four with fewest locally consistent traces (a deterministic CSP variable-ordering decision):

| Word index | Page | Chapter offset | Length | Preceding visible F | Local traces |
|---:|---:|---:|---:|---:|---:|
| 1458 | 27 | 3 | 12 | 0 | 600 |
| 444 | 8 | 140 | 12 | 1 | 1283 |
| 167 | 3 | 51 | 12 | 1 | 1302 |
| 833 | 16 | 159 | 13 | 7 | 1622 |

All six pair projections are computed exactly. For every chosen trace, intersect its compatible-trace bitsets with those of all earlier anchors before applying the full weighted union constraints. 43,912 first-pair traces, 279 consistent three-anchor traces, and zero four-anchor traces survive. The fourth level requires only 932 candidate extensions after pairwise intersections. Total exact DFS extensions 294,317; no cap, no witness. This is an exact conditional exclusion of **one globally shared pair of independent alphabets** with chapter resets at the historical first prime.

## Controls, limits and disposition

Seeded distinct permutations on seven planted long lexical forms preserve the actual graph constraints at source-matched offsets, and the graph solver constructs complete bijections satisfying every planted equation. These controls validate graph feasibility and injectivity, not blind full-key recovery: the existing plant construction uses supplied lexical traces, repeatedly selects a first eligible form of each length, and assigns absent symbols arbitrarily. The original contradictions are within-component and do not depend on a heuristic language score or the exact-cover completion search.

The tested cipher is rejected under each declared reset convention if the selected printed groups are intact words in the finite register. Unknown alternative spellings, changed segmentation, independent chapter-specific alphabet pairs, nonzero clock starts, other bypass symbols and other ciphers remain outside the proof. Do not increase arbitrary origin ranges or layer complexity without an independent clue.

[Page SFT](../sims/lp2_double_alphabet_prime_fhold_lexical_sft.cjs) · [Page result](lp2-double-alphabet-prime-fhold-lexical-output.json) · [Exact chapter pair-join SFT](../sims/lp2_double_alphabet_prime_fhold_chapter_pairjoin_sft.cjs) · [Chapter result](lp2-double-alphabet-prime-fhold-chapter-pairjoin-output.json). Cores executed in connected JS; standalone wrappers not separately tested in Node. No CI created. Raw capped exploratory searches remain explicitly marked limited in their JSON outputs.
