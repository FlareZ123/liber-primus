# Exact rank-insertion inverse gates: fixed and moving public schedules — 28 November 2026

## Decision

**Current causal decision:** A new *joint rank-and-pairwise-order synchronizer* closes a real identifiability gap for **varying** public insertion schedules. It gives a sound all-initial-deck certificate at rune 422 on the 12,956-rune original book for a period-16 schedule numerically fixed by the solved p15 spiral. That clock's 12,534 exact original ranks have mode 473/top-three 1,417 and are native-prose-negative against 533,987 full-length matched windows; independently initialized p16–22 and p40–53 scopes also synchronize and fail 567,707 and 563,465 windows. Four GP-native plants recover 690/690 certified suffix runes each. Stronger still, a key-independent adjacent-repeat identity now **excludes the entire 29^16-family** of period-16 public insertion targets on p16–22, p40–53 and all p0–55 across **3,323,286** matched GP-native control windows, even with arbitrary static GP rank relabeling and page-restarted clocks. Strictly transferring the solved p56 **F-null/key-hold rule** (omit literal F and do not advance state or clock) also excludes the same entire family over **3,327,174** further matched native controls, subject to that explicitly hypothetical transfer. Separately, the exact solver rules out four original-source-constrained p49–51 table-as-256-target variants on following p52–55 (all 2,279,018 matched native windows fail). No source selects this opcode. **This is a reusable exact algorithm and a bounded negative, not discovered plaintext or an authenticated cipher:** p15 selects the 16 numbers, but neither the rank-insertion opcode nor periodic reuse of those numbers is first-party instructed. Preserve the synchronizer for any future authentic changing schedule, and do not pursue clocks optimized to the original ciphertext.

Fixed-rank interior insertion is separately eliminated for ordinary native prose on LP2 p0–2 by an exact all-initial-alphabet, all-pivot-ranks, all-static-plaintext-rank-relabelings concentration bound: top-three ≤157 in 729 original runes, below all 569,402 matched donor windows. The endpoint MTF/MTB cases and other previously frozen public moving schedules are excluded in their own stated scopes below. None of these exploratory mechanisms is authenticated by the original images.

## Stronger exact inverse: joint rank and pairwise order for nonconstant public insertion (Agent41, 28 November 2026)

### What is newly decidable

Under a length-preserving, public-target rank-insertion model, a secret deck initially contains all 29 distinct GP labels in any order. At rune i, plaintext is the **rank** of observed ciphertext label C_i in the current deck; remove that label and reinsert it at publicly fixed rank k_i. Unlike a mere static substitution, this mechanism evolves a permutation after every output. An arbitrary starting deck has 29! possibilities. The older [rank-envelope + Hall synchronizer](../sims/lp2_moving_rank_sync_sft.cjs) certifies some clocks but never certified the specific nonconstant 16-step clock below, even when propagated through all 12,956 original runes.

The new [joint-order implementation](../sims/lp2_p15_spiral_rank_order_sync_sft.cjs) maintains two sound kinds of information. For each label y, a 29-bit mask S_y contains **every still-possible current deck rank**, and for each ordered pair y,z, the relation y≺z is recorded only if it must hold in every deck consistent with the observed ciphertext and the fixed public mutation schedule. Initially S_y includes all ranks and no relative ordering is known.

For an observed label x moved to target k, propagate the existing all-deck-safe rank-envelope transition and prune via perfect matching, retaining exactly the rank edges appearing in some perfect matching of the relaxed masks. Delete all known precedences involving x, **preserve every precedence among unmoved cards** (their relative order cannot change under removal and reinsertion of x), and derive new x relations when all allowed post-update ranks of y lie strictly before or after k. Take transitive closure. If y has b proven predecessors and a proven successors, its rank must lie in [b,28−a], so intersect S_y with that range, add any new forced orders from disjoint rank intervals, apply matching pruning again and repeat to a fixpoint.

Each inference is an over-approximation or a logical consequence of every reachable deck, not an optimizer's guessed permutation. Therefore the authentic, unknown initial deck always remains represented. The instant all 29 S_y are singleton, they determine one full permutation, which must be the current deck for **all** 29! initial decks. Every later plaintext rank is then exactly the observed card's current index; forward removal and reinsertion is the inverse invariant. A failure to reach singletons is inconclusive. In this experiment the joint method succeeds where independent rank masks alone do not.

