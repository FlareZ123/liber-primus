# Historical p56 prime key plus arbitrary word null and T echo

**Agent 10, 17 November 2026. Classification:** bounded source-original negative. No recovered unknown plaintext or authentic new key.

## Specific decoding route

The historical p56 cipher uses consecutive prime totients modulo 29 and a **plaintext-F nonconsuming bypass**. A different manuscript analysis fits LP2's average word-length excess with a hypothetical one-rune unkeyed insertion in some words. LP2 also has word-local six-back affine echoes, T(x)=24-2x modulo 29, possibly arising from collision repair. These last two mechanisms are hypotheses, not authenticated Cicada instructions.

To decide whether the actual p56 key could survive both transformations, the exact original ciphertext inverse grants the following freedoms for **each complete printed word independently**:

- An unknown initial prime ordinal **0 through 4,999**, and either GP29 sign.
- Exactly zero or one arbitrary inserted ciphertext glyph at any original printed word position; a null consumes no key.
- The true p56 literal-plaintext-F bypass, retaining both valid interpretations of a ciphertext F without guessing which F positions are literal.
- At **every** eligible original position six or later, where the printed rune satisfies C[i] = T(C[i-6]) and differs from C[i-1], either the printed rune was genuine or an underlying ciphertext doublet C[i-1] was replaced with T. All combinations of these branches are allowed.

The inverse tests all paths with an exact GP dictionary-prefix trie, without a language-model score, phase fitting or beam pruning. A printed word of length m may have underlying plaintext length m or m-1. This is intentionally more permissive than a single key clock continuing over multiple printed words. The original 2,896 word boundaries and all 12,956 canonical GP29 runes are unchanged.

## Entire original long-word result

Two independently sourced native GP29 dictionaries are enumerated: **29,060** unique GP-English encodings from the checked-in TextBlob word-frequency list and **7,305** native GP-Latin encodings from the checked-in Vulgate whole-word register. The English encoding applies longest GP digraphs, K/C, V/U, Z/S and QU/CW normalization. Both arithmetic signs and all 5,000 prime starts per word were searched.

| Printed ciphertext word length | Original source words | English full-word inverses | Latin full-word inverses |
| ---: | ---: | ---: | ---: |
| 9 | 78 | 0 | 0 |
| 10 | 52 | 0 | 0 |
| 11 | 32 | 0 | 0 |
| 12 | 18 | 0 | 0 |
| 13 | 4 | 0 | 0 |
| 14 | 3 | 0 | 0 |
| **Total** | **187** | **0** | **0** |

This zero result persists when *all* eligible six-back affine echo branches are permitted; there were also zero 9+ word hits under the smaller no-repair model. It was computed directly against the exact original Github corpus in the connected JavaScript execution. No original long printed ciphertext word meets even one of the two source-native reference vocabularies, despite a different freely chosen prime start for every word.

**Constructive matched controls:** The committed SFT plants source-native vocabulary words of all six tested lengths, encrypted with the true p56 prime/F cipher and varying secret starts. It adds an arbitrary unkeyed rune in alternating cases. A separate plant applies legitimate six-back T repairs to non-F colliding ciphertext attempts and exercises T repair with an insertion. The exact committed CommonJS source was executed directly in a local V8 harness loading all six original GitHub source files and the committed word parser, with only the unused digest print adapter stubbed. Every runtime model assertion passed: **187/187 English plus 187/187 Latin** length-matched encrypted positives recovered, **94** carrying an arbitrary ciphertext null and **93** carrying no null. The separate repair controls exercised **25 true T6 overwritten collisions across 24 planted words, including eight with a simultaneous inserted null**, all exactly invertible. The original-source inverse yielded the same four zero-hit totals. The native Windows Node 22 workflow has been dispatched separately and is not claimed completed here.

## Causal decision

This rules out a **direct English or Latin whole-word receiver** based on the first 5,000 starting positions of p56's authentic prime-totient stream, one unkeyed inserted rune per word, and any subset of T-repair events. It closes the specific possibility that a single hidden rune per printed word fixes an otherwise correct word-local p56 key. It does not exclude unknown plaintext outside the enumerated dictionaries, two or more nulls, unknown starts past 4,999, altered word division, non-totient keys, or a separately specified layer. A further dependent original-cipher search needs positive evidence selecting a new key or a different precise operation.

**Reproduction:** [Exact original-input Node 22 CommonJS test](../sims/lp2_p56_phi_onewordnull_all5000_sft.cjs); [manual-only runner](../.github/workflows/manual-node22-sft-runner.yml). Source corpus: [canonical GP29 LP2](../resources/liber-primus/lp2-corpus.json) and the original-preserving complete-word parser in the shared sims library.
