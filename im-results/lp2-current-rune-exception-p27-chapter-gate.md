# Chapter-local current-rune zero marker fails the original p27 word and whole-chapter English controls

**18 November 2026, Agent 1.** Original-input finite exclusion under intact GP29 native-English words and a chapter-stationary designated plaintext rune. No creator key, unknown-page plaintext, original operation, or destination recovered. Reproducer: [single CommonJS SFT](../sims/lp2_current_rune_exception_chapter_sft.cjs).

## Reversible proposal and independent reason to test

**Relation to prior work:** The book-global fixed-current-rune marker was previously rejected by the [all-29 whole-book word-shape gate](lp2-all29-zero-step-wordshape-gate.md) and [earlier fixed-marker controls](lp2-fixedmarker-original-wordshape-allsecret-gate.md). The new decision here is stronger in a distinct direction: granting a fresh designated rune at every *visual chapter* still fails in physical pp27–32 alone, conditional on the independently frozen 12-rune lexical witness and ordinary source-native English. It does not establish a new original mechanism.

The original unsolved 55 rune-bearing LP2 pages contain 12,956 runes with only **86 adjacent equalities** among 12,901 same-page comparisons. A source-visible physical p27 word has **two spatially separate doublets**. A simpler historical class to try before invented null side channels is a differential alphabet where every current plaintext GP29 symbol maps to one of the 29 possible ciphertext successor differences.

Let \(P_i,C_i\in\mathbb{Z}_{29}\) and let \(f_i\) be a permutation of all 29 symbols. A single designated plaintext rune \(r\) is fixed for a whole visual chapter, while \(f_i(r)=0\) for every position \(i\) in that chapter. The remaining 28 images of \(f_i\) may form an **arbitrary fresh secret permutation at every rune position**. The lossless forward channel for consecutive runes within a physical page is

\[
C_i=C_{i-1}+f_i(P_i)\pmod{29}.
\]

The unique inverse is \(P_i=f_i^{-1}(C_i-C_{i-1})\). A page can choose an independent first-rune IV, so all first-page runes are entirely excluded from the following test. For every other position the one invariant, independent of *all* 28-way secret maps and initial states, is

\[
C_i=C_{i-1}\quad\Longleftrightarrow\quad P_i=r.
\]

This is different from Agent 2's **fixed predecessor-plaintext-difference** marker gate: the present zero event is a fixed **current plaintext symbol**. It grants changing secret substitutions for every other symbol at every site and does not assume any p50 byte key.

## Original fixed word and the eight allowed plaintext symbols

Physical p27, source image 44.jpg, contains the original printed 12-rune word beginning at local rune offset 79:

- GP29 indices: **12,4,9,15,3,3,5,24,18,26,18,18**.
- Adjacent equality occurs at local indices **5** and **11**, and nowhere else in that word.

If this length-preserving transport preserves the whole printed GP-English word, its plaintext must have the same symbol \(r\) at local indices 5 and 11 and cannot have \(r\) at the other positions 1..11. Testing the pre-existing independent 29,058-word TextBlob lexicon using the repository's pinned source-native GP29 spelling rules yields **25 possible 12-rune words**, whose union of possible \(r\) symbols is exactly:

**C, N, S, T, E, L, D, A** (GP indices 5,9,15,16,18,20,23,24).

This is a *necessary condition under this finite word dictionary*, not a dictionary proof against unknown words, Latin, changed token boundaries, non-GP letters or private names. In particular, some native words genuinely satisfy the two-doublet pattern: COMMUNICATION has GP-index N at positions 5 and 11. The positive plant encrypts and decrypts it with exactly two disjoint ciphertext doublets. The transport is mathematically feasible, so a test of the complete source is necessary.

## Complete p27–32 visual-chapter original test

The authentic p27–32 chapter contains **1,433 ciphertext runes**, divided across physical page starts at zero-based chapter offsets **[0,234,503,780,1043,1312]**. Exactly **13** of the 1,427 eligible same-page transitions repeat their previous ciphertext rune.

A chapter with constant \(r\) would require **exactly 13 occurrences** of that particular plaintext GP symbol at those 1,427 non-start positions. Permit *all* eight dictionary-compatible \(r\) choices, every secret 28-way permutation per site, and six arbitrary page-start IVs. Enumerate **every contiguous 1,433-rune** native GP29 control window, with the same six page cut offsets, in the previously fixed control books. The controls use the standard QU→CW, V→U, K/Q→C, Z→S, ING→NG and IO→IA conversion, with no ciphertext-fitting.

| Independent source | Native GP29 runes | Exhaustive 1,433-rune overlapping windows | Lowest designated-rune occurrence count, after excluding six starts | Windows attaining the required 13 for any of eight markers |
|---|---:|---:|---:|---:|
| Gibran, *The Prophet* | 62,492 | 61,060 | **18** (C) | **0** |
| Shakespeare | 217,106 | 215,674 | **22** (D) | **0** |
| Emerson | 321,327 | 319,895 | **24** (C) | **0** |
| **Total** | | **596,629** | | **0** |

Across those controls, symbol-specific minima after the six page starts were:

| Control | C | N | S | T | E | L | D | A |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Gibran | 18 | 62 | 39 | 56 | 130 | 27 | 32 | 66 |
| Shakespeare | 27 | 52 | 59 | 49 | 110 | 33 | 22 | 62 |
| Emerson | 24 | 62 | 39 | 65 | 130 | 25 | 29 | 69 |

These are exhaustive *overlapping* windows, not 596,629 statistically independent trials. This is a deterministic finite-control exclusion, with no Monte Carlo p-value. A full original 12,956-rune whole-book search would only impose additional obligations; the single source-visible p27 chapter already fails this architecture under the three native source models.

## Reproducibility and exact interpretation

The exact original-source Windows/Node22 execution passed syntax, all fixture assertions and all **596,629** complete overlapping control windows in [manual CI run 44211628148](https://github.com/FlareZ123/liber-primus/actions/runs/44211628148), job `original-current-rune-exception`.

The [SFT](../sims/lp2_current_rune_exception_chapter_sft.cjs) reads the original canonical corpus, pre-existing spelling dictionary and all three unchanged source texts. It asserts the exact p27 witness, candidate word and symbol counts, source page cuts, original chapter repeat total, all native text rune lengths and window counts, all three minima and the absence of a single compatible window. It includes an invertible changing-permutation plant on COMMUNICATION, exact original p27 ciphertext decode/re-encrypt, and the 95-rune clear solved-page plant.

**Decision:** The designated-plaintext-symbol explanation cannot stay constant from physical p27 through p32 if the intact chapter is ordinary GP29-native English resembling any of these three complete source books and the p27 word is represented in the pinned dictionary. Even giving all other 28 successor mappings arbitrary independent keys per rune does not repair the impossible zero-event count. The same test does **not** exclude a symbol exception that changes inside that chapter, arbitrary plaintext spelling, word resegmentation, a non-GP intermediate, or a different cipher architecture.

No further key search is justified for this particular chapter-stationary model. The missing authored within-chapter update/opcode remains the next necessary input to any related dynamic exception model.
