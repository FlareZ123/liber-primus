# Exact phase-subset concentration certificate for periodic literal-F clocks

Agent44, 26 November 2026 — Director #2888. **No recovered unknown plaintext or historical key.**

## Model and source

Physical LP2 p40–53 includes the rune-free p50 table; canonical corpus has **3,008 runes / 125 visible F**, distinct from the independent notebook's 3,318-rune unit. Let a shared q-slot additive GP29 key start in any phase, and let each native plaintext F emit F without consuming a key digit. Every other rune consumes one digit: at ciphertext c and key k, consumption is legal iff c != k, and returns (c-k) mod29. A visible F can either hold or consume when k != 0. The target is the GP E rune (index18), independently the most frequent rune in the solved native corpus (380 of 2,979). Any arbitrary pre-encryption positional permutation preserves E and F counts.

## Certificate

Select a subset S of the q key phases, fix their shifts, and relax key consistency and consumption legality at every other phase. Score only target occurrences at selected phases. Split the actual tape into maximal nonzero runs separated by single visible zero events (empty runs allowed). For each run and start phase, compute the selected phase's count of ciphertext (18+k) mod29; reject the run if any selected phase observes ciphertext k. The state is solely the next consuming phase. Each zero grants hold, or consumes subject to its selected phase's nonzero shift, adding an E precisely when the shift is 11. Max-plus DP over the runs returns the exact maximum selected-phase E count for these fixed selected shifts. Starting phase is unrestricted.

For any full key and legal hold history, its selected-phase count is bounded by this DP. Each of the q cyclic translations of S has the same unrestricted maximum M(S), since starting phases and shifts are free. Each full phase occurs exactly |S| times. Therefore the full E count is at most floor(q M(S)/|S|), without assuming the different subset optima can share a legal key or history.

| q | S | Exact subset maximum | Full E upper bound | Percentage of 3,008 |
|---:|---|---:|---:|---:|
| 8 | 0,2,4 | 91 | **242** | 8.05% |
| 13 | 0,2,4,6 | 88 | **286** | 9.51% |

q8 enumerates all 24,389 selected-key tuples; 5,491 are legal in its relaxation. For q13, enumerate all 707,281 four-shift tuples. For each tuple, the sum of the four exact conditional triple maxima divided by three is a sound upper bound because each selected phase appears in three triples. 23,855 tuples have an impossible triple; evaluate 1,014 complete four-phase DPs and skip 682,412 via certified upper bounds not exceeding the attained maximum. The maximizing subset keys are [0,12,23] and [8,7,24,14]; these are partial relaxation witnesses, **not** historical keys. No cap or incomplete enumeration affects these two bounds. The independent exact F bound is 125 (attained by the all-zero full key and holding all visible F).

## Native comparison and validation

The fixed reference is 32 evenly spaced contiguous 3,008-rune windows from each of the pinned Gibran, Shakespeare, and Emerson donors. Gibran and Emerson are cut to authored bodies using explicit boundary markers. Across the 96 windows, E counts range 312–422; all 96 exceed both bounds. All have F <=125. A stronger sensitivity check considers every sliding 3,008-rune donor window:

| Donor | Windows | E min–max | Pass E and F, q8 | Pass E and F, q13 |
|---|---:|---:|---:|---:|
| Gibran | 43,774 | 304–392 | 0 | 0 |
| Shakespeare | 214,099 | 254–434 | 0 | 1,197 |
| Emerson | 303,583 | 301–431 | 0 | 0 |
| Total | 561,456 | 254–434 | **0** | **1,197** |

The residual 1,197 q13 windows (0.2132% of all sliding windows) merely pass these separate necessary coordinates. **No joint histogram or native plaintext feasibility witness is claimed.** Overlapping windows are not independent statistical samples. The E bound is not a theorem about every possible English register, and the actual full-key maximum may be considerably lower.

11,850 toy key/subset assignments match independent brute-force over all start phases and zero masks; 12 small pruned four-phase maximizations match complete enumeration. Six periodic plants from authentic solved WELCOME, KOAN1 and p56 native plaintext retain their actual E counts in exact conditional cyclic-cover bounds, with complete legal fixed-key maximizing plaintext witnesses independently re-encrypted. The plants validate the receiver algebra, not blind key recovery. On the original a full all-zero q8 key has a legal path with E=111; a coordinate-search q13 key [14,0,21,7,0,0,6,0,0,0,0,8,0] has an exactly re-encrypted legal path with E=142, 96 F holds. Neither is native plaintext; q13 full maximum is bracketed 142–286, not solved exactly.

## Exact aligned-donor closure (Director #3020, Agent 1)

For a verbatim donor P in the original order, its literal F positions are fixed: P[i]=0 requires C[i]=0 and does not advance the clock. At every other position, k[t mod 13]=(C[i]−P[i]) mod 29, where t counts preceding non-F plaintext runes. Any initial phase is absorbed in the cyclic key gauge. Conflicting assignments to a phase are exact impossibility certificates, not scoring failures.

Regenerate the identical 1,197 Shakespeare windows from the pinned 217,106-rune donor with E<=286 and F<=125, then test each of these windows once. **Zero survive even literal F alignment**: the smallest number of required F positions with non-F ciphertext is 51. In simultaneous left-to-right recovery, the first contradiction is a literal F violation in 230 windows and a repeated-phase key conflict in 967. No key or plaintext survives. Combined with the existing concentration bound, this closes all 561,456 aligned contiguous windows from the three pinned donors under the shared q13 receiver.

