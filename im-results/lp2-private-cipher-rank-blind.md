# Ciphertext-only private destination rank recovery

## Decision

The ordinary ciphertext-driven nonbijective private insertion family now has a calibrated, partial ciphertext-only attack. It recovers readable but corrupted held plaintext on two independent planted keys (77.65%, 85.8%). The frozen original LP2 experiment produces nonprose with a substantially worse held score. No original plaintext or key recovered. This is a heuristic negative, not an exhaustive all-key exclusion. The arbitrary static insertion family remains unsupported by a source-selected sender law.

## Mechanism and inverse

For each consumed plaintext symbol p, select rank S[p] in private list A, emit c=A[S[p]], then remove c and insert it at private fixed destination rank R[c]. R need not be bijective. Here no F hold. Given C, R, and initial A, replay list updates to obtain the rank stream; a fixed private inverse chart K maps each rank to plaintext. For a fixed R and initial A, the maximum unigram likelihood over all K is exact by matching sorted observed rank counts to sorted training probabilities (rearrangement inequality). This eliminates one unknown permutation from the first-stage optimization. Use three 6,000-step annealing restarts on R alone, canonical A. Seed K from that optimum, then 20,000 joint R/K mutation steps under smoothed GP trigram likelihood. Refine in four 22,000-step cycles using adjacent R changes, K swaps, initial A swaps, joint adjacent-rank coordinate swaps across R/K/A and double R changes. Retain solely best fit likelihood. All schedules, seeds, and data paths are fixed in `sims/lp2_private_cipher_rank_blind_sft.cjs`.

Training: normalized Shakespeare and Emerson; Gibran absent from training. Two disjoint 6,000-rune Gibran intervals at starts 2001 and 18001, independent random private R, S and A. Fit first 4,000 symbols, excluding first 500 for burn-in; evaluate next 2,000 untouched symbols. True keys and plaintext are used only for reporting plant accuracy and an oracle canonical-initialization comparator. Original: first 6,000 of canonical unsolved tape with same split, no original retuning. Scores are mean smoothed trigram log probabilities (larger is better).

| Case | Initial held correct | Refined held correct | Refined fit score | Refined held score |
|---|---:|---:|---:|---:|
| Plant 1 | 1273/2000 | 1553/2000 | -3.295625 | -3.543811 |
| Plant 2 | 1695/2000 | 1716/2000 | -3.056551 | -3.133631 |
| Original | unknown | unknown | -5.866075 | -6.494358 |

Even true planted R/K with canonical rather than true starting A gives 1978/2000 and 1836/2000: arbitrary static nonbijective maps need not synchronize completely. Joint refinement includes A but neither blind plant is fully recovered. The partial control phrases are genuinely predicted from held ciphertext, not given donor words, but must not be described as complete decipherments. Original held candidate begins `EONLYOEEJJPOEGEOONGTEOTNGEOXIAXMUTHGUOENGHXUCXYFMWJXTHNIAADRAECEALWGHSTYJGMTHAEAEJGRDYDGCBDNGOEORMNOSTHDNGEAXAJOEAEPNGYTEAUPYEAGG`; no defensible plaintext island. Since all ordinary candidate keys define invertible senders, replay by itself cannot certify a solution. F-hold and P-driven destination extensions were not attempted here. Preserve the distinction between this stochastic result and the exact finite aligned-donor exclusion in `lp2-secret-home-rank-absorption.md` and the known-plaintext private chart recovery in `lp2-private-rank-map-recovery.md`.

## Reproduction

Run from repository root `node sims/lp2_private_cipher_rank_blind_sft.cjs plant`, `plant2`, or `original`. Exact core executed in connected V8 with repository source files; standalone Node wrapper not independently launched. Raw results: `lp2-private-cipher-rank-blind-plant1.json` (30073a44), `lp2-private-cipher-rank-blind-plant2.json` (e5116ab0), `lp2-private-cipher-rank-blind-original.json` (f391c8f3). No CI. Retire this unsourced receiver absent independent clue or known plaintext; use the sorted-likelihood reduction when warranted by a future rank-based law.
