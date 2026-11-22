# Exact six-page shared-pad exclusion for the seven-page botanical chapter

**12 November 2026, Agent 2. Status:** finite original-input architecture exclusion; **no unknown LP2 plaintext or authentic key**. The independently source-visible seven-page tree chapter is physical **pp8–14**. Its original runic lengths are **255, 268, 263, 273, 261, 272, 137**. The earlier source-image analysis establishes that alternating left/right trees are repeated unmirrored printing stencils, rather than an evolving branch key ([original tree census](lp2-p8-14-tree-stencil-source-gate.md)). The conspicuous original **p10 `7 G`** is a possible seven-page cardinality cue, but there is no explicit command to reuse a pad.

## A complete original-cipher decision rather than a tuned key search

A historically plausible but unsourced hypothesis is that the **same 255-position GP29 additive pad** is reused on consecutive physical tree pages, with each page allowed its own independent fixed Caesar shift. A seven-page shared pad must also apply to the **first six** pages p8–13, all of which have at least **255** runes. The shorter p14 cannot rescue a model that fails this necessary six-page condition.

Write the rune identities in `F,U,TH,...,EA` GP29 order, modulus29. Let each original page (j=0,ldots,5) have an arbitrary 255-symbol plaintext (P_{j,i}), an arbitrary common 255-symbol keystream (K_i), and an unknown page-static shift (s_j):

\[
C_{j,i}\equiv P_{j,i}+K_i+s_j\pmod {29}.
\]

This yields the **key-cancellation invariant** for every same-column pair:

\[
(C_{a,i}-C_{b,i})-(s_a-s_b)
\equiv P_{a,i}-P_{b,i}\pmod {29}.
\]

The same key cancels for **every** value of its 255 unknown symbols. Set (s_0=0) without loss of generality and examine **all (29^5=20,511,149) relative shift choices**. A genuine shared-pad inverse whose six plaintext streams are native GP English must leave a native-GP joint pair-difference distribution after one of these assignments. No plaintext is guessed or selected from the original.

The fixed language model is the **29-way signed difference distribution** (q(d)=\sum_x p(x)p(x-d)), where (p) is the GP29 rune distribution from the source-pinned Shakespeare control, Laplace-smoothed by one count per rune. The exact objective is

\[
S(s)=\sum_{a<b}\sum_{i=0}^{254}
\log q\!\left((C_{a,i}-C_{b,i}-s_a+s_b)\bmod29\right).
\]

This uses all 15 interpage pairs and 3,825 paired positions. Exhaustive search, not stochastic optimization, finds the maximum over **every secret additive page offset**. Four simple original-tree reading choices were frozen: all pages printed direction; reverse the three right-tree pages; reverse the three left-tree pages; reverse all six pages. Each reversed page is read from its actual physical last rune. No arbitrary rotations, offsets within pages or newly invented chapter breaks.

## Original results and independent native controls

For each orientation, extract six corresponding contiguous segments of each native control corpus with **exactly the seven original page lengths**, using 1,000 evenly spaced 1,729-rune windows per corpus. Score the first six streams with the *true* zero relative shifts. This score is a **lower bound** on that control's own all-shift maximum; the original receives every available shift advantage. The control samples are native GP29 English from Shakespeare (training), Gibran and Emerson (held out).

| Original reading | Exact best original log score, 29⁵ shifts | Original maximizing page shifts | Lowest native Shakespeare | Lowest native Gibran | Lowest native Emerson |
| --- | ---: | --- | ---: | ---: | ---: |
| All printed forward | **−12903.522** | [0,0,4,16,5,19] | −12853.607 | −12851.242 | −12841.611 |
| Right-tree pages reversed | **−12895.668** | [0,20,12,25,13,17] | −12858.519 | −12837.409 | −12829.865 |
| Left-tree pages reversed | **−12897.317** | [0,14,12,17,12,10] | −12851.607 | −12846.416 | −12833.459 |
| All pages reversed | **−12895.836** | [0,5,12,10,12,2] | −12859.053 | −12853.977 | −12828.323 |

Higher (less negative) is more compatible with the fixed native-GP difference model. In all **12,000** orientation × source windows, **zero** native controls have a score as low as the best original-cipher score, even before giving those native controls the benefit of optimizing their own page offsets. There are 3,000 controls per orientation, 1,000 per source. This empirical zero is evidence against the *specific* six-page shared additive-pad architecture under these native-English controls; it is not a universal language/cipher theorem or a corrected familywise significance assessment over untested architectures.

The simpler no-offset equality invariant corroborates the effect. Printed p8–13 have **140** identical runes in **3,825** aligned interpage comparisons; all 3,000 native same-layout samples have **177 or more**. For the complete seven-page overlap of length137, the original has **116/2,877** equalities, with native minima **128,130,134** across Shakespeare/Gibran/Emerson. These literal equality values reject only zero-relative-shift reading. The full 29⁵ optimized log-score above directly addresses the potential constant-offset rescue.

## Positive control and actual scope

An independent source-native 6×255 Shakespeare plant received an arbitrary nonconstant 255-symbol common pad (K_i=(13i^2+19i+1)\bmod29) and deliberately distinct page offsets **[0,7,13,19,23,11]**. The raw ciphertext showed **123/3,825** same-position equalities, while after applying the correct relative offsets it recovered **218/3,825**, exactly matching the native plaintext. Direct decryption and forward re-encryption recovered **all 1,530 GP symbols**. The planted true-score is necessarily no greater than its exhaustive optimum; the exact search is tested against this invariant. No original plaintext was used to select the pad, shifts or sample passage.

**Decision:** a page-local, cross-page **identical GP29 additive pad** is a poor candidate for the original seven-page tree chapter, **even when all 29⁵ page Caesar offsets are secret and the visible tree-side traversal is reversed**. This specifically rules out a reused single relative-position pad producing the pinned native-English class. It leaves open genuinely independent page pads, non-additive transformations, page-varying symbol maps, time-varying clocks, mixed language or text encoding, and unselected arbitrary rotations. It provides no evidence that the original p10 number7 is a key, and no justification for more unsourced shift sweeps.

**Reproduction:** [complete original-cipher and native-plant SFT](../sims/lp2_tree6_sharedpad_alloffset_sft.cjs), Node22 from repository root. It reads only the original canonical rune corpus and three pinned control sources; enumerates all (29^5) page-offset assignments for each of four orientations; asserts the exact original maxima, matched-native separation, correct positive plant and exact inverse. The new step was added to the existing **workflow_dispatch-only** [visual chapter shared-pad workflow](../.github/workflows/lp2-visual-chapter-shared-pad-manual.yml), preserving the earlier separate nine-chapter test. The nine-chapter test addresses common pad **across chapters**; this experiment instead tests common pad **between pages within one tree chapter**. A new CI run has not been confirmed here.
