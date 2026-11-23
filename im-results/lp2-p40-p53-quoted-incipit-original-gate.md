# Two 14-word LP2 quotations share a source-unique five-word opening-length pattern

**Classification (23 November 2026):** Reproducible, original-image-compatible **provisional repeated-incipit crib hypothesis**. This establishes a specific cross-page structural coincidence and a 21-rune test receiver. It **does not recover plaintext, establish that the two openings contain the same words, authenticate a cipher/key, or locate Cicada's destination**.

## Human-visible source clue and frozen observation

Physical LP2 **p40 (archive 57.jpg)** and **p53 (archive 70.jpg)** each visibly include a quoted passage. The seven-span quote inventory in `resources/liber-primus/lp2-quote-punctuation-spans.json` records their respective global unknown-text rune offsets `[9811,9869)` and `[12522,12592)`. The original 2400×3600 source scans show the quotation typography; the span endpoints themselves remain a **derived transcription annotation**, not an independently authenticated plaintext claim. Physical p40 local quote start is rune171; p53 local start is rune53. The complete runic ciphertext comes from `lp2-corpus.json`, and the actual printed word boundaries come from `lp2-transcription.txt`.

Both source quotations contain **14 complete printed words**. Their exact GP29 *rune* lengths (not Latin transliteration character lengths) are:

| Source | Complete 14-word length tape | Rune total |
| --- | --- | ---: |
| p40 quote | **5 7 2 3 4** 6 4 3 3 4 4 4 5 4 | **58** |
| p53 quote | **5 7 2 3 4** 10 3 9 7 3 7 4 3 3 | **70** |

The shared prefix is exactly **five complete words, 21 runes**. The sixth word's rune length differs. Parsing all **2,941** complete words in the entire 58-page LP2 transcription, including the solved last two pages, finds the exact length-five sequence `[5,7,2,3,4]` **only twice**, at the two quoted starts. Among all **seven** annotated quotations, only these two have an equal first-five-word length pattern.

This is a stronger observation than noticing five short lengths in isolation, since **the same two 14-word quoted scopes select those two corpus-unique openings**. A human puzzler could notice quoted reuse without needing any crypto key or a guessed English phrase.

## Finite original-layout and external native controls

Condition on exactly the observed **14 complete words** and **58 or 70 total GP29 runes**, then compare the first five word lengths. All 14-word contiguous source windows give:

| GP-native text | 14-word windows totaling58 | 14-word windows totaling70 | Cross-pairs with the same first-five lengths | Pair fraction |
| --- | ---: | ---: | ---: | ---: |
| Original LP2 full word tape | 130 | 80 | **1 / 10,400** | **0.000096154** |
| Gibran, *The Prophet* | 620 | 168 | 7 / 104,160 | 0.000067204 |
| Emerson, *Essays, First Series* | 3,671 | 1,301 | 194 / 4,775,971 | 0.000040620 |
| Shakespeare, first 300k chars | 2,580 | 515 | 39 / 1,328,700 | 0.000029352 |

The single matching original pair is precisely the p40/p53 quoted pair. These finite pair fractions are **conditional baselines**, not posterior probabilities that the quote contents are identical. The external sources use the repository's existing GP29 native transliteration-normalization procedure.

As a *within-seven-quote family* check, independently sample a source window of the same **word count and rune total** for each of the seven actual quoted scopes. Compute the probability of a matching five-word prefix for every eligible pair of quoted windows (both have at least five words). The ten pairwise finite fractions sum to **0.0054679614**, giving a valid union upper bound **under this explicitly specified independent-uniform-window null** for any quote pair matching a first-five length tape. The conditional null fixes a five-word prefix test after observing it, so the bound does **not** correct for every broader motif or mechanism searched by previous agents. Do not present it as an authored probability or independent evidence of plaintext identity.

## The new 21-rune original-cipher conditional receiver

Under the testable hypothesis that the two printed quoted openings encrypt the **same five plaintext words in the same order**, let `C40[i]` and `C53[i]` denote the **21** untouched original GP29 rune indices.

The original modular differences `(C40[i]-C53[i]) mod29` are:

```text
1,9,7,16,2,10,19,26,27,23,9,5,2,16,26,19,14,27,0,1,11
```

Thus a repeated plaintext under any additive cipher `C=P+K mod29` would require the **exact difference of the two authentic key streams** to equal this vector. This is a compact, fixed original-input target for any *independently selected* proposed state/key operation. Full inverse, source-defined state/recovery and continuation beyond this 21-rune prefix are still mandatory before asserting plaintext.

The 21-rune packets have **8 versus 4** within-packet equal-symbol pairs, with **zero coincident pair coordinates**. If the hypothetical five-word plaintext really is identical, no two **quote-stationary bijective rune substitution tables** (even wholly independent secret 29! alphabets) can produce the observed pair. An evolving per-rune state, cross-position transport or different plaintext remains possible.

For a shared **periodic additive** secret with arbitrary values, model the observed differences as graph constraints `K[(a+i) mod m]−K[(b+i) mod m]=D[i]` over GF29. The earliest solvable period is **22** using continuous unknown-book-global starts 9811/12522, or **23** using genuine p40/p53 local starts 171/53; every shorter period is algebraically contradictory. Resetting the same key at both quote openings makes `D[i]=0` mandatory and fails immediately. These are **conditional shared-plaintext/periodic-key restrictions**, not a generic exclusion of short keys with different page seeds or changing state.

The authentic solved-p56 direct prime-totient additive key `K[j]=(prime[j]-1) mod29` agrees with the original difference vector at only **2/21** positions for either global or page-local no-skip clocks (and **1/21** for a quote-local shared reset). The actual p56 plaintext-F-transparency rule permits an F skip in the shared opening **only at rune index18**, where both original ciphertext packets carry F; there are exactly two possible shared skip masks (none, or index18). Across global, page-local and quote-reset clocks, the two signs and both skip masks, **no complete 21-rune shared plaintext is possible**; the maximum number of equal decoded positions is **3/21**. This rejects direct transfer of that particular solved cipher to this hypothetical repeated opening, while leaving other operators and different plaintext open.

## Decision and next experiment

This is a **promising crib selector**, since the original manuscript independently selects two related quote openings rather than requiring a solver to hunt arbitrary word positions. To advance it toward plaintext:

1. Identify an actual earlier-Cicada or original-page instruction naming a **quote-specific changing-state key, stream operation or alternate register**. Use its source-selected rule to predict the locked 21-rune difference vector, before adjusting parameters on the two quotes.
2. If any operation matches all 21 GP29 differences, decode the opening and require **linguistically credible identical words** in both, the source's correct word boundaries, **exact forward replay**, and a withheld continuation or third quote prediction. With a key difference alone, absolute plaintext may still be underdetermined.
3. If a source-selected operation fails, retire that *exact model* without rescuing it through arbitrary new resets/offsets. A repeated five-word *length pattern* can simply be two different plaintext phrases.

**Reproduction:** `node sims/lp2_quote_parallel_incipit_sft.cjs` (Node22/CommonJS, only built-in modules, strict original and native-control assertions). Canonical files above remain unchanged. This report is deliberately in `im-results/` pending plaintext or a source-selected mechanism.
