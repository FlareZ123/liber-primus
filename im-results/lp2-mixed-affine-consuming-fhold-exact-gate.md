# All-key first-order mixed consuming feedback with transparent F — exact reduction

24 November 2026, Agent 5, draw 3. **No unknown plaintext or key recovered.** This is a bounded negative on the original GP29 sequence, not a claim about all feedback ciphers.

## Model and proof

For plaintext P=0 emit C=0 and hold both state registers. Otherwise put X=uP (mod 29), where u is nonzero, and emit C=X+aXprev+bCprev+d (mod 29); update (Xprev,Cprev)=(X,C). The initial two registers are arbitrary. Nonzero ciphertext necessarily consumes; zero ciphertext may be consuming or holding. This extends [the earlier ordinary mixed-feedback test](lp2-hg-original-mixed-feedback-spectrum-gate.md) to actual latent F behavior and all stationary coefficients, rather than its source triads. No source authenticates this recurrence as the LP2 cipher.

Within any nonzero ciphertext run, X_i=-a X_(i-1)+C_i-b C_(i-1)-d. Write X_i=A_i X_0+B_i. Start with all 28 nonzero X_0; each i forbids exactly one root when A_i is nonzero, or rejects the run if both A_i and B_i vanish. Bitmask intersection gives the exact legal first-symbol set without guessing F holds, primers or plaintext.

On all 12,956 original p0–55 runes (455 runs, max 217), every one of the 29^3=24,389 normalized triples is tested, covering 682,892 tuples including u. The only 29 survivors satisfy b=-a and d=0. For each nonzero a, at least one run uniquely forces X_0=C_0. Then delta=Xprev-Cprev obeys delta'=-a delta on consumption and is unchanged on holds. Nonzero a makes this reversible in both directions; therefore delta=0 everywhere for any globally legal path. At zero ciphertext a consuming transition would require X=0, which is forbidden. Hence every zero is a hold and P=u^-1 C for every rune. The a=0 survivor is immediately the same static substitution. Conversely every u admits an exact inverse with initial delta=0. Original IoC 0.03447839786450569, p16–21 0.03454946549360884, both invariant under static bijective relabeling.

The union of 503 within-page runs gives the same 29 shared-coefficient survivors, even if primers reset at physical page boundaries. For each surviving a, at least one run on p7 forces cancellation (or a=0 directly), so p7 cannot obtain a nonstatic decoding from any shared-coefficient model. This is NOT a proof for independently chosen page coefficients: p7 alone retains 1,133 normalized triples (1,104 noncancellation).

## Planted native controls

The exact Viterbi decoder keeps previous consuming X,C and previous physical plaintext, with all 841 possible initial register pairs. It branches on both possible zero emissions when legal. A smoothed unigram/bigram mixture is trained only on native sections outside the target sections. Given a,b,d, fit u from the first half of ciphertext, then use that fixed u for full decoding. Full decoding may use future ciphertext; no held-out plaintext participates in key selection. The two plants use WELCOME+KOAN 1 and LOSS OF DIVINITY+jpg107–167+jpg229, respectively.

| Plant | u,a,b,d | Runes | Prefix-selected u | Holdout correct | Exact forward replay |
| --- | --- | ---: | ---: | ---: | --- |
| 1 | 7,9,13,4 | 1295 | 7 | 648/648 | yes |
| 2 | 11,17,3,18 | 1163 | 11 | 582/582 | yes |

True u ranks first in both. This demonstrates conditional scale recovery and latent-hold inference, not blind recovery of a,b,d. Cheap run-gate alone retains 16,832 and 1,933 triples on the respective plants; it is not a universally identifying attack.

## Exact longer-lag extension: q=2 and q=3

The initial necessary lane gate retains 4,367/19,172/23,271 triples at q=2/3/4, including 4,338/19,143/23,242 noncancellation triples. For q=2 and q=3, a new exact joint path test closes every remaining nonstatic possibility. The recurrence uses the oldest pair in a queue of q previous consuming (X,C) pairs; a hold leaves the whole queue unchanged.

At the longest nonzero run (zero-based corpus offset 1691, length 217), grant the first q symbols arbitrary nonzero X values and fixed observed C values. This is a relaxation of any reachable initial queue, so an empty path set is sufficient to reject the global model. Represent state sets as a union of products of q 29-bit X masks for fixed q C values. On consumption, affine-transform the oldest mask, remove zero, rotate both queues and append the new C and X mask. On observed zero, also retain a hold branch. Remove a product only when contained coordinatewise in another product with identical C queue. These operations are exact (no beam ranking).

For cancellation b=-a,d=0 and a nonzero, delta=X-C evolves by nonzero multiplier -a and rotates on consumption; the number of nonzero deltas in the queue is invariant. To test every nonstatic path, initialize the union of q products in which at least one delta is nonzero. If this union dies, any globally legal inverse must be static. For a=b=d=0 the inverse is directly static.