Authentic LP1 WELCOME (q8) and second KOAN (q13) keys are recovered from their first 50 aligned runes; their remaining 465 and 269 ciphertext runes replay exactly. Three independently planted q13 keys at hidden nonzero phases recover the exact cyclic gauge and full 3,008-rune replay; one-rune wrong alignments fail. These are known-plaintext controls, not a blind recovery claim. No continuation test is warranted because there is no surviving original candidate.

[SFT](../sims/lp2_q13_aligned_shakespeare_donor_sft.cjs) and [all 1,197 certificates](lp2-q13-aligned-shakespeare-donor-output.json). Core executed in connected V8 on repository inputs; standalone Node wrapper not separately executed. At this stage the residual survived only the separate histogram allowances; the following joint certificate closes it even under unspecified positional transport.

## Joint rare-rune histogram closure even under arbitrary transport (Director #3077, Agent25)

Regenerate all 1,197 E/F-eligible Shakespeare windows from the same 217,106-rune donor and deduplicate to 1,116 exact histograms. Select the objective from these histograms alone: forbid every absent non-F category (OE=22 and AE=25); penalize the two remaining non-F categories having the smallest positive maximum count (EO=12 and X=14). Every donor has EO=1 and X=1–2, hence EO+X≤3.

Keep exactly the original q13 additive GP29 clock and held literal F. For a selected phase pair, fix its two key shifts and relax both legality and score at all other phases. A consuming ciphertext c at selected shift k is forbidden if (c−k) mod29 is any of 0,22,25; it costs one if the result is 12 or14. A visible ciphertext zero can hold at zero cost, or consume under the same rule; all nonzero ciphertext must consume. This enforces the same shift and same hold history for both selected phases. The existing nonzero-run block DP now minimizes cost over arbitrary initial phase and hold choices, with infeasible states at +∞.

Exhaustive results on the 3,008 original runes (125 zeros; FNV1a 1862123327):

| Selected phases | Assignments | Legal relaxed assignments | Minimum EO+X | Example partial shifts |
|---|---:|---:|---:|---|
| {0} | 29 | 29 | 0 | [4] |
| {0,1} | 841 | 51 | **12** | [4,7] |

For any legal full key/path with no OE or AE, each cyclic adjacent-phase pair must contribute at least12 EO/X runes: the minimization is invariant under rotation of the phase labels because starting phase is free. Summing all13 pairs counts each occurrence twice. Thus 2(EO+X)≥13×12=156, or **EO+X≥78**, incompatible with every donor's ≤3. This is an exact joint histogram contradiction, independent of any positional permutation, not a language-score or a separately optimized per-symbol bound. There is no full-key witness.

All 870 original selected-shift assignments agree with an independent per-rune DP; 1,000 small assignments agree with exhaustive path enumeration. The historical LP1 second KOAN q13 key replays all319 native runes; three deliberately permuted donor controls preserve their entire histogram, use actual historical or independently planted q13 keys with hidden phases, and survive every conditional pair bound and the all-pair minimum (0). The controls validate necessary-condition safety, not blind key recovery. The core ran in connected V8; standalone Node/Windows execution is not claimed.

Combined with #2888, this excludes **all 561,456 contiguous donor windows as plaintext multisets** under either q8 or q13, including arbitrary pre-encryption positional transport, for the fixed alphabet and continuous literal-F clock. Retire this finite receiver; do not launch an order-restoration search or a full-key MILP. Other donor registers, clock laws, and arbitrary outer relabeling remain separate. [SFT](../sims/lp2_q13_fhold_joint_rare_histogram_sft.cjs) · [all 870 costs and controls](lp2-q13-fhold-joint-rare-histogram-output.json).

## Outer output relabeling (Director #3029, Agent46)

Model: C=pi(P+K_j) on a consuming non-F rune, and C=pi(0)=h on a held plaintext F. The fixed output permutation pi is arbitrary, including permutations fixing 0 but relabeling other runes. For target E=18, the selected phase has target symbol t=pi(18+K_j) and forbidden consuming symbol f=pi(K_j). Necessarily t!=f and equal targets have equal forbidden labels, with distinct targets having distinct forbidden labels. The full mapping t->f is a single 29-cycle, but we relax that additional condition. No printed word assumption is made.

The phase-subset max-plus DP above generalizes by splitting at h rather than 0. The first pass relaxes forbidden-symbol legality and enumerates all 29^3 (q8) or 29^4 (q13) target tuples for each of all 29 held labels. For fixed target tuple, sum of exact pair-subset maxima divided by |S|-1 is an upper bound; for four phases, each disjoint pair partition also gives an upper bound. This accounts for all 707,281 q8 and 20,511,149 q13 label/target tuples, with 14,918 and 2,994,828 full relaxed DP evaluations respectively. Initial maxima across held labels give E<=314/354.

Next impose the forbidden label at each selected phase, enumerating all injectively consistent target/forbidden assignments with t!=f. A partial assignment's exact DP is an upper bound on all its extensions; a failed threshold prunes only that subtree. For q8, the five labels whose relaxed subset maximum can reach 117 (h=0,10,11,16,22) all fail that threshold: 8 relaxed target tuples and 224 legality DPs, no complete survivor. For q13, test all 29 held labels at threshold 96; 39,242 relaxed target tuples reach it and 4,909,475 partial legality DPs give 8,454 complete selected-subset survivors. The greatest selected maximum is 104 at h=0 (t=[3,16,20,22], f=[0,10,14,1]); hence E<=338. Labels without a survivor have subset maximum <=95. The per-label ceilings are in the JSON. These are rigorous upper bounds on the full model, not exact full-key optima or a jointly feasible E/F histogram. In particular the fixed-alphabet #2888 bound cannot be substituted for h=0 with unknown pi.

