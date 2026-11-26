# U2b word-ordinal jump: ranking-free key inference and original receiver decisions

**26 November 2026 — Agents 3 and 7. Exact conditional original negatives.** No new plaintext or authentic key. All periodic q8 additive keys fail the terminal-body conserved-inventory hypothesis even with arbitrary word-initial phase and mixed F semantics. The fixed nonperiodic native-prime-minus-one pad with U2b jumps also fails (relaxed minimum 17 OOV versus budget 3). A rank-free finite-family calibration recovers both sampled top-eight ranking misses and two rank-hit controls; no authenticated source selects U2b or a nonperiodic historical key family.

## Model and distinct contribution

The external [U2b receiver](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round47/X1-redteam/x1_c10_beam_attack.py) jumps by cyclic GP-chart primes according to *true* word ordinal. The fixed-key #2887 decision is consolidated below. This independent branch uses an entirely unknown **period-eight key** (historical WELCOME q8 and terminal eight-rune rubric motivate the period, but do not select U2b). Freeze ordinary addition:

\[
C_{p+i}=P_i+K_{(p+i+J_k)\bmod8}\pmod{29},\qquad J_k=\sum_{j=0}^{k}\mathrm{prime}[j\bmod29].
\]

No literal-F holds, no unknown jump law, no key ranking, no assumption about printed true starts. This is an exploratory combination, not a first-party selected cipher. The independent count inventory premise is conditional; H-decoy with unconserved lengths escapes.

## Exact inference

The corrected terminal black body is p54 after its nine red runes plus p55: 299 runes, 64 complete groups including the 11-rune cross-page carry. The lengths include 10,10,11,13, so <=3 arbitrary OOV words imply at least one dictionary anchor of length >=10 regardless of its order. The 33,394-form GP29 register contains both greedy NG/ING and IA/IO spelling conventions, TextBlob forms, exact native solved words and all singleton runes. Donor words are included; controls assess key inference, not unseen lexicon robustness.

For any in-register anchor at position p, the repeated-phase differences C[p+i]-C[p+i-8] must equal P[i]-P[i-8] (mod29). Hash these signatures by length. Every compatible anchor fixes all eight key digits; enumerate each feasible phase. No rank or sample truncation. For each length l, remove one l from the count inventory and compute all possible prefix cardinalities k and sums p by 0/1 subset-sum DP. This gives necessary and sufficient individual-edge feasibility in some ordering. It restricts the anchor phases and each edge in the relaxed ordinal/offset lattice; the relaxed path may splice incompatible subsets, so it is an admissible lower bound on true OOV cost. Dynamic programming merges by (k,p) keeping minimum cost. Only surviving keys need exact remaining-count search with admissible suffix bound. The capped 3,000,000-node exact stage cannot certify a negative if capped; **no original key reaches this stage**.

## Executed results

| Input | Anchor matches | Candidate keys | Relaxed survivors | Exact key | Recovered runes |
|---|---:|---:|---:|---|---:|
| Native LOSS OF DIVINITY, 48 words | 1 | 4 | 1 | yes | 212/212 |
| Native KOAN, 48 words | 1 | 7 | 1 | yes | 190/191 |
| Original-shaped synthetic inventory, three long OOV | 1,248 | 8,340 | 1 | yes | 298/299 |
| Original p54–55, <=3 OOV | 1,099 | 7,641 | 0 | none | none |

All three controls recover the exact complete hidden key; two have alternate lexical segmentations, so exact key recovery does not imply unique plaintext. They recover 48/48, 46/48 and 62/64 words at corresponding ordinal positions; the selected witness need not be the planted one. The stress control replaces three long words by arbitrary nonregister rune strings and preserves the original 299/64 length inventory, testing the single surviving long-anchor guarantee. All found witnesses replay exactly with the same length inventory.

Original phase joins 7,660, 7,641 unique keys, 4,959,337 active-state visits. Every candidate is eliminated by the relaxed OOV path gate; no exact-count cap is relevant. Thus **every ordinary periodic q8 U2b key** fails the original 299-rune body if the true word-length multiset is the printed one and at most three true words are OOV in the named register. This does not reject arbitrary word lengths, other periods, other jump laws or transparent-F semantics. No candidate original plaintext.

## Reproduction and next decision

`node sims/lp2_u2b_periodic_q8_anchor_sft.cjs all` ([script](../sims/lp2_u2b_periodic_q8_anchor_sft.cjs)). V8 executed the same core for [controls](lp2-u2b-periodic-q8-anchor-controls.json) and [original](lp2-u2b-periodic-q8-anchor-original.json); standalone Node wrapper not separately CI-run. Inputs: canonical corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, corrected groups 8960e113af36ee46186965e394ec6be18d69b74f, TextBlob 140e1d22b5f8c45deddd2e8b25549d9d6307d938, native controls 1b064ef6d85819b7d96adaff31a82d1ec551598f.

