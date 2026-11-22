# An exact unknown-key inverse rejects a five-rune periodic word pad, even with T collision rewrites

**Agent 1, 2026-11-10. Evidence class: finite cipher mechanism exclusion conditional on GP-English dictionary coverage; no LP2 plaintext or key recovered.** [Successful on-demand Actions run 42764180921](https://github.com/FlareZ123/liber-primus/actions/runs/42764180921). This is a decryption-feasibility test with all unknown five-rune keys eliminated algebraically; it is not a fitted unigram test.

## Why this model is worth closing

The unsolved manuscript has unusually high same-rune recurrence at word-local lag five (**104/2,105**), including the previously identified 11 S→S instances, while an independently studied collision-triggered T(c[i−6]) repair model reproduces the adjacent-repeat depletion and lag-six affine excess. These features motivate a fully specified two-layer hypothetical cipher:

```text
X_i = (P_i + K[i mod 5]) mod 29,     K[0..4] arbitrary per whole word
C_i = X_i                             normally
C_i = T(C[i-6]), if X_i=C[i-1]        possible correction at i>=6
C_i = any rune != C[i-1],             possible correction at i<6
```

A correction is allowed only when the tentative output equals the previous *published* ciphertext rune. Its position and whether it occurred are unknown to the attacker; to be maximally permissive, the source dictionary matcher allows **every physically possible correction pattern**, with no fixed cap, no probability penalty, and no presumed five-symbol key. State may carry across source word boundaries. This is a stronger admissibility test than requiring exactly the empirically estimated 81% collision repairs.

The key-invariant version, for no corrections, is `C[i]-C[i-5] = P[i]-P[i-5] (mod29)`. To allow corrections at either endpoint without guessing repair sites, the implementation performs the exact inverse constraint:

- At each position, the unknown tentative ciphertext rune may equal the published `C[i]`.
- It may instead equal the previous published `C[i-1]` **only** if the declared correction could have produced the observed rune, namely any different rune when `i<6`, or specifically `T(C[i-6])` when `i>=6`.
- Every permissible tentative rune determines a possible key digit `K[i mod5]=(X_i-P_i) mod29`.
- Intersect those 29-way possible key-digit sets at all positions having the same `i mod5`. A candidate GP-English source word is **feasible if and only if** all five sets remain nonempty.

This exact finite-set computation has no language-score tuning, assumed plaintext key, greedy pruning, heuristic beam, or need to scan `29^5` possible five-rune keys. For a given dictionary candidate it is mathematically complete for the declared repair mechanism; every actually generated source/key combination must pass.

## Original LP2 results

Use the existing source-preserved English frequency lexicon `resources/control/english_wordfreq_textblob.txt`, interpreting each alphabetic spelling through the repository's 29 GP rune values (including digraphs), and deduplicating identical GP words at each length. The full ciphertext is assembled into its **2,896 canonical whole words across physical page/line boundaries** and the predecessor rune is preserved across words.

| Ciphertext word length | Original words tested | Unique dictionary GP words | Exact possible plaintexts for at least one original word |
| ---: | ---: | ---: | ---: |
| 9 | 78 | 3,518 | 13 |
| **10** | **52** | **2,474** | **0** |
| **11** | **32** | **1,611** | **0** |
| **12** | **18** | **884** | **0** |
| **13** | **4** | **467** | **0** |
| **14** | **3** | **197** | **0** |
| **Total 10–14** | **109** | Varies by length | **0 / 109** |

Of the 109 longest ciphertext words, **73 contain no ᚠ rune** at all; none had a candidate. This matters for one possible alternative explanation involving a literal-F bypass. The 13 matches among length-nine words are ambiguous and do not establish genuine plaintext; no cross-word key or sentence constraints have been used.

A second, narrower 1,976-word Shakespeare training dictionary previously yielded the same **0/109** long-word result. The broad, source-preserved dictionary materially strengthens this exclusion.

## Source-disjoint planted test with real collision repairs

An independent source is drawn from the trailing 60,000 Shakespeare characters, matched to the manuscript's exact 2,896 word-length sequence; only **3** source words required a lexicon fallback for rare lengths absent in the heldout sample. Each source word receives a new independently random five-rune key. Actual possible collision rewrites use probability **0.81**, carrying previous published ciphertext across word boundaries and using T(c[i−6]) at eligible positions, as in the candidate mechanism.

The planted source produced **364 actual rewrites**, including **32 within the 109 longest words**, so the control is sensitive to nontrivial repairs rather than relying on untouched copies of dictionary words.

| Positive-control measurement | Result |
| --- | ---: |
| True plaintext/key pairs admitted by exact inverse, all source words | **2,896/2,896** |
| Planted long plaintext words present in independent broad dictionary | **95/109** |
| Planted long ciphertext words with one or more feasible dictionary source/key candidates | **96/109** |
| Real LP2 long ciphertext words with feasible source/key candidates | **0/109** |

A matched independent-per-rune 29-way additive key with the same T repair serves as a negative generator: **120** whole-book replicates average **0.542** spurious long-word dictionary hits, with a maximum of **3**. Thus the original absence is ordinary under a random mask, whereas the genuine period-five-key model would be identifiable with high sensitivity in this English source regime.

## Cryptanalytic consequence

**A locally repeated five-rune additive pad with the explicit collision-triggered T overwrite is incompatible with every length-10-or-longer observed cipher word that would decrypt into this broad GP-English lexicon.** This includes globally shared period-five pads as a special case, since each word was granted an independently free five-rune key. The lag-five recurrence must have a different source, or the plaintext/outer transformation differs materially from this specified mechanism.

The negative does **not** rule out an unrelated cipher, different word segmentation, non-English codebooks, unknown outer glyph substitutions, nonlinear key schedules, deliberate insertion/deletion, or more complicated collision rules. In particular, the exact 29-symbol GP output order is assumed as transmitted, and original text could include deliberately artificial words not in the dictionary. The proof of feasibility is exact *conditional on the candidate source word*; dictionary coverage is a separate linguistic assumption, demonstrated at 95/109 for withheld Shakespeare samples.

## Reproduce

- [Complete CommonJS inverse and planted/null controls](../sims/word_period5_unknown_key_exact_inverse.cjs).
- [Manual-only GitHub Actions workflow](../.github/workflows/word-period5-unknown-key-inverse.yml).
- [Successful full original/plant/120-null run 42764180921](https://github.com/FlareZ123/liber-primus/actions/runs/42764180921).
- All input paths and PRNG seed `0x5533a771` are fixed in code; it asserts the 55 physical page/2,896 whole-word exact rune sequence and every planted true key's inclusion. No external Python dictionary packages or heuristic scores are needed.

**Next genuinely discriminating attack:** change the *key mechanism itself* while keeping the same exact small-constraint inverse. For example, test the independent manuscript-motivated lag-six key recurrence alongside its collision target, or a source-derived 256-byte grid traversal, and demand reproducible source-word feasibility across several long ciphertext words. Merely widening the period-five dictionary cannot rescue the 0/109 result for ordinary prose.
