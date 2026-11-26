# Global GP29 prime-exponent clock: identity and all-fixed-alphabet exclusion

**26 November 2026. Intermediate negative for Director Issue #2942 and Agent5's all-fixed-alphabet extension. No unknown plaintext or authentic key recovered.** The current strongest results are the exact global arbitrary-input/output-permutation concentration bound and the all-3,301-origin chapter-private upper bound below. The original fixed-symbol gate remains the special identity-offset case.

## Hypothesis and source boundary

The local p28 DH reconstruction independently selects cube exponent 3, and solved p56 uses a successive-prime clock with transparent plaintext F. A plausible but unverified transfer is a public exponent clock over the nonzero GP29 field:

- take successive prime numbers and reduce them modulo28;
- skip nonunits, so every exponent is invertible modulo28;
- encrypt each nonzero plaintext symbol as C = P^e mod29;
- let F/index0 pass unchanged and hold the exponent clock;
- start at the first unit prime, 3, with identity offset and no fitted phase or translation.

This is an exploratory global transfer, not a source-authenticated instruction. The p28-local READ OUT transform is a separate result and is not being re-tested or rejected here.

## Decisive invariant

The multiplicative group of nonzero residues modulo29 has order28. An exponent e gives a permutation of that group exactly when gcd(e,28)=1. Every such e is odd. Consequently, for every permitted exponent, regardless of its position in the clock:

\[
0^e=0,\qquad 1^e=1,\qquad 28^e=(-1)^e=-1=28\pmod{29}.
\]

Thus the identity-offset exponent-only receiver must preserve the exact counts of three GP29 symbols:

- index0: F;
- index1: U;
- index28: EA.

This invariant is independent of prime origin, clock phase, page resets, F holds, and the order of the exponents. A page reset cannot repair it.

## Original and native counts

| Register | Length | F | U | EA |
|---|---:|---:|---:|---:|
| Original unknown p0–p55 | 12,956 | **458** | 450 | **460** |
| External solved-native GP29 control register | 2,979 | 48 | 153 | 20 |

The original ciphertext therefore forces 460 plaintext EA runes, 3.55% of the entire text. The solved-native reference has 20/2,979 EA (0.67%). The solved-native dataset is an external transcription of nine solved GP29 records, not source-original Cicada bytes.

A second matched comparison used 12,956-rune windows at a fixed 1,000-rune stride:

| English control | Windows | F range | U range | EA range |
|---|---:|---:|---:|---:|
| Shakespeare | 205 | 206–319 | 368–680 | 48–134 |
| Emerson | 311 | 295–428 | 324–460 | 36–125 |
| Gibran | 50 | 258–388 | 435–649 | 39–168 |
| **All controls** | **566** | max 428 | — | **max 168** |

The original EA count 460 exceeds every one of the 566 matched windows by at least 292 symbols (2.74× the maximum control count). The original F count 458 also exceeds every matched window (maximum 428); U remains within the control ranges. The EA invariant alone is decisive for the ordinary GP-English plaintext hypothesis.

## Positive control and reproducibility

The reproducer generates the exact public unit-prime exponent sequence, confirms every exponent is odd and coprime to28, and verifies the fixed points. It then plants the same F-hold exponent clock into a 12,956-rune GP-transliterated Gibran segment and exactly inverts it. The synthetic plaintext and ciphertext have identical F/U/EA counts, as required.

Run from the repository root:

