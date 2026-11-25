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

## Blind control and remaining key ambiguity

A separate control plants two independently seeded permutations on eight distinct long Shakespeare groups (12–14 GP runes, at least eight distinct symbols), each with its real preceding/following donor text and a fresh first-prime reset. Anchor offsets are 0,3,9,12,15,18,21,23; the dictionary and visible ciphertext supply candidate traces. Exactly one eight-group trace tuple survives the uncapped graph join: all eight word tapes and all eight prime cursors are correct. It fixes one connected component containing 20 inner and 26 outer variables. The remaining 9 inner and 3 outer symbols are isolated. An arbitrary completion obtains 386/608 following native runes, all forward-replay; the best posthoc simultaneous gauge translation matches 49/58 raw key entries.

Using only the 101 preceding ciphertext runes and inferred anchor-endpoint cursor constraints, a capped 500,000-completion search selects a key with 101/101 preceding and 603/608 following runes correct (29/29 outer and 23/29 inner entries after gauge alignment). Because this search is capped, it is not a uniquely established optimum.

The uncapped quotient enumerates every outer completion, every visible-prefix-compatible hold mask, and assignments only to inner residues actually used by one of those masks; unobserved inner entries contribute their exact factorial multiplicity. This covers 2,177,280 complete gauge-normalized keys in 381,024 representatives, of which 1,612,800 complete keys have a legal prefix path. The best objective ties across 40,320 keys. The deterministic first exact winner again obtains 101/101 preceding runes, but only 459/608 following runes (seven legal continuations, one impossible; 29/29 outer and 21/29 inner gauge-aligned entries). Thus the earlier 603/608 is a favorable arbitrary completion, not a uniquely recovered key. No suffix is used for key fitting; the suffix decoder is bigram-ranked and trained on Gibran and Emerson, excluding the Shakespeare donor. The donor's long words are included in the finite lexical register, as required by the control design.

[Blind SFT](../sims/lp2_double_alphabet_prime_fhold_blind_control_sft.cjs) · [Blind output](lp2-double-alphabet-prime-fhold-blind-control-output.json) · [Capped completion output](lp2-double-alphabet-prime-fhold-completion-output.json) · [Exact completion quotient SFT](../sims/lp2_double_alphabet_prime_fhold_completion_quotient_sft.cjs) · [Exact quotient output](lp2-double-alphabet-prime-fhold-completion-quotient-output.json).

## Spacing-free joint optimizer calibration

A separate direct ciphertext optimizer removes lexical cuts. Exact forward/backward over latent F holds supplies expected ciphertext/prime-residue counts; alternating sorted inner assignment and Hungarian outer assignment fit the unigram model, followed by fixed-mask joint swap annealing and exact quadgram mask reoptimization. The first KOAN control (780 native runes, 580 fit/200 withheld) is excluded from training. Known-key exact Viterbi recovers 780/780, but blind optimization obtains only 40/580 fitting runes and no legal frozen continuation (2/29 entries in each normalized key). The blind optimizer therefore fails calibration; no original test or exclusion follows from it.

[Spacing-free SFT](../sims/lp2_double_alphabet_prime_fhold_spacingfree_sft.cjs) · [Control output](lp2-double-alphabet-prime-fhold-spacingfree-control-output.json).

## Controls, limits and disposition

Seeded distinct permutations on seven planted long lexical forms preserve the actual graph constraints at source-matched offsets, and the graph solver constructs complete bijections satisfying every planted equation. These controls validate graph feasibility and injectivity, not blind full-key recovery: the existing plant construction uses supplied lexical traces, repeatedly selects a first eligible form of each length, and assigns absent symbols arbitrarily. The original contradictions are within-component and do not depend on a heuristic language score or the exact-cover completion search.

The tested cipher is rejected under each declared reset convention if the selected printed groups are intact words in the finite register. Unknown alternative spellings, changed segmentation, independent chapter-specific alphabet pairs, nonzero clock starts, other bypass symbols and other ciphers remain outside the proof. Do not increase arbitrary origin ranges or layer complexity without an independent clue.

[Page SFT](../sims/lp2_double_alphabet_prime_fhold_lexical_sft.cjs) · [Page result](lp2-double-alphabet-prime-fhold-lexical-output.json) · [Exact chapter pair-join SFT](../sims/lp2_double_alphabet_prime_fhold_chapter_pairjoin_sft.cjs) · [Chapter result](lp2-double-alphabet-prime-fhold-chapter-pairjoin-output.json). Cores executed in connected JS; standalone wrappers not separately tested in Node. No CI created. Raw capped exploratory searches remain explicitly marked limited in their JSON outputs.