### Source-locked numerical input and hypotheses still needed

The independent p15 solved numeral grid ([source and formula](../results/lp2-p15-fibonacci-prime-spiral.md), original image 32.jpg) has the 16 marked outward-spiral values
`3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516`.
Their direct **GP29 residues**, without any language fitting or observed-ciphertext tuning, fix the sixteen targets
`[22,21,19,17,11,1,10,3,20,22,25,7,22,12,17,21]`.
This test explicitly **hypothesizes** a period-16 restart of those targets at each fresh tested scope and one move per rune, with no F holds or other exceptions. The original p15 **does not** specify that periodicity, the rank-reinsertion opcode, the deck-to-GP rank mapping, or any reset boundary. Those are exposed model assumptions, not first-party instructions. The immediately following p16–22 is the most natural scoped original receiver; distant p40–53 and whole-book p0–55 are independently tested robustness assumptions, not hints printed on p15.

### Exact original-cipher test and independent donor comparison

All scopes start with an *arbitrary* secret initial deck. The following are **certified, exact** suffixes after the joint-order fixpoint; the displayed histogram counts are permutation invariant, so any additional fixed relabeling of plaintext rank symbols cannot rescue their concentration profile.

| Original scope / fresh clock | Rune count | First exact next-rune offset | Exact suffix | Mode / top 3 | GP-rank IoC | Matched native donor windows passing both count thresholds |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Physical p16–22 | 1,744 | 450 | 1,294 | 65 / 172 | 0.03450514 | **0 / 567,707** |
| Physical p40–53 | 3,008 | 300 | 2,708 | 116 / 330 | 0.03452971 | **0 / 563,465** |
| Physical p0–55, continuous | 12,956 | 422 | 12,534 | 473 / 1,417 | 0.03452790 | **0 / 533,987** |

The three pinned exact-window comparisons use original-runic GP29 normalization of Gibran's *The Prophet*, Shakespeare and Emerson, counting **every** contiguous native window of identical exact suffix length. For p16–22, their respective minimum modal counts are 119/109/117, against original 65; for p40–53, 272/235/265 against original 116; for whole-book, 1,371/1,353/1,444 against original 473. This is not an optimizer miss: every possible secret initial deck gives the same exact suffix. The comparison is finite to these three literary GP controls; it does not exclude arbitrary nonnative source texts, plaintext order shuffles, or the broad family of all moving-alphabet ciphers. A full re-encryption check is necessary for any proposed key but by itself cannot make wrong-key plaintext authentic.

