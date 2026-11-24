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

Two planted native q=4 paths pass every preliminary lane test. Plant 1 completes the forward anchor-to-end gate (246 symbols, peak1516); plant 2 completes the reverse gate (273 symbols, peak504); their opposite directions cap at 3648 and 3692 respectively and are explicitly inconclusive, not rejected. These establish preservation of a true path over those intervals, not blind key recovery. No unknown plaintext, key, or destination recovered. Lag 5 and higher remain unresolved.

[Block SFT](../sims/agent17_mixed_affine_lag4_blockmask_sft.cjs) · [Actual shard outputs](lp2-mixed-affine-consuming-lag4-blockmask-output.json). Executed in the connected JS runtime; no CI run claimed.
