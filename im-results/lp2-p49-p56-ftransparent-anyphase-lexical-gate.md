# LP2 p49 table flanks under the authentic p56 prime/F-transparent cipher

**Agent4, 15 November 2026. Classification:** original-ciphertext, source-selected-algorithm exploratory negative; no unknown-page plaintext or authentic LP2 key recovered. The full operation, original printed word grammar and independent solved positive are reproducible in [one CommonJS SFT](../sims/lp2_p49_p56_ftransparent_anyphase_lexical_sft.cjs).

## The intended human clue and its weakness

The 2014 solved p56 text uses consecutive primes' Euler totients as a GP29 additive key with an exceptional **literal-plaintext F** that emits unmodified F and does not advance the prime clock. Its printed 128-character hex field follows a red ten-dot punctuation mark; the correct decipherment resumes on the next rune without advancing by any of those hex characters (original-p56 result #1084).

In the unsolved floral chapter, the intact sentence immediately before the p49 ten-dot mark is the last **72 original runes of p48 plus all 66 of p49**; its exact printed **33 words and 138 runes** terminate before the 256-cell table. The first intact sentence after the table comprises all 92 runes on p51 and the first 78 of p52, **40 printed words and 170 runes**. The page-carrying words remain joined. The independent [original source sentence audit](lp2-p49-table-complete-flanking-sentences.md) fixes these 308 source ciphertext positions and their real punctuation before testing.

This creates a low-step, human-recognizable candidate: transfer p56's **known actual cipher operation**, and treat the 256 printed numeral cells as a nonconsuming typed field. Its weakest premise is that no original 2014 instruction orders the p56 cipher to apply to p48–52 or identifies the prime-stream starting offset there. Thus the bounded key-phase scan is a *test*, not a source-authenticated key hunt.

## Frozen inverse and lexical evidence

Let `C` be all 138+170 original GP29 indices, in printed order, with a table skip between the two sentences, `q_k` the `k`th consecutive prime starting at 2, and `s∈{+1,−1}`. For each zero-based starting prime offset `t=0...49999`, use `K_j=(q_(t+j)−1) mod29`. At every ciphertext symbol, branch only as permitted by the authentic plaintext-F rule:

1. If ciphertext = F/index0, allow plaintext F/index0 **without consuming a key position**.
2. Otherwise, or as the alternative for ciphertext F, decode `P=(C−s*K_j) mod29` and consume one key position, **only if P≠F**.
3. Punctuation, physical page turns, and the entire table do not advance this key; real printed words are preserved, including across the page-carry sites.

The fully reproducible **word-level Viterbi** keeps only the highest-scoring path per consumed-key state at each printed word, using the **exact fixed lexical scorer** from the previously validated [three-authentic-control known-key decoder](lp2-ftransparent-word-lexical-viterbi.md): the pre-existing TextBlob 29,058-entry encoded GP29 frequency lexicon, `ln(1+frequency)` for exact word matches, and `−8` for an unseen whole word (unseen remains legal). GP spellings include source-native ING/IO and source-documented QU/V/K/Z conventions. Neither any hypothesized before-table plaintext nor any words from the following sentence select a key.

**Positive source control:** at prime offset0 and original sign+1, the very same decoder recovers independently solved p56 **85/85 GP29 runes**, identifies precisely its literal-F bypass at source position56, and matches **24/25** printed dictionary words, score **+164.92481474**.

## Original ciphertext result

The full pre-table search has `50,000×2=100,000` phase/sign choices. Of them **26,849** admit even a cipher-legitimate F-clock path through the 138-rune original preceding sentence; the rest are algebraically impossible under the strict historical branch rule. The highest dictionary score among all 100,000 is:

| Measure | Source-exact result |
| --- | --- |
| Best pre-table prime start | **23,705** (zero-based) |
| Best encryption sign | **+1** |
| Best pre-table lexical score | **−177.13072268** |
| Matched printed words, best of 33 | **8/33** |
| Authentic solved-p56 fixed-rule positive | **24/25** |
| Independent held-out following 170-rune sentence, best train phase | **No complete legal clock path** |

The **24** highest-ranking pre-table phase/sign combinations were frozen on the pre-table score before consulting the following sentence. **23/24** cannot reproduce the complete 308-rune original flanks while satisfying the historical plaintext-F encryption rule. Only starting prime index **38,874**, sign **−1**, permits a complete legal path, with **3** additional dictionary-supported words in the 40-word post-table sentence. Its pre-table score **−187.64699321** has 6/33 lexical matches and produces no coherent original unknown passage. These are selected-best results over a large arbitrary phase domain; they are *especially insufficient* to authenticate a key.

Forward re-encryption of a lawful inverse would be automatic for any valid start. The decisive test here is whether a **key chosen on the intact 138-rune sentence** carries legally to the independent 170-rune passage while producing GP-native words. It does not for the strongest training candidate.

## Decision

Do not pursue more freely chosen prime-start phases, arbitrary reset locations, or language-model reconstructions of the table caption under this exact historical cipher. The original source supplies a genuine reason to **skip a typed numeric field**, and the authentic p56 key/F clock is a rare well-motivated operation, but this 100,000-candidate screen gives no credible original-passage plaintext and does not select a creator key. The restriction is to the first 50,000 consecutive-prime starts, both additive signs, one uninterrupted prime key across the table, the source-fixed lexicon and English-register hypothesis. Other source-chosen operations, non-consecutive-prime keys, lost source material, non-English intermediates, and other unknown phase offsets remain open, subject to independent selection.

**Exact reproduction:** `node sims/lp2_p49_p56_ftransparent_anyphase_lexical_sft.cjs` from the repo root (Windows Node22 or another modern Node). It reads the original canonical rune corpus, real source punctuation, fixed external dictionary, asserts complete page-carried input identities, independent 85-rune solved-p56 plaintext/F positive and every result above. The 256 table is treated as a typed nonconsuming field, with no assumptions about its radix or byte payload.
