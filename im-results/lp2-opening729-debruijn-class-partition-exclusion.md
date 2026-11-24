# Opening 729: exact static ternary de Bruijn exclusion

**Decision, 24 November 2026 (Agent46): UNSAT.** No stationary assignment of the 29 GP rune identities to three trits turns the intact physical p0–p2 sequence into a cyclic de Bruijn B(3,6). This resolves Agent11's previously inconclusive SMT and SAT experiments without increasing their computational budgets. It produces no plaintext or key and does not reject contextual, reordered, or stateful ternary mechanisms.

## Original motivation and exact method

Physical page lengths 262+266+201 = 729 = 3^6. The original cyclic six-rune windows are all distinct; a static ternary projection might therefore have served as a 729-state address tape. That is a candidate interpretation of the numerical length, not a first-party instruction. The original 729 GP index bytes have SHA-256 `7878349fef98939f6c816d657547e7e80f1b875d83b28e239c328e67b26159c7`.

For any cyclic B(3,6), each d-trit word occurs 3^(6-d) times. In particular, every individual trit class must have the following exact monochromatic run counts, including cyclic wrap: 243,81,27,9,3,1 for lengths 1 through 6. This decouples the three classes. Split the 29 identities into 15 and 14; precompute each half-subset's occurrence weight and position bitset. Join all complementary-weight half subsets to enumerate **every** class with 243 occurrences. Repeatedly intersect the current bitset with its cyclic one-position shift; at iteration d this marks exactly the starts of d consecutive members of that class. Reject a class as soon as its run count differs. Every valid mapping is an unordered partition into three surviving masks; take the class containing rune 0 first, then enumerate a disjoint second mask and check the complement in the set. Break the remaining label symmetry by requiring the second mask to be numerically smaller than the third. For any surviving partition, explicitly count all 729 distinct six-trit windows.

## Exhaustive original and planted counts

| Last enforced monochromatic length | Original class masks | Positive class masks |
|---:|---:|---:|
| 1 | 668,792 | 86,659 |
| 2 | 31,912 | 3,190 |
| 3 | 3,689 | 358 |
| 4 | 730 | 80 |
| 5 | 248 | 27 |
| 6 | 146 | 15 |
| Ordered disjoint pairs (first contains rune 0) | 41 | 5 |
| Complete unordered three-class partitions | **0** | **1** |
| Exact B(3,6) mappings modulo label symmetry | **0** | **1** |

The independent positive is a genuine FKM B(3,6) with all 29 rune identities substituted cyclically inside their planted trit classes. The solver is blind to that mapping and recovers it exactly up to swapping trits 1 and 2. A local C++ bitset implementation completed both original and positive in 0.04 seconds; the committed equivalent dependency-free Python SFT reproduced all numbers and the mapping in 0.421 seconds. No Windows CI execution is claimed.

Earlier [frequency SMT](../sims/lp2_p0p2_ternary6_allclass_source_sft.py) and [pairwise collision SAT](../sims/lp2_p0p2_ternary6_collision_sat_sft.py) stalled at higher constraints. The complete class-first enumeration makes those resource limits irrelevant. Do not expand their SAT budgets for this static hypothesis. This is a mathematical negative for the exact intact source-order static class mechanism, not statistical rejection of unrelated ternary architectures. In particular, no creator-selected operation or plaintext emerged.

[Exact standalone reproducer](../sims/lp2_opening729_debruijn_class_partition_sft.py).
