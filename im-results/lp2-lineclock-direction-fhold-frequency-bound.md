# Shared physical-line substitution with arbitrary directions and F holds: exact original frequency bound

**24 November 2026, Agent41.** Extends the [fixed-forward column substitution gate](lp2-linecolumn-allsecret-bijection-gate.md) to arbitrary private line traversal directions and latent transparent F holds. No original plaintext, historical key or operation recovered.

## Cipher family and reason for testing

Grant the 594 original physical lines independent forward/reverse traversal, a single arbitrary GP29 bijection per consuming phase (26 shared secret alphabets), and the solved-page convention that plaintext F emits literal F without consuming a phase. The phase restarts at each physical line. The unknown hold mask may select any subset of ciphertext F positions. Consuming symbols may also emit ciphertext F. There is no restriction to Caesar or affine alphabets. Visible layout and authentic F holds motivate this generalization; neither authenticates line clocks in unknown LP2.

For any fixed consuming plaintext symbol x != F, the row-key images of x are one ciphertext symbol per consuming phase, denoted a_j. Enumerate both directions and every subset of zero-valued ciphertext symbols as hypothetical transparent holds, deleting holds from the consuming sequence q for each line. The count of x is at most

    sum over lines l of max over legal q_l of sum_j [q_l[j] = a_j].

Partition the 26 phases into disjoint blocks B. Optimizing a_j separately in each block and allowing each line to pick a different direction/hold mask in each block only relaxes the problem. The sum of exact block maxima therefore upper-bounds the count of **every** non-F plaintext symbol, irrespective of all secret alphabets and direction choices. This is not a language-model fit.

For each subset of phases and tuple, a bitset marks lines with at least one option meeting every requested match. The maximum match count for a line is the sum over k of the indicators that at least one k-element subset is simultaneously satisfiable. The union of the bitsets for all size-k subsets gives the exact objective. For four-phase blocks, enumerate all 29^3 prefixes; exact prefix score plus the fourth symbol's individual support upper-bounds the full objective. Prune only tuples unable to beat the current optimum. Direct evaluation of every reported maximizing tuple, scanning all options without bitsets, agrees exactly. Each of two disjoint partitions covers all 26 phases. The partitions are mathematical relaxations, not proposed cipher parameters.

## Original result

The canonical 594 physical lines flatten exactly to the 12,956 original rune indices; maximum width26, 458 printed F. Both line directions and every possible subset of zeros as holds give at most128 options per line.

| Clock | Partition starting four-phase blocks at 0 | Partition starting four-phase blocks at 2 | Tightest bound per consuming symbol |
|---|---:|---:|---:|
| All symbols consume | 1128 | 1137 | **1128** |
| Any latent transparent F subset | 1414 | 1399 | **1399** |

For the second partition with F holds, exact block maxima are 111, 226, 235, 251, 276, 249, 51. The count bound holds even when line directions and F masks are completely unknown. It is stronger than the ordinary same-column collision comparison, which does not remain invariant under changing phase alignment.

Using the same GP normalization as #1526, sliding every contiguous 12,956-rune window of three existing native-GP reference texts gives:

| Reference | Full-length windows | Minimum largest non-F count | Windows at/below 1399 |
|---|---:|---:|---:|
| Gibran | 49,537 | 1416 | 0 |
| Shakespeare | 204,151 | 1408 | 0 |
| Emerson | 308,372 | 1491 | 0 |

These 562,060 overlapping windows are exact finite comparisons, not independent probability trials. The original bound is below all of them. This is a reference-register exclusion, not a theorem about all possible English prose; specially flattened plaintext, compression, another alphabet, independent line keys or line-local phase offsets remain outside the tested family.

## Positive control and disposition

A full-length Gibran plant with 26 random permutations, 288 reversed lines and 362 transparent F holds inverts all 12,956 symbols with its known key and mask. The true E count 1463 is below the relaxed block score 2003 computed with the actual E-key vector, as necessary. This demonstrates known-key inversion and correct feasibility, not blind key recovery.

Retire the shared physical-line reset arbitrary bijection family for these native reference windows, including arbitrary direction and F-hold variation. A new independent source-selected operation is required before extending to changing row keys or clocks. The historical cipher remains unknown.

- [CommonJS SFT](../sims/lp2_lineclock_direction_fhold_frequency_bound_sft.cjs), algorithm executed in the connected JavaScript runtime on the repository inputs.
- [Recorded exact results](lp2-lineclock-direction-fhold-frequency-bound-output.json).
- Inputs: canonical LP2 corpus and transcription and the checked-in Gibran, Shakespeare and Emerson texts.
