# Exact ciphertext-autokey GP29 inverse gates: affine q8/q13 and arbitrary all-lag rows

**Decision:** no unknown LP2 plaintext or key. The all-lag row-permutation extension at the end excludes all 3,301 tested continuous ordinary lags against the frozen native register, and short transparent-F lags without guessing a hold mask. The fixed-length ciphertext-fed affine autokey family below has no whole-book shared feedback parameters. Four original pages individually reject both historical primer lengths even when given entirely independent coefficients and arbitrary primers. The ordinary additive member survives feasibility on just three page/length pairs; an exact language-scored inverse on those pairs produces nonprose despite native-plant success.

## Model and distinction from prior work

The established LP1 controls use 8- and 13-rune periodic additive keys with genuine transparent plaintext F. #2549 investigates *plaintext*-fed autokey; #2550 uses the previous physical ciphertext plus a separate periodic key. This gate instead uses the **qth prior consuming ciphertext** as the only post-primer key, with no periodic pad. #671's fixed 17-rune Instar seed is a different fixed-key scope. No historical instruction authenticates ciphertext autokey for unknown LP2; the two lengths are motivated by solved LP1, not selected by unknown text. This is a finite exact attack, not a new source selector.

GP29 indices 0..28 are used. Let q be 8 or 13; a and b range from 1 to 28; d ranges from 0 to 28. Initialize a q-entry queue with arbitrary GP29 primer entries. A plaintext F (P=0) emits C=0 and neither consumes nor appends a queue entry. Otherwise emit C=(aP+bK+d) mod29 where K is the queue head; pop K and append C. A consuming C=0 is permitted. After q consuming symbols, the queue contains only original ciphertext symbols; no unknown primer value survives.

For any q+1 consecutive nonzero ciphertext symbols within a reset-free region, every one must consume. Therefore C_i != b C_(i-q)+d mod29, because equality would force P_i=0, which would emit literal zero instead. Each such pair eliminates one d for each nonzero b, independent of a, the primer, language and spacing. There are 812 (b,d) pairs or 22,736 (a,b,d) triples per q. The second-stage exact dynamic program enumerates every possible hold versus consuming choice at every C=0. Its state is the queue of consuming ciphertext values; while fewer than q values have entered, the still-unused primer symbols are unconstrained, and a legal nonzero P always exists for a fresh primer entry. Once full, the only impossible consuming transition is C=bK+d. Equal queue states have identical future feasibility and are merged losslessly.

Every page is tested with its own arbitrary starting queue. A contradiction within one page also excludes continuous state entering that page, since a fresh arbitrary queue is a superset of reachable queues. Tests allow resets at physical page boundaries but not inside a page. Rune order and values are unchanged. The canonical p50 rune-free page is excluded from the 55 rune-bearing page counts.

## Exact original results

| q | Within-page zero-free pairs | Survivors with shared b,d across all pages | Pages excluding every b,d even with independent primers | Standard additive b=1,d=0 individually viable |
|---|---:|---:|---:|---|
| 8 | 9,020 | 0/812 | 19/55 | p14, p49 |
| 13 | 7,313 | 0/812 | 4/55 | p33 |

The exact latent-F DP examines all 656 q8 and 1,264 q13 page-local pairs surviving the cheaper zero-free gate, with peak 8 and 21 queue states respectively. The q8 page-local exclusions are p4,10,16,17,18,20,21,24,25,26,29,30,35,38,39,40,45,47,54. The q13 exclusions are p20,29,38,54, all of which also reject q8. Thus no choice of these two lengths, even changing the length, coefficients and primer per physical page, can account for every original page under this law. This does not exclude a distinct cipher on those pages or resets within a page.

For each q, three separately planted source-native sections (WELCOME, first KOAN, LOSS OF DIVINITY) use distinct nonzero affine parameters (1,1,0), (7,11,19), (23,19,8) and arbitrary deterministic primers. All six true parameter pairs survive. The known plaintext satisfies every tested zero-free transition. The affine feasibility gate does not identify the true parameters uniquely on these plants; it is a necessary and sufficient *existence* gate, not a key-ranking or prose-recovery test.

## Attempted original suffix recovery

For the **standard additive** model (a=b=1,d=0), the three remaining page/length pairs have a finite exact inverse. Rather than guessing a primer or treating ciphertext F as automatically transparent, a Viterbi DP tracks the queue and up to two previous decoded runes. The first q nonzero ciphertext symbols guarantee that the primer is fully consumed, so scoring begins immediately after the qth such symbol; no prefix plaintext is fitted to the language model. The score is a smoothed backoff trigram over native GP29 solved sections (backoff pseudocount 5, no word spacing). For each unknown page the training set is all nine native solved sections; for each positive control its own native section is excluded. A representative arbitrary prefix is constructed only to verify complete forward replay, so the printed primer in the raw output is **not recovered key material**.

