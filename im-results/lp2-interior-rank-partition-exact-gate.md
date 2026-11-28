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

## Distinct moving insertion schedule: exact all-starting-alphabet synchronization

A fixed-rank negative does not exclude changing ranks. Freeze three exploratory public insertion schedules without using plaintext scores: (1) target index of emitted C, (2) GP prime value of emitted C modulo29, (3) successive prime-minus-one residues from authentic solved p56, but interpreted here as insertion positions and advancing on **every** rune. The third is not the actual solved-p56 mechanism and does not incorporate its transparent-F hold. No original clue independently selects the insertion opcode. These tests answer whether the candidate has a genuinely recoverable hidden starting deck, rather than another 29! key search.

Let R_y be a sound superset of possible ranks of label y at the current time, initialized to all29 ranks for each label. For emitted x and public target k, each y≠x at old rank r can have its post-deletion rank r−1 if min(R_x)<r, and r if max(R_x)>r. Both possibilities are granted when both inequalities hold; same-rank deletion is impossible. Insert x at k, moving every remaining rank ≥k up by one. Assign R_x={k}. Every real deck is still represented. Prune via bipartite perfect matching (all-different): given one complete matching M, connect each label y to M(r) for every r∈R_y; an edge lies in a perfect matching exactly when it is on an alternating cycle, i.e. y and M(r) are in the same strongly connected component. This removes only impossible assignments of ranks under the current relaxed sets. Repeat. The abstraction can overestimate uncertainty; it can never omit a real deck. When all sets are singletons, every possible secret initial deck has merged into that one deck, so the entire subsequent suffix inverse is exact. No key guessing or plaintext assumptions. Partial singleton positions are also exact, but no assertion is made about joint support of other positions.

Executed the original p0–55 and each of nine independent chapters in connected V8. The whole-book synchronizes at the following offsets (number of runes consumed; next rune is fully decoded). The p40–53 chapter also synchronizes independently with a fresh arbitrary starting deck and schedule reset at its first rune.

| Scope | Schedule | Sync offset | Exact suffix n | Modal count | Top3 | IoC |
|---|---|---:|---:|---:|---:|---:|
| p0–55 | emitted ordinal |594|12362|468|1387|.0344773274|
| p0–55 | emitted prime residue |373|12583|477|1419|.0344943023|
| p0–55 | prime−1 clock |696|12260|466|1379|.0344768773|
| p40–53 | emitted ordinal |399|2609|109|321|.0345300717|
| p40–53 | emitted prime residue |204|2804|120|348|.0346032349|
| p40–53 | prime−1 clock |922|2086|84|248|.0343599330|

Each of the first eight independently initialized chapters synchronizes under each schedule; terminal p54–55 is too short for this abstraction to certify full synchronization (130/87/64 individually exact ranks). That is unresolved for terminal-only initialization, not an absence-of-synchronization proof. The 3,008-rune p40–53 independent case already excludes all three for a chapter-reset manuscript hypothesis. In each of the six exact suffix cases, **all** matched native donor windows exceed the exact modal count and top3 count. Smallest native modal counts across all three donor corpora: 1336/1361/1325 (whole-book schedules in order), 229/244/179 (independent p40–53). Window counts for those six cases across the three donors: 534503/533840/534809, 563762/563177/565331. Zero passes. This comparison permits any fixed secret plaintext-rank substitution, so there is no need for a heuristic substitution solve. Canonical rank readings also visibly nonprose. No extrapolation to moving secret targets, latent extra updates, other schedules, intra-chapter resets, or non-native registers.

Positive controls used the actual first729 clear LP1 runes and four separately shuffled secret decks per schedule (seed3301). All true ranks remained inside every propagated envelope, and all decoded suffix ranks after a certified synchronization matched native plaintext exactly. For ordinal insertion the abstraction did not fully synchronize within729 on these four plants, but certifies 537–575 individual ranks; prime-residue plants synchronize after488/550/488/488, prime-clock plants after436 in all four. Cipher adjacent repeats in these controls 19–23,17–28,30 respectively; unlike fixed rare pivot, these schedules do not recreate the low original rate. A separate independent Python implementation agreed on all three p0–2 synchronization offsets594/373/696 and exact suffix statistics. No claim of independent Node-wrapper execution. The JS core and 12 native controls were actually executed in connected V8. Reproducer: [moving-rank synchronizer](../sims/lp2_moving_rank_sync_sft.cjs), commit 7d3426ea.