| q | Lane gate survivors | Exact path tests (exclude static when cancelling) | Rejected | Largest rejection offset after anchor | Peak products |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 2 | 4367 | 4366 | 4366 | 926 | 53 |
| 3 | 19172 | 19171 | 19171 | 1975 | 228 |

No cap reached. Thus stationary continuous consuming lag q=1,2,3 mixed affine laws all reduce to static substitution. This is not an exclusion of q>=4, irregular clock, multiple taps, or piecewise coefficients. The earlier monolithic q=4 path run hit an execution timeout; the block-compressed extension below resolves it.

Two separate native-text q=2,3 plants with the same keys and donors as the first-order plants survive both the lane gate and the exact anchored path test (actual output in the script); this checks preservation of a true path, not full blind key recovery.

Reproduce with `node sims/lp2_mixed_affine_consuming_queue_exact_gate_sft.cjs`. Both first-order and queue scripts were executed in connected JavaScript on canonical inputs; no CI run claimed.

## Reproduction

Run `node sims/lp2_mixed_affine_consuming_fhold_exact_gate_sft.cjs` from repository root. The same function was executed against the canonical inputs in connected JavaScript, with exact result assertions in the standalone script. No GitHub Actions run claimed. All original unknown pages remain unresolved.

## Lag 4: complete block-compressed original inverse gate (Agent17, 24 November)

The previously timed-out q=4 branch is now complete. Rather than advance one rectangle per individual nonzero ciphertext rune, batch each maximal forced-consuming nonzero run. For each incoming ciphertext queue, the four initial X coordinates evolve independently as affine expressions A_j x+B_j in GF(29). At each step remove its unique forbidden initial root (or kill the entire state when the expression is identically zero). At the end, intersect each original mask with its surviving roots, apply the final affine image, and rotate the lanes by the run length modulo q. This is exactly equivalent to sequential propagation: all forced nonzero transitions are deterministic, and an excluded root is never restored. At a ciphertext zero, branch into hold and legal consumption; antichain reduction discards a rectangle only when another contains it coordinatewise with the identical ciphertext queue. No score, beam, or fitted mask enters the gate.

For a,b nonzero there is also an exact reverse recurrence with a'=a^-1, b'=b^-1, d'=-d/b and X'=-(a/b)X. This follows by solving C_i=X_i+aX_(i-q)+bC_(i-q)+d for C_(i-q). It preserves nonzero X and the literal F hold. Reverse testing is available for paths that survive or cap in the forward direction; none of the lag-4 original candidates required it.

| q | All normalized triples | Lane-gate survivors | Nonstatic path tests | Excluded | Pending | Peak rectangle count | Latest rejection block end after anchor |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 4 | 24,389 | 23,271 | 23,270 | 23,270 | 0 | 751 | 2,824 |

The original anchor is the 217-symbol run beginning at zero-based offset 1691. The path test gives its first four X values any nonzero value, a relaxation of all reachable primers. For the 28 nontrivial cancellation cases, it retains only paths with at least one nonzero delta X-C; cancellation preserves the count of nonzero deltas across consuming updates and holds. All such paths die. The remaining 29 cancelling parameter triples therefore admit only the static scaled permutation P=u^-1 C. This is an exact necessary exclusion of nonstatic **continuous stationary single-tap q=4** under the stated latent-F law. The 2,500-rectangle cap was never reached on original q=4. The listed rejection offset is a block endpoint, not necessarily the earliest individual contradiction.

Two planted native q=4 paths pass every preliminary lane test. Plant 1 completes the forward anchor-to-end gate (246 symbols, peak1516); plant 2 completes the reverse gate (273 symbols, peak504); their opposite directions cap at 3648 and 3692 respectively and are explicitly inconclusive, not rejected. These establish preservation of a true path over those intervals, not blind key recovery. No unknown plaintext, key, or destination recovered. The low-zero anchor extension below resolves lags 5 and 6; larger lags remain untested.

[Block SFT](../sims/agent17_mixed_affine_lag4_blockmask_sft.cjs) · [Actual shard outputs](lp2-mixed-affine-consuming-lag4-blockmask-output.json). Executed in the connected JS runtime; no CI run claimed.

## Lags 5 and 6: low-zero anchor makes the complete exact search practical (Agent17)

The source's lag-five/six motifs and five-dot art make these two single-tap lag candidates more relevant than an indefinite lag sweep, but neither authenticates the law. At q5, the initial longest-run anchor gave a 37.5-second a=1 shard and two forward caps subsequently rejected by the reverse test. A cheap coordinatewise-union relaxation (a=2) rejected only 339/841, and grouping by two exact coordinate masks rejected 825/841; neither was used for the final exclusion. Instead select the original 114-rune nonzero run beginning at offset1408. The following 400-rune window has only four ciphertext zeros; the first q arbitrary nonzero X masks still grant every reachable initial state. Fewer early ambiguity branches make **exact** reachability faster. This is input-based choice of a contradiction witness, not selection of any cipher parameter or plaintext.

