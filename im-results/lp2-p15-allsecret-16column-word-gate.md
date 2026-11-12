# LP2 181×16 original-word table: exact all-key 16-column permutation gate

**12 November 2026, Agent 8. Classification:** bounded, reversible word-order architecture test on the original 2,896 printed LP2 words. The putative plaintext order remains unknown; no original rune plaintext or source-authenticated permutation key was recovered. Reproducer: [standalone CommonJS SFT](../sims/lp2_p15_allsecret_16column_word_gate_sft.cjs), [completed independent Node 22 Actions run](https://github.com/FlareZ123/liber-primus/actions/runs/43279741588).

## Why this is an executable route

The authentic p15 red-started Fibonacci-prime spiral contains sixteen positions; the full original unsolved manuscript has exactly **2,896 whole rune words = 181×16**, with 32 words continued across physical page boundaries. An earlier [source-spiral test](lp2-p15-spiral-181word-transposition.md) rejected the *one known spiral order* on an 181×16 arrangement. The 2014 magic-square source also includes 181, though its relevance to this manuscript is not authenticated.

A stronger alternative is that a 16-column arrangement is correct but the column permutation is secret. Instead of trying a handful of guessed paths, this test **optimizes over every possible one of 16! column orders exactly**, then scores the winning order on held-out original material without changing one ciphertext rune or printed-word length.

The two source-plausible transposition models are:

1. **Row source:** the 2,896 original words are serialized as 181 consecutive sixteen-word rows. The same unknown permutation acts separately on the sixteen columns of each row.
2. **Column source:** the 2,896 original words are serialized as sixteen consecutive 181-word columns. A single unknown ordering is used when reading them as 181 rows.

Under either model, ciphertext rune words are carried intact and all 2,896 positions are bijectively permuted; no word insertions, drops, runic substitution, language-based letter fitting, or secret cipher-state repairs occur.

## Exact inversion and held-out discrimination

Train an independent seven-category GP-normalized adjacent **word-length** log-odds model on the first 30,000 words of the preserved Shakespeare control and the first 8,000 of Gibran. These are source-native GP words, not LP2 ciphertext. The bins are lengths 1,2,3,4,5,6,7+; they are fixed before testing. Compute the score of placing each ordered column after each other column across the **first 90 rows**. A directed Held–Karp Hamiltonian-path dynamic program finds the **globally optimal permutation out of all 16!** for this frozen training set, including every starting and ending column. Its use of a complete 16-vertex path eliminates failures due merely to a bad guessed key.

Evaluate that frozen key against the **remaining 91 original rows**. The held-out null is the score distribution of **30,000 fixed-seed uniformly shuffled sixteen-column orders on the same held-out rows**, conditional on the observed printed words. The training-fitted original key does not distinguish itself from this null:

| Model | Training gain over printed order (nats) | Held-out gain over printed (nats) | Held-out score | Random-order upper-tail probability |
| --- | ---: | ---: | ---: | ---: |
| 181 rows × 16 contiguous ciphertext words | +42.4980 | +6.6348 | −25.9196 | **0.60015** |
| 16 columns × 181 contiguous ciphertext words | +31.9915 | −1.0535 | −32.0836 | **0.89724** |

The original training-selected row-source key is **[11,15,2,0,13,12,5,3,9,4,7,10,1,14,6,8]**; the column-source key is **[2,14,8,13,10,1,0,6,11,9,15,5,7,12,3,4]**. Neither is an authenticated key and neither produces the expected held-out grammar. A non-held-out fit over all 181 rows unsurprisingly gains +64.44 and +49.48 nats over the printed order, respectively; those in-sample improvements **cannot** be evidence of the original plaintext order because all 16! keys were available for overfitting.

The DP optimizes within-row adjacency only, without optimizing transitions between the last word of one row and the first of the next. The null shares that exact metric. This explicitly limits the conclusion to this simple fixed-order model.

## Positive controls and limits

Encode genuine source text by the exact same 181×16 transformation using the historical p15 spiral order **[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12]** as an otherwise hidden 16-column key. Use Shakespeare words 35,000–37,895 and Gibran words 12,000–14,895, both beyond their respective training prefixes. All 2,896 planted word positions re-invert exactly under the known key.

- **Shakespeare:** whole-181-row DP recovers the exact sixteen-position secret key in **both** serialization models. The independently trained 90-row key is imperfect, but its held-out score is **+10.7913** and beats all 30,000 random keys, upper-tail bound **0.0000333**.
- **Gibran:** the 90-row key and whole-181-row key do not exactly recover the secret, demonstrating source/style dependence. Nevertheless the 90-row key's held-out score **+5.0692** exceeds 29,973 of 30,000 random keys, empirical upper-tail **0.0009333**.

The same held-out detector thus identifies deliberately encoded natural-language *word-order signal* on independent control passages even without a perfect training-key reconstruction. For original LP2, its null-like scores give no reason to favor an unknown secret stationary 16-column permutation. It **does not rule out** ciphertext words encoding arbitrary-width data, a different plaintext language, variable column orders, word-padding, embedded punctuation grammar, an unrecovered source-defined column address, or a further reversible stage that destroys length order.

**Decision:** retire a global fixed-key 181×16 whole-word permutation as an unsupported direct route to source-native GP prose. A meaningful successor would require an original-source instruction fixing a different word/block register, along with an original withheld segment that predicts recognizable plaintext. No new wide permutation or language-only search follows from this negative.

**Reproduction:** the [SFT](../sims/lp2_p15_allsecret_16column_word_gate_sft.cjs) reads the original canonically parsed word stream, asserts its 2,896 words, 12,956 runes and 32 cross-page words, optimizes all 16! keys exactly, samples the 30,000 null orders with pinned seed `0x71cbdd31`, and performs both native-source plants. Node 22 completed successfully with all assertions passing in [GitHub Actions run 43279741588](https://github.com/FlareZ123/liber-primus/actions/runs/43279741588).
