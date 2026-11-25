# Exact long-anchor obstruction for LP1 running keys with decoy word lengths

## Decision

Neither 2,797-rune LP1 source register can supply enough long plaintext words under the chapter-length-inventory-preserving H-decoy model, even granting arbitrary jumps at true word boundaries, both additive signs and encodings, unrestricted bidirectional collision-triggered rejection and either literal or consuming Fehu independently. All 72 original chapter/receiver variants fail the 5% OOV budget. This is a necessary-condition exclusion, not recovered plaintext.

## Source and model

Motivation: the earlier first17→last57 source hypothesis and the unresolved shuffled-length (b′) scope in Dukotah Round47. Use the same corrected and printed source registers as the finite LP1 V-BACK report. The correction of the printed koan fragment uses mod29(60−index). Allow arbitrary cyclic source cursor at each true word boundary and every possible physical start. This strictly relaxes any rule choosing a particular cursor at a true word start. Within a word, ordinary consuming emission advances one; a literal held Fehu emits zero and leaves the cursor unchanged. On a collision with previous ciphertext, reject and step either way, any number of times; final acceptance need not suppress a repeat.

For initial cursor j with rejected emission, plaintext is forced to c_previous−K[j]. Every subsequent rejected state has that same key residue, so accessible rejected positions are exactly the connected equal-residue run on the cyclic tape. Acceptance may occur at any position in that run (when ciphertext repeats), or at either adjacent unequal-residue neighbor matching the required emission. The first emission of a word can simply choose its accepted cursor. This yields an exhaustive trie traversal, without scoring or beam pruning. The language register has 35,944 forms, including 16,920 of lengths 8–24, from the earlier native/literary lexicon. True long-word intervals must be disjoint and must obey the original chapter's multiset of lengths. Min of the independent earliest-finish interval maximum and per-length inventory cap gives an upper bound. Grant all short words and all OOV words without further constraints.

| Chapter | Groups | Long groups | floor(5% groups) | Max supported long groups across receivers |
|---|---:|---:|---:|---:|
| 1 | 158 | 21 | 7 | 0 |
| 2 | 255 | 27 | 12 | 1 |
| 3 | 383 | 46 | 19 | 0 |
| 4 | 437 | 48 | 21 | 0 |
| 5 | 224 | 26 | 11 | 0 |
| 6 | 326 | 36 | 16 | 0 |
| 7 | 378 | 45 | 18 | 0 |
| 8 | 669 | 84 | 33 | 1 |
| 9 | 66 | 10 | 3 | 0 |

70/72 receiver rows have zero matches. The two isolated matches are chapter 2, offset 397, corrected index sign -1: SURPRISNG; chapter 8, offset 2742, printed index sign -1: CHAFFNGLY. Neither is evidence of decipherment. Even allowing receiver changes per word, at most two long words across all chapters are supported: at least 341/343 long words require OOV, against an aggregate 144/2896 budget. Total original trie visits 704,157,632.

## Controls

Three contiguous held-out donor samples, using independent arbitrary starting cursors per actual word and mixed-direction collision rejection, with ordinary and Fehu-hold conventions represented. In-register long words recovered at exact position 9/9, 11/11, 21/21; all controls pass the 5% budget (long OOV lower bounds 1, 3, 2). This is anchor retention, not complete plaintext or cursor recovery.

## Scope and reproducibility

This rules out the two tested finite LP1 registers even with cyclic wrap, independently permuted lengths within each chapter, and arbitrary word-boundary jumps. It does not rule out changing the word-length inventory, rune-order transposition, inserted/deleted runes, non-LP1 keys, arbitrary jumps inside a true word, or a precomputed effective jump stream whose skips can cross true-word boundaries. The 5% allowance and long-word register are explicit conditional language assumptions.

Run `node sims/lp2_lp1_decoy_length_anyjump_long_anchor_sft.cjs plants` and then each argument 0–8. Raw evidence: `im-results/lp2-lp1-decoy-length-anyjump-plants.json` and `im-results/lp2-lp1-decoy-length-anyjump-ch0.json` through ch8. Core JS executed in the connected runtime; no separate CI run claimed.

Retire the LP1 running-key receiver under these conditions. No authentic key or unknown plaintext recovered.
