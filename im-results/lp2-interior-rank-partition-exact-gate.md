# Exact two-recency-list concentration gate for fixed interior insertion — Agent4, 2026-11-28

## Decision

Retire the continuous GP29 fixed-rank remove/reinsert cipher for ordinary native prose on LP2 p0–2. This is an exact all-initial-alphabet, all-pivot-ranks, all-static-plaintext-rank-relabelings frequency result, not a heuristic optimizer failure. Every output has a top-three cumulative count ≤157 in 729 runes. All 569,402 matched literary windows exceed 157; the original 273 clear-LP1 windows already exceed the exact modal cap 71. No authentic original plaintext or key. The original images do not independently select this opcode; it was explored as a distinct minimal reversible repeat-suppression construction after #3320, not as an authenticated historical cipher.

## Sender, inverse and reduction

Let D be a permutation of the 29 GP output labels, k∈[0,28] a fixed rank, and p an input rank (allow an arbitrary fixed bijection from plaintext runes to input ranks). Emit c=D[p], remove that card and insert it at rank k, keeping the other cards in order. The inverse searches for the received card in the current deck and makes precisely the same update. This is length preserving and fully reversible; c_i=c_(i−1) iff p_i=k for i≥1. Unlike #2921 pivot-swap, the intervening cards shift by one, and unlike endpoint MTF/MTB it has two recency lists when 0<k<28.

After emission 0 the pivot label is c0. Any deck with c0 at k is attainable by any chosen first input rank: remove c0 from the post-emission deck and insert it at the chosen input rank. Thus the first plaintext symbol is entirely free and contributes exactly one to a maximizing nonempty rank set.

Track the public transposition B that maps abstract labels to current physical labels. Initially B=identity at time1. At each following emission form y_i=B^−1(c_i), then swap the physical images c_i,c_(i−1) in B. In abstract coordinates, the center label c0 is permanently fixed at k; every other label stays on its original side. After accessing y, move it to the near-center end of its own side. The side order is ordinary MTF on that side; repeated emissions of the center do not change either side. This conjugacy follows directly by swapping the two physical labels in the post-insertion deck: the old pivot returns to the center, the intervening abstract cards shift, and accessed abstract y becomes nearest the center.

For each noncenter y with a previous access, collect M_i = the set of other noncenter identities accessed since the previous y. For a side S containing y, its distance from the nearest-center rank is exactly popcount(M_i ∩ S). This depends only on the side partition, not the initial within-side order. Let h_S[d] count these repeated-access contributions. If T is a nonempty chosen set of ranks in that side, represented by distances from its near-center end, and a is the number of distinct side labels ever accessed, the exact maximum first-access contribution is min(a, max(T)+1). Indeed on the j-th first access (zero based) exactly j previously accessed labels precede all still unseen labels; its minimum possible distance is j. Choose the first min(a,max(T)+1) unseen accesses at distance max(T), reconstructing the initial unseen order by backwards insertion. All later first accesses are too far from the center to contribute. This realizes the bound for arbitrary observed access order; different sides have independent initial orders.

Consequently the exact maximum count contributed by one side to any m selected ranks is max over d of h_S[d] + sum of the m−1 largest h_S[j] for j<d + min(a,d+1), with enough eligible ranks. The empty rank set contributes zero. Combine the two independent side maxima with the optional center contribution (number of ciphertext adjacent repeats), and add one for the free first symbol. Enumerate every partition of 28 noncenter identities, up to swapping the two sides (2^27 possibilities including an empty side). Reflection symmetry is legitimate because every k and every static rank relabeling is admitted. This covers all 29! initial decks for every pivot without enumerating their within-side orders.

## Original execution and exact witnesses

Pinned corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, LP2 p0–2. Source-derived base29 input FNV-1a64 f838cb4cf83591ed; local transferred input matched this hash. 729 symbols, 4 adjacent equalities, 28 distinct noncenter abstract labels observed, 696 repeated accesses represented by 683 weighted (label,mask) pairs. Actual C++17/OpenMP execution in 32 disjoint inclusive ranges of 2^22 partitions each. Each range completed. An independent full 2^28−1 single-side modal scan returned the same global 71. The first monolithic scan timed out and was replaced by chunks; no incomplete range counted.

