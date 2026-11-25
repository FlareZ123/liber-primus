# Word-boundary-free authentic F-bypass source-crib recovery and exact key-period gate

**Agent 10, 25 November 2026.** No unknown LP2 plaintext or authentic unknown-page key recovered. This is a finite plaintext-source recovery attack, independent of printed segmentation, with a fully specified subsequent consumed-key inversion.

## Mechanism and motivation

The known p56 prime-minus-one cipher demonstrates plaintext F transparency: P[i]=F implies C[i]=F, and the key clock does not advance. The converse is false. The [corrected F-capacity report](lp2-literal-f-fullbook-native-capacity.md) establishes this direction. The [two-rune ending-F capacity](lp2-ftransparent-two-rune-word-end-f-capacity.md) assumes genuine word breaks; [current segmentation evidence](../workplace/integrated-original-inversion-challenge.md) leaves that assumption unsettled. Here no printed group, line, sentence or page-boundary grammar is used. Unlike the [earlier rare-marker source scan](lp2-original-doublet-mask-wordfree-sourcepassage-crib-gate.md), this uses actual literal F (not a hypothetical equivalence between a secret rune and repeated ciphertext).

For a native source passage of length N, enumerate every contiguous offset and both source reading directions. Test whether every plaintext F position falls at an observed ciphertext F. The implementation uses a next-F array for early rejection; every possible offset is still tested. A surviving passage determines the exact consumed additive key stream K[j]=(C[i]-P[i]) mod29 at each non-F plaintext position, and the hold mask at each F. A cyclic key of period q exists iff K[j]=K[j mod q] everywhere. The minimum period is obtained exactly by subtracting the longest proper border length (KMP prefix-function) from the key length. The negative sign convention is equivalent by negating K.

## Original results

The nine already pinned native source texts are Shakespeare, Gibran, Emerson, Blake's Marriage of Heaven and Hell, the three Book of the Law files, KJV Passion excerpts, and Tennyson's Lady of Shalott (713,301 native runes combined). The exact inputs and counts by source, direction and scope are preserved in [raw JSON](lp2-fhold-wordfree-source-crib-output.json). Source encoding follows the existing longest-match GP29 historical convention including ING/IO. The nine chapter rune lengths are [729,1145,1729,1903,1021,1433,1680,3008,308]; all 12,956 unknown runes are retained.

| Target | Tested offsets | F-compatible | F-free among compatible |
|---|---:|---:|---:|
| Chapter 1 | 1,413,498 | 0 | 0 |
| Chapter 2 | 1,406,010 | 0 | 0 |
| Chapter 3 | 1,395,498 | 0 | 0 |
| Chapter 4 | 1,392,366 | 0 | 0 |
| Chapter 5 | 1,408,242 | 0 | 0 |
| Chapter 6 | 1,400,826 | 0 | 0 |
| Chapter 7 | 1,396,380 | 0 | 0 |
| Chapter 8 | 1,372,476 | 0 | 0 |
| Chapter 9 | 1,421,076 | 1,984 | 1,702 |
| Opening black body | 1,413,732 | 0 | 0 |
| Physical p55 | 1,425,252 | 246,045 | 229,438 |
| Full unknown tape | 1,246,202 | 0 | 0 |

The short survivors are not cribs. For every one of the 1,984 final-chapter survivors and 246,045 p55 survivors, derive its exact consuming key sequence. **None has even two complete cycles of any period**, including the historically motivated 8 and 13. Minimum attainable period is 305 on the 308-rune chapter (307 consuming symbols) and 73 on p55 (76 consuming symbols). This is a finite all-offset, all-cyclic-key conclusion for the supplied source passages under the authentic F-hold clock, not a generic rejection of arbitrary running keys. No phase fitting is necessary because any fixed start phase is absorbed into the ordered key.

A secondary spacing-free exact invariant is adjacent FF capacity. All 12,956 ciphertext runes contain 458 Fs but only four adjacent FF pairs, at second-symbol offsets 2192, 7118, 7869, 8776. Any direct F-transparent plaintext can have at most four adjacent FF pairs. All full-length windows from Emerson (minimum 5), Blake (minimum 5) and KJV (minimum 7), in either direction, violate this weaker invariant. Shakespeare and Gibran minima are 2 and 3; 54,932 full-length candidate offsets satisfy this count bound but none survives exact positional inclusion. This does not establish an FF count bound on arbitrary word permutation: only within-word FFs survive arbitrary complete-word reordering.

## Controls and reproduction

Authentic p56: apply the known 84 prime-minus-one shifts, with the independently established single literal F at local offset 56. All 85 original ciphertext symbols replay. Two independent source offsets 12,345 and 54,321 in the 729-rune Shakespeare control, encrypted with separate deterministic synthetic random additive streams and actual F holds, each recover as the unique source offset out of 216,378 forward windows. They have 15 and 8 literal Fs respectively. The subsequent exact period extractor recovers planted period-8 and period-13 keys on 302 consuming symbols of a native 308-rune plant. These controls validate the source-crib and key-extraction method, not the historical use of these synthetic keys.

- [Source scan SFT](../sims/lp2_fhold_wordfree_source_crib_sft.cjs), commit 4208bfbc.
- [Raw scan output](lp2-fhold-wordfree-source-crib-output.json), commit 8af1a611.
- [All-survivor exact key-period SFT](../sims/lp2_fhold_wordfree_crib_keyperiod_sft.cjs), commit 633bf647.

Both scripts were executed on exact repository inputs via connected JavaScript; no CI claim. Reproduce under Node 22 directly. No new workflow needed.

## Decision

Reject direct forward/reverse contiguous reuse of these nine texts as the full unknown book or any of its first eight chapters under authentic F transparency, regardless of unknown additive shifts or original printed separators. For the short surviving final-chapter/page source offsets, retire direct cyclic additive key reuse (including all periods that repeat at least twice). Newly authored prose, word-permuted source text, noncontiguous quotation, loss of F transparency, or longer independent running keys remain possible. Only reopen source crib search for a genuinely new clue-selected text, a separately justified word-order inverse, or a source-selected key/operation; no candidate source passage is identified here.
