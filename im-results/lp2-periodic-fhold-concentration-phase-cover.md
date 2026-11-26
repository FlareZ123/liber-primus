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

## Decision

Retire q8 and q13 continuous shared periodic additive key transfer to p40–53 for the fixed native frequency references, even granting arbitrary plaintext positional transport. q8 also excludes all sliding donor windows. q13 leaves a small reference-conditioned residual, but no actual historical key, joint native histogram, or plaintext witness. Independent page resets, chapter-private clocks, dynamic keys and changed register are different receivers. A five-phase exploratory optimizer timed out and contributes no result; no automatic successor is warranted from that incomplete computation.

Reproduce: `node sims/lp2_periodic_fhold_concentration_phase_cover_sft.cjs`. [SFT](../sims/lp2_periodic_fhold_concentration_phase_cover_sft.cjs), [raw output](lp2-periodic-fhold-concentration-phase-cover-output.json). Executed in connected JS on fetched repository inputs; no Windows CI claim. This is a strict source-coordinate conditional exclusion, not a claim that the cipher or manuscript is solved.