Do not extend ordinary q8 key sweeps. The original historical cipher permits literal plaintext-F holds; the following extension settles that distinct global consuming branch. Other key families need independent source support. This is the complementary key-inference result for #2887; see the fixed-key decision below.

## Literal plaintext-F hold extension (26 November)

The native historical rule makes plaintext F transparent and non-consuming; ordinary encrypted non-F can also emit ciphertext F. This is a different sender:
\[
C_{p+i}=\begin{cases}0 & P_i=0,\\ P_i+K_{(h+J_k)\bmod8}\pmod{29}&P_i\ne0,\end{cases}
\]
where h counts all preceding **non-F** plaintext runes, across true word boundaries. An ordinary branch decoding to zero is illegal; a visible ciphertext zero can be either a hold or a legal ordinary branch. The original has six visible zeros (body offsets 32,56,186,238,248,264).

Anchor inference enumerates every in-register word of length >=10 at every count-feasible offset. F requires a literal zero at its position; the remaining runes must yield a consistent periodic eight-digit difference vector. Missing key digits are exhaustively completed (the original and all three controls have no compatible partial anchors; the sole low-consuming long dictionary form FOODSTUFFS cannot align its three literal Fs). Prior holds can only occur at visible zeros; enumerate every phase from the feasible ordinal/offset phase minus 0..number of preceding zeros. This is a conservative superset, not a fixed F assignment.

The relaxed lattice state is now (true ordinal, rune offset, cumulative holds). At every word edge, enumerate every local consuming/holding inverse; two paths with the same length and number of holds have identical future key state, so retain the lowest OOV cost. Impossible ordinary-F transitions are discarded even on OOV words. The individual count-feasible edge mask and final total word count/length remain exact necessary conditions. The exact count DFS on survivors carries the hold state and replays each returned witness; no original candidate reaches it.

| Input | Anchor matches | Unique complete keys | Relaxed survivors | Exact planted key | Recovered runes |
|---|---:|---:|---:|---|---:|
| Native LOSS | 1 | 6 | 1 | yes | 212/212 |
| Native KOAN | 1 | 8 | 1 | yes | 191/191 |
| Same inventory, three long OOV | 1,087 | 7,908 | 1 | yes | 298/299 |
| Original p54–55, <=3 OOV | 1,047 | 7,941 | 0 | none | none |

All original candidate ranges [0,1000),[1000,4000),[4000,7941) were executed, totaling 7,614,925 active-state visits. No rank cutoff, no partial anchor cap, no original exact-stage timeout. The stress control's full ranges [0,1000),[1000,5000),[5000,7908) have only its correct key survivor; its exact replay differs from the planted plaintext at one rune (an alternative segmentation/plaintext remains possible). The two native controls recover all words under this sender.

**Decision:** the same exact original conditional exclusion now covers both ordinary and global plaintext-F-consuming periodic q8 U2b models. This is not an exclusion of every latent length inventory, arbitrary word phase or arbitrary key law. No original key/plaintext recovered. The combined sender remains a hypothesis, not a first-party authored operation.

Reproduce: `node sims/lp2_u2b_periodic_q8_fhold_anchor_sft.cjs original 0 1000`, then `original 1000 3000`, `original 4000 3941`; control modes `loss`, `koan`, `stress 0 1000`, `stress 1000 4000`, `stress 5000 4000`. [SFT](../sims/lp2_u2b_periodic_q8_fhold_anchor_sft.cjs), [original first](lp2-u2b-periodic-q8-fhold-original-0000.json), [middle](lp2-u2b-periodic-q8-fhold-original-1000.json), [final](lp2-u2b-periodic-q8-fhold-original-4000.json), [LOSS](lp2-u2b-periodic-q8-fhold-loss.json), [KOAN](lp2-u2b-periodic-q8-fhold-koan.json), [stress first](lp2-u2b-periodic-q8-fhold-stress-0000.json), [middle](lp2-u2b-periodic-q8-fhold-stress-1000.json), [final](lp2-u2b-periodic-q8-fhold-stress-5000.json). Same four pinned inputs; connected V8 core executed, standalone Node/CI not independently run.

## Stronger clock-free decision: arbitrary true-word phase and mixed F semantics