**Decision:** the exact public schedules are retired for continuous or chapter-reset direct native GP29. The useful reusable result is the sound rank-envelope synchronization technique for any future independently source-selected public remove/reinsert schedule. It can recover a full exact suffix without initial key knowledge, and a failure to synchronize is merely inconclusive. Do not fit a free insertion sequence to original plaintext.

### Stronger all-secret result: any bijective emitted-label target map sorts itself

Allow the insertion target k=f(C) to be an entirely secret permutation of the 29 ranks (not merely the canonical emitted ordinal), independently of the secret starting deck and static plaintext-rank relabeling. When label f^{-1}(0) is first accessed it becomes permanently fixed at rank0: all other moves delete and insert at ranks≥1. Likewise f^{-1}(28) becomes permanently fixed at rank28. Inductively after the outer j ranks on each side are fixed, the next access to the two unique extreme labels of the remaining interval fixes those endpoints permanently. Thus **fourteen consecutive complete-alphabet coverage intervals** force every deck to equal f^{-1}; the remaining central label is determined. Thereafter all updates are identities and the input rank is exactly f(C). This is a uniform bound for all (29!)² deck/target choices, even if the target map was selected adversarially from the ciphertext. No statistical key selection enters the proof.

Greedily close each coverage interval at the first point all29 original ciphertext labels have appeared. Whole-book first14 ends (exclusive offsets): 163,248,369,443,576,649,769,866,971,1080,1194,1376,1444,1523. Thus all secret maps reduce to a static substitution on the remaining 11,433 original runes, modal442/top3=1301/IoC=.034492954. Four independently initialized chapters also have ≥14 complete covers; the remaining five are not decided by this particular sufficient condition.

| Scope | Guaranteed sorted offset | Exact remaining n | Modal/top3 | Minimum native modal/top3 across three donors | Matched native windows passing |
|---|---:|---:|---:|---:|---:|
| p0–55 |1523|11433|442/1301|1235/2969|0/537290|
| p8–14 |1275|454|22/62|36/105|0/570227|
| p15–22 |1586|317|19/50|24/72|0/570638|
| p33–39 |1337|343|18/52|27/78|0/570560|
| p40–53 |1809|1199|48/144|101/290|0/567992|

The sorted-state theorem is exact, independent of native prose; the exclusions are finite native-register comparisons. Source-extracted original greedy coverage and every matched donor window were executed in V8. This subsumes the canonical ordinal special case while granting arbitrary static secret target permutation. It does not cover non-injective target maps or targets changing independently with time. No plaintext or key recovered. The proof also explains why a canonical emitted-ordinal model often degenerates into a static substitution long before its initial rank-envelope ambiguity has been fully resolved.

### Authentic-style literal-F holds cannot rescue the bijective target-map family

Permit every emitted F to be either a literal plaintext-F hold (no deck update) or an ordinary consuming output, with arbitrary branch choices; all non-F emissions must consume. Even if F never consumes, each complete coverage interval of all other28 labels fixes at least one more permanent outer rank unless the sole remaining label is F, which is then forced. Indeed at least one of the two remaining extreme target labels is non-F until only F remains; that extreme is accessed within the interval and remains fixed thereafter. Optional consuming F moves cannot undo already fixed extremes. Thus 28 non-F covers are sufficient for every secret target bijection, every initial deck, and every hold mask.

