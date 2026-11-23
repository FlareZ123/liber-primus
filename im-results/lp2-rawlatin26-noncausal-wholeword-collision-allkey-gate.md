# Original raw-Latin26 two-rune words: all-key **noncausal whole-word** collision bound

**Agent 40, 23 November 2026. Classification:** exact original-ciphertext count, a finite-register source-language obstruction, and a reversible noncausal positive control. **No unknown LP2 plaintext, authentic key, cipher, or endpoint recovered.** This advances Director [#2378](https://github.com/FlareZ123/liber-primus/issues/2378) by testing the formerly surviving **noncausal** word-wide model independently of the [online word-start capacity theorem](lp2-rawlatin26-causal-wordstart-allkey-gate.md). This is a conditional language-register result; it does **not** assert that every possible two-letter plaintext string is an English word.

## Source-first necessary condition

Suppose (1) every authentic original **two-rune printed word** conceals one ordinary **two-letter Latin word**, without altered boundaries or inserted/deleted characters; and (2) **one fixed deterministic word-local encryption function** applies to every such word throughout the original manuscript. The function may use an arbitrary secret key, full two-letter lookahead, a complicated nonlinear permutation, reversed reading direction and any within-word positional diffusion. It may map into all 29 GP ciphertext runes. The only restriction is that identical plaintext two-letter words at different positions enter the **same effective whole-word state**, and thus produce identical ciphertext two-rune words.

For any n source word tokens under that operation:

- The number of distinct ciphertext two-rune types is **no larger than** the number of distinct plaintext two-letter word types.
- The number of equal unordered ciphertext word-token pairs, \(\sum_t \binom{n_t}{2}\), is **at least** the corresponding plaintext collision count. Different plaintext types may collide too; their merging would only increase collisions.
- If ordinary plaintext is restricted to a lexicon of **at most k types**, the smallest possible word-token collision count is achieved by distributing the n word occurrences as evenly as possible among k types. Write \(n=qk+r\) with \(0\le r<k\). Then the exact all-secret lower bound is \(r\binom{q+1}{2}+(k-r)\binom{q}{2}\).

This argument does not require an invertible cipher or any restriction on the secret whole-word mapping. It requires **the same mapping across the tested scope**, so it does not test context-varying IVs or keys computed from the word ordinal or its predecessors.

## Entire original LP2 ciphertext and generous raw-English reference

The [single runnable CommonJS reproducer](../sims/lp2_rawlatin26_wholeword_digraph_collision_allkey_sft.cjs) checks the original unchanged 12,956 GP29 runes against the shared canonical transcript and joins all 32 cross-page continued words before extracting two-rune words. The exact source has **2,896 complete printed words**. Its 448 two-rune tokens contain **354 distinct exact ciphertext word types** and only **106 identical unordered word-token pairs**.

As a deliberately generous comparator, the pinned English \`resources/control/english_wordfreq_textblob.txt\` frequency lexicon contains **168 distinct raw A–Z two-letter strings**, including atypical abbreviations and Roman-numeral forms. Any plaintext of 448 two-letter tokens drawn entirely from this **168-type universe**, even adversarially chosen to *minimize* repetition, requires:

\[
448=168\cdot 2+112,\qquad
\min{\rm pairs}=112\binom{3}{2}+56\binom{2}{2}=\mathbf{392}.
\]

**Actual original ciphertext: 106 pairs, 354 types.** A stationary whole-word cipher cannot map a plaintext with **≥392 equal plaintext-token pairs** into the observed **106 equal ciphertext-token pairs**. Independently, it cannot create 354 distinct ciphertext outputs from only 168 input word types. These are exact contradictions **conditional on the pinned 168-type English lexical register**. A hypothetical non-English plaintext dictionary with at least 354 two-letter types, or a one-time/word-dependent cryptographic state, escapes the bound. The mathematical alphabet of all \(26^2=676\) raw two-letter combinations is itself large enough; the claim depends explicitly on ordinary *lexical* constraints.

### Independent source-language sensitivity

Direct raw two-letter tokenizations of three checked-in source-language controls contain only **35** (Gibran), **45** (Shakespeare) and **51** (Emerson) distinct types. Their union contains **63** types, a finite *attested comparator* rather than a complete English lexicon. Even if a completely independent arbitrary secret whole-word cipher is assigned **per source-visible chapter**, two individual original chapter groups exceed the 63-type reference:

| Physical original chapter | Two-rune original words | Exact original ciphertext types | Original equal-token pairs | Minimum pairs in 63-type attested control |
| --- | ---: | ---: | ---: | ---: |
| p15–22 | **74** | **73** | **1** | **11** |
| p40–53 | **101** | **98** | **3** | **38** |

The actual physical p50 number-only page is excluded, and 32 page carries remain joined. Each row excludes that particular chapter-private stationary whole-word model **under the attested 63-type vocabulary**. Neither row independently excludes a broader 168-word lexicon; the **full-book** 168-type argument excludes a **single shared** stationary map, not chapter-rekeyed variants.

## Source-authentic word delimiters cannot themselves supply enough IV diversity

A cheaper changing-state guess is that the *four different original punctuation marks* preceding a word select its whole-word key or block cipher. The original complete word parser normally discards delimiters; the reproducer additionally reparses **the exact printed separator marks** without treating typographical wraps or the 32 across-page word carries as delimiters. The 448 actual two-rune words separate by their immediately preceding punctuation:

| Previous original delimiter | Two-rune word tokens | Distinct ciphertext types | Exact equal-word pairs |
| --- | ---: | ---: | ---: |
| Hyphen \`-\` | **416** | **334** | **92** |
| Period \`.\` | 28 | 25 | 3 |
| Dollar \`$\` | 3 | 3 | 0 |
| Ampersand \`&\` | 1 | 1 | 0 |

Even if the author uses a completely different unknown nonlinear whole-word secret cipher for **every delimiter category**, the **416 words following the same ordinary hyphen** still have to share one map in this proposed source-selector family. A 168-type English lexicon would allow at most 168 different outputs for that one fixed map, versus **334** actual GP words. Their 416 tokens require at least **328** identical-token pairs in any arrangement of 168 input types; actual output has only **92**. This is a mathematical contradiction conditional on the same permissive finite English lexicon. In particular, **using the immediately preceding \`-\`, \`.\`, \`$\`, or \`&\` mark as the entire word IV selector cannot explain the actual two-word ciphertext**. The modifier must also depend on a word ordinal, other original context or additional state; a cipher with persistent state whose transitions are **triggered** by hyphens but continue evolving is not excluded.

## Page-private key sensitivity: authentic 2-word repeats remain almost absent within pages

An independent stronger *source-language* prediction tests the natural fallback of **one arbitrary secret whole-word cipher per physical page**, with the same page key for every two-letter plaintext word on that page. The full-book 168-type pigeonhole obstruction does not apply to 55 independently keyed pages, where each page has 0–15 two-rune words. Nevertheless identical two-letter words printed *on the same page* must still receive identical ciphertext words.

Counting unordered equal-word token pairs **within each of the 55 rune-bearing original physical pages** yields only **two** among all **448** source two-rune word occurrences. The test preserves the exact per-page two-word token counts (p50's number-only page contributes none, 32 across-page joined words belong to their start pages). We then take **303 deterministic contiguous 448-two-letter-word windows** from three pinned, independently authored ordinary-English texts, repartition each window into *exactly those 55 authentic original page groups*, and count repeated whole two-letter words within each page.

| Native raw-English donor | Fixed 448-word windows | Minimum within-page equal-token pairs | Median | Maximum |
| --- | ---: | ---: | ---: | ---: |
| Actual original LP2 two-rune ciphertext | 1 | **2** | 2 | 2 |
| Gibran, *The Prophet* | 103 | 165 | 270 | 383 |
| Shakespeare, first 300k characters | 100 | 123 | 161 | 225 |
| Emerson, *Essays* | 100 | 165 | 230 | 415 |

Under an **independent arbitrary secret whole-word map per page**, a source-native page-key cipher would preserve at least its plaintext's within-page identical-word pairs; all 303 sampled native donor windows have **≥123**, compared with the original **2**. This is a substantial finite-language contradiction for those donor passages and exact page partitions. The windows overlap, so do not interpret 0/303 as an iid confidence level or infer a formal universal-English p-value. Alternative plaintext vocabulary, dissimilar discourse, altered spaces or a genuinely **within-page word-varying key/IV** survive.

This moves the main conditional architecture choice past **page-local stationary secrets** as well as globally stationary secrets: a native-English intact-word decoder would need changing encryption state *inside original pages*, unless it relied on a very unusual two-letter word distribution. The script checks the original two within-page collisions and the exact three donor min/median/max ranges in addition to the global theorems and positive plants. It makes no claim that the author actually used English or a particular IV.

## Minimal changing-state consequence

A decoder that assigns one of `s` fixed deterministic maps to each printed two-letter word, with no other input distinguishing repeated plaintext types, can produce **at most `168 × s` distinct ciphertext two-letter types** from the permissive 168-type raw-English lexicon. Since the unmodified original contains **354 distinct two-rune ciphertext words**, any surviving model in that register must have at least **`ceil(354/168) = 3` different effective word-encryption maps** across the full manuscript. Under the narrower **63-type observed donor union**, the corresponding lower bound is **six maps** globally. This is only a necessary state-support bound; it does not identify IV values, establish where state transitions occur, or exclude independent page keys. Under the 63-type control, the actual p15–22 and p40–53 sections each require **at least two effective maps within that chapter**. A source-selected clock with more than these counts remains entirely possible.

## Exact noncausal positive control

The reproducer defines a complete **two-letter block cipher** over GP29:

\[
C_0=(7P_0+3P_1+4)\bmod29,\qquad
C_1=(5P_0+11P_1+6)\bmod29.
\]

The determinant is \(7\cdot11-3\cdot5=62\equiv4\bmod29\), which is invertible with \(4^{-1}\equiv22\bmod29\). The script checks decryption of **all 676 distinct raw Latin letter pairs**. Because the first ciphertext rune depends on **both** Latin letters, the transformed 676 pairs occupy **all 29 possible first GP glyphs**, so this is a genuine **noncausal whole-word cipher that evades the older 26-first-glyph online bound**. This makes the new equality-collision obstruction logically independent.

Then it creates the strongest possible 448-token 168-word synthetic plant, with its word types balanced 2 or 3 occurrences apiece. After the declared noncausal cipher, the **448 planted GP29 words still contain exactly 168 types and 392 collisions**, and **all 448 decrypt exactly**, with all original-length-word framing intact for this two-rune class. A fixed secret, reversible nonlinear full-word operation cannot make these same plaintext-token identities disappear; the original ciphertext only has 106 collisions.

The complete **live committed test passed** when executed using the fetched exact repository files and existing parser, with all original counts and both synthetic positive controls asserted. It is a self-contained Windows/Node22 CJS script and reads pinned files directly when run in the repository.

## Decision for #2378

The **fixed-state whole-word polygraphic** route now fails under an explicitly permissive standard-English word universe, independently of the earlier fixed-reset online/position-changing failure. Together, these original-cipher theorems mean that ordinary raw-Latin26 plaintext with all printed two-rune word boundaries intact requires at least one mechanism able to assign *different ciphertext outputs to identical words at different positions*. An **inter-word evolving key/IV**, a word-position clock, a preceding-word-derived state, or altered plaintext segmentation could do so. A non-Latin or intentionally nonlexical source register is another escape. The solved author-native GP29 spelling includes multigraph runes, so [the independently demonstrated noncanonical-GP-renderer problem](lp2-gp-contextual-grapheme-source-original-gate.md) must also be solved before any raw-Latin decoder could be called original-cipher faithful.

**Missing original selector:** no authenticated 2014–2016 instruction yet fixes which of the surviving word-varying state machines applies, supplies its first IV or external key, defines a Latin26→GP29 input/output codec, and explains original ciphertext word boundaries. Neither the 2016 signed statement that words are a map nor the solved p57 “shed ... circumferences” phrase uniquely supplies those typed operations. A new decoder must be pinned **from independent author-readable evidence** and recover connected ≥300 original training runes and disjoint ≥150 original holdout runes with exact forward re-encoding. The present fixed-state branch should be retired; **no new key-sweep should attempt to rescue it**.
