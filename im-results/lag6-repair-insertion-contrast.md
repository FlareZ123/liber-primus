# Affine lag-six echo: collision repair reproduces the spike, while one-null insertion fails a direct necessity

**Agent 1, 2026-11-10. Status: candidate generator and falsified submechanism; no actual LP2 ciphertext inverse, plaintext or key.** Tested against the exact 55 rune-bearing pages, 2,896 canonical whole words and physical-page layout. [Successful on-demand CI run 42763054181](https://github.com/FlareZ123/liber-primus/actions/runs/42763054181).

## Core observation and new mechanistic discrimination

A previously known exploratory relation among word-internal ciphertext rune indices is

```text
C[i] = T(C[i-6]) = (24 - 2*C[i-6]) mod29, for i>=6 in a word.
```

It holds in **80/1,290** eligible positions. The manuscript also has only **63 immediate equalities inside words**, **23 at genuine within-section word boundaries**, and **86 across the 12,901 physical-page-internal adjacent positions**. This strongly suggests that any proposed encoding must account for both a near-global anti-repeat rule and the localized lag-six structure.

A useful *forward* explanation is surprisingly simple: emit a uniformly randomized 29-symbol ciphertext trial, and whenever that trial equals the previous emitted rune, correct the collision with probability **0.81**. At positions six or later inside the same canonical word, use **T(C[i−6])** for the correction; elsewhere choose a uniformly random nonrepeating rune. If T itself would equal the preceding rune, choose a random different rune. This model predicts an excess of about `0.81 / 29 * 1,290 ≈ 36` affine lag-six matches above the chance baseline of `1,290/29 ≈ 44`, close to 80 observed.

The **0.81 rate is inferred from the observed repeat depletion**, and the particular T relation was selected on original ciphertext in earlier research. The match is therefore a mechanistic sufficiency check, **not independent cryptographic proof**. More importantly, overwriting a ciphertext symbol is generally **noninvertible** unless additional key/state or transmission information preserves the corresponding plaintext. This forward process cannot itself decrypt the manuscript.

## Joint exact-layout challenge

Implemented [a seeded, reproducible two-generator test](../sims/lag6_repair_insertion_contrast.cjs):

- **M0:** base uniform GP rune source, 81% collision repair to a random different symbol, continuous across words;
- **M1:** same source and repair rate, but at whole-word local positions 6+ the repair symbol is T of the earlier emitted rune at lag six.

Both use all actual source word lengths and preserve word, section and physical-page coordinates. A separate master transcript supplies the nine physical manuscript text sections; the code asserts exactly **2,887** eligible within-section word transitions. Each generator makes **1,800 independent deterministic books**, scans the identical predeclared diagnostics, and saves empirical full-generator tails. The source and scripts validate all 12,956 original runes; the original numerical point estimates are fixed assertions.

| Diagnostic | Original | M0 mean | M1 mean | M1 upper-tail p |
| --- | ---: | ---: | ---: | ---: |
| Within-word consecutive equalities | 63 | 65.60 | 65.95 | 0.666 |
| Within-section equal word endpoints | 23 | 18.91 | 19.15 | 0.213 |
| Within-physical-page doublets | 86 | 84.19 | 84.79 | 0.469 |
| Equal nonadjacent pairs in words length 4–9 | 526 | 511.74 | 511.90 | 0.263 |
| **Lag-six T matches** | **80** | 44.38 | **78.12** | **0.423** |
| Same-rune matches at lag five | **104** | 72.52 | 72.80 | **0.000555** |
| S→S matches at lag five | **11** | 2.55 | 2.59 | **0.000555** |
| Aligned identical runes across adjacent physical pages | 432 | 402.61 | 402.82 | 0.071 |

The broad joint fit is meaningful as an explicit simulation, but **M1 decisively misses the separate lag-five identity recurrence and its unusually concentrated S→S subset**. This missing structure must be explained before anyone promotes M1 to a viable complete encoding architecture. The last physical-page statistic is mildly elevated under both models; its reported p is uncorrected across research-selected diagnostics.

As a further check, consider the full 29-bin lag-six affine-residue histogram `R=C[i]+2*C[i-6] mod29`: residue 24 occurs 80 times. Among the other 28 residues, the observed Pearson statistic against their fitted flat common mean is **36.5322 on 27 nominal degrees of freedom**. M1's corresponding Monte Carlo mean is 27.1741, with upper-tail **0.1038**. Thus most of the apparent affine effect is concentrated in one residue; an otherwise nearly flat distribution is compatible with a sparse *symbol-rewrite* explanation. This observation alone does not identify the writer's mechanism.

## A direct, independent necessity for a reversible insertion variant

An obvious way to make collision repair lossless would be to **insert a special T-derived null between an existing doublet**:

```text
Original payload:     ... A A ...
With inserted null:   ... A T(C[i-6]) A ...
```

Under this *particular one-null-between-AA mechanism*, the inserted marker is necessarily flanked by two identical visible runes. This is a deterministic local prediction requiring no language model, unknown key, or frequency fit.

Of the 80 original lag-six T matches, **48 have their following rune inside the same word**. Of those 48, **only one** has equal left and right neighbours (`C[i-1]=C[i+1]`). The full corpus contains **27** such palindromes at the 731 positions with a following rune, and just one overlaps a T match.

Consequently, the vast majority of word-internal T matches **cannot be individual nulls inserted immediately between an otherwise adjacent equal-rune pair**. This rejection applies even if the proposed inserted symbol is computed from a secret key, because the visible neighbouring equality is necessary for the simple insertion placement. It leaves open multi-null runs, later rearrangements, positions at the end of words, and other reversible encodings. It also does not prove T matches are actual repairs.

## Interpretation and productive continuation

The forward generator explains why a word-local affine echo might coexist with globally strong anti-repeat suppression without preserving the H positions that an all-T rotor would preserve. Its noninvertibility is a critical obstacle. A credible next cipher candidate should be **reversible**, should reproduce both the 104 general lag-five repetitions and 11 S-specific ones, and should predict plaintext on new source positions. Purely resampling the same fixed 0.81 repair proportion and T formula cannot identify a key.

**Reproduce:** [CommonJS source](../sims/lag6_repair_insertion_contrast.cjs), requiring Node.js 22 and only existing local shared-corpus code. [On-demand workflow](../.github/workflows/lag6-repair-insertion-challenge.yml) and [full successful result](https://github.com/FlareZ123/liber-primus/actions/runs/42763054181). PRNG seeds: M0 `0x6a17f8b1`, M1 `0x6a17f8b1 XOR 0x538eb1cc`; 1,800 full-book replicates per model. No permanent CI trigger.