The preceding two original negatives depend on one prime-jump law. Remove that assumption entirely: one unknown q8 additive cycle (keys quotiented by cyclic rotations); each true word independently chooses any of its eight initial phases **and either ordinary addition or native plaintext-F holds**. The true starts remain arbitrary; only the complete 299/64 length inventory and <=3 OOV budget are conserved. This subsumes both previous U2b clocks and arbitrary word-local phase/reset laws. Unlike the earlier approximate hidden-word proposal #2702, no key is ranked or truncated. Unlike prior intact-group tests, no printed start is required.

The full-key long-anchor argument still holds. For each feasible start and long word, enumerate both conventions, complete any missing shift digits, and canonicalize the resulting cycle by minimum cyclic rotation. The original has 1,099 ordinary and 1,047 F-hold matches, giving respectively 1,096 and 1,044 rotation classes (1,164 in their union). All have complete anchors. Any key outside this union already requires >=4 OOV long words.

For each candidate cycle, compute the exact set of all dictionary-compatible intervals for every required length, permitting all phases and either convention at each interval. For a length l with required count n_l, let m_l be the maximum number of nonoverlapping compatible length-l intervals. Greedy earliest-finish selection is exact for intervals of equal length. Each distinct true word must occupy a disjoint interval, so at least max(0,n_l-m_l) true words of that length are OOV. Summing over lengths is a valid lower bound even while relaxing overlap **between** different lengths. This lower bound exceeds the exception budget for **every original candidate cycle**, minimum 23 among the 1,164 anchor-supported cycles. Keys outside the anchor union are excluded at budget3, not certified at budget22.

| Input | Unique rotation classes | Packing rejections | Relaxed survivors | Actual key recovered | Witness runes matching plant |
|---|---:|---:|---:|---|---:|
| Native LOSS, independent random phases/modes | 1 | 0 | 1 | yes | 197/212 |
| Native KOAN, independent random phases/modes | 1 | 0 | 1 | yes | 166/191 |
| Original-shaped three-long-OOV plant | 1,176 | 1,175 | 1 | yes | 236/299 |
| Original p54–55 | 1,164 | 1,164 | 0 | none | none |

For controls, the relaxed ordinal/offset lattice and exact-count DFS recover the unique true cycle up to rotation; all witnesses replay exactly. These controls deliberately leave arbitrary phase/mode and lexical segmentation nonidentifiability visible: unique cycle does not imply unique plaintext. The three-long-OOV plant proves the anchor/packing pipeline retains a true key under the full exception allowance. The original packing gate rejects all keys before any DFS, score, rank or timeout. No new plaintext or authentic key.

**Final route decision:** retire the entire named ordinary/mixed-F shared-period-eight additive family on the terminal black body under a conserved true-word-length multiset and <=3 OOV in this register, irrespective of true starts and word-initial phases. This is a stronger clock-independent statement than the two specific U2b negatives. It does not reject an arbitrary different alphabet action, arbitrary period, within-word clock changes, changed length inventory, a larger lexical exception budget or unusual plaintext register. Do not spend more q8 key searches on arbitrary phase/ordinary-F mixes under these assumptions.

Reproduce: `node sims/lp2_q8_hidden_inventory_arbitrary_phase_sft.cjs all`. [SFT](../sims/lp2_q8_hidden_inventory_arbitrary_phase_sft.cjs) · [controls](lp2-q8-hidden-inventory-arbitrary-phase-controls.json) · [original](lp2-q8-hidden-inventory-arbitrary-phase-original.json). Same pinned inputs. Connected V8 cores executed, standalone Node wrapper not separately run.

## Fixed-key ranking-free decision (#2887, Agent7)

### Exact rank-free calibration

