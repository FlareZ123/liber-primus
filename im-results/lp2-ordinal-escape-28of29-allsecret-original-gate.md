# A lossless 28+escape GP29 model fails even with independent hidden alphabets on every physical page

**Agent7, 18 November 2026. Original-cipher result: exact, bounded exclusion; no unknown LP2 plaintext or key recovered.** The original 55 rune-bearing encrypted physical pp0–55 contain 12,956 GP29 glyphs and only 86 identical adjacent glyph pairs in continuous reading order. This suggests an economical human-invertible alternative to stochastic collision rejection: represent one secret plaintext symbol by repeating the previous ciphertext glyph, and use the other 28 glyph choices to encode the other 28 plaintext symbols. A global hidden ordering of the 29 plaintext symbols may be granted completely free.

This is a **constructive full inverse**, not a sampled or language-fitted cipher. Its decoded rune frequencies on the untouched original are incompatible with ordinary solved-Cicada GP-native English under either natural 28-way rank scheme. The exclusion survives **every one of 29! global secret alphabet permutations, nine independent chapter alphabets and 55 independently secret physical-page alphabets**, with exceptionally generous page/large-mark initialization freedom. It does not rule out an alphabet that changes inside a physical page, word-local resets, another plaintext representation or an additional cipher layer.

## Reversible mechanism and source-visible trigger

With the preceding original cipher index `b` and current one `c`, reserve `c=b` as a special **rank28 escape**, which can represent any one chosen GP rune under the secret alphabet. For `c≠b`, form either of two natural ranks among the 28 unoccupied current symbols:

- **Linear GP chart order:** `r=c−[c>b]`, where `[ ]` is 1 when the comparison is true, otherwise 0.
- **Cyclic GP chart order:** `r=(c−b−1) mod 29`, taking values 0–27 for nonrepeat transitions.

A single secret 29-symbol bijection `π` maps `r` to the hypothetical plaintext GP index. Conversely, rank28 emits the previous ciphertext, while a linear rank `r<28` emits `c=r+[r≥b]`, and cyclic rank `r<28` emits `c=(b+r+1) mod29`. Both inverses are exact given the predecessor. Reversing the ranks or choosing a different special plaintext rune is already included in the secret permutation.

The only premises are the publicly visible GP29 alphabet and the manuscript's striking avoidance of adjacent identical glyphs; the solved p56 page also establishes that Cicada had used a plaintext-symbol skip elsewhere. **No first-party clue selects this particular ordinal scheme or a global secret alphabet.** We tested it because the mechanism itself offers a definite plaintext recovery route if correct.

## Complete original-input result

| Original GP ordinal rank | Continuous IoC | Page-reset IoC | Global secret π ceiling | Nine independent chapter π ceiling | 55 independent page π ceiling |
| --- | ---: | ---: | ---: | ---: | ---: |
| Linear | 0.035281722456 | 0.035270783791 | 0.035369636911 | 0.035920347454 | **0.039267757665** |
| Cyclic | 0.035324762170 | 0.035319221343 | 0.035411091830 | 0.036087990240 | **0.039451498639** |

The source-native control reuses the **unaltered clear GP runes of p57** to fill exactly 12,956 slots in the original page-length geometry. Its plaintext IoC is **0.072481607731**, and **12,956/12,956** runes are recovered after full encryption and decryption under an intentionally hidden 29-symbol permutation. The ordinary solved p57's 95-runic IoC is 0.062709966405, consistent with strongly nonuniform natural-language rune frequencies. The tested original registers stay near the uniform 29-alphabet collision rate of 1/29, even under the most generous source-boundary bound. One-to-one GP label permutations cannot change this statistic.

**Exact arbitrary-π boundary proof:** In addition to all 55 original physical page starts, grant the first rune immediately following every one of the **31** image-attested large mark events and **four** physically printed comma events an arbitrary decoded GP rank, whether or not a real decoder could make that choice. The deduplicated union consists of **78** unknown rune positions; all **12,878** others have an exact rank determined by the preceding original ciphertext. The largest fixed-rank histogram bin has **513** occurrences in the linear model and **510** in the cyclic model. To maximize plaintext collisions over *all* arbitrary values of the 78 free ranks, assign every free rank to this already most frequent bin. Replacing its `n(n−1)` contribution with `(n+78)(n+77)` yields the displayed rigorous upper bounds. A global secret plaintext permutation `π` merely relabels these counts, so **all 29! keys** obey the same bound. Any subset of page/mark resets is covered automatically.

**Independent-alphabet extension:** Allow the unknown permutation π to change completely at any of the nine source-visible illustrated chapter breaks, or even independently on each of all 55 rune-bearing original physical pages. Every fixed non-boundary rank histogram is invariant under its local π. By the rearrangement inequality, the largest possible combined coincidence count over *all* such independent permutations occurs when each chapter/page histogram is sorted in the same descending order before addition. Giving all 78 free source-boundary symbols to the resulting modal bin increases the maximum to **0.035920347454/0.036087990240** across nine chapters and **0.039267757665/0.039451498639** across 55 pages, for linear/cyclic rank respectively. No key enumeration is required. The larger per-page register includes the global and nine-chapter cases. The source model still requires one uniform secret symbol order within each physical page, apart from the separate first-rune exceptions already granted.

These upper bounds remain markedly below the reported original-length native-GP language-control coincidence rates used in the project's previous full-book reference tests, as well as the explicitly planted clear-p57 positive. They reject this particular unchanged-word/unchanged-rune-position original plaintext model under those source-native language requirements. Inventing an arbitrary plaintext with an unusually flat 28-letter histogram would evade a purely unigram exclusion and would not constitute recovered message evidence.

## Reproducer, scope and consequence

[Standalone Node22 CommonJS SFT](../sims/lp2_ordinal_escape_allsecret_original_sft.cjs) reads only the committed original `lp2-corpus.json` and source-mapped `lp2-punctuation-identity.json`. It asserts each original count, computes both exact global and page-reset IoCs, derives all 78 boundary-free adversarial ceilings and the nine-chapter/55-page all-secret rearrangement bounds, checks untouched-ciphertext round trips in all four regimes and recovers the full solved-p57-derived plant using a nontrivial global GP alphabet permutation.

[Windows Node22 source-CI PASS 44343963783](https://github.com/FlareZ123/liber-primus/actions/runs/44343963783), on commit [564be193](https://github.com/FlareZ123/liber-primus/commit/564be1931fbdedbdcbe6abbaeb46f03e77f89cbc).

A round trip is automatic for any bijective secret ordering, including one that yields nonsense. The actionable decision is to **retire rank-order 28+literal-repeat channels with even one fully secret alphabet per physical page** as standalone English decoders. A future attempt needs an independently sourced changing rank alphabet, a typed additional channel or an operator that materially changes this univariate invariant. No original unknown-page plaintext, authentic key, or final continuation is inferred.