| Original page | q | Unscored prefix | Scored suffix runes | Maximum score (nats/rune) | Forward replay |
|---|---:|---:|---:|---:|---|
| 14 | 8 | 9 | 128 | -5.330633 | exact |
| 49 | 8 | 9 | 57 | -5.526301 | exact |
| 33 | 13 | 15 | 199 | -5.292225 | exact |

The original suffixes are not connected readable native prose. For comparison, six additive ciphertext-autokey plants on authentic native sections predict **4,033/4,033** scored suffix runes exactly, across q8 and q13 (each target excluded from its language model). Their true/selected scores are -2.4814 to -2.7838 nats/rune; every plant round-trips. The original suffix selection uses the complete original suffix and is therefore retrospective decoding, not held-out plaintext prediction. Exact round-trip is an implementation invariant, not proof of a solution. The result does not reject every per-page affine survivor by language, and does not test plaintext-fed autokey, position-fed variants, nontransparent F, or arbitrary internal resets.

## Reproduction and disposition

- [Exact queue-feasibility SFT](../sims/lp2_ciphertext_autokey_affine_8_13_zero_free_gate.cjs) and [complete output](lp2-ciphertext-autokey-affine-8-13-exact-output.json).
- [Exact standard survivor Viterbi SFT](../sims/lp2_standard_ciphertext_autokey_survivor_viterbi.cjs) and [complete output](lp2-standard-ciphertext-autokey-survivor-output.json).
- Source fixtures: [canonical LP2 indices](../resources/liber-primus/lp2-corpus.json) and [native solved rune sections](../resources/external/relikd-solved-gp29-native-v1.json).

Both exact function bodies were executed on the fetched repository JSON in a JavaScript runtime; no Windows Node CI result is claimed. Run either SFT from the repository using Node. The complete outputs preserve per-page constraints, native-plant outcomes, exact candidate suffixes and replay status.

**Research decision:** retire the whole-book q8/q13 ciphertext-fed affine model under the stated queue and F-hold law. Retire standard additive page-local q8/q13 as an ordinary native-prose decoder on these pages. Do not retune arbitrary feedback lengths or offsets without an independent selector. #2549's plaintext-fed model is not excluded by this result.

## Generalization: arbitrary stationary feedback and output permutation

Consider `C=pi(P)+f(K) mod29`, where pi is any GP29 permutation with pi(0)=0 and f is **any** GP29→GP29 function. Preserve transparent plaintext F and the qth-consuming-ciphertext queue. Every zero-free q+1 interval implies f(C_(i-q)) != C_i independently of pi.

| q | Usable pairs | Rows forced f(x)=0 | Maximum injective matching | Fully forced original words length ≥5 |
|---|---:|---:|---:|---:|
| 8 | 9,020 | 28/28 nonzero inputs | 2/29 | 621 |
| 13 | 7,313 | 28/28 nonzero inputs | 2/29 | 502 |

Each nonzero row sees all 28 nonzero successors. Hence all 28 nonzero inputs force f(x)=0; only f(0) remains unrestricted. This reduces the full 29^29 map space to at most 29 degenerate functions, **without assuming affine structure or language**. No feedback permutation survives; a planted genuine feedback permutation on native text admits 29/29 matching at both lengths.

The surviving maps imply P=pi-inverse(C) at every forced position. Against a frozen 38,920-spelling GP29 lexicon (TextBlob wordfreq, historical rune transliteration variants and solved native words), the exact fully constrained words give:

| q | Best matches over 28 affine output slopes | Pattern-impossible words under any zero-fixed pi | Additional disjoint incompatible word groups | OOV lower bound under any shared pi |
|---|---:|---:|---:|---:|
| 8 | 1/621 | 25 | 82 | 107/621 (17.23%) |
| 13 | 1/502 | 19 | 65 | 84/502 (16.73%) |

All words with no equality-pattern match are necessarily OOV. Remaining words are sorted by decreasing length, ties in source order. Exact word-candidate arc propagation, singleton injectivity and bipartite matching certify the disjoint incompatible groups. At least one word from each group must be OOV; groups are disjoint from the pattern-impossible words. This is a rigorous lower bound relative to the frozen vocabulary, not a global optimum or language-independent English theorem.