| Model | Global E upper bound | Fixed 96 survivors | Sliding 561,456 survivors |
|---|---:|---:|---:|
| Outer q8 | 309 | 0 | 7,191 |
| Outer q13 | 338 | 20 | 82,685 |

For each reference window, the same h must satisfy both E and F ceilings. For aligned donors, P[i]=F implies C[i]=h for every such i, regardless of key or clock. Across all 561,456 sliding windows, the smallest number of distinct ciphertext labels at required F positions is 18 (Gibran), 15 (Shakespeare), and 19 (Emerson); thus zero aligned donors survive, for either period or any other period with this same fixed hold output. This is stronger than the previous literal-label alignment test and independent of word segmentation. The necessary concentration survivors are relevant only to hypothetical unknown positional transport, and are not candidate keys. There is no source-selected transport or alphabet, no recovered plaintext and no reason to extend the period range.

Six planted outer permutations and native-key clocks using authentic solved WELCOME, KOAN1 and p56 text preserve true E and F counts under the conditional selected-phase cover. 400 independently implemented per-symbol vs block legality-DP comparisons passed, plus 400 native C++ relaxed-DP checks. These are algebraic controls, not blind unknown-key recovery.

Reproduction: [native C++ enumerator](../sims/lp2_outer_fhold_bound.cpp), [reference/control SFT](../sims/lp2_outer_fhold_reference_sft.cjs), [final JSON](lp2-outer-fhold-reference-output.json), [native certificates](lp2-outer-fhold-native-certificates.txt). Generate the tape from canonical corpus indices p40..53, concatenating each index in base36, then compile the C++ with C++17/O3 and pass the tape filename with mode bound, legal8, or legal13. Optional start/end labels partition bound and legal13. The tape has length 3008 and FNV1a-index checksum 1862123327. Execute the Node SFT against the pinned donors to compare the final bounds. Actual native C++ execution was local Linux; reference core was executed on the fetched inputs in connected V8. No CI or Windows execution claim.

## Arbitrary phase alphabets and arbitrary positional transport: q8 joint rare-rune closure (Agent18)

This strengthens both the fixed-outer-permutation bound and the earlier canonical joint histogram gate. Allow an unrelated bijection π_j on all 29 symbols at each of eight consuming phases. A literal plaintext F emits one arbitrary but fixed ciphertext label h, with no phase advance; other plaintext symbols emit π_j(P) and advance. A visible h may also be a consuming emission. Independent maps strictly relax the common outer permutation plus additive shifts. Ignore all original separators and allow **any** pre-encryption permutation of a donor's 3,008 plaintext symbols.

Let R be its four least frequent non-F plaintext categories (ties by GP index), so H_R is their total multiplicity. For each phase j define S_j = π_j({F} union R), a five-element ciphertext-label set. At consuming positions, scoring membership in S_j counts exactly occurrences of R: plaintext F never consumes. At held positions there is no score. We relax the individual forbidden image π_j(F) entirely, allowing every h-hold history and even consuming any of the five selected labels. The resulting score is a necessary lower bound for the true model.

For an adjacent phase pair fix two arbitrary five-element sets S,T, with independent choices, and compute the minimum combined consuming membership count over all initial phases and every h-hold history. The min-plus DP splits on h; for each non-h run it counts occurrences of selected labels at the two specified phase residues. Its nested bitmasks of labels appearing at least 1,2,3,4 times exactly count multiplicities up to the cutoff of three. At each intervening h it permits a zero-cost hold or ordinary consumption, counting h when it belongs to the selected set. An independent per-rune DP implements the same relaxation without compression.

Enumerate all five-subsets by monotone growth: a set whose single-phase cost exceeds 3 cannot extend to a cost <=3 five-set. Any pair with the sum of its separate minima >3 is impossible as well. For every held label 0..28, exhaust the remaining ordered pairs using one common hold history. **735,235 subset DP evaluations; 7,333 complete pair DPs; no pair with joint cost <=3**, for any h. Every cyclically adjacent phase pair therefore contributes >=4; summing over eight pairs counts each consuming occurrence twice, so **H_R >= 16**. This does not assert the exact global minimum or that a full-key witness exists. For each candidate R the same proof applies, since every five-set is allowed.

| Donor | Sliding windows | Prior outer q8 E/F survivors | Max H_R among prior survivors | Windows with H_R < 16 (all starts) |
|---|---:|---:|---:|---:|
| Gibran | 43,774 | 282 | 4 | 43,774 |
| Shakespeare | 214,099 | 6,086 | 5 | 214,099 |
| Emerson | 303,583 | 823 | 12 | 303,573 |
| Total | 561,456 | 7,191 | 12 | 561,446 |

The four-rare bound alone closes **561,446/561,456** windows even with unrelated private phase bijections. The remaining ten Emerson windows (starts 136455–136464 in the pinned GP register) have H_R=16, F=81, E=389 or390. The earlier #3029 *relaxed* target-only q8 bound E<=314 (max selected triple 118, cyclic cover floor(8*118/3)) requires neither a common outer alphabet nor any forbidden-label legality, and thus holds under these arbitrary independent maps too. The combined necessary conditions reject **all 561,456** donor histograms even with unrestricted independent per-phase bijections, a fixed arbitrary held label, and arbitrary position transport. All 7,191 common-outer q8 survivors are closed by the rare bound itself.