**Planted native controls:** Four distinct independently shuffled starting decks (fixed public seeds 3301, 4078, 4855, 5632), each with 1,001 GP-native clear LP1 symbols, were encrypted under this exact 16-target opcode. On every step before convergence, the true deck rank was asserted inside its sound mask and every proven pair relation was checked against the real planted order; after convergence, the complete recovered deck was compared with the real deck. All four synchronize after 311 symbols and recover **690/690 true suffix ranks**, 2,760/2,760 in total. The implemented sender and inverse use the same length-preserving move rule but are independently checked by the rank and pair invariants. The committed source was executed with the original repository resources in connected V8 and passed the independent repository checkout / Windows Node22 [manual source SFT run 46127992485](https://github.com/FlareZ123/liber-primus/actions/runs/46127992485).

**Decision:** This materially improves identification of a public, varying-rank inverse; specifically, the previous independent-mask failure to synchronize was **not** evidence that the historical ciphertext retained a large unresolved key. The new joint solver closes this source-derived period16 candidate for ordinary native GP29 prose at the listed scopes, but the strongest missing premise is still an authenticated instruction to mutate the deck. Do not extend period16, flip signs, rephase or optimize target clocks against LP2. Reuse the general joint-order algorithm only on a newly source-selected operation/clock, and demand actual unknown plaintext or independently delivered key material before promoting it to `results/`.

### Entire period-16 target family: ciphertext-doublet equivalence gate (Agent41)

This is a **different, stronger decision** than selecting a p15 numerical insertion schedule and synchronizing its inverse. It rules out **all** period-16 public absolute insertion-target clocks on the tested native-prose register, without selecting any of the 16 numbers or recovering the starting alphabet. The mechanism's opcode still is **not** authenticated by p15; this is a model-family exclusion, not a recovered LP2 key.

**Deck-independent theorem.** Let `D_i` be any permutation of 29 ciphertext labels. At position `i-1`, emit label `C_(i-1)=D_(i-1)[P_(i-1)]`, remove that card, and reinsert it at public target rank `k_(i-1)`. Then at the very next position,

~~~text
C_i == C_(i-1)    if and only if    P_i == k_(i-1).
~~~

No other history, initial alphabet, numerical key or matching/synchronization algorithm enters this identity. Let the unknown **fixed** mapping from numerical rank `P_i` to GP29 plaintext rune be any bijection `pi`; then a period-16 target vector defines 16 unknown plain runes `q_r=pi(k_r)`. For every original ciphertext doublet with preceding target phase r, the matching plaintext rune **must equal** `q_r`; for every original non-doublet at that phase it **must not**. Within a given r, contradictory forced runes or a forced rune occurring at any forbidden position is a proof of incompatibility. For a phase with no doublet, at least one GP rune must be absent at all its non-doublet positions.

For this *binary equality trace only*, these conditions are both necessary and sufficient for **some** choice of 16 targets and static plaintext rank relabeling: take the chosen `q_r` as literal ranks under identity `pi`. All 16 phases are free and can share target values; every one of the `29^16` possible 16-target vectors is thus implicitly covered, including permutations, reflections, shifts, all secret initial decks and all fixed 29-rune plaintext rank relabelings. A passing equality trace is **not** a valid complete original-cipher inverse; a failing trace conclusively rejects the model for that plaintext register.

**Exact original corpus test.** Use the original physical p16–22, p40–53, or full p0–55 ciphertext runes. Test two separately frozen, natural public-clock interpretations: a single continuous period across the whole selected scope, or a common 16-symbol target cycle **restarted at every physical page** (with page-boundary comparisons omitted). In both, the same 16 target values and fixed plaintext-rank interpretation apply to the entire selected scope, while **arbitrary secret deck initialization at each page is allowed** for the page-restarted model. Compare every contiguous matched-length GP29-native window of the three pinned Gibran/Shakespeare/Emerson texts, after the project's established rune-normalization. No candidate window is language-scored, no phase or target value is fitted, and no unknown-deck search occurs.

| Source scope | Original rune count | Original equal adjacent events | Native windows per clock semantics | Continuous period-16 compatible | Page-restarted period-16 compatible |
| --- | ---: | ---: | ---: | ---: | ---: |
| p16–22 (immediately after p15) | 1,744 | 10 | 566,357 | **0** | **0** |
| p40–53 | 3,008 | 18 | 562,565 | **0** | **0** |
| p0–55 | 12,956 | 86 | 532,721 | **0** | **0** |
| **Total** | — | — | **3,323,286** across both semantics | **0** | **0** |

The stronger test therefore eliminates, **within these finite native-text comparisons**, the entire public *position-only period-16 absolute rank-reinsertion* family, not just the p15 spiral's chosen residues or a lucky secret initial deck. Separately, the source-fixed original p15 clock tested at **every one of its 16 cyclic phase shifts**, granting any fixed GP29 relabeling, has zero surviving donor windows even on p16–22 alone, under both page-continuing and page-restarting clock interpretations.

**Positive source-native plants:** The reproducer synthesizes four 1,744-rune GP-native ciphertexts from original-shaped seven-page text, each with a shuffled secret initial alphabet, shuffled **unknown static plaintext-rank labeling**, and the exact moving-to-target sender. It uses two clock phases and both chapter-continuing/page-restarting target clocks, allowing secret deck resets at each page. The original equality-law gate accepts all four; two page-restarting controls also pass the *all-period-16-target* theorem, which needs no knowledge of planted target numbers or secret alphabets. The mandatory emission/equality identity is asserted at every eligible step. The [self-contained source-pinned test](../sims/lp2_public_rank_doublet_equivalence_sft.cjs) passed a [Windows Node22 control run 46129648917](https://github.com/FlareZ123/liber-primus/actions/runs/46129648917); its optimized equivalent has the same proof obligations.

**Boundary:** These are exact finite donor-register exclusions, **not a theorem that no possible English message can satisfy the doublet mask**. They assume plaintext rune order is intact, encoded directly as a fixed GP29 bijection of rank symbols across the scope, no variable-length inserts/deletes, and one fixed 16-target sequence per scope (which may restart at each physical page). They do not exclude unknown nonnative binary/compressed registers, word reordering, per-page independently remapped plaintext alphabets, ciphertext-dependent/nonperiodic targets, an F-hold or other state transition, or any moving-alphabet mechanism other than absolute remove/reinsert. The source p15 spiral remains a genuine numeric graphic but its 16 entries do **not** identify this opcode. Research implication: do not invest in more period-16 rank-target permutations; require an independently selected different operation or an independently authenticated plaintext register.

#### Strict F-null/key-hold transfer from the solved p56 control (Agent41)

The solved p56 operation establishes a concrete **F interruption**: a ciphertext F can be omitted from plaintext and need not advance its prime keystream. This is **not** evidence that a moving alphabet uses F, but is the most historically motivated non-length-preserving variant of the period-16 rank-target hypothesis. To bound that explicit transfer without arbitrary search, reinterpret every original GP index-0 F as a strict no-output/no-deck-move/no-target-clock-advance marker. Remove F from the **ciphertext** stream before applying the same adjacent-repeat theorem to consecutive **emitted** non-F ciphertext cards. For the continuous model, keep the period-16 public target phase across the book; for the page-restarted model, restart the same target phase on each physical page and omit page seams. The old and new original rune counts make the necessary-condition test fully inspectable.

| Original scope | Literal F0 interruptions | Remaining emitted labels | Adjacent repeats after F omission | Matched GP-native donor windows per clock semantics | Compatible public period-16 target vectors |
| --- | ---: | ---: | ---: | ---: | ---: |
| p16–22 | 65 | 1,679 | 11 | 566,552 | **0** |
| p40–53 | 125 | 2,883 | 20 | 562,940 | **0** |
| p0–55 | 458 | 12,498 | 95 continuous / 94 page-restarted | 534,095 | **0** |
| **Total, two clock semantics** | — | — | — | **3,327,174** | **0** |

**Why the check is sound:** under this exact hypothetical F handling, no deck operation or target-clock tick occurs at F. The next emitted non-F label therefore sees the previous emitted non-F label sitting at the prior public insertion rank, regardless of the number of intervening literal F markers. The same if-and-only-if identity, arbitrary initial decks and completely arbitrary time-period16 rank targets still apply to the **compressed** ciphertext. Original F counts and the native comparison length are recalculated rather than reusing unskipped windows. The experiment remains deliberately **more permissive** than a 28-card F-reserved sender: the binary matching gate allows every one of the 29 GP plaintext rune values as each required phase symbol, so a zero is still a valid exclusion for the stricter model.

For positive controls, the [source-pinned reproducer](../sims/lp2_public_rank_doublet_equivalence_sft.cjs) generates two planted GP-native-minus-F messages using 28 emitting cards and one reserved F null marker, each following the exact **65 literal F positions** and seven original page shapes of p16–22. Secret initial deck and fixed plaintext mapping are independently shuffled. The sender emits F without advancing its deck/clock or consuming a plaintext symbol, then the diagnostic removes F and accepts the true GP plaintext under both continuous and page-restarted phase conventions. This checks the nontrivial deletion/reindexing assumption rather than treating a mismatched text length as a negative.

**Decision:** even a strict p56-style F-null/key-hold transfer **does not rescue a time-period16 absolute rank-reinsertion cipher** under these three finite native GP29 registers. The original solved p56 only authenticates the F-null operation in its own prime-shift setting; it does not authenticate its reuse in other pages, a 28-card deck, or an absolute rank-insertion opcode. A more complicated F escape, word-level alphabet resets, page-specific plaintext-rank remapping, period changes, or nonnative plaintext remain outside this negative. Do not rephase/reorder period-16 targets in an attempt to evade this algebraic obstruction.

### Distinct source operand: p49–51 row-major 256-cell clock on the following p52–55 (Agent41)

The same all-deck sound joint-order method can now adjudicate a materially different numeric source that older rank-envelope-only tests could not necessarily finish. The original physical p49–51 artifact prints **32×8 two-character cells** across three pages; the ink confirms their characters, table order is row-major, and the facing p50 trees independently motivate the alternate horizontal column reflection. There are **two surviving historical numeric radices**, 59 and 60, with no lowercase `f` among the original tokens. See [canonical source table](../resources/liber-primus/lp2-grid-256.json) and [p50 operand analysis](lp2-p50-radix-codebook-overlap-source-gate.md).

Freeze four finite, source-defined target clocks without ciphertext tuning: decode the 256 literal cells using radix 59 or 60, optionally reflect the order of each printed eight-cell row, reduce each resulting 0–255 value mod29, then read cyclically once per encrypted rune. Initialize an arbitrary secret deck immediately after the numerical pages, at the first rune of **physical p52–55** (750 runes). As above, the **rank-insertion opcode, repeating the 256 cells, and starting at p52 are still hypotheses, not an authenticated instruction**. Unlike the p15 16-step operand, this is a direct typed experiment on an entire 256-token original numerical panel.

| Original reading of the 256 tokens | All-deck sync offset | Certified exact remaining runes | Mode / top3 | Three full native donor comparisons |
| --- | ---: | ---: | ---: | ---: |
| Radix59 row-major | 211 | 539 | 25 / 75 | **0 / 569,972** |
| Radix59 mirror each row | 143 | 607 | 28 / 83 | **0 / 569,768** |
| Radix60 row-major | 100 | 650 | 30 / 88 | **0 / 569,639** |
| Radix60 mirror each row | 100 | 650 | 32 / 95 | **0 / 569,639** |

These bounds are fully initial-deck independent: at each certified boundary all 29 label ranks are forced. Eight additional *native plaintext* plants, two independent secret starting decks per grid model, have complete pre-sync rank-and-pair truth checks and exact post-sync recovery: respectively 856/856, 853/853, 874/874 and 860/860 suffix runes per plant pair member (6,886/6,886 total). The tests are finite to the three pinned literary donor corpora, and the exact original inverse is uniformly near GP29-random, not recovered prose. [Single-file source-pinned reproducer](../sims/lp2_p50_grid_rank_order_sync_sft.cjs), importing the generic all-deck joint synchronizer. Source test **passed Windows Node22** in [manual run 46128302348](https://github.com/FlareZ123/liber-primus/actions/runs/46128302348).

**Decision:** both historically plausible numeric readings and both independently motivated table orientations fail for this particular public-target remove/reinsert receiver. This closes the **specified** p50→p52 rank-list implementation, not the actual role of p50's numbers, any different decoder, an F hold, or an unknown state-delivery protocol. The key prerequisite remains a first-party instruction connecting any original numeric operand to an evolving alphabet operation. Never interpret zero literary-window matches as proof of every possible plaintext register.

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


## Endpoint move-to-front and move-to-back: exact all-deck native gate (Agent4, 28 Nov 2026)

The constant endpoint insertion operations are important special cases of the same **reversible** deck algorithm: emit the plaintext rank as a GP29 ciphertext label, then remove the emitted label and reinsert it at index 0 (move-to-front, MTF) or 28 (move-to-back, MTB). The inverse emits the pre-update index of each ciphertext label. Both are historically standard and simple enough to merit a single finite original-input test, but **no authenticated Cicada clue selects either algorithm**. Do not treat this as a newly discovered cipher or revive arbitrary list schedules from it.

**Exact identifiability:** after each of the 29 emitted labels has appeared at least once, every deck order is determined only by its labels' last appearance times, independent of all 29! possible starting alphabets. Under MTF the newest-seen label is at the front; under MTB it is at the back. For the original uninterrupted p0–55 input, the first complete cover occurs after **163 runes**. Therefore all **12,793 subsequent plaintext ranks** are exactly known under either fixed model. MTF and MTB produce mirror rank histograms, because their decks remain reversed after synchronization. Their original suffix has modal count **498**, top-three count **1,461**, and mean symbol frequency almost flat across the 29 ranks except the extreme repeat-linked rank. At 12,793-rune scale, three pinned native GP29 controls have minimum modal count **1,400 / 1,388 / 1,475** and minimum top-three **3,477 / 3,335 / 3,447** respectively. Exact rolling-window census: **0 of 533,210** eligible native windows meet both original thresholds, for either endpoint insertion model. Permuting the plaintext rank alphabet does not change this exclusion.

The independent chapter starts test the same fixed model with fresh starting decks; they do not assume book-wide continuity:

| Original interval | First cover / exact suffix runes | MTF and MTB mode / top three | Matched donor windows passing |
| --- | ---: | ---: | ---: |
| p0–55 | 163 / 12,793 | 498 / 1,461 | 0 / 533,210 |
| p0–2 | 163 / 566 | 30 / 88 | 0 / 569,891 |
| p8–14 | 72 / 1,657 | 70 / 209 | 0 / 566,618 |
| p15–22 | 88 / 1,815 | 83 / 235 | 0 / 566,144 |
| p40–53 | 92 / 2,916 | 125 / 363 | 0 / 562,841 |
| p54–55 | 103 / 205 | 12 / 35 | 0 / 570,974 |

Eight independently encrypted native LP1 plants (four secret starting decks per endpoint) recover **every rank after the certified cover** exactly. In the authentic original, adjacent ciphertext equality occurs iff the decoded rank equals the update endpoint at the *next* position, so the 86 rare doublets could superficially look like a rare plaintext endpoint symbol; **that diagnostic is not evidence for MTF/MTB**, because the other 28 rank frequencies remain almost uniform instead of linguistic. The exhaustive finite native comparison rejects ordinary unchanged GP29 prose under uninterrupted or these chapter-restored endpoint updates; it does not reject arbitrary decoy plaintext, external changes in the update rule, or pages that fail to cover the full alphabet.

**Decision:** retire literal endpoint MTF/MTB with the original length/order and a static bijective rank→GP29 alphabet. This complements the existing fixed interior-pivot and public moving-rank negatives, but leaves source-authored schedules unresolved. Reproducer: [endpoint exact inverse and native rolling-window SFT](../sims/lp2_extreme_rank_reinsert_sft.cjs). The in-memory V8 core was actually run with pinned canonical corpus and literary donors; the committed standalone Node wrapper for uninterrupted/chapter scopes passed [CI run 46125991147](https://github.com/FlareZ123/liber-primus/actions/runs/46125991147). The new page-private reset extension was independently executed and **passed** in [GitHub Actions run 46126526093](https://github.com/FlareZ123/liber-primus/actions/runs/46126526093) (Node22 Windows, checked-in canonical inputs).


### Source-selected page resets: 7,143 original ranks exactly recoverable, still nonprose

Allow **completely unrelated secret starting GP29 decks at every original physical page boundary**, while retaining a frozen literal endpoint k=0 (move-to-front) or k=28 (move-to-back) update within each page. Each page self-synchronizes after its first complete 29-label cover. Across original p0–55 there are **7,143 exactly recoverable rank outputs** from 53 such pages; p49 (66 runes) and p55 (76 runes) do not cover all labels, and p50 has no runes. Both endpoint histories have identical pooled histogram statistics up to rank reversal: **modal 286, top-three 838**.

To avoid a continuity-mismatched null, compare the *same actual per-page retained suffix intervals* with every full-book-length GP29-native literary window. This mask contains 53 disjoint intervals and was frozen from original ciphertext coverage, independent of each donor. An exact incremental rolling census updates the 29-bin histogram by deleting each interval's old first item and adding its new last item; no language model, word segmentation, selected donor positions or fitted key is involved.

| Native donor | Matched length-12,956 windows | Lowest modal count | Lowest top-three count | Windows meeting both original thresholds |
| --- | ---: | ---: | ---: | ---: |
| Gibran | 34,674 | 741 | 1,885 | 0 |
| Shakespeare | 204,151 | 733 | 1,809 | 0 |
| Emerson | 293,896 | 782 | 1,882 | 0 |
| **Total** | **532,721** | **733** | **1,809** | **0** |

New independent full-book-length literary controls encrypt each physical page with its **own shuffled starting deck**, reverse the emitted text with the exact page-local rank algorithm and assert every recovered symbol after *its own* first coverage. Under the original artifact the page-local native-control capacity fails even when every unsynchronized prefix is unknown and each starting deck is arbitrary. The test is necessary, not sufficient for all possible original plaintexts: it excludes unchanged native GP29 prose under these exact opcode, order, length and page reset assumptions; it does not exclude hidden within-page resets, arbitrary transports, different language, or unselected evolving update laws.

**Decision:** literal endpoint MTF/MTB now fails native controls under both uninterrupted and **independently page-private secret decks**. There is no source instruction selecting either opcode. Report and [enhanced exact reproducer](../sims/lp2_extreme_rank_reinsert_sft.cjs) preserve this bounded original-cipher negative without opening another speculative update schedule.
