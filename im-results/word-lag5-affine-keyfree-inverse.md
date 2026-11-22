# Exact five-back affine autokey inversion with unknown word seeds and T-repair

**Agent 1, 2026-11-10. Evidence class: conditional finite-mechanism exclusion, source-constrained exact inverse. No original LP2 plaintext or key recovered.** Reproduced in [successful GitHub Actions run 42765249389](https://github.com/FlareZ123/liber-primus/actions/runs/42765249389). The original candidate scan was also independently replicated using the connected GitHub runtime.

## Question and algebraic method

The previously recognized LP2 word-local lag-five excess suggests a delayed feedback rule, rather than just a repeating additive pad. The narrower unknown-period-five pad has already been excluded under GP-English lexical assumptions by [the exact five-key test](word-period5-unknown-key-exact-inverse.md). Here test two **different, reversibly specified** cipher mechanisms:

```text
Word index i >= 5:
     X_i = P_i + a*P_(i-5) + b  (mod29)   [plaintext five-back]
or   X_i = P_i + a*C_(i-5) + b  (mod29)   [ciphertext five-back]
     a, b in {0,...,28}, globally shared and unknown.

Word index i < 5: X_i is allowed any value (five free seed pads per word).

Published cipher C_i = X_i ordinarily; optionally an adjacent-collision
rewrite publishes T(C_(i-6)) when i>=6 and X_i=C_(i-1), with
T(x)=(24-2*x) mod29. At i<6 a rewrite may publish any different rune.
```

The encryption is expected to leave its **first five source word positions unconstrained**. The attacker does not guess those runes, the a/b coefficients, or repair decisions. Given an original ciphertext whole word and a candidate GP-English plaintext word of identical rune length:

1. For each of the 29 possibilities for slope `a`, use position 5 to derive at most **two** compatible offsets `b`. Position 5 may be literal or a possible collision rewrite from its preceding published rune.
2. For every later source position, evaluate the exact stipulated tentative glyph from `P`, `a`, `b`, and either earlier original plaintext or earlier published ciphertext. The tentative rune must equal `C_i` or, at a valid T-repair site, `C_(i-1)`.
3. Record all (a,b) surviving the **entire word**. Deduplicate across multiple dictionary spellings so each original whole word contributes at most one vote per coefficient pair.
4. Select the best original coefficient using **only word indices 0–1447**, freeze, and report its score among independently untouched words 1448–2895.

The test is exact for all possible rewrite choices, with no probability penalties, estimated language-rune probabilities, partial-path beam search or bounds on repairs. It does assume that the cipher operates on the canonical GP alphabet and whole words without undisclosed deletions, hidden outer permutation or unrelated intermediate code.

The lexicon is the pinned GP-encoded textblob English spelling list in `resources/control/english_wordfreq_textblob.txt`. The exact source is 55 rune-bearing physical LP2 pages, 12,956 runes, and 2,896 genuinely complete words including words crossing page boundaries. Only the **109 length≥10 words** are used as discriminators; very short words are too permissive. An external, broader dictionary could expand candidate coverage, but the chosen dictionary already has 2,474 distinct GP words of length10, 1,611 of length11, and others.

## Original ciphertext result

| Cipher family | Length≥10 words with any dictionary source/parameter | Best word votes for one globally shared (a,b) on first half | Frozen key votes second half |
| --- | ---: | ---: | ---: |
| Plaintext five-back | **9 / 109** | **1** | **0** |
| Published ciphertext five-back | **6 / 109** | **1** | **0** |

In the plaintext-history family, eight of nine permissive matches are length ten, one is length eleven and none is length≥12. In the ciphertext-history family, six matches are length ten and **none** are longer. The respective best global count is **one original word**, with other unrelated candidate pairs appearing on separate individual words. No common key survives even **two** long original cipher words. The manuscript generates scattered, isolated lexicon coincidences including *excitement*, *slenderest* and *strawberry* (plaintext-history) or *whereabouts*, *counteract* and *patriotism* (ciphertext-history), each demanding different a/b values.

The apparent individual English words are chance dictionary-compatible snippets; they are **not decrypted LP2 text**, and their local parameters cannot be joined into one keyed algorithm. The substantive finding is that a globally shared a/b five-back rule cannot generate dictionary-covered GP-English on several long words under the declared independent word seeds and collision-repair policy.

## Genuine-language planted positives on the exact manuscript word layout

Construct source words from **the trailing 60,000 characters of Shakespeare** (not the source dictionary construction), preserving the exact 2,896 original word lengths. Three rare lengths require a broad-dictionary fallback. For both feedback modes, set unknown true global coefficients `a=11, b=17` and choose a fresh independent five-symbol initial seed pad for each whole word. Use the same `q=0.81` adjacent-collision rewrite policy with T at positions i≥6. The matching procedure has no access to the true a/b or correction decisions.

| Positive control | Plaintext feedback | Ciphertext feedback |
| --- | ---: | ---: |
| Actual collision rewrites | 337 | 372 |
| Rewrites inside long words | 27 | 33 |
| Exact true-source/true-key feasibility checks on long words | **109/109** | **109/109** |
| Long source words present in broad dictionary | 85/109 | 85/109 |
| Long ciphertext words with any dictionary match | **87/109** | **95/109** |
| True global (a=11,b=17) votes on original-word first half | **39** | **45** |
| True global votes on word second half | **46** | **49** |
| Recovered top global coefficient pair | **(11,17)** | **(11,17)** |

Dictionary coincidence can occasionally produce a word match for the true key even when the planted source word is absent from the dictionary, so 95 true-key votes exceed the 85 original source words in-lexicon for ciphertext feedback. The exact true-source/true-key feasibility counts are 109/109 in both modes, confirming every generated repaired word retains an admissible inverse.

Thus the same key-free method is sensitive to the declared long-word autokey ciphers in genuine GP-English controls. A fixed globally shared a/b maps coherent language to many simultaneously compatible original word candidates, whereas actual LP2 yields at most one source-compatible word per pair.

## Interpretation and scope

Within a word-local additive GP alphabet, simple five-rune delayed **plaintext- or ciphertext-history affine feedback with one global slope/intercept, free word seeds, and the proposed T collision rewrite cannot explain ordinary dictionary-covered GP-English plaintext in the long original words**. This contrasts with the separate period-five-key result and substantially narrows the simplest explanations for LP2's lag-five echo.

The conclusion is conditional on the original ciphertext words corresponding directly to plaintext GP-English words, a globally constant a/b over the book, and a particular collision-rewrite rule. It leaves open word- or section-changing coefficients, transpositions, different source codebooks, nonlinear or irregular feedback, additional layers, and hidden key generators. The isolated accidental lexical matches must not be promoted to solution claims.

## Reproduce

- [Full CommonJS model, exact candidate enumerator and constructed heldout controls](../sims/word_lag5_affine_keyfree_inverse.cjs).
- [Manual-only workflow](../.github/workflows/word-lag5-affine-keyfree.yml).
- [Successful complete run 42765249389](https://github.com/FlareZ123/liber-primus/actions/runs/42765249389), Node.js 22, GP corpus and source dictionary pinned by repository.
- Source PRNG seed `0x5a7d3311`. The initial pilot workflow [42765157138](https://github.com/FlareZ123/liber-primus/actions/runs/42765157138) failed on an overly strict positive assertion that source-dictionary hits equalled all true-key votes; a repaired source can also match a *different* dictionary word under the true key. That assertion was corrected before this successful run, preserving the logically necessary coverage check.

**Research priority:** direct recovery of independent original key material or a reversible mechanism jointly predicting lag-five structure, T mass transfer, and anti-repeat suppression. Unconstrained extra feedback periods or alphabet shuffles could explain isolated word matches by search multiplicity alone, so demand a shared key and original heldout text.
