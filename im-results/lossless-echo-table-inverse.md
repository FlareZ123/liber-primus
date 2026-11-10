# A lossless GP29 tableau can reproduce the selected LP2 echo profile without overwriting ciphertext

**Classification: new constructive architecture, expressly post-selected; bounded negative original-grid key inversion. No unknown LP2 plaintext, authentic key, full mechanism, or destination recovered.** Agent 17, 10 November 2026. [Node.js 22 reproducer](../sims/lossless_echo_table_inverse.cjs); [successful Windows CI run 42798902323](https://github.com/FlareZ123/liber-primus/actions/runs/42798902323).

## Original input and motivation

The canonical 55 rune-bearing LP2 pages contain 12,956 GP-indexed ciphertext runes and 2,896 complete printed words, including 32 that cross physical pages. The original page-50 grid contains 256 printed bytes in a 32-by-8 array. The previously identified word-local T6 map is \`T(x)=(24-2x) mod29\`; the GP field has primitive root 15. All these are fixed input contracts, not decipherments. See [authoritative corpus](../resources/liber-primus/lp2-corpus.json), [true word parser](../sims/lp2_word_pages.cjs), and [existing echo evidence](lag6-conditioned-echo.md).

The existing stochastic echo-repair example replaces plaintext-dependent ciphertext runes, so its direct formulation is information-losing. This experiment asks the more actionable question: **can a deterministic, genuinely invertible, source-language-aware GP29 transducer reproduce all the unusual lag-five/six and doublet features simultaneously?** Its mapped GP plaintext symbols were chosen after observing those statistics. Good synthetic fit therefore demonstrates *architectural possibility*, not attribution to Cicada.

## Exact reversible 29-to-29 mechanism

At every position, construct an ordinary **complete bijection** between all 29 GP plaintext values and the 29 possible next published rune values. It depends only on earlier printed ciphertext, the position within the printed word, and one key byte. The visible rules reserve output channels in this priority order:

1. GP **EA** (28) emits the previously printed rune, giving the only normally permitted adjacent duplicate.
2. From word position 6, GP **T** (16) emits \`(24-2*C[i-6]) mod29\`.
3. From word position 5, GP **U** (1) emits \`C[i-5]\`. For an antecedent \`C[i-5]=S(15)\`, or when the preceding published rune already satisfied the five-back equality, GP **E** (18) is assigned that output instead. This deliberately permits correlated five-back pairs and the S-conditioned echo.

If two reserved outputs collide, the later reservation takes the first unoccupied output in the primitive-root-15 differential order \`previous+15^0, ..., previous+15^27 (mod29)\`. The remaining 26–28 plaintext GP letters, in numerical order, map bijectively to the remaining output values in the same differential order, cyclically rotated by \`keyByte mod remainingCount\`. No latent correction flags are needed. Each step has one permutation of all 29 outputs, which is explicitly computed and inverted from previously published ciphertext alone. All 12,956 generated symbols recover exactly under the correct key; original ciphertext also re-encodes exactly for any candidate key, which by itself gives **zero key authenticity evidence**.

The root 15, T6 map and grid are original-source motivated. The choice of transparent GP plaintext **EA/T/U/E**, and the conditional five-back channel, is **deliberately tuned to the already-observed anomalies**. No such mapping has been found independently in source material.

## Joint source-native-format generator comparison

Use GP-encoded Shakespeare held-out prose from the last 110,000 characters of the committed 300k-character text control. Take 256 seeded contiguous 12,956-rune samples, **independent of the printed LP2 word breaks**, preserve those printed breaks in the ciphertext, and supply an independent random byte at each emission. These plants use precisely the same original word lengths and history resets as the proposed inverse. The pseudo-random seed is \`0x17952601\`, and all calculations were executed in the linked CI.

| Feature, measured on source layout | Original LP2 | Synthetic mean | 5th–95th percentile among 256 plants |
| --- | ---: | ---: | ---: |
| Adjacent equal runes | **86** | 103.33 | 93–118 |
| Equal rune at first position of a printed word | **23** | 22.82 | 16–31 |
| Equal rune at final position of a printed word | **19** | 23.28 | 16–29 |
| Exact affine six-back echoes | **80** | 70.84 | 56–86 |
| All five-back equalities | **104** | 102.88 | 81–126 |
| Five-back S-to-S copies | **11** | 7.91 | 4–13 |
| Adjacent pairs of five-back copies | **9** | 9.20 | 5–14 |
| Five-back S antecedents | **74** | 72.91 | 58–86 |
| Nonadjacent equal-rune pairs in complete printed words of lengths 4–9 | **526** | 531.13 | 494–572 |

The **doublet count fails the stated 5th–95th synthetic interval**; the other eight selected/descriptive features fall inside it. In particular, its word-first/last duplicate positions become compatible once the plaintext boundaries are independent of printed ciphertext boundaries, in accord with the native-source-register caution in [the current synthesis](../results/README.md). These nine tests are strongly dependent and the cipher was designed with several of them in mind; do not multiply marginal p-values, assert an independent discovery probability, or imply the model explains unseen manuscript structure.

## Genuine original-input inversion with the exact 256-byte grid

A key schedule must succeed on **original source runes**, as the synthetic generator is permissive. The script treats the real 256-byte grid as follows: four 256-byte row/column forward/reverse traversals, plus each section's own 32-byte grid column; book/section/page rune clocks; direct byte modulo the currently available 26–28 slots or proportional byte scaling; and all phases (256 or 32). This is **6,336** fully declared deterministic source-grid options. For each one, derive the original GP candidate plaintext through the exact inverse, fit a Shakespeare GP-unigram likelihood on original sections 0–3 (5,506 runes), then report the untouched sections 4–7 (7,450 runes). The score is the mean \`log(29*q[decodedSymbol])\`, with \`q\` trained on the first 190,000 committed Shakespeare characters, and 0.5 pseudocounts.

The best training original-grid setting is **reverse-column, page reset, byte modulo slots, phase 201**; it scores **−0.763054** on training and **−0.885343** on untouched original sections. It does not decode readable GP-English or identify a real key. The exact source-matched positive plant uses the real section-column keys, section reset, byte modulo, phase 7 and 12,956 GP runes from held-out source prose. The blind scan **recovers its actual key schedule at rank one**, scoring **+0.400349** training and **+0.411084** heldout. The plant fully decrypts and re-encrypts all **12,956/12,956** source symbols; the next-best alternative setting scores −0.400313 on training.

The original failure is specific to this tableau, this source grid, these 6,336 serializations and this plaintext-language prior. Other state schedules, word segmentations, real keys and binary intermediate registers remain open.

## Decision

This is an explicit **lossless counterexample** to the assumption that lag-six/five echoes and severely reduced doublets require unrecoverable overwritten ciphertext. The original printed ciphertext admits a deterministic inverse and exact re-encryption under the model, but its hidden text is not readable with the tested original grid schedules. Preserve the implementation as an alternative to lossy surrogate generators and a reusable candidate for independently recovered key bytes. **Do not promote to established LP2 cipher**, and avoid expanding another unanchored key sweep simply to optimize the synthetic feature match.

**Reproduce:** \`node sims/lossless_echo_table_inverse.cjs\`. Existing manual workflow \`word-lag5-affine-keyfree.yml\`, dispatch input \`experiment=lossless-echo\`. The program asserts all nine original source feature counts and all source/page/word lengths, tests exact positive roundtrip, and ranks every literal-grid key variant on original heldout source.