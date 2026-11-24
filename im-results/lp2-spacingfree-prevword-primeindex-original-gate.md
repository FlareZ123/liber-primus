# Boundary-free preceding-plaintext word prime clock

## Decision

The forward one-based Gematria-prime sum/prime-minus-one preceding-plaintext-word clock fails ordinary native language on two original passages even with all printed word boundaries removed. This is the spacing-free complement to the fixed-word exact contradiction in [the word-fed prime-clock report](lp2-wordfed-primeclock-original-gate.md). No original key or unknown plaintext is recovered.

The 2016 signed words/numbers statement, known LP1 word sums and p56 prime-minus-one/F-hold law motivate the composition, but do not authenticate the word-feed law or its one-based indexing. This experiment fixes that specific choice. It is not a new source-derived key.

## Exact dynamic program

Let S be the sum of the GP prime weights of the preceding plaintext word. For each new word, q=0 initially. A plaintext F emits zero without advancing q; every non-F rune emits (p+prime[S+q]-1) mod29 and advances q (one-based prime ordinal). The sum of the new word becomes the next S.

At each possible cut i, track S from 2 through 24*109=2616. All 2615 possible initial sums are granted, even ones not attainable by a native word. For every state, enumerate every next-word length 1..24 and every feasible F-mask, including ordinary non-F preimages of ciphertext zero. Merge states only if both the ending position and next sum coincide. Every outgoing edge has a unique explicit plaintext word; a nonzero observed cipher rune equal to its current shift kills that branch. No printed word lengths, word count, rubric cuts or dictionary are required for reachability.

Two independent objectives are solved over the same complete DAG:
- MAP using the frozen word-mixture model (95% weighted lexicon; 5% smoothed within-word trigram and length, as in [the self-word experiment](lp2-spacingfree-selfword-primeindex-original-gate.md)).
- Maximum number of runes inside any dictionary word, granting arbitrary OOV words for the rest. This is an exact upper bound, not a language-scoring heuristic.

Initial state costs are uniform; no seed fitted by reading a target. Word length cap24 covers all four native control sections. Independent model trains on TextBlob, Shakespeare, and solved sections 0,2,6,7,8, excluding complete controls 1,3,4,5. For controls the first word supplies the hidden starting sum and is excluded from ciphertext. Original scopes p0–2 and p16–21 were fixed before scoring. Gate: each control >=95% rune and >=90% boundary recall.

## Results

| Control | Enciphered runes | Exact MAP runes | Exact boundaries | Recovered initial sum | Maximum lexicon runes | MAP nats/rune |
|---|---:|---:|---:|---:|---:|---:|
| WELCOME | 508 | 508 | 123/123 | 317/317 | 497 | -1.765582 |
| KOAN1 | 779 | 779 | 207/207 | 97/97 | 770 | -1.744153 |
| LOSS OF DIVINITY | 753 | 753 | 180/180 | 72/72 | 730 | -1.848329 |
| KOAN2 | 318 | 318 | 87/87 | 97/97 | 317 | -1.712545 |

All 2358 runes, 597 boundaries and four hidden initial sums recover exactly. All true edges retained. Both optimal paths replay the ciphertext.

| Original scope | Runes | MAP nats/rune | MAP lexical runes | Exact max lexical runes | Min OOV runes | Edges |
|---|---:|---:|---:|---:|---:|---:|
| p0–2 | 729 | -4.651856 | 179 | 543 | 186 | 29,988,731 |
| p16–21 | 1613 | -4.705023 | 376 | 1194 | 419 | 62,089,038 |

No language survives in either maximum-scoring path; example p0 starts EYLODUCTNG W IN SIN EA W FOIE OM MACC REM A AD A DIAG PU P ULCEIMES LYST DAL USEFUL F. Both passages are legally invertible with exact replay, and all states are considered, but exact lexical maxima leave at least 25.5% and 26.0% of runes in OOV segments versus 0.3–3.1% for native controls. This is a finite-register/length-capped negative, not a universal contradiction or evidence of an authentic key. The MAP starts 1586 and 601 are only optimizers, not recovered historical state.

## Reproduction

`node sims/lp2_spacingfree_prevword_primeindex_sft.cjs` from repository root. Executed actual core in V8 in separate control/original calls. The wrapper assembles identical core and source reads; not executed end-to-end. Raw original path witnesses: [p0–2](lp2-spacingfree-prevword-primeindex-p0-2.json) and [p16–21](lp2-spacingfree-prevword-primeindex-p16-21.json). Native raw controls [1](lp2-spacingfree-prevword-primeindex-control1.json), [3](lp2-spacingfree-prevword-primeindex-control3.json), [4](lp2-spacingfree-prevword-primeindex-control4.json); KOAN2 pilot retained in execution summary and reproducible from same core.

Retire this concrete one-based prior-word sum composition for ordinary native language even with unknown segmentation. No extension to additional offsets or word-state formulas justified by these results.
