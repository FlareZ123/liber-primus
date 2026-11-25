# Source-ranked glibc 2.15 TYPE_3 key stream on LP2 original ciphertext

**Agent50, 25 November 2026. Classification: bounded original-input negative. No unknown plaintext or key recovered.** The frozen source-ranked timestamp/low32/glibc-2.15 TYPE_3/GP29/keyskip1 conjunction does not distinguish the original 12,956-rune ciphertext from wrong-seed controls.

## Causal hypothesis and fixed scope

The pinned Cicada PGP timestamp inventory supplies 433 candidate integers. A historically plausible Linux C library offers a concrete way to turn a 32-bit seed into a continuous pseudorandom stream: glibc's TYPE_3 \`random()\` generator. If one of those timestamp words seeded the generator and its outputs were reduced to GP29, a source-selected additive key could decrypt LP2 without unconstrained key search.

The test fixes exactly one model:

- Original input: all pages 0–55, 12,956 GP29 indices, 86 adjacent equal-rune pairs; no page resets.
- Candidate seeds: the 433 distinct low-32-bit words from the pinned Round18 L8 PGP timestamp inventory. \`srandom()\` takes an unsigned 32-bit seed; no timestamp offsets or alternative word encodings.
- Generator: glibc 2.15 \`random_r.c\`, TYPE_3, degree 31, separation 3, signed Park–Miller seed initialization and 310 warm-up draws. The exact source file is pinned at [glibc-2.15 \`random_r.c\`](https://github.com/bminor/glibc/blob/glibc-2.15/stdlib/random_r.c), blob \`51a2e8c812aee78783bd6d38c1b6269d41c8e47e\`.
- Symbol reduction: reject raw outputs \`>= floor(2^31/29)*29\`, then reduce modulo 29. This is one frozen unbiased reducer.
- Cipher: continuous offset zero, positive additive GP29, at most one collision-triggered rejected key draw per emitted rune.
- Decoder: fixed GP29 trigram model trained on the pinned Gibran and Emerson controls, beam width 64; score the first 12,444 runes and freeze the winning state before the final 512-rune continuation.
- Null: 500 deterministic, distinct 32-bit wrong seeds, disjoint from the 433 candidates.

No seed, offset, sign, reducer, page reset, beam width, skip cap, or language model was tuned against the original.

## Generator and positive-control validation

The JavaScript TYPE_3 implementation is checked against six known glibc output vectors (96 draws total), including seeds 0, 1, \`0x3301\`, \`0x12345678\`, \`0x80000000\`, and \`0xffffffff\`. The vectors match Debian glibc 2.41; the glibc 2.15 source was inspected independently and specifies the same TYPE_3 degree/separation, initialization and warm-up.

The same fixed inverse was tested on source-native solved GP controls and an independent long literary plant:

| Positive control | Exact recovery | Frozen continuation |
|---|---:|---:|
| Solved p57 native GP, eight hidden glibc keys | 8/8 plants, each 95/95 runes | 20/20 on every plant |
| Solved p56 native GP, eight hidden glibc keys | 3/8 plants, each 85 runes | 20/20 on all eight, despite some prefix errors |
| Shakespeare long plant | 12,953/12,956 | 512/512 |
| Repeated p56||p57 long plant | 11,731/12,956 | 409/512 |

The repeated native long plant is synthetic and repetitive; it is reported as a stress control, not as independent natural prose. The p57 native plants provide the required source-native positive recovery. The full Shakespeare plant shows the decoder can preserve a long independent continuation.

## Original-cipher result

| Metric | 433 source-ranked candidates | 500 wrong-seed controls |
|---|---:|---:|
| Prefix mean | −5.808631 | −5.809293 |
| Prefix SD | 0.012808 | 0.013347 |
| Prefix maximum | **−5.771092** | **−5.764741** |
| Holdout mean | −5.889199 | −5.886501 |
| Full-score maximum | −5.771767 | −5.771189 |

The approximate one-sided Gaussian Bonferroni threshold for 433 prefix tests, using the fixed conservative multiplier 3.69, is **−5.760041**. No source-ranked candidate exceeds that threshold or the empirical maximum of the 500 wrong-seed controls (0/433 for both comparisons).

The prefix-selected candidate is rank 427, seed \`1326067201\`: prefix −5.771092, full score −5.778028, 223 inferred skips, and withheld score **−5.946582**. Its continuation is worse than the wrong-seed holdout mean. The best holdout score if selected retrospectively is −5.520130 (rank 275, seed \`1438060320\`), but that candidate's prefix is only −5.806956; choosing it by its withheld score is post-selection and not a prediction. The best full-score candidate (rank 220, seed \`1358020800\`, −5.771767) also falls below the wrong-seed full-score maximum.

Thus the candidate and null populations are indistinguishable under the frozen language model, and the best source-ranked prefix is slightly worse than the best wrong seed. No coherent original plaintext, authenticated key, or independent continuation was recovered.

The often-cited L2 skip count is **not** used as an independent filter. It is inferred from the language-scoring beam's winning path, so using it as a second key-only confirmation would double-count the same linguistic evidence. Skip counts in the raw score file are descriptive only.

## Decision and scope

Retire this exact conjunction: the 433 Round18 timestamp words reduced to low32, glibc 2.15 TYPE_3, unbiased raw-output reduction modulo 29, continuous offset-zero positive additive key, and capped-one-skip inverse. This does **not** exclude glibc used to initialize a state from original p50 material, other glibc state sizes/types, other source-derived seed material, a different cipher consumer, other offsets/signs/reducers, or uncapped rejection. In particular, the seed-free p50 low-byte recurrence question is a distinct model and is not settled by this rune-key test.

## Reproduction and retained evidence

- [Exact glibc TYPE_3 implementation and vectors](../sims/lp2_glibc215_pgp_keyskip1_sft.cjs).
- [Full original-input gate: native controls, 433 candidates, 500 nulls and frozen holdout](../sims/lp2_glibc215_pgp_keyskip1_full_gate_sft.cjs).
- [All 433 candidate and 500 null score rows, controls and summary](lp2-glibc215-pgp-keyskip1-original-scores.json).
- Candidate inventory snapshot: \`im-results/agent50-2667-pgp-seeds.json\`, Git blob \`55d8323e473e454cdedaa61fd70f08fc18d23396\`.
- Original corpus: \`resources/liber-primus/lp2-corpus.json\`, Git blob \`054f2a0f780b7d46901acbe3d9bf4f0ac1801165\`.
- Windows Node.js 22 manual runner, full score output: [run 45538706404](https://github.com/FlareZ123/liber-primus/actions/runs/45538706404). The earlier control-only run is [45537644779](https://github.com/FlareZ123/liber-primus/actions/runs/45537644779).

From repository root, reproduce with Node.js 22:

\`\`\`sh
node sims/lp2_glibc215_pgp_keyskip1_full_gate_sft.cjs
\`\`\`

The script reads only the pinned repository corpus, seed inventory and control texts. The full score JSON preserves the per-candidate and per-null values needed to rerank or independently audit the fixed experiment.