A separate native-text, known-zero-feedback plant with unknown nontrivial output permutation recovers **1,192/1,192** and **1,100/1,100** q8/q13 anchor runes, with no OOV. Two mappings not occurring in the anchors remain unresolved. The control's own vocabulary is included, so this validates the constraint engine rather than blind vocabulary generalization.

**Disposition:** the entire stationary one-input feedback-permutation family is impossible at q8 and q13 on the manuscript. Unrestricted stationary functions are forced into degenerate near-zero maps with nonnative forced-word behavior. No LP2 plaintext or key recovered. Page/chapter-changing maps, multiple inputs, time-varying maps and internal resets remain outside the tested scope.

[Nonlinear feedback and cryptogram SFT](../sims/lp2_autokey_arbitrary_feedback_map_gate.cjs) · [complete output](lp2-autokey-arbitrary-feedback-map-output.json). Exact function body executed in JS against canonical repo inputs; no Windows CI result claimed.

## Arbitrary lag-context permutation rows

Replace the affine/additive structure entirely with one arbitrary stationary GP29 bijection pi_K per prior consuming-ciphertext queue head K. Plaintext F remains transparent and holds the queue. For each nonzero K, the within-page zero-free pairs observe all 28 nonzero outputs. A consuming input is never zero, so the missing row output pi_K(0) must equal zero. Once q consecutive nonzero ciphertext runes occur, the entire consuming queue consists of nonzero entries. Thereafter every zero ciphertext is necessarily a hold, and every nonzero ciphertext consumes and appends itself. No unknown initial queue can affect the subsequent contexts.

For each nonzero row, sort its observed nonzero ciphertext frequencies descending. Summing equally ranked entries across rows majorizes any assignment of those counts to plaintext symbols. Keep the forced F count separate, then grant every prefix rune before synchronization to the largest frequency. This relaxed construction majorizes every possible full plaintext histogram; its top-nine and IoC are upper bounds, not a claim that the prefix can actually attain the maximizing assignment.

| q | Unsynchronized prefix runes | Forced F holds | Known consuming positions | Top-nine upper bound | IoC upper bound |
|---|---:|---:|---:|---:|---:|
| 8 | 490 | 445 | 12,021 | 5,462 | 0.039084410 |
| 13 | 842 | 438 | 11,676 | 5,655 | 0.042622234 |

All 176 frozen same-length windows of existing native-GP encoded prose exceed both bounds: Gibran 16 windows (min top-nine 8,249, min IoC 0.0593767), Shakespeare 64 (7,946, 0.0572324), Emerson 96 (8,377, 0.0604263). Two planted row-permutation controls on the same 2,979 solved native runes replay exactly, with actual top-nine 1,958 below their respective ceilings 2,079 and 2,062. These controls use zero-fixed cyclic row bijections; they validate the inverse/count construction, not every possible language. The proof grants arbitrary 29-symbol row bijections and independent initial queues at each physical page, but requires globally shared stationary rows. The finite donor comparison does not prove all conceivable English plaintexts impossible.

[Executable SFT](../sims/lp2_lagged_consuming_ciphertext_allrow_permutation_gate.cjs) · [Complete counts and controls](lp2-lagged-consuming-ciphertext-allrow-permutation-output.json). Executed exact JS function against repository inputs; no Windows CI claim. No original plaintext recovered.

## All-lag majorization and latent F propagation

Agent 11, 24 November 2026. This extends the preceding q8/q13 row bound rather than re-running the affine search. The family is (C_i=\pi_{K_i}(P_i)), with 29 independently arbitrary stationary GP29 bijections and a q-entry ciphertext-fed queue, q=1…3301. Ordinary mode consumes every rune. Transparent-F mode emits literal zero for plaintext zero without consuming; nonzero plaintext may emit ciphertext zero and consume. The arbitrary row tables are shared across all frames; each initial queue is unrestricted. Tested frames are continuous 12,956 unknown original runes, the eight canonical transcription sections delimited by "$", and 55 nonempty physical pages. Neither framing nor lag is claimed as author-authenticated.

### Key-independent proof

For ordinary mode after the first q runes in each frame, (K_i=C_{i-q}) is known, regardless of the private primer. In row k, let (n_{k,c}) be the original output count for c. Any inverse row is a permutation of that histogram. For every k-rank cutoff m, its largest possible contribution to a fixed set of m plaintext symbols is the sum of its m greatest counts. Thus summing sorted row histograms entrywise gives a vector majorizing every possible decoded histogram. Grant the unobserved primer-dependent positions entirely to its largest component. This is a relaxation (it need not be simultaneously attainable by the real queue), so exclusion by any cumulative rank is sound.