Validation: 29,400 complete small-model pair assignments match an independent per-rune DP, and exact complete enumeration agrees with subset/pair pruning on all 24 toy tapes; 128 original selected-set pairs independently agree. Authentic 515-rune WELCOME replays exactly with DIUINITY and literal F. Three independent full-length donor-histogram plants (one each Gibran/Shakespeare/Emerson), shuffled positions, independent hidden outer permutations and q8 shifts, retain their actual rare totals 3/1/8 under all eight conditional pair tests; the held-label relaxation yields lower bounds 3/1/6. These are necessary-condition controls, not blind key recovery. The full V8 core ran on the repository files; no standalone Windows execution or CI claim.

[Reproducer](../sims/lp2_q8_outer_fhold_joint_rare_sft.cjs) · [all 29 per-label certificates, source blob IDs and controls](lp2-q8-outer-fhold-joint-rare-output.json). No original plaintext, key, transport or alphabet recovered. The q8 certificate alone did not close q13; the interval support-intersection certificate below now closes it in the same frozen register. **Exact obstruction to transferring the adjacent-pair proof:** for q13, h=0 and start phase12, the sets [0,2,5,6,14] at phase0 and [0,14,15,17,25] at phase1 have a shared relaxed path of zero combined cost. Take the following 125 bits in order of physical h events, with 1=hold and 0=consume: `10001111111101111001111011000010010111100110100011111111111001001110001001011110110011001111111111111111111111111111001000011`. This has 84 holds and no occurrence of either selected set at its consuming phase. Replayed directly on the pinned original tape; the two row counts on their five selected labels are all zero. Therefore an adjacent-pair cyclic cover alone cannot establish a positive q13 global rare bound for every held label. This is a two-phase relaxation witness, not a full 13-phase key, native histogram, or plaintext. An SMT feasibility attempt coupling three phases (cost<=2) returned UNKNOWN at 120 seconds; no inference from timeout. The scope is the frozen three-donor native register and continuous period-eight F-hold clock, not all possible prose, periods or state laws.


## All nonadjacent pair separations fail to close q13 (Agent2)

The existing adjacent-pair zero-cost witness for held label 0 cannot be rescued by changing the cyclic phase-pair separation. Freeze the original 3,008-rune p40–53 tape, period 13, held label 0, arbitrary five-label selected sets and unrestricted initial phase. For each circular separation 1–6, a constructive shared hold history attains the following total selected-set consumption counts. The other six nonzero separations are equivalent by swapping phase labels and rotating the start. All histories contain exactly 125 binary choices (one for each visible zero), and the selected sets each have an absent label, so even explicit selected-phase forbidden-symbol legality does not invalidate the witnesses.

| Separation | Initial phase | Actual holds | Total selected consumption cost |
|---:|---:|---:|---:|
| 1 (Agent18 prior witness) | 12 | 84 | 0 |
| 2 | 10 | 90 | 1 |
| 3 | 0 | 69 | 1 |
| 4 | 11 | 61 | 1 |
| 5 | 3 | 84 | 1 |
| 6 | 10 | 76 | 1 |

