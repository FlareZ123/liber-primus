# Fixed-slot swap cipher: all-secret original inverse with exact latent-F count gate

**Agent 6, 24 November 2026.** No unknown LP2 plaintext or authentic key recovered. Retire the fixed-slot swap architecture for the stated native-GP frequency register, including independently keyed physical pages and even pagewise choice between consuming every rune and literal plaintext-F holds.

## Candidate and causal relevance

A lossless way to suppress consecutive ciphertext repeats is to maintain a secret alphabet A of 29 glyphs indexed by a static plaintext rank permutation. Let s be a fixed pivot slot. To encipher rank r, emit A[r], then swap A[r] and A[s]. Decipher by finding the emitted glyph in A and making the same swap. The previous emitted glyph then occupies s: another equal consuming ciphertext glyph occurs exactly when the following plaintext selects s. A rare plaintext pivot can therefore explain the original repeat anomaly without inventing exception data. The original p57 circumference language supplies only weak motivation for an adaptive alphabet; it does **not** authenticate the swap opcode or a pivot. Unlike the earlier [interior recency insertion](lp2-recency-alphabet-original-inversion.md), [adjacent rank transposition](lp2-adjacent-transpose-rank-allsecret-original-gate.md) and [word-five rolling state](lp2-wordfive-rolling-swap-allsecret-gate.md), this algorithm exchanges two glyphs and retains the modified alphabet at every consuming step.

All initial permutations, pivot slots, and independent static plaintext-to-rank permutations are covered by the following reduction. No fixed key dictionary or original language-score optimization is needed.

## Exact inverse and projected dynamic program

Without F holds, the first consuming emission places its glyph at the pivot. Any two possible lists after that point are related by a permutation of the 28 other slots fixing the pivot. The next observed glyph selects corresponding slots; swapping into the common pivot commutes with that relabeling. Inductively all subsequent decoded rank equality partitions are identical up to a single unknown substitution. The first rune contributes at most one additional occurrence of any rank. In particular, the original whole-book rank tail has maximum 503, so no all-consuming key yields a count above 504.

Under authentic literal plaintext-F bypass, an emitted zero may be a hold (no alphabet update) or an ordinary consuming non-F output. A transparent F never consumes its own slot. To compute the exact maximum frequency of an arbitrary fixed non-F plaintext slot, track three glyphs: h at the pivot, g at the target slot and k at the forbidden F slot. Initialize **every distinct assignment** compatible with the three slot identities. If target=pivot, impose g=h; if F=pivot, impose k=h; otherwise all three glyphs are distinct. These are all cases for the static rank permutation.

At each observed ciphertext c:
- When c=0, allow an unchanged state with no non-F count increment (literal F hold).
- When c≠k, allow the consuming branch: the pivot becomes c; a tracked non-pivot slot becomes old h exactly when its old glyph equals c. Increment target count iff c=g.
- Keep the maximum accumulated count for each resulting state; discard unreachable states.

No other information about the alphabet is needed for these transitions. Any projected assignment extends to a full permutation and each legal transition is a full-alphabet swap, so the projected DP is exact for the specified target frequency (not simultaneous maxima for multiple targets). F count itself is bounded by the number of ciphertext zeros. State dimension is at most 29³, with 21,924 initially legal states when all three slots are distinct. The DP never assumes every visible zero is a hold.

There is a stronger algebraic simplification on the original whole book and all nine chapters. If F is the pivot, two immediately consecutive equal nonzero ciphertext symbols are impossible. Each chapter contains at least one such pair. If F is not the pivot, its glyph is invariant because the forbidden slot is never swapped; every nonzero glyph occurs in each chapter, so the invariant F-slot glyph must be 0. Thus all original zero symbols must be literal F in this particular architecture. This is an inference from the original tape and exact swap law, not the invalid general assumption that ciphertext F is always transparent. The DP independently handles short pages without full support or without a nonzero doublet.

## Original results

The exact original source is the shared [LP2 corpus](../resources/liber-primus/lp2-corpus.json), physical p0–55, 12,956 runes; p50 has no rune body. Reference comparison uses the pinned 2013 Book of the Law (all three parts) and Blake's Marriage of Heaven and Hell (Gutenberg 45315), using the same greedy GP transliteration as the earlier recency study. Every equal-length contiguous reference window is included. The comparison is conditional on this native-GP frequency register.

| Region | Runes | Any consuming-only upper | Any literal-F upper | Either upper | Law min max | Blake min max |
|---|---:|---:|---:|---:|---:|---:|
| Whole p0–55 | 12956 | 504 | 515 | 515 | 1646 | 1608 |
| p0–2 | 729 | 38 | 38 | 38 | 68 | 70 |
| p3–7 | 1145 | 57 | 63 | 63 | 115 | 122 |
| p8–14 | 1729 | 77 | 75 | 77 | 189 | 197 |
| p15–22 | 1903 | 87 | 92 | 92 | 210 | 220 |
| p23–26 | 1021 | 48 | 48 | 48 | 102 | 104 |
| p27–32 | 1433 | 65 | 67 | 67 | 153 | 161 |
| p33–39 | 1680 | 80 | 80 | 80 | 184 | 190 |
| p40–53 | 3008 | 132 | 125 | 132 | 352 | 354 |
| p54–55 | 308 | 21 | 21 | 21 | 26 | 29 |

Granting an independent arbitrary alphabet, pivot, rank mapping, and F policy on **each of 55 rune-bearing physical pages**, summing the individual maximum count bounds permits at most **856** (all-consuming), **867** (all literal-F), or **879** (independently mixed). Even this overgenerous bound is below the minimum maximum count of every one of the 8,656 Law and 5,676 Blake whole-length windows. In the full book, literal-F DP maxima are 515 for an arbitrary nonpivot non-F target, 96 for the pivot, and no reachable F-pivot path; 458 zeros bound the count of F. The page-local mixed bound permits even a different maximizing rank on each page, so it also bounds any one actual plaintext rune across the book.

## Positive calibration and reproducibility

[CommonJS single-file test](../sims/lp2_fixed_slot_swap_fhold_allsecret_sft.cjs). Run from the repository with Node 22. Exact original computation and controls ran in connected V8; no CI execution is claimed.

Nine source-native solved sections each supply four independent seeded planted alphabets/modes: all-consuming, F slot initially 0, F slot initially nonzero, and F itself at the pivot. All 36 planted true inverses reproduce every native rune and their complete ciphertext exactly with known key and mask. Every true count is within the applicable DP bound; 15 literal-F plants include ordinary consuming zero outputs, exercising the hidden-zero ambiguity. For the all-consuming and zero-slot variants, a native prefix crib occupying the first two-thirds of the plant identifies the static relabeling; on the untouched suffix, **1,970/1,970 covered runes are recovered exactly** out of 1,994 total, with 24 uncovered by the prefix map. This is a cribbed constructive recovery of the effective relabeling, not a blind historical key search.

## Decision

No source-supported fixed-slot swap key could produce the native-frequency register on the original. Retire the stationary swap and its independently reset physical-page extension rather than fitting pivot names or unknown initial alphabets. A changed pivot within a page, extra value layer, changing plaintext alphabet, different plaintext register or segmentation that changes the rune count is outside the result. Pursue one only if an original clue independently fixes that extra operation. The exact small-state projection is reusable for other permutation-update mechanisms when their state can be tracked with a few glyph slots. No unknown plaintext/key/destination and no change to the authoritative solved-page count.