[H2's actual published C10](https://github.com/Dukotah/cicada3301/blob/master/challenges/c10_shuffled_lengths.py) uses a public 65,536-key SplitMix64 family, ordinary consuming U2b and true sentence length multisets. Its [reported](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round47/H2-harden/RESULTS.md) top-512 recovery is 88/100. This study uses the same stream formula and salt but only seeds 0–255, a single 64-word native unit, and a native leave-section-out bigram ranker. It is a focused surrogate calibration, not a rerun of the sealed H2 benchmark or a claim of its throughput.

For a fixed seed, an edge (k,p)→(k+1,p+l) decodes exactly one word using C[p+i]−K[p+i+J_k] modulo29. Remove one length l from the exact inventory and compute feasible subset cardinalities/sums for the prefix. Retain only individually feasible edges. The cost is 0 for a word in the frozen 33,394-form register and 1 otherwise. Every exact inventory path is a path in this relaxed lattice; therefore its minimum cost is a sound lower bound. Pruning a state with cost >3 cannot remove a true path with <=3 OOV. In this finite family, no ranking cutoff is applied.

Twenty-four predetermined 64-word native controls use fixed xorshift seeds and shuffled length lists. Seven have true ranks outside the surrogate top eight; select the first two misses and first two hits for exhaustive 256-key tests. All four true keys are the sole surviving seed, each with relaxed minimum 0. The other 1,020 seed/control combinations are eliminated.

| Native source | Runes | True printed-start rank | True seed | Surviving seeds |
| --- | ---: | ---: | ---: | ---: |
| First KOAN | 248 | 21 | 20 | 1 |
| LOSS OF DIVINITY | 262 | 25 | 8 | 1 |
| WELCOME | 274 | 1 | 16 | 1 |
| LOSS OF DIVINITY (second key/shuffle) | 262 | 1 | 24 | 1 |

The fourth row reuses the second row's source start with a different key and shuffle; it is not an independent fourth text. The dictionary includes authentic solved words from all controls, while bigram ranking excludes each tested section. This establishes retention and key filtering in the named surrogate, not universal recall, unique plaintext, a runtime guarantee for 65,536 keys, or performance on the actual H2 ranking misses. Exact inventory reconstruction is unnecessary for rejecting the wrong seeds; the known plant certifies a feasible exact path for each survivor.

[SFT](../sims/lp2_u2b_ranking_free_fixed_key_calibration_sft.cjs) · [raw results, all 24 ranks and pinned blobs](lp2-u2b-ranking-free-fixed-key-calibration.json). Connected V8 core executed; standalone Node/CI not run.

### One original fixed nonperiodic pad

The authentic p56 prime-minus-one/F-hold operation provides a genuine historical pad and known starting cursor, but **does not select its composition with U2b**. Test only that explicit exploratory composition, origin zero, no fitted offsets, no other key sweeps. Freeze the corrected terminal black body: p54 after nine red runes plus all p55; 299 runes, 64 complete groups, cross-page carry merged. Use the same 33,394-form register and <=3 OOV budget.

Let h count preceding non-F plaintext runes; let J_k be the inclusive cyclic GP-chart prime sum as above. For non-F, C=(P+prime[h+J_k]−1) mod29 (zero-based prime ordinal); for F, C=0 and h does not advance. This is a nonperiodic pad, distinct from all previously tested q8 keys. Verify the authentic p56 operation by removing the jump term: exact 85/85 original replay.

The lattice now uses (k,p,b), with b cumulative F holds and h=p−b. At each visible zero enumerate both literal-F and legal non-F alternatives; never allow an ordinary branch to decode to F. Preserve every legal inverse branch on every allowed word-length edge, including OOV words. Individual prefix subset feasibility and terminal length/word count are enforced; inventory multiplicities remain relaxed between successive edges. Merge states only when their future cursor and cost are equivalent. The original minimum is exact over this relaxed graph, not a beam or cap.

| Input | Runes / words | Relaxed minimum OOV | Witness matching true runes | Exact inventory witness |
| --- | --- | ---: | --- | --- |
| LOSS OF DIVINITY | 212 / 48 | 0 | 212/212 | yes |
| First KOAN | 163 / 48 | 0 | 160/163 | no |
| WELCOME | 181 / 48 | 0 | 178/181 | no |
| AN END | 85 / 25 | 0 | 83/85 | no |
| Original p54–55 | 299 / 64 | **17** | unknown | no |

Original: 18,117 visited states, 169,430 inverse-edge instances, seven terminal hold-count states. The best relaxed witness re-encrypts exactly but is incoherent and does not preserve the full inventory; it is not a candidate plaintext. Since even a relaxation requires 17 OOV, every exact-inventory path requires >=17. Native controls are deliberately allowed to demonstrate alternative relaxed witnesses; each true plant itself has an exact zero-OOV inventory path.

[SFT](../sims/lp2_u2b_native_primepad_lattice_sft.cjs) · [raw output and four input blob hashes](lp2-u2b-native-primepad-lattice-output.json). Connected V8 core executed; standalone Node/CI not run.

**Director decision:** The ranking-free prefilter works as a sound conditional receiver, and the named nonperiodic native-pad composition is rejected on original ciphertext. The source does not independently select the U2b jump law or a historical key family that survives. No original plaintext, no recovered historical key, no frozen continuation to predict. Stop before a large artificial SplitMix or unrelated key sweep. Reopen a targeted receiver only on independent source evidence selecting the jump law/key or a justified different inventory/register. The wider arbitrary-phase q8 exclusion above remains unchanged.
