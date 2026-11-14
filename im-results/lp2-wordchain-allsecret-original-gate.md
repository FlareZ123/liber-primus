# Word-local predecessor-chain all-secret original-input gate

**Status (14 November 2026): conditional negative, no unknown plaintext.** The original LP2 near-absence of adjacent equal runes suggests examining a ciphertext-predecessor transport. This experiment grants a separate, unrestricted secret key to **each printed word** and checks whether the authentic, source-native English words could be encoded by that family. The observed signal alone does not authenticate this cipher.

## Exact original input and models

The immutable [LP2 transcription](../resources/lp2-transcription.txt) and [GP-index corpus](../resources/liber-primus/lp2-corpus.json) supply 2,896 printed words and 12,956 unsolved runes. The decision subset comprises **109 original printed words of length 10–14 runes**, with length distribution 52, 32, 18, 4, 3. No original symbol or printed break is changed.

For a ciphertext word `C[0..n-1]`, consider three *different* reversible predecessor-chain definitions over GF(29):

1. **Unrestricted IV:** `D[i] = C[i]-C[i-1] (mod29)`, `1 <= i < n`. `C[0]` is a freely supplied initial state, so only plaintext suffix `P[1..n-1]` is constrained.
2. **Zero-predecessor start:** `D[0]=C[0]`; `D[i]=C[i]-C[i-1] (mod29)` for `i>=1`. The whole plaintext word is constrained.
3. **Circular predecessor:** `D[i]=C[i]-C[(i+n-1)%n] (mod29)`. The whole word is constrained, and `sum(D) mod29=0` follows automatically.

For each individual word, the affine hypothesis allows every `D[i]=a*P[i]+b (mod29)` with any `a in {1..28}` and `b in {0..28}`, both reset and independently secret for that word. We also grant **every independent 29-rune permutation** `D[i]=pi(P[i])` per word, replacing the affine restriction. This latter test is an equality-pattern invariant under all 29! potential relabelings; no heuristic key search is needed.

The finite plaintext register is the repository's [29,157-word English reference](../resources/control/english_wordfreq_textblob.txt), encoded with original [ING and IO spellings](../sims/lp2_native_gp_source_orthography_sft.cjs). The affine signature divides all rune differences by the first nonzero difference, eliminating the unknown `a,b`. The arbitrary-permutation signature labels symbols in first-occurrence order, eliminating the complete secret permutation. Exact signature matches are necessary and sufficient for each respective family on the compared rune positions.

## Original evidence

| Printed length | Original word count | IV affine | Direct affine | Circular affine | IV any permutation | Direct any permutation | Circular any permutation |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 52 | 0 | 0 | 0 | 40 | 32 | 38 |
| 11 | 32 | 0 | 0 | 0 | 22 | 14 | 18 |
| 12 | 18 | 0 | 0 | 0 | 9 | 4 | 2 |
| 13 | 4 | 0 | 0 | 0 | 0 | 0 | 0 |
| 14 | 3 | 0 | 0 | 0 | 0 | 0 | 0 |
| **Total matching** | **109** | **0** | **0** | **0** | **71** | **50** | **58** |
| **Unmatched** | | **109** | **109** | **109** | **38** | **59** | **51** |

The script supplies a distinct source-native positive plaintext word for **every original long-word length slot**, independently changes each word's secret affine parameters, chains its ciphertext, and recovers the exact planted plaintext over the constrained positions. Each model passes **109/109 positive controls**, including circular zero-sum closure with its source-selected final affine offset.

**Reproducer:** [Node.js 22 CommonJS single-file test](../sims/lp2_word_chain_allsecret_affine_sft.cjs). **Original-input CI:** [successful workflow run 43598115782](https://github.com/FlareZ123/liber-primus/actions/runs/43598115782). The separate workflow is manually dispatched and has no automatic commit trigger.

## Decision and strict scope

Under unchanged printed-word boundaries and source-native GP29 English spellings, a word-independent two-parameter affine map on the predecessor increments cannot produce **any** of the 109 original long words under any per-word key. Even arbitrary distinct secret bijections per word cannot match 38/59/51 words under the three input-state definitions. This makes a word-local constant-key cumulative GP29 cipher an unattractive next decryption route without a new independent clue selecting a more expressive operation.

This is an **exact finite-reference exclusion**, rather than a statement that no unknown English passage can fit, and no original plaintext has been recovered. It does not address a nonlinear evolving alphabet, an intermediate binary/compressed register, insertions/deletions, changed printed segmentation, a different language, or a bypass mechanism. The word-local model was motivated by the observed stream; a first-party clue selecting its operation is missing. Preserve this boundary if future work compares other predecessor encoders.