\`node sims/lp2_prime_clock_exponent_permutation_fixed_symbol_sft.cjs\`

The script asserts the original and solved-native counts, the 566 control windows and their maxima, the algebraic fixed points, and exact synthetic recovery.

## Decision

Close the frozen identity-offset prime-exponent clock without running a full original inverse or language scoring. Every allowed exponent fixes EA, while the original contains far too many EA symbols for the matched ordinary-English controls. This rejects the specified exponent-only global transfer and, more generally, any identity-offset power-only map using units modulo28 as exponents.

It does **not** exclude a non-English intermediate register, a source-authenticated additional translation/affine layer, or the separate p28-local READ OUT candidate. No such extra layer is selected by this task's source evidence. Do not rescue this receiver with arbitrary translations, remappings, or exponent schedules.


## Arbitrary fixed input/output alphabets: exact public-clock exclusion (Agent 5, 26 November)

**Stronger decision:** the identity-offset fixed-symbol objection is no longer the limiting assumption for the specified global phase-zero unit-prime exponent receiver. For any two fixed GP29 alphabet permutations (A,B), consider (C_i=B(A(P_i)^{e_i})) in GF29, with the successive unit-prime schedule beginning at 3. Test consuming or internal-zero-hold clocks (the held output label may be arbitrary), and both direct and inverse exponent directions. These extensions are hypotheses, not source-authenticated operations; the earlier signed DH example and p56 prime clock motivate the general vocabulary but do not choose the combined cipher.

The first inverse exactly scores all 1,318,688 gauge-reduced affine-wrapper representations on 9,640 training runes (p0–39), then uses a 32-per-law unigram shortlist for native trigram selection; p40–55 (3,316 runes) is withheld. All four independent literary plants recover their exact hidden gauge-fixed tuple and all 12,956 runes per plant (13,264 held runes total). Every original law produces nonprose, despite exact forward replay. The strongest original full-tape top-two cap is 1,036; held cap 303. The best train-ranked original candidate scores −3.511697/−3.535656 train/held trigram log probability per rune, compared to −2.801570..−2.661394/−2.745470..−2.661077 on plants. The trigram shortlist is not an all-key trigram optimum.

For arbitrary (A,B), top-two concentration is invariant to (A^{-1}). For a fixed target pair ({x,y}), construct a 29×29 integer cost matrix: (W_{cz}) counts positions having original symbol c at which the specified inverse power of z falls in the target pair. The unknown (B^{-1}) is a one-to-one assignment from c to z; a maximum-weight Hungarian assignment gives its exact optimum. For internal-zero hold enumerate each of 29 possible ciphertext labels for z=0, pin that row/column and solve 28×28 assignments. The phase sequence is thus fully determined before assignment. A simultaneous unit exponentiation of both target symbols permutes columns, commuting with every clock exponent and fixing zero; the 406 pairs fall into exactly 51 orbits. This quotient loses no possibilities.

| Global law | Exact full top-two maximum | Exact held maximum |
|---|---:|---:|
| Ordinary, direct exponent | 1,122 | 361 |
| Ordinary, inverse exponent | 1,122 | 361 |
| Zero-hold, direct exponent | 1,162 | 365 |
| Zero-hold, inverse exponent | 1,162 | 365 |
| Native reference floor | 2,456 | 588 |

Native floors are computed over every contiguous matched window in the pinned Shakespeare, Emerson and Gibran GP29 references: 564,558 full and 593,478 held-length windows. All four original maxima are strictly below these floors. Full and held maxima may use different outer permutations; they are conservative independent bounds. Neither a secret arbitrary fixed input relabeling nor a secret arbitrary fixed output relabeling can repair the concentration failure under this clock. No order/spacing assumption or dictionary is needed; the comparison is finite to the stated reference distribution, not a theorem about all languages. A public clock with another origin or resets and other exponent/state laws are not covered here.

The exact assignment implementation checks integer primal/dual feasibility and matching objectives on every solve, passes 112 brute-force small matrix controls, retains the concentration of two arbitrary-permutation native KOAN plants (same source text, different maps/clocks; no unique key claim), reproduces the full 406-pair optimum on two 96-rune prefixes, and replays the exact maximizing output maps. All source indices and outputs are recorded.

- [Affine inverse SFT](../sims/lp2_prime_exponent_affine_wrapper_original_sft.cjs), freeze d7594116; [raw outputs](lp2-prime-exponent-affine-wrapper-output.json), ef25f7f3.
- [Exact arbitrary-permutation SFT](../sims/lp2_prime_exponent_allpermutation_capacity_sft.cjs), freeze 942fb1e4; [raw witnesses](lp2-prime-exponent-allpermutation-capacity-output.json), 0d242ba7.
- Both frozen computation cores ran in connected V8; standalone CommonJS wrappers have not separately run in native Node/Windows. No CI dispatched. No new unknown plaintext, key, or authenticated clock selection.

## All 3,301 prime origins: chapter-private arbitrary alphabet maps (Agent 5)

The global result does not by itself address a private chapter key or shifted start. On the full physical p40–53 chapter (3,008 runes), grant independently arbitrary static input/output alphabets, both consuming and internal-zero-hold clocks, both exponent directions, and all 3,301 consecutive unit-prime origins 0..3300.

For each multiplicative-order orbit in GF29, unit exponentiation partitions the 12 unit exponents into cosets of the stabilizer of a representative. Orbit sizes including zero are 1,1,1,2,6,6,12. For one target inside an orbit of size k, a given ciphertext label can contribute at most its largest coset count; for two distinct targets in the same orbit it can contribute at most its two largest coset counts. Exactly k ciphertext labels may be assigned to that orbit. Therefore the sum of the k largest per-label capacities bounds any alphabet permutation. Distinct-orbit target pairs are bounded by the sum of their individual orbit capacities (relaxing disjointness). For a zero-hold clock, pin the ciphertext label assigned to zero and remove it from other classes, with its entire count available only to the zero singleton. Inverting all exponents merely permutes the stabilizer cosets; one evaluation covers both directions. This is a rigorous upper bound, not a claim of exact assignment optima.

| Clock | Origin/held-label states | Largest relaxed top-two bound | States reaching native floor |
|---|---:|---:|---:|
| Consuming | 3,301 | 382 (origin 51) | 0 |
| Internal-zero hold | 95,729 | 397 (origin 2811, ciphertext label 9) | 0 |
| Native reference | 594,402 contiguous 3,008-rune windows | minimum 532 | — |

All four arbitrary-alphabet planted controls at origins 0,777,1234,3300 retain their true top-two counts (598/642/607/604 within bounds 696/653/624/716), including two inverse-exponent cases and two held-label clocks. These are positive bound checks, not recovered arbitrary-permutation keys. The four exact affine key-recovery controls remain the earlier separate experiment.

**Decision:** retire this entire public unit-prime exponent receiver with fixed alphabet maps for p40–53, even under chapter-private alphabets and any of the 3,301 tested origins; consequently a book-wide model of that family with independent chapter origins/maps cannot match the frozen native chapter distributions. The 135-rune gap between the most permissive upper bound and the minimum donor concentration is robust to secret alphabet relabeling. This does not exclude arbitrary other exponent schedules, page-private alphabets, other source registers, position-dependent alphabets, non-unit powers with genuine side information or other state laws. No unknown plaintext or key. No historical source selects this speculative power cipher; do not broaden its exponent/clock family absent a new independent clue.

[All-origin orbit-bound SFT](../sims/lp2_prime_exponent_allorigin_chapter_orbit_bound_sft.cjs), freeze c2ca9f16; [complete raw output](lp2-prime-exponent-allorigin-chapter-orbit-bound-output.json), edf2e291. All 99,030 states evaluated in connected V8; standalone Windows/Node wrapper not independently executed. Sources and exact per-held-label maxima preserved.
