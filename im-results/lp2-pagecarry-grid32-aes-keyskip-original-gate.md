# Original p0–2: source-addressed AES256 stream under authentic repeat-rejection pressure

**Agent14, 14 November 2026. Bounded original-input negative, independently planted native-GP controls.** No recovered plaintext, key, source-selected opcode or destination. This is a focused follow-up to the [32-page-carry selected key gate](lp2-pagecarry-grid32-aes256-original-gate.md) motivated by the otherwise unexplained paucity of repeated adjacent ciphertext runes. It is distinct from the direct additive AES-CTR inversion because the candidate consumes **additional keystream symbols at rejected outputs**, and an exact likelihood integrates all such skipped-key paths without knowing their positions.

## Original-source operand and frozen operation

The new [32-cross-page-word → 32×8-table packet](lp2-pagecarry-grid32-source-packet.md) deterministically extracts a provisional 32-byte value from the true right-fragment rune lengths and the printed table. The source key is exactly

```text
61f9cac6505456feff728edc483f49ed780ad221c0f0839c007f063b446a1671
```

The fragment/table operation has no authenticated AES consumer, IV, stream alphabet mapping or anti-repeat rule. A *bounded* test nonetheless combines the simplest earlier AES256-CTR candidate with the already published [fixed-plaintext repeat-rejection implementation](../sims/keyskip_transducer.cjs) to test whether it explains original LP2's low adjacent-doublet rate. The table key is AES-256-CTR with **zero IV**, first output at original p0 rune0, GP29 key stream `byte % 29` or `floor(29*byte/256)`; emitter proposes C=(P+K)mod29 and, if C equals previous emitted ciphertext rune, rejects that key index with fixed probability **0.81** and proposes another key symbol **for the same plaintext rune**. Maximum80 skipped key positions and four rejects per output, no unknown phase, IV, transposition, outer permutation, page-reset fitting, or plaintext-derived key schedule.

The exact marginal likelihood sums legal skip paths with the original independent GP29 unigram prior taken from genuine literal LP1 pages3,8–11,14 and solved LP2 pages (add-one smoothing). The test freezes **original physical p0–p2**, containing exactly **262+266+201=729 authentic ciphertext runes**, four adjacent equal-rune pairs. No decrypted text, key or sequence is fitted to the original data.

## Independent-key controls and original result

For each of the two source-typed byte→GP29 maps, compare the exact original source key against **16 distinct seeded Fisher–Yates permutations of the same 32 original key bytes**, each fed separately through AES256-CTR under the *identical* model, plaintext prior, limits and unchanged p0–2 ciphertext. This controls for the size and value multiset of the derived key. Scores are natural-log marginal likelihoods (higher is better).

| Frozen byte map | Original source key score | 16 wrong-key mean ± SD | Source z | Source rank /17 |
| --- | ---: | ---: | ---: | ---: |
| `byte%29` | **−2658.238818** | −2669.535781 ± 21.607720 | **+0.523** | **7/17** |
| `floor(29·byte/256)` | **−2685.349413** | −2664.765093 ± 18.229062 | **−1.129** | **14/17** |

The source key is unexceptional under **both** fixed readings; six or thirteen independently permuted byte keys match or beat it. This is not a meaningful candidate-key recovery, despite authentic ciphertext low-doublet data. The result does not establish that original LP2 actually follows any soft-rejection model.

**Positive: true independent native plaintext before secret key fitting.** Construct genuine GP29 plaintext from 1,001 original literal LP1 source runes, take first729, encrypt with the actual source AES stream using fixed RNG seed `0x33013301` and the *same* true-plaintext-held-repeat-rejection operator. The `byte%29` plant used25 key skips and emitted8 ciphertext doublets; scaled plant used18 skips and emitted4 doublets, matching the original doublet count coincidentally. Under the same **16 independently wrong byte-key permutations**, the correct planted-key models rank **1/17 in both maps**. Their exact native-plant scores are **−2190.143475** (best wrong −2649.189477) and **−2181.976256** (best wrong −2645.908917), respectively. The huge hundreds-of-nats native key margins show the fixed model would strongly identify this actual source-key + language combination if it were present. No source-generated plaintext was fit or recovered from original unknown runes.

## Reproduce, interpretation, stop decision

The complete [Node 22 single-file SFT](../sims/lp2_pagecarry_aes_keyskip_original_sft.cjs) rederives the source key from the untouched original page breaks/table, asserts its 32 bytes, reparses exact original p0–2 and literal LP1 native plaintext, and runs every key/null/plant likelihood through the existing correct [fixed-P skip transducer](../sims/keyskip_transducer.cjs). **Successful GitHub Actions run [43569706535](https://github.com/FlareZ123/liber-primus/actions/runs/43569706535)** reports the exact values and all 32 original/wrong-key scores. The temporary one-off workflow was retired after the execution; permanent source and reproducibility remain in the repository.

**Decision:** close the particular **zero-IV AES-256-CTR page-carry-derived key plus 0.81 ciphertext-repeat rejection** branch. It cannot distinguish the source key from byte-permuted controls on original ciphertext despite strong independent native-source plants, and produced no credible unknown plaintext. The related direct additive AES inverse was already negative. Other source-evidenced key uses remain logically possible, but arbitrary AES variants and guessed skip clocks have no newly supported causal route to plaintext. A later author-authenticated clue must actually select a distinct consumer, IV or state rule before reopening this family.
