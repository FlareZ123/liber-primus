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

## Moving pivot: source-table clock and synchronization attack

The original [p49–51 base60 table](../resources/liber-primus/base60-grid.json) gives one non-fitted binary clock previously considered in [the bit0 MTF rotor decision](lp2-p50-bit0-mtf-rotor-allsecret-original-decision.md): at absolute physical rune index i, select pivot 0 or 1 by grid[(i+255) mod 256] & 1. This conditional association does not authenticate the swap opcode. Allow both pivot plaintext symbols and every initial alphabet and static plaintext permutation to be arbitrary.

A consecutive equal nonzero ciphertext pair requires the pivot selected at the first rune to be consumable at the second. Both clock bits have such witnesses on the original (36 and 46 book-wide, respectively); both occur in every chapter. Consequently neither pivot can be literal F. The nonpivot F slot is invariant, and the observed full nonzero support forces that slot to contain glyph 0; therefore all zeros are literal holds under this model.

Track the two current pivot glyphs (a,b). When a consuming glyph c is observed, updating pivot 0 sends the pair to (c, a if b=c else b); updating pivot 1 sends it to (b if a=c else a, c). A hold leaves the pair unchanged. Propagate **all** possible pairs without guessing the alphabet. Once the pair becomes unique, arbitrary orderings of the remaining glyphs differ only by a static relabeling of nonpivot slots, and all subsequent inverse ranks have the same equality partition. This makes the remaining problem an ordinary substitution CSP rather than a search over changing alphabets. The original pair synchronizes after two runes to (15,8) in both models. The following bounds include the most generous possible contribution of the unsynchronized prefix.

| Region | Burn-in | Consuming-only upper | Literal-F upper |
|---|---:|---:|---:|
| Whole p0–55 | 2 | 514 | 521 |
| p0–2 | 2 | 39 | 39 |
| p3–7 | 2 | 52 | 51 |
| p8–14 | 2 | 86 | 77 |
| p15–22 | 3 | 87 | 86 |
| p23–26 | 2 | 54 | 50 |
| p27–32 | 5 | 68 | 79 |
| p33–39 | 3 | 83 | 79 |
| p40–53 | 7 | 135 | 134 |
| p54–55 | 3 | 22 | 22 |

All are below the corresponding native reference minima above. Moreover, the first 150 complete synchronized original words contain five impossible equality signatures in each mode under the frozen 38,919-spelling GP lexicon. Even without word boundaries, the frequency discrepancy remains.

**Constructive key recovery:** For each of three solved source sections, generate independently randomized secret alphabets and plaintext permutations in both modes. Synchronize the pivots from ciphertext alone, infer the static substitution from the first two-thirds of complete words using an exact word-pattern CSP, and decode the untouched last third without further fitting. All six plants recover a consistent effective key; all 1,078 of 1,080 held-out runes whose effective rank occurred in training are correct, with the two other runes (one each in the two KOAN modes) unrepresented in training and incorrect. More precisely, this is **1,078/1,078 covered** and **1,078/1,080 total**. The dictionary contains native target vocabulary, but no ordered plaintext crib. This is a vocabulary-assisted synthetic calibration, not a historical solution. The synchronized suffix inverse is exactly replayed in both controls and original.

Reproducer: [two-pivot synchronization SFT](../sims/lp2_p50_bit0_twopivot_swap_allsecret_sft.cjs), executed in connected V8 before committing; Node CommonJS runner provided, no CI claim. The clock is fixed to the earlier conditional bit0 association, not swept or optimized against the held-out source.

An unrestricted binary pivot schedule is outside this exclusion: preliminary max-plus propagation allowing either pivot at every rune admits a target count of 2,720 under all-consuming operation. Hence the simple frequency gate cannot rule out unknown arbitrary switching. An exploratory trigram beam and finite lexicon beam/DFS did not reliably recover randomly switched native controls, so their original outputs were not interpreted as evidence. Without an independently supported clock, additional arbitrary schedule fitting is not justified.

## Unknown binary glyph-class clock: exhaustive key recovery and original rejection

The previous section assumes a public position clock. A different mechanism selects which pivot to update by an unknown fixed binary class function on the emitted glyph. This includes a static plaintext-rank class choice whenever each pivot belongs to its own selected class: swaps preserve the two disjoint slot groups, so the initial glyph classes stay fixed. It does not include plaintext-rank class functions whose pivot ranks select the opposite pivot.

Given the class assignment, a pivot holds the last emitted glyph in its class after that class has emitted once. After both active classes have emitted, each glyph stays within its class, and the initial alphabet is irrelevant up to a static rank relabel. This permits a much cheaper inverse than replaying every alphabet.