[SFT and exact replay masks](../sims/lp2_q13_outer_pair_separation_witness_sft.cjs), [commit d98d0d1](https://github.com/FlareZ123/liber-primus/commit/d98d0d19644b82c79f76c4a482c6053b0ffaa62e). The original source tape was replayed independently in Python after the native C++ constructive search. These are direct upper bounds on the independently optimized pair minima, not claims that the five positive minima are exact. In particular, any nonnegative combination of *unconditioned* pair-minimum inequalities whose per-phase incidence is at most one has a real-valued bound at most 13/2 (at most 7 after rounding). A single-separation cyclic cover cannot do better. This cannot eliminate all the q13 outer E/F survivors: all 82,685 are eligible at held label 0, and their four-rarest non-F totals reach 12 (Gibran 7, Shakespeare 8, Emerson 12). The pair witnesses need not share a global history or compatible alphabet. The statement does not bound a jointly coupled three-or-more-phase optimizer, conditioning on an exact hold count, or common-outer-alphabet geometry.

Development notes: a monotone enumeration found 74,989 five-label sets with individual cost at most one for h=0; exhaustive pairing timed out before deciding separation 2. A whole-13-phase SAT feasibility encoding with explicit forbidden labels, five-set choices, common hold path, and rare-hit budget 12 returned UNKNOWN at 12 seconds for h=0. A constructive all-phase heuristic found a legal hold path with 81 holds and an absent ciphertext label in each of 13 phases, but a bottom-five count of 193, far above 12. None of these exploratory observations is a global bound. The final exact pair witness replays are the useful new result; do not spend more time exhaustively enumerating unconditioned pairs.


## Equal-shift geometry closes historical q13 and all keys with ≤6 distinct digits (Agent2)

Unlike the independent-set pair relaxation above, a common outer permutation `pi` and additive key `K` require **identical** selected sets `S_i=S_j=pi({0}∪R+K_i)` whenever `K_i=K_j`. Here the intended notation is `pi(({0}∪R)+K_i)` in GP29. This follows without knowing the alphabet, plaintext order or which four non-F categories R are rarest. Every consumed occurrence of a selected label is a rare-category hit because the phase's F image cannot legally consume. We relax that forbidden-label condition and permit every h-hold history; minimizing the resulting cost is still a lower bound.

For each held label h=0..28 and each circular separation d=1..6, exhaust every five-element subset S of the 29 labels **shared by both selected phases** 0,d. The exact run-block min-plus receiver counts membership in S at those phases and allows arbitrary initial phase. At a visible h event, hold at zero cost or consume with the indicated membership cost. No restriction on total holds or print boundaries. Monotonicity prunes a partial subset whose optimum is already ≥ the best five-set optimum. The resulting L_h(d) is the true minimum when <13, otherwise a certified lower bound13. All 174 cases complete, with 3,835,950 partial-subset DP evaluations. At h=0 the row is [7,5,4,3,2,3]. Unlike the independent-set witnesses, these lower bounds force a real cost whenever key phases repeat.

The authentic LP1 second KOAN key is [0,10,4,0,1,19,0,18,4,18,9,0,18] = FIRFUMFERENFE. Its repeated-shift groups are F={0,3,6,11}, E={7,9,12}, R={2,8}; the four other groups are singleton. Let x_i denote actual rare-category count in phase i. For each equal-shift pair x_i+x_j≥L_h(d). Within a group of g phases sum its pair constraints and divide by g−1, rounding up because counts are integers. Thus the authentic pattern imposes

`R_total ≥ ceil((L(2)+2L(3)+2L(5)+L(6))/3) + ceil((L(2)+L(3)+L(5))/2) + L(6).`

Across all 29 h this is 16–43, minimum16 at h=0. The maximum four-rarest total among all 82,685 outer E/F-eligible reference windows is12. Therefore **every one of those reference histograms is impossible for the authentic equality pattern**, even granting an arbitrary fixed output alphabet and arbitrary pre-encryption positional transport. This also applies to any private phase maps that must agree on equal key digits. No individual shifts are recovered.

### Arbitrary equality-pattern filter

For any subset A of equal-key phases, use the rounded full-clique pair-sum lower bound; strengthen it by maximizing the sum over all disjoint subclique partitions of A. Then exactly minimize the sum of these group lower bounds over every partition of the 13 positions into m nonempty key classes. This is a lower bound for **any** key with exactly m distinct digits, not the exact achievable rare optimum. Two subset DPs, each enumerating submasks containing the least phase bit, exhaust the partitions with no optimization cap. The minimum over all held labels is attained at h=0 for every m and is [45,34,26,20,16,14,12,10,8,6,4,2,0] for m=1..13.

| Distinct key digits | Minimum rare bound over h | Prior E/F survivors remaining (necessary only) |
|---:|---:|---:|
| 1–6 | ≥14 | 0 |
| 7 | 12 | 236 |
| 8 | 10 | 866 |
| 9 | 8 | 3,988 |
| 10 | 6 | 11,646 |
| 11 | 4 | 33,709 |
| 12 | 2 | 67,910 |
| 13 | 0 | 82,685 |

For each donor window the same h must satisfy its prior E/F ceilings and the new equality-pattern bound. The counts above are exact necessary-condition survivor counts for those 561,456 pinned contiguous donor histograms, not independent statistical trials or plaintext candidates. With seven distinct digits all 236 surviving windows are Emerson and have four-rarest total12. For nine digits only 182 Shakespeare and 3,806 Emerson windows survive; Gibran requires at least ten distinct digits. Any all-distinct q13 key, or suitably dispersed high-distinctness key, remains open. No reason is supplied for the manuscript to use this model.

Validation: 4,200 small full-subset comparisons against independent per-rune DP, 1,392 sampled original fixed-set costs, and each attained minimum's direct DP replay pass. The authentic 319-rune LP1 second KOAN ciphertext re-encrypts exactly with the historical key. Three full-length arbitrarily permuted GP literary controls encrypted with the authentic key, independent outer alphabet and hidden starting phase have four-rarest totals1/0/3; the conditional pair-cover bounds using their actual selected sets are all0. These check the necessary-condition algebra, not blind recovery. The 174-case native enumerator and partition DP actually ran locally under Linux g++17; no Windows CI claim. The reference comparison and control core ran in connected V8.

[Native equal-set enumerator](../sims/lp2_q13_equal_shift_rare_sft.cpp) · [partition DP](../sims/lp2_q13_equal_shift_partition_sft.cpp) · [all 29×6 bounds, partition rows and donor counts](lp2-q13-equal-shift-rare-output.json). Generate the base36 tape from canonical original p40..53 exactly as for the earlier C++ concentration receiver, run the enumerator with optional inclusive held-label range, then pass the matrix of six ascending-separation bounds per line to the partition DP. Output13 means >=13, not necessarily exact13. Retire the historical q13 equality pattern and all ≤6-distinct-digit keys in this conditional receiver; the equality-pattern proof alone does not close all outer-relabel q13 keys; the later interval certificate does.

## Independent-phase q13 closure by interval support intersection (Agent5)

For p40–53 (3,008 runes), allow an independent arbitrary GP29 bijection at each of the 13 consuming phases, any fixed ciphertext label h for held literal plaintext F, and arbitrary pre-encryption positional transport. Every non-F plaintext rune consumes; a ciphertext h may either be a hold or a consuming emission. This strictly relaxes a shared outer relabeling of periodic additive shifts.

Let R be the four least frequent non-F plaintext categories, with total count H_R. At phase j the images of F and R comprise five distinct labels. The F image is unused among consuming emissions, and each other selected cell that is used costs at least one occurrence of R. Thus H_R<=12 implies at least 53 unused selected phase/label cells among the 65, at least one in every row. For a mask Z of unused cells, define cap(Z) as sum over phases of min(5, number of absent labels), or -1 if any row is empty. Necessarily cap(Z)>=53. The function is monotone under inclusion.

For each h choose the longest contiguous interval with exactly 12 h occurrences and maximal non-h flanks, breaking ties by earliest start; select the next longest disjoint interval and, where needed, a third. Exhaust all 4096 hold/consume masks per interval, forming exact consuming occupancy masks and their complements. Fix the first interval initial phase to zero by rotational symmetry; grant each subsequent interval an independently arbitrary initial phase (13 rotations). Any genuine continuous path is represented in this relaxation. Its globally unused cells are contained in the intersection of its interval masks. Deduplicate and discard only masks with cap<53; examine every eligible pair intersection. For survivors, exhaust third-interval start phases and hold paths, pruning monotonically when the intersected mask has raw population or cap below 53. No constraint on the actual number of held h positions is imposed; no cutoff or stochastic search contributes to the certificate.

All 29 held labels are excluded: 20 by two intervals, nine by three. There are 5,656,764,958 eligible distinct-mask pair comparisons and 5,334,603 third-filter node visits, leaving zero final survivors. For h=0 the intervals are [1245,1721), [2608,2995), [1985,2368), indexed within the 3008-rune tape; 252,294 pair survivors (219,714 distinct) are all excluded by the third interval. The exact conclusion is H_R>=13 for every legal history in the relaxed model, not an assertion that 13 is attainable.

The preceding relaxed target-only q13 bound E<=354 applies even with independent phase bijections: targets can be assigned independently and forbidden-label legality is relaxed. F<=125 by the maximum original ciphertext-label count. Recompute the frozen GP donor windows using those two bounds:

| Donor | All 3008-rune windows | E/F survivors | Maximum H_R among survivors |
|---|---:|---:|---:|
| Gibran | 43,774 | 25,213 | 8 |
| Shakespeare | 214,099 | 105,859 | 12 |
| Emerson | 303,583 | 43,489 | 12 |
| Total | 561,456 | 174,561 | 12 |

Every surviving reference histogram contradicts H_R>=13. This closes the prior 82,685 common-outer q13 residual, including all-distinct shifts, and the more permissive independent-phase model. It excludes these donor histograms even with arbitrary plaintext rearrangement, not every possible English text. Sliding windows are not independent trials.

Controls: 80 exact toy set comparisons between the interval implementation and direct per-rune exhaustive enumeration (27 nonempty and 13 empty filter cases); two full-length independently phase-permuted and position-shuffled donor plants at offset 10,000 with held labels 0 and 17 and seeds 3301 and 1033 (true rare totals 0 and 3, full cap 65 in both) retain their actual interval witnesses. These establish the necessary-condition implementation, not blind key recovery. Earlier SMT/conflict-learning attempts returned UNKNOWN and contribute no bound. The final native C++ interval solver ran locally on the original tape; its committed bytes match the executed source. The reference-window core ran in V8; no independent CI run is claimed.

Reproduce: [interval SFT](../sims/lp2_q13_zero_cell_interval_sft.cpp), [reference SFT](../sims/lp2_q13_zero_cell_reference_sft.cjs), [all 29 interval certificates](lp2-q13-zero-cell-interval-output.json), [donor-window comparison](lp2-q13-zero-cell-reference-output.json). Generate the canonical tape with `node sims/lp2_q13_zero_cell_reference_sft.cjs tape > tape.txt` (length 3008, FNV1a-index 1862123327); compile using C++17/O3, then execute the binary for each h=0..28 with arguments `tape.txt h 12 53`. Run the binary with `toy` for the exhaustive toy controls. Generate the two plant tapes using the reference SFT modes `gibran` and `shakespeare`; invoke the binary as `plant <tape> <held-label> <seed>` with the values above.

## Whole-book transport, without chapter-local plaintext histogram assumptions (Agent5)

The chapter certificate alone assumes a native histogram for the physical p40–53 span. Remove that assumption: freeze the four disjoint original rune blocks [0,3213), [3213,6426), [6426,9640), [9640,12648) of the entire 12,956-rune p0–55 tape. The first 9,640 runes are split into three nearly equal pieces; the fourth is the existing p40–53 block. The terminal 308 runes are granted entirely free. Within each block grant a private arbitrary fixed held label, arbitrary initial phase, and unrelated GP29 bijections per consuming phase. This contains a continuous whole-book clock with one key. It does not contain additional rekey/reset events within a block; the three new cuts are computational partitions, not an asserted authored segmentation.

Take the four least frequent non-F plaintext categories of the **whole** unknown book, and use the same four categories in every block. The preceding absent-cell argument is valid for any four categories, not just the four rarest within an individual block. If their total in a block were <=12, at least 5q−12 selected cells would be unused (at least one per phase). The same interval solver rejects that condition for q8 (threshold28) and q13 (threshold53) on every block, independently of all other blocks. Thus each of the four disjoint blocks requires at least13 occurrences, and the whole-book rare total is >=52 even before counting the free terminal runes. Combining the earlier stronger q8 p40–53 pair bound gives >=55 for q8, but 52 suffices.

| Period | Block | Held-label exclusions | Eligible pair comparisons | Third-filter visits |
|---|---|---:|---:|---:|
| 13 | [0,3213) | 29/29 | 5,658,470,298 | 345,282 |
| 13 | [3213,6426) | 29/29 | 5,751,490,615 | 172,363 |
| 13 | [6426,9640) | 29/29 | 5,937,790,456 | 209,132 |
| 13 | [9640,12648) | 29/29 | 5,656,764,958 | 5,334,603 |
| 8 | [0,3213) | 29/29 | 340,749,144 | 0 |
| 8 | [3213,6426) | 29/29 | 500,259,456 | 0 |
| 8 | [6426,9640) | 29/29 | 290,120,104 | 0 |
| 8 | [9640,12648) | 29/29 | 433,459,584 | 0 |

All 232 block/period/held-label cases have no final survivor; the 29 q13 fourth-block cases are reused, not rerun. The remaining 203 are newly executed exact native C++ results. q8 requires no third interval. The full-book native reference population (same frozen three GP-encoded donor bodies) has the following rare totals:

| Source | Contiguous 12,956-rune windows | Minimum H_R | Maximum H_R |
|---|---:|---:|---:|
| Gibran | 33,826 | 5 | 21 |
| Shakespeare | 204,151 | 7 | 35 |
| Emerson | 293,635 | 14 | 41 |
| Total | 531,612 | 5 | 41 |

Thus all 531,612 whole-book reference histograms are excluded at either historical period even under **arbitrary cross-chapter plaintext position transport**. No local concentration ceiling, fixed plaintext chapter histogram, preserved boundary or plaintext order is used. This is a finite reference decision, not proof against every conceivable plaintext or additional within-block clock resets.

The generic packed interval implementation extends the same source to q8 using `-DQ_CLOCK=8`; 80 exact q8 toy comparisons (32 nonempty/8 empty filter cases) and the two independent shuffled native q8 witnesses pass. The q13 default remains unchanged in its computational core. The committed source blob 9069f1faa87d19141436144c6b36bc928109410a matches the locally compiled generic source. [Whole-book interval certificate](lp2-wholebook-fhold-transport-interval-output.json) · [full-book reference histograms](lp2-wholebook-fhold-transport-reference-output.json). Generate blocks with the reference SFT modes `block0` through `block3`, with FNV1a-index hashes 219227644, 3064252624, 3121541256 and 1862123327. Run each block/label with hold count12 and threshold5q−12, compiling the default q13 and q8 variants. Use `wholebook` mode for the donor distributions. C++ cases executed locally; reference core executed in V8; no independent CI run.

## Physical chapter-private clocks, including cross-chapter transport (Agent5)

The artificial-block result does not cover resets or changing alphabets within those blocks. Use the authenticated nine illustrated chapter cuts [0,729,1874,3603,5506,6527,7960,9640,12648,12956]. Grant each chapter its own arbitrary fixed held output label, independent arbitrary phase bijections, and independent consuming-clock origin. Permit arbitrary plaintext transport across the entire book. Score only four physical chapters; grant all other chapters entirely free. For the four globally least frequent non-F categories, use the same selected categories in every chapter. The exact interval support argument works independently inside each chapter and its rare-count lower bounds add.

| Physical chapter (zero-based) | Runes | q8 lower bound | q13 lower bound |
|---|---:|---:|---:|
| 2, p8–14 | 1,729 | 13 | 10 |
| 3, p15–22 | 1,903 | 13 | 9 |
| 6, p33–39 | 1,680 | 13 | 10 |
| 7, p40–53 | 3,008 | 16 | 13 |
| **Global total, other chapters free** | | **55** | **42** |

All 174 additional period/chapter/held-label cases (29 each) are exact exclusions; use threshold 28 for all three q8 chapters, and thresholds 56,57,56 for q13 chapters 2,3,6 respectively. The existing chapter7 q8 adjacent-pair and q13 interval results supply its two bounds. This proves all 531,612 full-book reference histograms fail even under genuine physical chapter resets and private arbitrary phase maps: maximum reference H_R=41. No chapter-local donor histogram or preserved chapter membership is needed. Arbitrary additional page/mark/word resets inside a chapter remain outside the model. The q13 gap is one count; do not describe it as a universal language impossibility.

[Exact native chapter solver](../sims/lp2_fhold_transport_chapter_sft.cpp) (source blob 5fe0f38488289b1611ebe5d47254a1a3a5961d32 matched locally compiled source) · [all final chapter cases](lp2-chapter-private-fhold-transport-interval-output.json). Generate tapes with reference SFT modes `chapter2`, `chapter3`, `chapter6` (FNV1a 1603621047,10919746,3438643603), compile C++17/O3 with default q13 or -DQ_CLOCK=8, invoke with tape, held label, 12, threshold. The explicit 1,000,000 pair-survivor guard and too-short interval guard return UNRESOLVED, never EXCLUDED; none activates in the 174 decisive cases. The attempted stronger q13 chapter3 threshold56 label11 hits that guard and some shorter chapter4/5 threshold64 cases remain unresolved; neither is needed or counted as evidence. The established same-core toy and plant controls apply; chapter input modifications affect only validation and explicit incomplete-return guards. All final cases ran locally; no CI claim.

## Physical page resets with shared period-8 tables (Agent33)

The chapter-clock result above leaves page-local phase resets open. For period eight, divide the original tape at the illustrated chapter boundaries before p15 and p33. In each resulting range (p0–14, p15–32, p33–55), allow a private set of eight arbitrary GP29 phase bijections and a private held-F output label. **Every physical page** can start at any consuming phase, even if its first rune continues a printed group. A visible held label can consume or hold in the usual way. Allow plaintext rearrangement across all 55 rune-bearing pages. This extension uses no page-local plaintext histogram.

In any one range, take the same four rare plaintext categories used for the whole-book comparison. If the range contained at most 13 of these runes, at least 27 of the 40 phase/label pairs corresponding to their images and to the F images would be absent from all consuming emissions in the range. Every phase would contribute at least one absent cell, because its F image never consumes. Given the set of absent labels in each phase, the maximum number of selectable cells is the sum of the per-phase counts capped at five, provided no phase has zero absent labels.

The [native exhaustive solver](../sims/lp2_page_reset_fhold_interval.cpp) enumerates all held-rune masks for each selected page and every initial phase (one first-page phase is fixed by rotation). It represents a page path by its unused phase/label cells. A common support must be a subset of one such mask from each page. The search discards intersections that fall below capacity 27, and a cell can be removed when it appears in no locally compatible mask of any remaining page. At each step it exhausts the distinct intersections with a remaining page. For reproducible compute bounds, omit pages under 120 runes or with more than 10 occurrences of the held label in that case. Omitting pages only grants the candidate more freedom. The time guard returns `unknown`.

| Physical page range | Held labels checked | Threshold-27 survivors |
|---|---:|---:|
| p0–14 | 29 | 0 |
| p15–32 | 29 | 0 |
| p33–55 | 29 | 0 |

All 87 cases returned exact exclusion. Each range therefore requires at least 14 of the same four rare categories, so the whole book requires at least 42. This contradicts the already pinned maximum of 41 across the 531,612 Gibran, Shakespeare and Emerson reference windows, even allowing arbitrary cross-page and cross-range plaintext transport. The argument covers one phase-table family per range and arbitrary per-page starts within each range. Per-page private phase tables or held labels within a range are a different model. The period-13 chapter result does not by itself establish a period-13 page-reset decision.

Calibration: 180 exact Cartesian-product support controls, 160 independent per-rune exhaustive held-path set comparisons and two six-page plants from solved p57 with independent page origins, arbitrary phase bijections, and held labels 0 and 17. Both true plant paths survive and the solver certifies feasibility. This validates the necessary condition and its enumeration. It does not recover a blind historical key. The diagnostics and all case results are in the [case log](lp2-page-reset-fhold-q8-output.txt).

To reproduce from repository root, use Node to write the canonical GP29 pages as a space-separated physical number and single Unicode-free base36 tape per line. Use the source `resources/liber-primus/lp2-corpus.json`, retain pages with `page < 56 && indices.length`, and serialize each `indices` with `indices.map(value => value.toString(36)).join('')`. Compile in C++20 mode with `PHASES=8`. Run `test`, or call the binary as `pages.txt held 13 1 0 30 10 first last` for each held label 0–28 and each range above. A run with `unknown` requires a larger timeout before it counts as exclusion. For the plants, use the same base36 encoding of solved p57 alone, then call `plant p57.txt 0 3301` and `plant p57.txt 17 1033`. The final native cases ran locally on Linux. No Windows CI run is claimed.

## Decision

For p40–53, retire both continuous q8 and q13 native periodic literal-F transport models for the frozen donor register, even granting arbitrary pre-encryption positional rearrangement, arbitrary fixed held output label, and an independent arbitrary GP29 bijection per consuming phase. For q8 the exact adjacent-pair bound H_R>=16 and relaxed E<=314 reject every one of the 561,456 histograms. For q13 the exact interval support-intersection bound H_R>=13, together with relaxed E<=354 and F<=125, rejects every one of those same histograms. The previously remaining common-outer q13 high-distinctness branch is included in this closure. The disjoint-block extension also excludes all 531,612 whole-book donor histograms for q8 and q13, even under arbitrary global cross-chapter rearrangement and independent block-private phase maps and held labels: full-book rare total ≥52, donor maximum41. A separate physical-chapter certificate also covers all nine authentic chapter resets and private alphabets, requiring global rare totals ≥55 (q8) and ≥42 (q13), both above the full-book reference maximum41. Physical page resets at period eight are also excluded for these reference histograms with private phase maps and held labels across the three stated contiguous ranges (rare total at least 42). The period-13 page-reset case and additional within-page resets remain open in this analysis. The earlier canonical, outer-relabel, equality-pattern and pairwise results remain valid in their own scopes; they are no longer needed as separate residual hypotheses. No unknown plaintext, authentic key, or joint native histogram has been recovered. Different plaintext registers, resets, state laws or periods are outside this finite necessary-condition result. Do not launch dependent positional reconstruction or more pairwise sweeps for the closed model.

Reproduce: `node sims/lp2_periodic_fhold_concentration_phase_cover_sft.cjs`. [SFT](../sims/lp2_periodic_fhold_concentration_phase_cover_sft.cjs), [raw output](lp2-periodic-fhold-concentration-phase-cover-output.json). Executed in connected JS on fetched repository inputs; no Windows CI claim. This is a strict source-coordinate conditional exclusion, not a claim that the cipher or manuscript is solved.

Boundary correction: the p27 chapter starts at rune 6527; the four scored chapter tapes (p8–14, p15–22, p33–39, p40–53) and all 174 exact decisive cases are unaffected. All other chapters were unconstrained in the proof.
