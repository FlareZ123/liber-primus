# Signed base60 24-node path as ranked transposition plus prime cipher (Agent49)

The original signed EPIPHANY SEEKS THE DEVOTED clause and the independently reconstructed modulus23 select the base60 path from71 to physical p32, with 24 visited nodes and 121 original GP29 runes. Earlier literal cyclic path pads fail. This tests a **distinct ranked permutation consumer** of the fixed 24 path values: use ascending/descending path-value ranks as column order in a classical ragged width24 columnar transpose, or as a within-row rank permutation. Both are invertible on the complete 121-rune tape, including the single short last row. The source selects the path, not this operator.

Cross these four fixed permutations with authentic consecutive-prime-minus-one cipher, both signs and both encryption layer orders. Enumerate every prime origin0..3301 and every legal latent plaintext-F hold path; 52832 receiver/clock combinations. Fit the first80 decoded runes using a fourth-order backoff model trained on Shakespeare plus disjoint Gibran/Emerson tails; freeze the selected complete path, inspect withheld41. Three target-excluded native plants require exact hidden key and plaintext recovery before original scoring.

- Plant 1: 51271 legal paths, true rank 3, 107/121 recovered, replay true.
- Plant 2: 27389 legal paths, true rank 1, 121/121 recovered, replay true.
- Plant 3: 13904 legal paths, true rank 1, 121/121 recovered, replay true.

Gate FAILED. Original unscored because the calibration gate failed.

Reproduce `node sims/lp2_p32_signedpath24_rank_prime_sft.cjs`. [Raw results](lp2-p32-signedpath24-rank-prime.json). Connected JS execution, no CI claim. This is a finite source-path receiver decision, not rejection of the signed navigation clue itself or all transpositions.

## Prefix-parameter freeze with exact ambiguous-suffix enumeration

The first calibration failed because the prefix winner and the true path have identical prefix output, order, layer, origin and sign, but differ on held-out Fehu choices. This is a genuine nonidentifiability of the first protocol rather than an incorrect recovered key. Before any original inspection, fix the following alternative: retain all complete paths having the selected parameters and the exact selected first80 runes, then choose the maximum continuation language score among those paths. This uses the last41 symbols for **suffix inference**, so the selected suffix score is not an independent held-out prediction. It cannot authenticate plaintext by itself.

- Plant 1: 3 same-prefix variants; 121/121 exact plaintext recovery; chosen order/layer/origin/sign column_asc/prime_then_transpose/23/1.
- Plant 2: 1 same-prefix variants; 121/121 exact plaintext recovery; chosen order/layer/origin/sign row_desc/transpose_then_prime/3301/-1.
- Plant 3: 1 same-prefix variants; 121/121 exact plaintext recovery; chosen order/layer/origin/sign column_desc/transpose_then_prime/121/1.

Gate passed. Original 12888 legal complete paths; prefix winner row_desc/transpose_then_prime, origin518, sign1; 2 exact same-prefix alternatives. Best inferred continuation -7.0542 after prefix -5.4503. Output `IAPWGOELEOUBXECSTWIPMCITLPRIAHEREARTELXOFIATNUUILISOIAJEADEAEAELYTHTEAULCEANEACYALWLWYYTHNEWUREOYIASEGPJYSOERTOEEOTXOEAYTFAAMNGYNEOTHRDUETCWOEHB`; full replay true. No authenticated plaintext.

[Conditional SFT](../sims/lp2_p32_signedpath24_rank_prime_conditional_sft.cjs) · [raw output](lp2-p32-signedpath24-rank-prime-conditional.json). Actual connected JS execution.