For a singleton at ciphertext position t, let p be the preceding occurrence of c[t], and q the first position after p with a glyph of the same class. After p, the class pivot holds c[t]; the next same-class event q transfers that glyph to its emitting slot. Thus if q=t, the singleton rank is the pivot; if q<t, its rank equals the rank at q. If q precedes the synchronized boundary, its canonical rank is the glyph at that boundary. An unseen glyph after the synchronized boundary similarly identifies its original nonpivot rank. Follow this strictly decreasing predecessor chain to one of the two pivot labels or a canonical nonpivot label. The rank equality relation is exact for every initial alphabet.

The original first full-support boundary is rune 163. All 83 complete printed singleton groups occur later; their ciphertext glyphs cover 28 types. The nine known native solved sections have only A/I singleton words; the attack conservatively permits **three distinct singleton plaintext symbols** (allow O as well), without assigning their names. For the first 4,150 original runes, exhaust every class assignment modulo complementary pivot relabeling, namely 2^28 = **268,435,456** assignments. After the first four singleton anchors, 218,504,675 assignments fail; after five, only 6,539,634 remain; after eleven, only nine remain; after the twelfth (global offset 1545), **zero remain**. Therefore no initial alphabet, fixed rank permutation, or stationary binary glyph-class clock admits the stated intact-singleton register on the original. No unknown plaintext was used.

**Blind planted key recovery:** Two independently seeded secret alphabets, plaintext permutations and class masks encrypt 1,883 native training runes (first and second KOAN, WARNING, WELCOME, AN END), then 850 untouched runes (LOSS OF DIVINITY and PARABLE). Both plants have 26 observed training glyphs, and all held-out ciphertext glyphs are represented in training. Enumerate every 2^25 = 33,554,432 effective class assignment per plant; the true normalized mask is the unique survivor in both (33,285,526 and 209,092,818). Class synchronization after two runes permits the same dictionary CSP to infer the remaining static substitution from training alone. The resulting frozen inverses recover **850/850 + 850/850 = 1,700/1,700 held-out native runes** and exactly replay their ciphertext. Target vocabulary is present in the dictionary; there is no ordered plaintext crib or target-specific frequency selection. Unseen cipher class bits and unused initial rank labels remain unidentifiable. This is an actual all-effective-secret recovery technique on two native plants.

**Literal F extension:** If plaintext F is not a pivot, its glyph is invariant and full nonzero support forces that glyph to 0. The original complete singleton at offset 644 is glyph 0, so it must decode to F, excluding the native singleton register. If F is a pivot, no nonzero glyph having an immediate repeat can belong to its class: the first emission places that glyph at the forbidden pivot and the next cannot consume it. The original repeat glyphs cover all nonzero types except 17. Hence the F-pivot class is one of empty, {0}, {17}, or {0,17}; {17} alone is impossible because its 445 occurrences cannot be separated by other consuming class members. For the remaining cases, by the time all nonzero glyphs have appeared (offset 163), the active pivots have initialized; if the F class has never emitted by then, F's invariant glyph is forced to 0 and that class cannot subsequently emit. The other-class inverse is the fixed-slot swap on its nonzero subsequence, even if the literal/consuming zero mask in the F class is unknown. Counting all zero and 17 events plus an overgenerous arbitrary prefix for the special class, and using the fixed-slot count bound for the other class, yields whole-book maximum any-rune bounds 667 (empty or {0}) and 1050 ({0,17}), below the native reference minimum 1608.

Reproducer: [CommonJS driver](../sims/lp2_class_clock_swap_allsecret_sft.cjs) compiles the [C++ enumerator](../sims/lp2_class_clock_singletons.cpp) with g++ and OpenMP. Original and plant enumerations ran locally on the exact repository inputs (FNV32 matched); 1,001 literal-alphabet rank-origin comparisons per tape passed. Original scan took about 10 seconds on four logical CPUs. The held-out CSP phase ran in connected V8 using the actual local exhaustive outputs. No CI claim. The plaintext-singleton condition is essential to the all-consuming and nonpivot-F exclusions as stated here; the F-pivot bound is spacing-independent. The same two-class model with variable class membership or crossed pivot updates is outside the result.

## Decision

No source-supported fixed-slot swap key could produce the native-frequency register on the original. Retire the stationary swap and its independently reset physical-page extension rather than fitting pivot names or unknown initial alphabets. The fixed p50 bit0 two-pivot clock is also excluded for the whole book and each independently initialized chapter, under the same reference-frequency condition. The all-secret stationary glyph-class clock is also excluded under the intact-singleton register, with literal-F pivot cases excluded independently by frequency. An unrestricted changing pivot, crossed plaintext-class pivot updates, extra value layer, changing plaintext alphabet, different plaintext register or segmentation that changes the rune count is outside the result. Pursue one only if an original clue independently fixes that extra operation. The exact small-state projection is reusable for other permutation-update mechanisms when their state can be tracked with a few glyph slots. No unknown plaintext/key/destination and no change to the authoritative solved-page count.
