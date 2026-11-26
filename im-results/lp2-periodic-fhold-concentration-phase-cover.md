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

[Reproducer](../sims/lp2_q8_outer_fhold_joint_rare_sft.cjs) · [all 29 per-label certificates, source blob IDs and controls](lp2-q8-outer-fhold-joint-rare-output.json). No original plaintext, key, transport or alphabet recovered. The q13 arbitrary-outer transport branch is still unresolved; the q8 certificate does not imply its closure. **Exact obstruction to transferring the adjacent-pair proof:** for q13, h=0 and start phase12, the sets [0,2,5,6,14] at phase0 and [0,14,15,17,25] at phase1 have a shared relaxed path of zero combined cost. Take the following 125 bits in order of physical h events, with 1=hold and 0=consume: `10001111111101111001111011000010010111100110100011111111111001001110001001011110110011001111111111111111111111111111001000011`. This has 84 holds and no occurrence of either selected set at its consuming phase. Replayed directly on the pinned original tape; the two row counts on their five selected labels are all zero. Therefore an adjacent-pair cyclic cover alone cannot establish a positive q13 global rare bound for every held label. This is a two-phase relaxation witness, not a full 13-phase key, native histogram, or plaintext. An SMT feasibility attempt coupling three phases (cost<=2) returned UNKNOWN at 120 seconds; no inference from timeout. The scope is the frozen three-donor native register and continuous period-eight F-hold clock, not all possible prose, periods or state laws.


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

## Decision

For the canonical fixed alphabet, retire q8 and q13 continuous shared periodic additive key transfer to p40–53 for the fixed native frequency references, even granting arbitrary plaintext positional transport. Both q8 and q13 exclude all 561,456 sliding donor windows even as arbitrarily permuted plaintext multisets: q13's 1,197-window separate E/F residual fails the exact joint rare-rune certificate above. The q8 outer-relabel and arbitrary positional transport loophole is also closed, even allowing independent bijections at every phase: H_R>=16, whereas 561,446 donor windows have H_R<16 and the remaining ten exceed the relaxed E<=314 ceiling. The q13 outer-relabel plus transport family remains open; every phase-pair separation has an explicit low-cost witness at h=0, so the unconditioned two-phase cover alone cannot close it. No actual historical key, joint native histogram, or plaintext witness. Independent page resets, chapter-private clocks, dynamic keys and changed register are different receivers. A five-phase exploratory optimizer timed out and contributes no result; no automatic successor is warranted from that incomplete computation.

Reproduce: `node sims/lp2_periodic_fhold_concentration_phase_cover_sft.cjs`. [SFT](../sims/lp2_periodic_fhold_concentration_phase_cover_sft.cjs), [raw output](lp2-periodic-fhold-concentration-phase-cover-output.json). Executed in connected JS on fetched repository inputs; no Windows CI claim. This is a strict source-coordinate conditional exclusion, not a claim that the cipher or manuscript is solved.
