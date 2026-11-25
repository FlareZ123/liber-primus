# Blind parallel-frame rank28 plaintext-predecessor decoder — Agent30, 25 November 2026

## Decision

A constructive, spacing-free key-recovery method learns hidden 28-entry additive plaintext-predecessor keys from genuine held-out literary controls at the exact original frame lengths. The manuscript instead produces nonlinguistic train and independent continuation scores indistinguishable from random rank tapes. Retire this specific fixed-row, repeat-reset receiver. This is a predictive beam-search negative, not an exhaustive theorem about all secret keys or evolving states.

## Receiver

Nine chapter-first ciphertext runes are IVs. Each of the 86 equal adjacent original ciphertext transitions is a frame delimiter; the remaining 12,861 nonzero transitions are cyclic ranks `d=(C[i]-C[i-1]+29)%29-1`. Thus there are 95 frames; their rank lengths sum to 12,861. Plaintext is GP28 with EO removed (written E,O if encountered in the donor transliteration); F is ordinary. Reset the preceding plaintext state q to F at each frame start. A shared secret K[0..27] defines:

- encode rank d=(P+K[q]) mod28; q=P
- decode P=(d-K[q]) mod28; q=P
- reconstruct nonrepeat C[i]=(C[i-1]+1+d) mod29.

The known chapter IVs and source delimiters are preserved; every original rune reconstructs exactly. The frame interpretation and choice of EO omission/F reset are hypotheses, not independently authenticated Cicada instructions. The native plaintext is shorter by 95 rune sites reserved as IV/delimiter. This is different from prior fixed plaintext-prime feedback or printed-word lexical tests, and specifically addresses decoy printed boundaries.

## Key recovery

Fit smoothed unigram/bigram/trigram distributions to the initial portions of three pinned literary sources; reserve their final 16,000 GP symbols. Standard ING/IO contractions and QU/V/K/Q/Z spelling folds. Search a width-64 beam of partial keys, each retaining one decoding frontier per training frame. Pick the unassigned preceding-plaintext row blocking the largest number of frame frontiers; branch over its 28 shifts. Propagate every frame exactly until its next unassigned state. Rank candidates by cumulative log-likelihood gain relative to uniform GP28; freeze the best full/partial key, with never-used rows defaulting to zero. No word boundaries, cribs or known plaintext are provided to the solver. This is bounded beam pruning; cumulative scoring at different depths is heuristic.

Fit on seven original chapters (10,245 ranks), withhold the complete p0–2 and p15–22 chapters (724 and 1,892 ranks). Each control uses the identical frame geometry, hidden independent random key, and a contiguous source-disjoint native passage. No held-out ranks are involved in fitting.

| Input | Training gain (nats/rank) | Held-out gain | Exact training/held-out runes |
|---|---:|---:|---:|
| Gibran | +1.106317 | +1.082978 | 10245/10245; 2613/2616 |
| Shakespeare | +0.981398 | +0.927598 | 10245/10245; 2616/2616 |
| Emerson | +1.049556 | +1.015720 | 10245/10245; 2616/2616 |
| Original | −2.890237 | −3.166215 | Unknown / nonprose |
| Three iid uniform-rank controls | −2.888935, −2.878066, −2.888482 | −2.980238, −3.073630, −3.191434 | Not applicable |

All used training key rows recover (26,28,28); Gibran has one unseen training row used in heldout, giving three errors. The original independent p0–2 and p15–22 gains are −3.369266 and −3.088514. The fitted original key does not decipher either. Full raw results contain candidate key, frame-level previews, per-chapter scores and beam traces. This algorithm is operational on the chosen hidden-key family but provides no original key or plaintext.

## Reproduction

- `node sims/lp2_rank28_plainprev_parallelframe_beam_sft.cjs` — all positive controls, original and matched rank nulls.
- `im-results/lp2-rank28-plainprev-parallelframe-beam-output.json` — actual V8 execution; no Windows CI claim.

Two early control setup attempts failed because the reserved literary tail was too short for 12,861 symbols; fixed at 16,000 before the successful pilot. The successful pilot informed retention of width64; the other two donors/keys were fresh controls. No original-data hyperparameter tuning. Do not extrapolate this result to arbitrary plaintext-indexed bijections, alternate rank alphabets, nonreset state, or a different plaintext distribution. No new deciphered rune.
