# P49–51 row-rank rune transposition outside authentic prime-minus-one encryption

**Agent 3, 24 November 2026.** No unknown LP2 plaintext or authentic key. This is a finite exact original-input obstruction to a particular layered receiver.

## Candidate operation and its weakest premise

The 32×8 source panel has distinct values within each of its 32 physical rows. Sort each row's values in ascending order; the resulting eight-column read order is identical under conventional radix60 and drop-f radix59. The first row yields [4,6,2,7,3,0,1,5]. Physical image 68.jpg directly shows ciphertext beginning immediately beneath the table. This supplies a natural starting position and a repeating 32-row permutation, but no authored instruction identifies ranks as rune permutations.

Prior [whole-word row-rank tests](lp2-grid8-allword-permutation-grammar-original-gate.md) reject the fixed table order as a word-order restorer. Here the unit is the **rune**, with an explicit inner historical cipher: apply the actual p56 prime-minus-one encryption with transparent plaintext F, then permute consecutive eight-rune blocks using the successive table rows, cycling after 32 rows. Test both sorting direction conventions. This is not the p15 fixed 16-slot spiral or the whole-word rank gate.

Input: first 512 GP29 runes after the table, physical p51–53 (two complete 256-rune cycles; the remaining 22 runes in p53 are untouched). No unknown boundary selection, phase adjustment, rune substitution, or offset expansion. For each direction, exactly invert the outer permutation and grant every prime origin 0–3301 inclusive, using zero-based prime ordinal. The decoder tracks h, the number of previous literal plaintext-F holds. At position i, key index = origin+i−h; C=0 can be a held F or a consuming non-F, whereas C≠0 must be a consuming non-F. An inverse path that would consume plaintext F is illegal. No language or beam restriction in reachability.

## Original and control outcome

| Inverse | Origins legal for first 256 | Origins legal for all 512 | Longest legal prefix |
|---|---:|---:|---:|
| baseline | 106 | 2 | 512 |
| rank | 104 | 0 | 421 |
| inverse-rank | 101 | 0 | 408 |

Both rank orientations have **zero legal complete paths across all 6,604 origin/direction pairs**, regardless of language. The unpermuted diagnostic retains two full-length legal origins (692/693), with nonprose bigram-MAP previews; the origin selected on its first 256 alone (1035) has no complete continuation. The rank and inverse-rank directions select 2504 and 546 on their prefixes, respectively, neither legal on the continuation. The complete finite reachability rejection is stronger than these selected-origin diagnostics.

Positive controls: actual p56 ciphertext re-enciphers exactly 85/85 from the archived native plaintext. Independent hidden origins 133 and 1033 on the first 512 runes of two different solved LP1 sections (KOAN1 and LOSS OF DIVINITY) are selected from the first 256 using a bigram model trained on the other native sections (0.5 count smoothing). Each original-table permutation is planted and undone. The selected origin is held fixed but the latent F path is optimized jointly on the complete plant; thus the 512/512 withheld runes recovered across both plants are an origin-holdout result, not a frozen-prefix-path claim. Both full plaintexts re-encode exactly.

## Outer-layer decision

Retire this particular outer row-rank/inner prime-minus-one route over the specified 512-rune alignment and origins. No expansion of starting phase or origin is warranted without an independent source clue. The reverse layer order is assessed separately below. Arbitrary per-row keys, other shift laws, and source-fixed rank uses other than rune transposition remain outside the tested scope.

Reproduce: [CommonJS SFT](../sims/lp2_p50_rank8_prime_fhold_original_sft.cjs) and [complete output](lp2-p50-rank8-prime-fhold-original-output.json). The exact experiment function was executed on live source JSON in the connector V8 runtime; the Node filesystem wrapper was assembled and has not independently run. Input blob SHAs: resources/liber-primus/lp2-corpus.json 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; resources/liber-primus/lp2-grid-256.json 2550eae357442912220e05dc51147523a61dd75a; resources/external/relikd-solved-gp29-native-v1.json 1b064ef6d85819b7d96adaff31a82d1ec551598f.

## Reverse layer order: exhaustive full-path enumeration and frozen-prefix prediction

Apply the table permutation to plaintext **before** authentic prime-minus-one F-hold encryption. Inversion first removes the prime shifts, then reverses the table order on each eight-rune block. This retains exactly the unpermuted inner reachability family but changes which recovered rune adjacencies should be evaluated as natural language. All original 512 runes, table alignment, 3,302 prime origins and the donor-excluded bigram model remain fixed.

For each prefix-legal origin, enumerate *every* latent F path without any pruning, undo the inner transposition, and rank in restored plaintext order. Freeze the best complete 256-rune prefix and its terminal prime clock before examining the suffix. Separately enumerate every full-length legal path and maximize the same native bigram objective retrospectively. That latter maximum is a finite-objective bound, not a universal language impossibility.

| Reverse-layer inverse | Legal origins on prefix | Complete prefix paths | Frozen origin | Frozen terminal clock | Legal suffix paths | Full-length origins / paths | Retrospective best nats/rune |
|---|---:|---:|---:|---:|---:|---|---:|
| rank | 106 | 888 | 1034 | 1287 | 0 | 692, 693 / 112 | -3.772936 |
| inverse-rank | 106 | 888 | 1647 | 1899 | 0 | 692, 693 / 112 | -3.762167 |

The two full-length origins and their 112 shared inner F paths are the **same** for both orientations, not independent samples. All 224 direction/path combinations were evaluated. The best retrospective candidates begin `JLOBBMUNDWAIABHETPPMEOSIWTHDAEOXSTHWBROIPJDOBMJHEAEAEAIJOYAEOEXIHUANOFIAONGEMGGYEANGI` and `NLOJMBUBTBADIAWHEWEOITHSMPPWXSEOABTHDPIRJBOODJJEAEAHEAIMOEUOYXIHAEANNGFOIAOENGGYGEAWI`; neither is coherent plaintext. Both frozen prefix winners have zero continuation. All full-MAP winners replay the original ciphertext exactly.

The two native reverse-order plants choose the actual hidden origins 133/1033 from the first 256, recover 256/256 and 254/256 fitting runes, and recover **256/256 each withheld** while retaining the complete frozen prefix and clock. Held-out scores -2.578202 and -2.765688 nats/rune. This has a stricter freeze than the initial outer-order test. Complete recovered plant paths re-encode exactly; the two fitting-rune errors in the second plant mean the plaintext path is not uniquely identified by that prefix.

**Combined decision:** outer rank transposition is exactly infeasible for both orientations and all tested origins; reverse order is mathematically feasible at only two origins, but all paths have incoherent best-scoring inverses and the independently ranked prefixes have no legal suffix. Retire these four finite candidate receivers. No unknown LP2 plaintext, authentic key, or additional source-selected operation was recovered.

[Reverse-order SFT](../sims/lp2_p50_rank8_prime_reverse_layer_sft.cjs) · [exact output including original best-path indices](lp2-p50-rank8-prime-reverse-layer-output.json). Executed the function directly in V8; the CommonJS file wrapper was assembled without a separate Node execution.
