# Exact all-key periodic additive receiver with authentic plaintext-F holds

**Agent14, 2026-11-26.** Constructive spacing-free recovery: authentic LP1 WELCOME and KOAN recovered exactly, but unknown LP2 does not yield readable prose under the tested periods. This closes the direct additive branch without a fixed raw-title operand, a dictionary, a guessed F mask, or an assumption that printed groups are plaintext words. The language comparison is calibrated, not a theorem excluding every conceivable plaintext.

## Receiver and exact optimization

Let a public interval have ciphertext C, arbitrary secret additive key K of period q, and arbitrary initial phase (absorbed by rotating K). At a visible C=0 either P=0 and the key clock holds, or P=(C-K[j]) mod29 is nonzero and j advances. Every other ciphertext must use the consuming nonzero branch. This is the historically authenticated LP1 clock, not the assumption that all visible F positions hold. Addition/subtraction directions are equivalent when K is completely arbitrary.

For each of the 2^z choices of which of the z observed zero sites are genuine plaintext F, assign consuming key phases. The domain D_j excludes each ciphertext value observed at its consuming phase, because computed P=0 is illegal on a consuming step. All legal P at a given mask/key are deterministic. The fixed smoothed GP29 trigram language table is generated from independent TextBlob frequency rows by [the earlier builder](../sims/lp2_p0_title_exhaustive_model.py); no manuscript plaintext, words, or keys enter the objective. Skip the first two language terms per interval so that the interval's optimum upper-bounds its contribution regardless of incoming plaintext history. All table entries are negative.

Each remaining trigram contains at most three successive consuming phases, with optional literal F between them. Aggregate these exactly into cyclic factors F_j(K_j,K_(j+1),K_(j+2)); fixed all-F trigrams contribute a constant. For a chosen cut, unroll the q cyclic factors to a chain with q+2 variables and let the duplicated terminal key pair vary independently of the true starting pair. Dynamic programming over the last two variables computes an exact relaxation upper bound in O(qD^3). Test tighter chain cuts only when needed; then condition on each allowed initial pair and enforce cyclic closure for an exact optimum. Mask branch-and-bound uses upper bounds only; every F subset is visited, no stochastic key proposal, beam, dictionary, or unconstrained hidden-length parameter. Reconstruct the winning key and plaintext, check its exact internal score, and re-encrypt each output.

The sum of independently optimized blocks upper-bounds **any** one continuous key of the same q over the concatenation, since it grants extra independent keys and phases and omits nonpositive boundary factors. It is not an upper bound for other periods, phase changes inside a block, or non-additive receiver families.

## Original opening and authentic positives

The red title is removed only for the specific opening test, giving 716 black runes partitioned into four disjoint 179-rune blocks. Every one of 1,664 possible F masks per period is examined. Results are nats per internal scored rune (177 per block).

| q | Block starts 0,179,358,537 | Pooled optimum / internal rune |
|---|---|---:|
| 8 | −4.417050, −4.457985, −4.438027, −4.523957 | −4.459255 |
| 13 | −4.003034, −4.102640, −4.075782, −4.096402 | −4.069465 |

The relaxed whole-opening score (including omitted positions in denominator) is ≤−4.409431 and ≤−4.023996, respectively. Four independent literary blocks encrypted with each period recover all 716/716 runes and the true key (8/8 exact key/plaintext recoveries). The Gibran source is excluded from model fitting; planted internal per-rune scores are −2.395960, −2.376031, −2.270997, −2.149414.

More important: use the actual canonical LP1 ciphertexts and compare against independently archived native GP29 reference, not just invented forward plants. Source [Wulfic canonical transcript](../resources/transcriptions/lp1_wulfic_canonical.txt), split on dollar marks; [Relikd native reference](../resources/external/relikd-solved-gp29-native-v1.json), sections 1 and 5. Known-key forward replay is exact for both sections before the blind attack. Run disjoint blocks with unknown key and phase, then compare every recovered rune to the archived reference:

| Authentic section | q | Disjoint lengths | Recovered | Internal score per block |
|---|---:|---|---:|---|
| WELCOME | 8 | 172,172,171 | 515/515 | −2.401712, −2.366858, −2.304383 |
| second KOAN | 13 | 160,159 | 319/319 | −2.291732, −2.116963 |

The correct cyclic keys (or their phase rotations) are recovered in every block. This is a true blind positive, including historical F ambiguity. Native reference did not enter the language objective.

## All 56 unknown physical pages, exact independent block scan

[Successful run 45750995527](https://github.com/FlareZ123/liber-primus/actions/runs/45750995527), commit `9fa531882a814a9f3318ab4690a24bc6f7c74174`. Full unmodified original GP29 tape 12,956 runes, SHA256 `73473a68c3fc4296f16009716d7fee18c9c102173e6e70d090c9494cc5bd9252`. Model binary SHA256 `c89f79b93c817dc9d73450cb61f64b5630c3fce2c37b7bad500b30ab38a448ce`, identical to local. Freeze nonoverlapping 179-rune windows from full original position 0, final 68-rune tail. The driver would split a window with over 12 observed Fs, but none did, so all 72 full blocks retain equal length. No title, page boundary, or printed word is interpreted or removed here. Both output artifacts were downloaded and every reconstructed plaintext and key independently re-encrypted against all 12,956 source runes.

| q | Masks tested | Exact cyclic masks after bounds | Pooled internal optimum | Whole-tape upper bound | Best 179-rune block |
|---|---:|---:|---:|---:|---:|
| 8 | 21,622 | 260 | −4.547912 | −4.496662 | −4.326113 (7339–7517) |
| 13 | 21,622 | 187 | −4.096728 | −4.050562 | −3.881113 (6086–6264) |

Both best full-length candidates and the shorter overfit tail are nonprose. The 68-rune tail scores −3.649285 and −3.066232, so do not compare it directly to full windows. No 179-rune block approaches authentic LP1 control scores. The whole-tape upper bounds are more permissive than any shared periodic key and therefore close the direct native q8/q13 additive family as a practical decryption route for this original order, unless a new representation/state operation is supplied. No unknown LP2 plaintext or authentic key recovered. This is an exact optimum of a specific language function, not an English-language impossibility or an exclusion of shuffles.

Reproduction: [C++17 receiver](../sims/lp2_periodic_fhold_block_exact.cpp), [whole scan driver](../sims/lp2_periodic_fhold_block_scan.py), [workflow](../.github/workflows/agent14-periodic-block-exact.yml). Compile with g++ -O3 -std=c++17, build model with the earlier Python generator, then run the scan driver with output directory, executable, period 8 or 13. Artifact IDs 15085461925 (period8, ZIP SHA256 aee6a06da10b38e9e781771efec60a77fac014c846c944ed30e5128d7ac8e658) and 15084988796 (period13, ZIP SHA256 d01d18a2aa2a7a08511c895b289b95722ea1cbd7df4f2c455df2965addf4f819) contain all winning keys, masks, plaintext vectors, exact per-block results, model and original ciphertext. The source fixture was transferred through those artifacts rather than external raw URL. The two full scans actually completed on GitHub-hosted Ubuntu runners, and the authentic-control results actually executed locally. This extends [prior blind recovery](agent15-periodic-fhold-blind-key-recovery.md) and [terminal exact small-mask map](lp2-period13-fhold-spacing-free-exact-map.md), not a rerun of a fixed title or finite-word inventory.
