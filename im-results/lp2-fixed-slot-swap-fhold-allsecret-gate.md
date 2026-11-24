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

**Literal F extension:** If plaintext F is not a pivot, its glyph is invariant and full nonzero support forces that glyph to 0. The original complete singleton at offset 644 is glyph 0, so it must decode to F, excluding the native singleton register. If F is a pivot, no two consecutive equal **consuming** outputs may occur in the F-selected glyph class. The monotone class closure below strengthens the earlier immediate-repeat test.

Reproducer: [CommonJS driver](../sims/lp2_class_clock_swap_allsecret_sft.cjs) compiles the [C++ enumerator](../sims/lp2_class_clock_singletons.cpp) with g++ and OpenMP. Original and plant enumerations ran locally on the exact repository inputs (FNV32 matched); 1,001 literal-alphabet rank-origin comparisons per tape passed. Original scan took about 10 seconds on four logical CPUs. The held-out CSP phase ran in connected V8 using the actual local exhaustive outputs. No CI claim.

### Spacing-independent all-mask extension

Freeze original first 4,150 runes. At the first full-support boundary, every active class has emitted and its pivot glyph is known. For each of all 2^28 binary classes modulo complement (2^27 on the 28 nonzero glyphs for invariant F), count rank occurrences in the synchronized suffix. A rank's accumulated count moves with its glyph when it swaps with the selected pivot. Keep pivot counts separately; the old value in the newly occupied pivot's nonpivot counter is stale but never larger than the final count of the rank from which it came. Thus the maximum over stored counters equals the true synchronized suffix maximum. This removes the entire unknown initial alphabet and rank substitution. Grant every pre-synchronization consuming rune to a single rank.

| Mode | Masks exhaustively tested | Consuming burn | Max suffix count | Any full-prefix rank count upper |
|---|---:|---:|---:|---:|
| All consuming | 268435456 | 163 | 223 | 386 |
| Literal F, invariant nonpivot | 134217728 | 155 | 223 | 378 |

All 148 physical zeros in the prefix could only contribute to F in the invariant-F case, also below the bound. Every equal-length Law/Blake window has some rune count at least 494/497, so **zero masks attain the native frequency register, even without trusting printed words**. The two scans completed in 192.466/203.696 seconds (concurrent local workloads affected timings); both compare 2,048 scalar and AVX512 inverse counts exactly. [Frequency census](../sims/lp2_class_clock_frequency.cpp). This continuous-prefix result does not itself exclude private chapter masks.

For F at a pivot, start a candidate special class containing all observed glyphs, even physical zeros (over-relaxation: allow every zero as a consuming separator). If a nonzero glyph appears adjacently twice in the tape filtered to this class, delete it: no subset containing it can restore a missing separator. Iterate to a fixed point. On the whole original and each of its first eight chapters, the closure leaves only glyph 0. Therefore there is at most one consuming zero in the F class, because no second consumption of the current forbidden pivot glyph is legal. Such a single zero exchanges the previously forbidden, never-consumed glyph with a rank not previously consumed by the nonzero tape. It does not change the equality partition of the other class's nonzero outputs after that class's first output. Even granting the first nonzero and one ordinary zero arbitrarily, the whole-book any-rank bound is 516; first-eight chapter bounds are 39,64,76,93,49,68,81,126. All fail the reference minima in the table above. This closure is independent of word boundaries, literal-F mask and initial alphabet. The final chapter retains other glyphs in its closure and requires a separate test.

## Crossed plaintext-rank classes

A static class function on *plaintext ranks* need not send each pivot to itself. The two special ranks may select each other, changing the observed glyph classes. This is a distinct extension, not covered by the fixed glyph-class census. For ordinary ranks assign the group selected by the function; mark pivot0's glyph as group0 and pivot1's glyph as group1 regardless of their own destination. State is a binary group mask G, pivot glyphs a,b, and two fixed cross flags. At an observed glyph v, find its current group; if it occupies a crossed pivot, select the opposite pivot and exchange both group memberships. Otherwise swap with its own group pivot. Track which rank tokens have occurred at singleton positions by a glyph-coordinate tag mask; move these tags by the same exchanges. More than three distinct tags is impossible under the intact native singleton register.

