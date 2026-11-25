# Opening 729: radix-3 address permutation coupled to authentic p56 prime/F inverse

**Decision (Agent26, 25 Nov 2026):** the complete, bounded address-digit family does not recover original prose. The exact search recovers a planted hidden address permutation and prime origin with 325/329 frozen withheld runes, but every one of 738 fully legal original configurations scores far below the native controls. No unknown plaintext/key.

## Hypothesis and causal motivation

The physical p0–2 chapter has 262+266+201=729=3^6 runes. The repeated three-bar crosses are real half-turn counterparts. Prior work exhausted ordinary 9×9×9 axis orders and a 27×27 Peano traversal, and separately tested p56-style primes. Here the specific new candidate is a *six-trit address transpose* (not an arbitrary permutation of 729 symbols): split the row-major address into six ternary digits and permute their positions. The global complement of all six digits represents the visible half-turn. The chapter shape and half-turn motivate the family but do **not** authenticate the radix-digit operation or the key clock. See [earlier cube work](lp2-taxicab-chapter-cube-original-gate.md), [Peano work](lp2-p0-27square-peano-prime-control.md), and [physical cross work](p0-rotated-cross-source-readorder-gate.md). No claim of a first-party digit-permutation instruction is made.

## Exact inverse

Let d0..d5 be the most-significant-first base-3 digits of logical index i. For each of 6! orders and the two turn choices, read physical index A(i) by concatenating the reordered digits d or 2−d. All 1,440 address maps are distinct bijections. Decrypt the resulting read order using the solved p56 key rule: k_j=(prime_j−1) mod29, zero-based prime origin 0..3301. Plaintext F (GP index0) emits ciphertext F without consuming a key position; every other plaintext rune consumes one key symbol. No page resets, alphabet reordering, local phase fitting, or optional non-F holds. Physical forward encoding applies the inverse address placement to the encoded sequence.

A state at logical position i is the number h of F holds so far. If ciphertext is zero, h→h+1 is always possible. The consuming transition h→h is possible iff C_i != k_(origin+i−h). Every legal state is carried, using two uint32 bitsets, not a beam. A scalar Set DP agrees on all origin-zero cases and one independently sampled origin per address map; the tested tapes have fewer than 64 visible F symbols. The original p56 authentic replay is 85/85. Three separate 729-rune native plants at origins 0,1033,3301 and different nonidentity maps all pass exact known-key source replay. For scoring, a two-lane exact Viterbi stores last plaintext F versus the uniquely determined non-F for each h; independent map-based traceback matches selected scores to 1e-8.

## Original result

All **4,754,880** configurations (1,440×3,302) were tested; the raw physical-order comparison has no legal full path at any of the 3,302 origins (longest prefix674). At the authentic first-prime origin alone, 21 maps reach 400 and exactly one reaches 729: digit order [0,3,2,1,4,5], no turn. Its complete MAP score is −3.966089 nats/rune; its readout begins X G X Y AE W J J OE Y U O X A Y H P R AE L G NG TH S R Y T C D Y. It is not prose.

| Address-map indices | Reach 400 | Reach 729 | Best full MAP |
|---|---:|---:|---:|
| 0–359 | 8,857 | 238 | −3.799524 |
| 360–719 | 8,795 | 142 | −3.806308 |
| 720–1079 | 8,507 | 168 | −3.818459 |
| 1080–1439 | 9,440 | 190 | −3.803159 |
| Total | **35,599** | **738** | **−3.799524** |

The bigram prior uses only the final 612 GP runes of the published solved LP1 register (three disjoint earlier 729-rune tapes excluded; add-0.25 smoothing). Their genuine plaintext mean scores are −2.914114, −2.761448, −2.900116. The prefix-only MAP ranking considers all 35,599 legal logical 400-rune prefixes; only prefix score selects the key and terminal state. The best prefix is address map336, digits [1,3,0,2,4,5], no turn, origin1144, score −3.707263; **all ten top prefix-ranked frozen states fail in the 329-rune continuation**. This is logical read-order holdout, not a contiguous physical-page split; the physical positions belonging to each candidate's first 400 logical addresses vary across maps, so it is not a fixed untouched physical set across the family.

For retrospective completeness, score all 738 complete legal original configurations using the same frozen prior. The highest full score is −3.799524, map177, digits [0,4,3,5,1,2], complement on, origin831. Its complete inverse physically re-encrypts exactly and starts:
`N L E N EA R AE B W H EO P S P T NG OE U L X I U I S J N W J F N T F L J W O N Y C EO G P AE AE EO I W P E H P L EO EO L T H B X H T B U P E EA F X EA S NG NG N L C TH W E L M D T H C F TH T NG E R TH EA N O J D T A OE N`.
This is nonlinguistic; replay alone is automatic for a valid inverse. The complete retrospective ranking is not an independent heldout test.

## Blind recovery calibration

Plant1 uses native runes 729..1457 from the concatenated solved LP1 reference, outside the training suffix. Its true hidden map901 ([3,4,5,0,1,2], complement on) and origin1033 are used only to generate the tape and grade results; the same full search is applied.

| Address-map indices | Reach 400 | Reach 729 | Best prefix score | Best full score |
|---|---:|---:|---:|---:|
| 0–359 | 27,252 | 1,418 | −3.695460 | −3.784363 |
| 360–719 | 26,557 | 1,046 | −3.696849 | −3.749643 |
| 720–1079 | 22,604 | 919 | **−2.765674** | **−2.755230** |
| 1080–1439 | 23,227 | 992 | −3.698954 | −3.746107 |
| Total | **99,640** | **4,375** | **−2.765674** | **−2.755230** |

The global prefix winner is the exact planted key; all 400 prefix runes are recovered. Freezing the key, last rune and eight-hold state yields 325/329 withheld correct (725/729 total, exact replay), heldout score −2.742532. Four residual ambiguous runes are not hidden-key errors. Neighboring origins 1032 and 1031 have lower prefix scores but can merge into the same consuming state and yield the same suffix; the full score also selects the true origin. This is a single blinded full-domain native calibration, not a population power estimate.

## Scope and reproduction

Retire this source-motivated but unauthenticated radix-3 address-order + continuous solved-p56 prime/F family for this chapter under the tested origins and prior. The original has hundreds of mathematically legal inverses; it is not an unconditional cryptographic impossibility theorem. No justification to extend offsets, arbitrary digit relabelings or higher-dimensional permutations without new first-party evidence.

Reproducer: [sims/lp2_opening_ternary_address_prime_fhold_sft.cjs](../sims/lp2_opening_ternary_address_prime_fhold_sft.cjs), inputs `resources/liber-primus/lp2-corpus.json` (blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165), `resources/external/relikd-solved-gp29-native-v1.json` (blob 1b064ef6d85819b7d96adaff31a82d1ec551598f). Run from repository root with Node: default mode `original`; `original-full` skips redundant prefix scoring; `plant1` tests the blind calibration. Optional arguments give inclusive/exclusive address-map index range, e.g. `node sims/lp2_opening_ternary_address_prime_fhold_sft.cjs plant1 720 1080`. Merge shard top scores by maximum and counts by sum. Executed on the actual source files in connected V8; standalone Windows Node/CI execution not claimed.
