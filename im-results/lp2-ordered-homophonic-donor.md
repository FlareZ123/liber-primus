# Ordered historical donor inverse under unrestricted homophonic whole-word encoding (#2936)

## Decision

No complete contiguous Book of the Law / Self-Reliance donor survives, whether one global homophonic dictionary or independent chapter-private dictionaries are allowed. Six of nine chapters independently reject every eligible donor window. Chapter 1 retains three distinct donor windows but cannot select one; chapters 5 and 9 have no repeated ciphertext groups and are intrinsically unidentifiable by this method. No authentic new plaintext or key.

## Receiver and frozen register

For a uniquely decodable homophonic word code, each ciphertext codeword has exactly one plaintext word. Any number of distinct ciphertext forms can map to the same plaintext word; code lengths and plaintext lengths need not match. At each contiguous word-aligned donor offset, every set of equal original ciphertext groups must therefore coincide with equal donor words. This equality condition is necessary and sufficient for a codebook on the observed types: map each type to the donor word at its first occurrence. This is a direct source recovery test, not an attempt to tune arbitrary codeword keys. It assumes the printed group order is the plaintext word order, unlike the [arbitrary-order state-count result](lp2-wholeword-state-count.md).

The corrected 2,896-group/12,956-rune tape has 32 cross-page carries; all physical page rune arrays agree with the canonical corpus. Use the nine source-defined chapter counts 158/255/383/437/224/326/378/669/66. Freeze ASCII lexical words, QU→CW, V→U, K/Q→C, Z→S, ING→NG and greedy GP29 tokenization from #2930. The three raw historical Law chapters normalize to 1,897/1,968/2,002 words and every word length agrees with the pinned derived #2930 witness. The pinned 2014 Self-Reliance witness normalizes to 10,170 words. Include all nine independently solved GP source records as exact rune word groups, and mark their concatenation (740 words) as sensitivity only. Include the contiguous Law text and its individual chapter windows, so some location counts intentionally duplicate physical donor passages. This is the frozen #2936 register, not a generic corpus search.

For each target scope use the first occurrence of each repeated ciphertext type as reference, then compare all later occurrences. These are N−D independent equality constraints. Freeze the first floor(2N/3) word positions as training; only code types observed in that prefix can predict corresponding withheld words. Full-window consistency may additionally test within-holdout-only equalities. No per-occurrence exceptions, alignment changes or language score.

## Original result

| Scope | Words | Equality constraints | Cross-split predictions (distinct types) | Eligible donor windows | Training survivors | All predicted matches | Full survivors |
|---|---:|---:|---:|---:|---:|---:|---:|
| Book shared | 2896 | 165 | 64 (60) | 10247 | 0 | 0 | 0 |
| Book, private chapters, single contiguous donor | 2896 | 34 | 1 (1) | 10247 | 0 | 0 | 0 |
| Chapter 1 | 158 | 2 | 1 (1) | 21777 | 264 | 5 | 5 |
| Chapter 2 | 255 | 3 | 2 (2) | 21120 | 21120 | 1 | 0 |
| Chapter 3 | 383 | 6 | 3 (2) | 20352 | 0 | 0 | 0 |
| Chapter 4 | 437 | 7 | 2 (2) | 20028 | 0 | 0 | 0 |
| Chapter 5 | 224 | 0 | 0 | 21306 | 21306 | 21306 | 21306 |
| Chapter 6 | 326 | 6 | 3 (3) | 20694 | 0 | 0 | 0 |
| Chapter 7 | 378 | 3 | 1 (1) | 20382 | 4 | 0 | 0 |
| Chapter 8 | 669 | 7 | 3 (3) | 18636 | 0 | 0 | 0 |
| Chapter 9 | 66 | 0 | 0 | 22595 | 22595 | 22595 | 22595 |

207,384 scope/location tests including both whole-book models. Every eligible whole-book shared window violates at least 157/165 equalities; private chapter dictionaries on a single contiguous source still violate at least 29/34. The first six failing chapter scopes are 2,3,4,6,7,8. The p40–53 body chapter 8 violates at least four of its seven equalities in every donor window.

Chapter 1's five passing locations reduce to **three distinct normalized donor windows** (Law III is listed once independently and once in the contiguous Law tape). At the frozen split 105, only one distinct codeword type is independently predictable from training: GP F-EA at zero-based index 66, repeated at 156.

| Distinct donor location | Prediction for F-EA at position 156 |
|---|---|
| Law III, word 755 (Law continuous 4620) | RA |
| Law III, word 1532 (Law continuous 5397) | IN |
| Self-Reliance, word 1857 | OWN |

Each complete candidate reproduces this single repeat because it is an equality-consistent window, but the training set has 264 locations and no independently selected donor. All three predictions conflict with each other. The result supplies no justified value for F-EA or the remaining codewords. Chapter 2's one cross-split-consistent location fails the within-holdout equality. Chapter 5 and terminal chapter 9 admit every eligible window, because a type seen only once has no cross-split test; a fitted unrestricted codebook here is tautological.

## Held controls and shuffled rivals

For each of eleven scopes, construct twelve independent seeded hidden-offset homophonic plants using actual donor windows: draw disjoint equal-word occurrences to match every original ciphertext repetition multiplicity exactly, then assign unique codewords to remaining positions. For the private-chapter book model construct each chapter's codebook independently, preserving each chapter histogram and preventing cross-chapter type reuse. 132/132 true offsets retained. All twelve shared-book plants isolate the exact offset using training alone, predicting 49–74 held-out repeat occurrences; all twelve private-chapter plants isolate the offset using training (0–3 held-out predictions under the global split). For chapter 1 even 0/12 full plant scans isolate a single location, consistent with weak original repeat constraints. The all-distinct chapter 5/9 controls accept every location, as required. Identical source windows listed under multiple representations count as multiple locations in these control statistics, which makes isolation conservative.

For each scope, shuffle 512 independently sampled donor windows, preserving the window word multiset. All 512 shared-book and all 512 private-chapter shuffled windows fail; all nonvacuous individual chapter shuffled windows fail the full test, including chapter 1. This sampled null is descriptive, not a familywise significance claim: original chapter 1 was searched over 21,777 locations, far more than 512 null trials. Do not use the lack of a sampled null survivor to authenticate one of the three original windows.

Retire ordered homophonic transfer from this finite historical donor register for the complete book and six individually excluded chapters. Do not retire homophony generally, arbitrary pre-encryption order, another plaintext, variable word boundaries or a codeword whose interpretation depends on additional state. No source-selected donor or held-out decipherment; no expansion requested.

[Reproducer](../sims/lp2_ordered_homophonic_donor_sft.cjs) · [all original/control results and input blob pins](lp2-ordered-homophonic-donor-output.json). The connected V8 core executed on the pinned bytes. The standalone Node wrapper was not separately CI-run.