| q | Normalized triples | Lane survivors | Nonstatic path tests | Rejected | Pending | Peak boxes | Latest rejection block end after anchor |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 5 | 24,389 | 23,543 | 23,542 | 23,542 | 0 | 230 | 3,854 |
| 6 | 24,389 | 23,549 | 23,548 | 23,548 | 0 | 946 | 3,132 |

The same exact block SFT was extended to six 5-bit ciphertext queue entries (30 bits) and optional anchor selection. Every final original shard used forward exact propagation only; neither reverse fallback nor the 2,500-box cap was needed. The 29 cancelling triples for each q again force static substitution by the invariant count of nonzero deltas. Both q5 and q6 include independent native plants: each of the two known keys passes the full forced-run lane test; plant 2 completes one anchor-to-end directional test (q5 reverse305, peak1515; q6 forward349, peak2030); the other full directional tests cap and are inconclusive. No original cap, no language-fit condition. At that checkpoint the scoped conclusion was q=1 through 6: every stationary continuous single-tap mixed affine inverse under authentic latent-F holds reduces to static substitution. Multiple taps, arbitrary switching laws, alternate clocks and larger q remain outside this result. Do not keep extending q without an independent receiver clue.

Run `node sims/agent17_mixed_affine_lag4_blockmask_sft.cjs 5 0 29 2500 1408` or replace 5 with 6. [Exact actual shard outputs](lp2-mixed-affine-consuming-lag5-6-blockmask-output.json). No CI execution claimed and no unknown plaintext or key recovered.

## Lags 7 and 8: complete vocabulary-independent normalized gate (Agent 3)

The exact block antichain algorithm now uses a 128-bit packed ciphertext queue and compiled 29-bit plaintext domains. On the original physical-rune interval [1408,7408), all initial nonzero X values on the first q consuming runes are granted independently; the first 400 runes have four ciphertext zeros. This interval reuses the earlier source-only low-zero anchor, not a language or parameter fit. Input FNV-1a over numeric rune values: 3382196842.

For each forced-consuming block, the affine composition of each lane is tracked and its forbidden zero preimages removed before applying the final affine image. Each zero-ciphertext branch is either a literal hold or a legal consumption. Only rectangles contained in another rectangle with the same ciphertext queue are discarded. All normalized coefficients a,b,d in GF(29) are tested, including a=0 or b=0; all nonzero plaintext slopes u are absorbed by X=uP. For cancellation a+b=0,d=0, the initial q-box union excludes the all-zero delta X-C state; its nonzero count is invariant for a≠0. The trivial a=b=d=0 case is static without testing.

| q | Nonstatic tests | Rejected | Capped | Peak boxes | Latest death (exclusive, relative) | Box visits |
|---:|---:|---:|---:|---:|---:|---:|
| 7 | 24388 | 24388 | 0 | 5527 | 4835 | 84482765 |
| 8 | 24388 | 24388 | 0 | 25048 | 4835 | 817767128 |

The cap was 30,000; no original case reached it. Every nonstatic trajectory is impossible for this continuous normalized single-tap law at these lags, independently of vocabulary, language, unknown initial queue and plaintext slope. Together with earlier results the continuous q=1–8 family reduces to static substitution on the unknown corpus. This does **not** establish exclusion of chapter/page-reset laws, multiple taps or q13.

Eight native 100-rune positive feasibility plants (four per lag) preserve a legal path. They use KOAN1 scale3/(9,17,4), LOSS scale5/(0,17,4), WELCOME scale2/(9,20,0) with nonstatic initial delta, and LOSS scale5/(9,0,4); coefficients are normalized (a,b,d). Dense-F full native plants can cap and are inconclusive; the short positive checks were selected for computational cost after those caps. A separate q13 exact box/MDD probe exceeded state limits; a bounded SAT encoding returned unknown, not a rejection. No CI execution, unknown plaintext or authenticated cipher selection is claimed.

[Compiled source](../sims/lp2_mixed_affine_lag7_8_box_gate.cpp) · [Source-bound runner](../sims/lp2_mixed_affine_lag7_8_box_gate_sft.cjs) · [All shard results](lp2-mixed-affine-lag7-8-box-gate-output.json). Reproduce from repository root: `node sims/lp2_mixed_affine_lag7_8_box_gate_sft.cjs 7 0 29` or lag 8. A C++17 g++ compiler is required. Each shard was actually executed locally; input was transferred from the repository and checked against the numeric FNV.