The original full book reaches its 28th complete non-F cover at exclusive offset2732, leaving 10,224 runes. Non-F ciphertext labels map to distinct static plaintext labels; arbitrary split of 368 F outputs among consuming and literal F branches cannot add more than368 occurrences to any selected set. Therefore modal upper769 and top3 upper1535 (non-F mode401/top3=1167). Native minima are 1095/2625; zero of 540,917 matched donor windows pass. This grants ordinary consuming F collisions and does not assume that an emitted F is automatically a hold. No independent chapter reaches28 covers, so the literal-F theorem does not decide all chapter-reset versions. Exact mathematical sorting and finite native comparison, no new plaintext/key.


### Source-conditioned A194954 moving insertion: long original suffixes are exact nonprose (Agent15, 28 November 2026)

The recovered 2014 Stage11 message whitespace contains eleven numbers, `2,3,5,7,11,13,17,23,29,31,37`, matching the initial terms of OEIS A194954. The [historical source study](lp2-2014-whitespace-a194954-p56-clue-gate.md) shows that the human p56 route instead repairs the missing ordinary prime **19** and uses ordinary prime-minus-one shifts; it **already rejects** A194954 as a direct additive running key. This separate, deliberately bounded test asks whether the nonstandard sequence could control an *evolving alphabet* rather than a shift. There is **no authenticated instruction to move/reinsert symbols**: the choice of opcode and extension beyond eleven observed entries remain conjectural, not an established intended path.

Freeze one reversible receiver, without scoring or fitting unknown ciphertext: start from an arbitrary secret 29-label deck; plaintext at step i is the current **rank** of emitted ciphertext label C_i; delete C_i and reinsert it at zero-based target `k_i=(A194954(i+1)-1) mod 29`, advancing the sequence once per original rune, with no F exceptions or resets inside the tested scope. The sequence is the OEIS recurrence `a(1)=2`, with each subsequent term the smallest greater prime whose gap is divisible by `popcount(i-1)`. It generates the independently published next eleven terms 43,47,53,59,67,71,73,79,97,101,107 and the 12,956th term 641057. The rank-envelope perfect-matching synchronizer from the prior section is sound for **all** initial secret decks; after certification its suffix is exact. No matching of word boundaries or fitted substitution is used.

| Original scope (fresh deck at first rune) | certified all-deck sync offset | exact suffix | modal/top-three counts | IoC |
|---|---:|---:|---:|---:|
| p0–55 (12,956 runes) | 917 | 12,039 | 447 / 1,333 | 0.03445557 |
| p40–53 (3,008 runes) | 1,408 | 1,600 | 78 / 211 | 0.03452548 |
| p8–14 (1,729 runes) | 662 | 1,067 | 48 / 139 | 0.03440412 |
| p15–22 (1,903 runes) | 476 | 1,427 | 61 / 182 | 0.03450977 |
| p54–55 (308 runes) | not certified | — | — | — |

The full-book rank suffix contains only 447 copies of its most frequent symbol over 12,039 observations; **every** GP29-native literary window of the same length from the three pinned donors has at least 1,300 copies of its most frequent rune. For full book, all 535,472 matching windows fail the original modal/top-three thresholds. Independently resetting at p40 gives 0/566,789 matched-donor passing windows; p8–14 gives 0/568,388, p15–22 gives 0/567,308. These are exact finite native-register exclusions, not universal language theorems; an arbitrary **fixed** plaintext alphabet permutation cannot change these histograms. Independently synthesized 729-rune native plants with secret decks check the exact inverse and truth containment. Direct clear text in the original exact suffix is unreadable. The terminal p54–55-only model fails to synchronize and is **not** excluded by this test.

**Decision:** retire only the frozen A194954 move/reinsert schedule for long continuous/chapter-reset native GP29, including every possible initial deck. The source already points to ordinary primes for the solved p56 **shift**; it does not authorize a moving alphabet for p0–55, so do not spawn arbitrary variations or promote this as a discovered cipher. In #3335, a genuinely authored evolving-list operation remains the missing prerequisite; neither this negative nor the older three exploratory insertion clocks resolves that issue. Reproducer: [A194954 exact synchronized inverse](../sims/lp2_a194954_moving_insertion_sft.cjs). The core was executed on pinned inputs in connected V8; the committed Node wrapper and independently checked CI status must be assessed separately.
