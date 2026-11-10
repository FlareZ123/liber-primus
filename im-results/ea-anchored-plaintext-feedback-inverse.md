# EA-anchored F29 plaintext-autokey inverse

**Agent 8 · 10 November 2026 · bounded original-cipher test.** No unknown LP2 plaintext, authentic key or cipher has been recovered. This report tests one **complete reversible forward architecture** motivated by the red-prime field root and the observed 86 zero-step markers. The original-source failure applies to that defined mechanism and the normalized solved-Cicada GP language register.

## Cipher and exact conditional decryption

The original red-source root **15** has order 28 in F29, so its powers enumerate the 28 nonzero differences. For each physical rune page, choose an initial output rune (IV), and for subsequent positions set

```text
DeltaC[i] = (C[i] - C[i-1]) mod 29

P[i] = 28 (GP-EA)  ->  DeltaC[i] = 0
P[i] in 0..27      ->  DeltaC[i] = 15^((P[i] + a*(P[i-1] mod 28) + b) mod 28) mod 29
```

The unknown shared parameters are **a,b in Z28** (784 choices). At any repeated adjacent published rune, the plaintext would necessarily be **EA**. This is an *assumption of the tested mechanism*, not a verified LP2 plaintext attribution. The first such marker on each page fixes the preceding plaintext symbol and thereby makes every *later* rune on that page exactly decipherable for a candidate pair (a,b), even without knowing the earlier plaintext or the IV. Each additional marker resets the plaintext feedback exactly.

There is no lossy doublet rewrite or post hoc inserted-null mechanism. Reversibility is exact after each anchor. Visible cipher-word boundaries play no role, so a mismatch between cipher and plaintext word segmentation cannot by itself explain the outcome.

## Source-selected and held-out attack

Use the checked-in [original 55 rune-bearing LP2 pages](../resources/liber-primus/lp2-corpus.json) and the [normalized authentic solved-Cicada LP1 source](../resources/liber-primus/lp1-plaintext-reference.txt). Tokenize the latter with the repository's GP digraph and standard Cicada spelling normalization; it contains **3,248 reference runes**. Smooth the non-EA source unigram probabilities by adding 1 to each of the 28 bins, as completely defined in the [standalone inverse script](../sims/ea_anchored_plain_feedback_inverse.cjs).

1. Compute log_15 of each nonzero original within-page ciphertext difference.
2. Anchor at each original zero difference and decode all subsequent runes under each of 784 (a,b) candidates.
3. Rank by mean GP-native language log probability on original physical pages **0..27** only.
4. Freeze the winning parameters, score untouched physical pages **28..55** without reselection, and compare to the source-language score of a uniform 28-rune stream.
5. Construct an independent source-native synthetic manuscript using exactly the original page lengths and a fixed random seed, encrypt with hidden a=15,b=22, then require exact plaintext reconstruction after anchors and recovery of both unknown parameters.

## Observed original-source result

| Statistic | Original ciphertext |
|---|---:|
| Zero steps used as hypothetical EA anchors | 86 (45 train, 41 holdout) |
| Nonzero symbols decoded after page-local first anchors | **6,155** (3,132 train; 3,023 holdout) |
| Winning fitted pair | **a=8, b=4** |
| Training log score per recovered non-EA rune | **−4.092824820** |
| Frozen holdout log score | **−4.177336910** |
| Uniform reference expectation | **−4.179564254** |
| Frozen holdout advantage relative to uniform | **+0.002227344 nats/rune** |
| Training winner's rank by holdout score among 784 pairs | **479th** |

The +0.00223 heldout advantage is practically negligible relative to the 1.27 nats/rune gain a true source-native plant produces below. The fitted pair does **not** yield a recoverable GP-native LP2 text under this mechanism. All 784 tested pairs reencrypt the original *conditionally decoded* symbols exactly by construction; that roundtrip is a correctness check on the algebra, not cipher identification.

### True-source positive challenge

Plant the exact source-native rune sampling procedure with a fixed **0x3301** xorshift seed, original per-page lengths, and source-defined feedback a=15,b=22. The same fully blind training selection returns **a=15,b=22 as its top pair**, with true-source holdout log score **−2.905047047**. All page suffixes following their first zero-step recover their original plaintext exactly, and their difference-stream reconstruction is exact.

This contrast shows that the lack of native language on the frozen original holdout is informative for this narrow family. It does not exclude different plaintext languages, nonlinear feedback rules, independently varying keys, or architectures in which zero difference is unrelated to EA.

## Reproduce and decision

```text
node sims/ea_anchored_plain_feedback_inverse.cjs
```

This is self-contained CommonJS for Node 22, requiring only existing repository resource files. The script asserts corpus dimensions, the F29 primitive root, exact true-source recovery, both true parameters, and exact original reconstructed-step identities. No new GitHub Actions wrapper was created: the existing manual `.github/workflows/red-triangle-discrete-log.yml` now includes this inverse as a step.

**Decision:** Do not invest in broader unconstrained searches of the same first-order linear plaintext-feedback equation. The original frozen second-half signal is absent. A clue-grounded nonlinear or source-specific correlated state, preferably one admitting exact held-out original-text reconstruction, would be needed to revisit this architecture.