After the first output, WLOG pivot0 holds the first ciphertext glyph. Group candidate masks by the first subsequent group1 glyph. Until this first event, pivot0 cannot cross unless two adjacent outputs repeat. If the first group1 event precedes the first repeat, the entire pre-event pivot0 trajectory synchronizes and only two possibilities for that event remain (normal or crossed pivot1). For late group1 events or entirely unobserved group1, enumerate the other pivot glyph directly. This covers every initial state modulo the free pivot relabeling; the pre-synchronization singleton constraints are relaxed. Each candidate then has an exact deterministic inverse equality partition.

On the original 4,150-rune prefix, the full search tests **268,435,464 / 536,870,883 / 536,870,822** candidate states for the three nontrivial crossing patterns, total **1,342,177,169**, with **zero survivors** (complementary pivot labeling is free). The scalar projected transition was compared with 1,001 full literal-rank permutations over the input. Local SIMD/OpenMP census completed in 241.938 seconds; [crossed-pivot enumerator](../sims/lp2_cross_pivot_singletons.cpp).

An independent native calibration uses the same 1,883/850 train/heldout split as above, a new seeded secret alphabet and rank permutation, and one-way crossing (pivot1 selects pivot0). All 536,870,883 candidate states of that normalized flag pattern are traversed. The 3,064 singleton-compatible states include the actual secret effective state. They reduce to 383 distinct canonical training streams; the exact word CSP leaves 16 states belonging to two training-stream representations. **All 16 produce the identical 850/850 correct heldout plaintext**, without inspecting the heldout during fitting. Unobserved glyph-class bits remain ambiguous, and the dictionary includes native target vocabulary. This calibrates a constructive all-effective-state attack on a crossed variant. Authentic latent F at crossed pivots is not covered by this original census.

## Chapter-private original attack: p54–55

The whole-book gates permit a different binary mask at each chapter. Freeze the final chapter's first 205 runes / 45 complete printed groups as training and reserve the last 103 / 21 groups for prediction. This is the same physical boundary used in several earlier independent cipher-family attacks. For each binary mask, synchronize from its own first active-class outputs, discard incomplete/pre-synchronization training words, form the exact rank stream and constrain a static bijection using the 38,919-spelling GP lexicon (38,780 spellings of length ≤14; every training group is shorter). Enforce word equality signatures, unary rune domains, full word relation propagation, and all-different matching/branching as needed. Grant arbitrary starting alphabets and substitutions.

| Mode | Exhaustive masks | Unary compatible | Word-propagation compatible | Complete key witnesses |
|---|---:|---:|---:|---:|
| All consuming | 268435456 | 26098438 | 0 | 0 |
| Literal F at invariant nonpivot | 134217728 | 6726847 | 0 | 0 |

No training key exists and hence no fitted candidate reaches the untouched original suffix. Local four-thread scans took 42.1013/20.5583 seconds. Two fresh matched-length native plants demonstrate actual recovery using the same dictionary and no ordered crib: 205-rune WELCOME training yields the true normalized mask among two fits (the other delays synchronization until rune187); 206-rune LOSS OF DIVINITY training yields a unique mask. Minimum training burn selects the true fit without holdout information. Frozen inverses predict **94/94 + 78/78** heldout native runes; all heldout effective ranks were represented in training. [Chapter-private lexical solver](../sims/lp2_class_clock_lexical.cpp). This is a finite lexicon constraint, not a general language theorem.


## Decision

No source-supported fixed-slot swap key could produce the native-frequency register on the original. Retire the stationary swap and its independently reset physical-page extension rather than fitting pivot names or unknown initial alphabets. The fixed p50 bit0 two-pivot clock is also excluded for the whole book and each independently initialized chapter, under the same reference-frequency condition. The continuous all-secret stationary glyph-class clock is excluded independently of spacing under the native-frequency register; crossed all-consuming plaintext-class pivot updates fail the intact-singleton register. Private final-chapter masks also fail the tested intact-word CSP for all-consuming and invariant-F models. An unrestricted changing pivot, crossed latent-F dynamics, independently keyed other chapters, extra value layer, changing plaintext alphabet, different plaintext register or segmentation that changes the rune count is outside the result. Pursue one only if an original clue independently fixes that extra operation. The exact small-state projection is reusable for other permutation-update mechanisms when their state can be tracked with a few glyph slots. No unknown plaintext/key/destination and no change to the authoritative solved-page count.
