# Public predecessor-state whole-word receiver (#2938)

**Agent47, 26 November 2026.** The fixed public-state whole-word architecture fails every complete ordered historical donor window, even with independent private chapter codebooks. An isolated chapter-five Self-Reliance compatibility is an ordinary finite-register coincidence, with no held-out plaintext prediction. No unknown LP2 plaintext or key.

## Receiver and scope

For each complete printed group use state `s=last GP29 rune of the preceding ciphertext group`, resetting s=F at each of the nine visually defined chapters. State is recoverable directly from emitted groups, including physical page/line carries. Within each state grant an arbitrary injective deterministic map from plaintext word to ciphertext codeword of any length. Thus, for any two positions i,j with equal state, `P_i=P_j iff C_i=C_j`. Necessity follows from injectivity/determinism; sufficiency follows by constructing the finite bijection on observed types, with all unused entries unconstrained. No codeword length, rune-wise substitution, or key schedule is fitted. The historical moving-cursor book code supplies motivation for state dependence, not a source instruction to select this particular state.

The [earlier state-capacity result](lp2-wholeword-state-count.md) already excludes any shared 29-state deterministic codebook on its four frozen literary donors with arbitrary order; the historical ordered register here is distinct, and private chapter maps are additionally tested. The [#2936 receiver](lp2-ordered-homophonic-donor.md) allows homophony but has no decoder state. Neither test identifies the fixed state law above.

Reuse the #2936 corrected 2,896 complete groups, 12,956 runes, 32 cross-page carries, nine chapter starts, native solved GP records, three Law chapters and continuous Law, Self-Reliance, and concatenated solved sensitivity. Each original physical rune array is checked against the corpus; all Law word lengths match the pinned #2930 witness. All source blobs are pinned in the JSON. Freeze the first floor(2N/3) printed groups as training. For each contiguous donor window build two dictionaries within each public state; reject on the first violation of either direction. A later occurrence of a state/codeword known in training is a genuine word prediction; a previously unseen state/codeword only constrains injectivity.

## Original result

| Scope | Groups | Repeated state/code occurrences | Eligible windows | Training survivors | Full survivors | Longest compatible prefix |
|---|---:|---:|---:|---:|---:|---:|
| Book shared | 2896 | 8 | 10247 | 0 | 0 | 226 |
| Book, private chapters, contiguous donor | 2896 | 2 | 10247 | 0 | 0 | 320 |
| Chapter 1 | 158 | 0 | 21777 | 1715 | 139 | 158 |
| Chapter 2 | 255 | 0 | 21120 | 77 | 0 | 207 |
| Chapter 3 | 383 | 0 | 20352 | 0 | 0 | 230 |
| Chapter 4 | 437 | 1 | 20028 | 0 | 0 | 219 |
| Chapter 5 | 224 | 0 | 21306 | 265 | 1 | 224 |
| Chapter 6 | 326 | 1 | 20694 | 2 | 0 | 219 |
| Chapter 7 | 378 | 0 | 20382 | 0 | 0 | 228 |
| Chapter 8 | 669 | 0 | 18636 | 0 | 0 | 231 |
| Chapter 9 | 66 | 0 | 22595 | 17020 | 10458 | 66 |

Six independent chapters fail; even the complete-book chapter-private case cannot survive its first training split. The three nonexcluded chapters do not provide a trained map capable of predicting a single held-out plaintext word: each has all-distinct state/codeword pairs.

The sole chapter-five survivor is zero-based normalized Self-Reliance word offset 822, starting OF BOYS WHO ARE SURE OF A DINNER, ending THEM IN FEAR THESE ARE THE UOICES WHICH. It was selected using all 224 groups, from 265 training survivors. The post-fit sender dictionary replays 224/224 codeword IDs, but has **zero cross-split plaintext predictions**. As a conditional coincidence check, 128 seeded random permutations of the exact 224 original groups (recomputing the public predecessor state and scanning the identical full donor register) produce at least one compatible window in **86/128** trials, 192 total compatible windows, maximum 10 in a trial. This is descriptive under the stated permutation reference; it is not an author-intent probability. A single passing historical offset is not exceptional under this null.

## Calibration and next decision

33 independent native plants encode hidden contiguous donor intervals using genuine state-specific variable-length codebooks and chapter-reset states. All 33 true offsets survive the exact scan; all six complete-book plants isolate the true location in training and full scans, with 292–301 cross-split repeated-code predictions for shared codebooks and 9–19 for chapter-private maps. All 33 plants reproduce their observed codeword identifiers exactly through a reconstructed sender dictionary. Some duplicate source locations represent the same Law passage, and terminal chapter plants are weak (zero cross-split predictions). The implementation asserts native true-offset retention and source checks. The connected JS core was executed against the fetched repository bytes; standalone Node wrapper was not CI-run.

**Decision:** retire this exact public predecessor state with ordered contiguous donors in the frozen register; retain unselected other states, different plaintext, variable segmentation or reordered donors as separate hypotheses. Do not promote the chapter-five compatibility, or search for a key that explains it: a full fitted map is tautological and the shuffled reference regularly supplies similarly compatible windows.

[Reproducer](../sims/lp2_public_predecessor_wordcode_sft.cjs) · [raw output and input pins](lp2-public-predecessor-wordcode-output.json).
