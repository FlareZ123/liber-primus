# Exact arbitrary-phase-bijection F-hold capacity: pp40–55, q1–9

**Decision:** extending the existing q1–8 additive reachability result to arbitrary GP29 phase permutations, and exactly solving q9 reachability, excludes ordinary native-register prose for the entire continuous pp40–55 tape under any of these nine periods. No unknown plaintext or authentic key recovered. This does not grant independent resets between p40–53 and p54–55 or any change to the F-hold clock.

## Invariant and SAT inverse

A consuming phase permutation S_j is a bijection on GP29. Literal P=F bypasses it, emits zero and holds the phase. Consequently ordinary consumption is legal exactly when C != f_j=S_j(F), independently of the other 28 images. At C=0 there is also a literal-F hold branch. Every legal f-vector and hold history can be completed to a full phase permutation. Thus the [prior additive q1–8 all-zero key theorem](lp2-section8-q4-allkey-fhold-frequency.md) is **exactly a theorem on possible F images** even for arbitrary phase permutations, because additive shifts realize every f_j value.

For q9, formulate exact Boolean SAT: one-hot f_j and one-hot entry phase at each nonzero run (including final run). A selected entry forbids every f value encountered at its corresponding consuming phase. At a terminating zero, Boolean b_t decides consume versus hold; consume requires nonzero f at that phase. Start phase zero WLOG since all phase vectors are free. Incrementally block each full f-vector after SAT; terminating UNSAT proves exhaustiveness. For every vector, backward feasibility and forward enumeration generate all legal zero histories. All 35 histories are retained. The source canonical 3316-index FNV64 is be6c056ed7b1bd0a; local copied source matches the connector-derived digest.

## Exact maximal histograms

For each legal history, remove f_j (the inaccessible consuming F image) from that phase's ciphertext histogram, then sort the remaining 28 counts descending. Any single non-F plaintext rune can attain at most the sum of row maxima; choosing every row's maximum as E attains it. For IoC, pairwise rearrangement maximizes each row dot product when ranks align, and all these pairwise maxima are simultaneously attainable by the same alignment. Since literal F count is fixed by the history, this maximizes total IoC over **all** arbitrary GP29 phase permutations. The q9 reproducer constructs witness permutations and forward-replays all 3316 ciphertext symbols for every history.

| q | max any non-F count | max IoC |
|---:|---:|---:|
|1|132|.034462827|
|2|151|.034763940|
|3|164|.035075788|
|4|167|.035280290|
|5|159|.035598688|
|6|172|.035815927|
|7|173|.035957477|
|8|179|.036062093|
|9|192|.036742191|

The q1–8 maxima follow from the already exact all-zero F-image vector (no new q1–8 search needed). q9 exactly five vectors: all zero (1 path); nonzero f_7=13 (4); f_6=14 (12); f_5=14 (12); f_3=14 (6). All other entries zero. Phase ordinals zero-based. Visible zero count 131; min literal F 122, max 131. An independent cardinality PB SAT search also proved consumption max9 (at least10 UNSAT), with witness.

Reference: all 590,980 contiguous 3316-GP-rune windows across the three pinned literary controls, using the existing greedy GP encoder (QU→CW, V→U, K/Q→C, Z→S, ING→NG, IO→IA, other longest GP token first). Gibran 59,177 windows min largest nonF336, min IoC .0578796165; Shakespeare 213,791 windows min289, min .0561899252; Emerson 318,012 windows min338, min .0585198689. The source's **maximum attainable** non-F count and IoC are below **every** control window's minima. These are finite reference-register comparisons, not logical English-language frequency laws.

## Calibration and limitations

Authentic KOAN1 first716 runes encrypted under nine independent random phase permutations seed3301. True f-vector [6,7,26,15,19,2,28,23,1] fixed SAT, 12 literal F, 28 ciphertext zeros, true largest non-F count92, exact histogram upper108. Twenty independent fixed-vector toy tests match positionwise DP (8 SAT,12 UNSAT). The test is of legal vectors and capacity, not recovery of arbitrary hidden permutations.

Exploratory q10,11,13 PB cardinality searches at threshold66 consumed zeros returned UNKNOWN after30s, so **no exclusion or consumption bound is claimed for these periods**. q9 is complete. Retire the exact continuous q≤9 arbitrary phase-bijection model for this combined section and native-register plaintext; separate keys, resets, alternative transforms, non-native plaintext and different clocks remain open.

[SFT](../sims/lp2_phase_fimage_exact_q9_sft.py). Run with Python and the Z3 shared library, using Z3_LIBRARY to locate libz3.dll on Windows if needed. Executed locally with libz3.so.4 and connector-verified input tape; native control copied from pinned rune-native source. SFT emits all 35 replay witnesses/histograms and the maximizing permutation witnesses. Reference windows were computed independently in connector JS.