The transparent-F case requires determining which zero ciphertext symbols definitely hold. Let H be the set already proved held; all nonzero ciphertext symbols must consume, and all other zeros are independently allowed to consume or hold. At physical position i, if at least q preceding nonzero symbols exist, the actual predecessor is between the qth previous nonzero position and qth previous position not in H, inclusive. Its candidate context set is the OR of symbols in this interval excluding H. This is the exact context set in the relaxed independent-zero model. Before q mandatory consumptions, grant all 29 primer possibilities. The sliding interval endpoints advance monotonically, so a count-and-bitmask implementation is linear per propagation pass.

A nonzero ciphertext in a singleton context must occupy a nonzero plaintext input in that row. When all 28 nonzero outputs are witnessed in such a row, its unused zero-input image is forced to zero. A ciphertext zero whose possible contexts all have zero-input image zero must be a transparent hold. Add it to H, recompute the intervals, and repeat until no change. Every inference is monotone and sound for the full model. The remaining unknown context positions and unresolved zeros are granted arbitrarily to the largest frequency. For known nonzero outputs, row histograms permute into 28 nonzero plaintext slots; the separately proved holds occupy plaintext zero. Sort and majorize as above.

### Original results and controls

All 176 quarter-window-stride native-GP donor windows are exactly the earlier frozen Gibran (16), Shakespeare (64), Emerson (96) controls. Their smallest top-nine count is 7,946. The windows overlap, so this is a finite-register comparison, not 176 statistically independent trials. A donor is incompatible when any one of its 29 cumulative frequency ranks exceeds the corresponding key-independent upper bound. A lag is excluded against the register only when no donor survives.

| Clock and reset scope | Tested lags | All-rank excluded | Top-nine-only excluded |
|---|---:|---:|---:|
| Ordinary, continuous | 3,301 | 3,301 | 3,301 |
| Ordinary, eight sections | 3,301 | 1,675 | 538 |
| Ordinary, physical pages | 3,301 | 214 | 78 |
| Transparent F, continuous | 3,301 | 51 (1–49, 51–52) | 49 |
| Transparent F, eight sections | 3,301 | 50 (1–49, 51) | 48 |
| Transparent F, physical pages | 3,301 | 44 (1–44) | 43 |

Continuous ordinary maximum top-nine upper bound is 7,358 (q3299), below every donor even after granting the full initial prefix. Section/page ordinary complete exclusion ranges are in the output JSON; their first unexcluded lags are 1643 and 214. In continuous F-hold mode q13 propagates 457 holds, fixes 28 rows, and leaves 21 unconstrained positions; q52 fixes 28 rows, proves 454 holds, leaves 165 unconstrained positions, and yields top-nine bound 5,224. Some q46/q51 exclusions instead arise from cumulative ranks beyond nine. q50 is not excluded by this relaxation (73 donor vectors remain); q53 leaves three. Do not conflate a surviving frequency vector with an actual feasible plaintext or key.

Twenty-one independently keyed known-native controls (2,979 solved runes, seven lengths, ordinary/zero-fixed/mixed-row modes) replay exactly and their actual cumulative frequency vectors never exceed the bounds. Their known masks are used only for control replay and assertions, not for context inference. Mixed rows generate 39–96 genuine consumed ciphertext zeros per control. Two additional 50,000-rune uniform propagation plants at q13 exercise actual inferred holds: all-F-fixed case proves 1,660/1,661 true holds, fixes 28 rows; mixed case proves 1,633/1,699 true holds, fixes 27 rows, with 55 genuine consumed zeros. No false context or hold inference in either plant. These two are mechanistic controls, not language-recovery claims.

**Decision:** retire continuous ordinary stationary single-lag row-table receivers over q1–3301 for this native register, plus the precisely excluded short F-hold/reset variants. Do not tune another affine/single-lag receiver inside these scopes. This leaves other lag/reset scopes, multi-input or time-varying state, per-section changing row keys, nonnative encoding, and clue-selected operations open. No original plaintext/key, independent source-selected lag, or original hold-mask identity is claimed.

[All-lag SFT](../sims/lp2_all_lag_ciphertext_row_majorization_sft.cjs) · [complete summarized output and controls](lp2-all-lag-ciphertext-row-majorization-output.json). Exact code body executed on repository input files in JS; native Node CI has not been claimed. Source and output commits: 4af72c109c069cad76fed435505c20912552ae01 and 3bf4d993f4209dc18897f26536bb1dfe4a410a8d.