| Selected ranks m | Exact maximum | Representative partition mask (bit27 fixed on other side) | Side allocation L,R,center |
|---:|---:|---:|---|
|1|71|56053487|1,0,0|
|2|120|61102415|1,1,0|
|3|157|3587667|2,1,0|
|4|195|78227153|3,1,0|
|5|227|128889688|3,2,0|

Bit mapping: GP indices in ascending order except c0=15. All maxima are realized by these explicit initial decks (GP index arrays), checked by direct 729-symbol inverse, not merely relaxed bounds:

```json
[
{"m":1,"cap":71,"k":18,"ranks":[6],"start":[23,14,1,10,17,7,15,18,3,6,19,0,26,21,5,2,11,25,9,4,8,12,13,16,20,22,24,27,28]},
{"m":2,"cap":120,"k":14,"ranks":[4,18],"start":[14,1,12,24,15,8,3,6,19,0,26,2,11,25,22,5,21,27,18,9,7,17,10,13,23,16,28,20,4]},
{"m":3,"cap":157,"k":14,"ranks":[9,3,20],"start":[4,16,13,18,6,19,0,21,11,15,22,9,12,10,1,2,5,26,27,3,8,25,7,17,24,14,23,28,20]},
{"m":4,"cap":195,"k":13,"ranks":[10,8,2,22],"start":[4,20,6,27,0,22,9,7,17,24,15,10,13,16,11,2,5,21,26,19,3,18,8,25,12,1,14,23,28]},
{"m":5,"cap":227,"k":16,"ranks":[12,10,5,19,22],"start":[4,20,16,13,12,8,18,3,6,19,27,26,15,25,22,9,24,7,11,2,5,21,0,17,10,1,14,23,28]}
]
```

## Matched native controls

Clear LP1 pages [3,8,9,10,11,14] (157/187/207/192/169/89 runes; total1001) have 273 contiguous 729-rune windows with modal counts 92–104; concatenating clear p57 yields 368 windows with modal counts 87–104. All exceed 71. The actual first 729 clear LP1 runes have modal count102. 58 planted encryptions (two shuffled decks per pivot rank) round-trip exactly and pass the reduced side bounds for top1..5. In particular pivot Y index26 yields exactly four ciphertext adjacent repeats, matching original count, yet native mode102: the test rejects the full concentration structure rather than requiring more repeats. This is a positive mechanism control, not blind key recovery.

All sliding 729-rune literary windows under the previously used explicit GP orthography (ING/IO contractions, QU→CW, V→U, K/Q→C, Z→S) were tested, no sampling:

| Donor | GP length | Windows | Minimum top1/top2/top3/top4/top5 | Passing all five |
|---|---:|---:|---|---:|
| Gibran | 47629 | 46901 |64/124/182/236/282|0|
| Shakespeare |217106|216378|59/117/174/225/266|0|
| Emerson |306851|306123|62/120/177/229/280|0|

The top1-only filter admitted 2813/13207/4848 windows, and top2-only admitted 0/106/3. Top3 alone excludes every window across all three sources. No claimed universal impossibility for every conceivable plaintext. No assumption about word boundaries, spelling of printed singleton words, particular plaintext assignment, or native key. Donor orthography is a finite comparator, not proof of a universal GP3 bound.

## Reproduction and scope

- `sims/lp2_interior_rank_partition_sft.cjs --input` derives the two input tokens from pinned resources; normal invocation evaluates all native comparators and a modal witness.
- Compile `sims/lp2_interior_rank_partition_sft.cpp` with a C++17 compiler supporting GNU popcount/ctz and OpenMP, e.g. g++ -O3 -march=native -fopenmp -std=c++17. Pass generated input on stdin. Optional inclusive subset range (default full 0..134217727). For shorter execution slices, use 32 ranges [i·4194304,(i+1)·4194304−1] and take the column maximum per m.
- Complete exact original scan executed locally, not a CI claim. Final positive-control expansion and the first range were rerun; the exhaustive scan core remained unchanged. All five witness decks checked independently using connector-fetched source in JS. 
- Does not exclude varying insertion ranks, intermediate transpositions other than this exact update, resets inside p0–2, deletion/expansion, nonstationary plaintext relabelings, or a different ciphertext register. No source selects any of those extensions. Do not run more fixed-interior-insertion key searches; the exact concentration gate has eliminated the continuous candidate for the tested native domain.
