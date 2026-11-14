# Original LP2 word-start English-prefix enrichment: transition-preserving source gate

**Classification, 14 November 2026:** A finite, source-conditioned signal check motivated by an earlier all-word English-prefix finding. The original four-rune excess remains mild when the entire directed GP29 bigram graph is preserved. A stronger first-three-runes-fixed experiment gives a vocabulary-threshold-familywise tail **0.077296**. This neither selects a plaintext-bearing word nor supports a GP plaintext island; all p0–55 remain unsolved.

## Causal question and rival

The prior [p32 HOME/HOMEX whole-book lexical scan](lp2-p32-home-wordstart-english-prefix-familywise.md) reported 68 four-rune GP-English prefix matches at original printed word starts using CMUDict, compared with page-wise *unigram* shuffles (p=0.0072), while expressly warning that its null destroys the ciphertext's extreme adjacent-repeat suppression. If the apparent lexical fragments survive exact observed rune transitions rather than only the 29 rune totals, a partial readable-island model might merit an independently sourced decoder. The competing explanation is that a broad dictionary happens to label accidental prefixes in a nonprose 29-symbol output.

We froze a **different existing English word-frequency reference**, `resources/control/english_wordfreq_textblob.txt`, without choosing words after inspecting the ciphertext. Each source word is normalized to the existing GP29 spellings `K/Q→C, V→U, Z→S` and greedily tokenized for `TH, NG, EO, OE, AE, IA, EA`. This produces 28,941 GP-transliterated word types of ≥3 runes, and prefix sets of **2,479 / 7,612 / 11,956 / 13,291** unique types at lengths **3 / 4 / 5 / 6**. This lexicon is distinct from the prior CMUDict family, so do not equate their raw match counts.

## Original source and exact directed-transition null

Source files are the canonical unchanged [12,956-index corpus](../resources/liber-primus/lp2-corpus.json) and [full original page/word transcription](../resources/liber-primus/lp2-transcription.txt), checked rune for rune. The parser retains **2,896** typographic words, **175** literal full stops, **174** words following full stops, and physical page/line word continuations. Physical p50 has no runes.

Across original printed-word starts: **252** lexicon three-rune prefixes, **27** four-rune prefixes, **one** five-rune prefix and **one** six-rune prefix. Four follow a full stop. The sole six-rune prefix is GP **PENTHOU** (physical p15 rune offset52), embedded in the nine-rune ciphertext word `PENTHOUIIAR`, whose first six runes resemble `PENTHOUSE`. This is source *ciphertext* and no plaintext assignment is inferred.

For an exact source-transition null, hold all 55 physical page starts/ends and the **complete 29×29 ordered original adjacent-rune transition count matrix independently per physical page**. Randomize the outgoing directed edges and construct a valid Euler trail (iterative Hierholzer), then apply the *unchanged* original word-start offsets and fixed dictionary. This preserves the entire page's rune histogram, ordered bigram frequencies, all **86** within-page equal-pair occurrences, page lengths and printed boundary coordinates, but randomizes higher-order paths. Seed `0x33013279`, **1,200** draws.

| Exact-transition statistic | Original | Null mean | Null SD | ≥original / 1,200 | One-sided add-one tail |
| --- | ---: | ---: | ---: | ---: | ---: |
| ≥3-rune prefixes | 252 | 246.4725 | 13.2504 | 423 | 0.35304 |
| ≥4-rune prefixes | 27 | 17.7800 | 4.0624 | **23** | **0.01998** |
| ≥5-rune prefixes | 1 | 0.6767 | 0.7684 | 620 | 0.51707 |
| ≥6-rune prefixes | 1 | 0.0158 | 0.1248 | 19 | 0.01665 |
| ≥4-rune prefixes immediately after periods | 4 | 1.0492 | 1.0591 | 30 | 0.02581 |

The original four-rune excess is consequently *not completely explained by* page-local first-order transition counts under this exact random-trail ensemble. This alone does not establish meaningful English content, since the family of inspected prefixes, lengths, dictionaries, word locations, and historical hypotheses was not fixed before seeing the source and Euler trails do not preserve longer-range dependencies.

## Stronger first-three-original-runes-fixed test

As a direct check of the fourth rune's lexical completion, leave **all 1,645 words of ≥4 runes' first three original GP29 symbols untouched**. Estimate the fourth-symbol distribution from the untouched *whole-book original page-internal* first-order transition matrix. For each original three-rune prefix, the fixed existing TextBlob reference supplies a set of allowed fourth glyphs. The conditional success probabilities can be computed exactly without selecting a source word after observing its fourth glyph.

Test eight word-frequency cutoffs **1, 2, 5, 10, 20, 50, 100, 500** and compute independent Poisson-binomial upper tails per threshold. The eight tests are correlated; correct the resulting threshold selection using **20,000 Monte Carlo draws** of a single fourth symbol per original word, shared across all cutoffs, from its fixed third-symbol transition row. Under `xorshift32` seed `0x3301009e`, **1,545/20,000** draws reach the largest original standardized excess over the eight thresholds, yielding the **add-one familywise tail 0.0772961352**.

| Minimum reference word count | Eligible first-three prefixes | Original four-rune hits | Null mean | Uncorrected one-sided tail |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 185 | 27 | 19.464 | 0.04315 |
| 2 | 161 | 21 | 14.889 | 0.06064 |
| 5 | 132 | 12 | 10.726 | 0.38475 |
| 10 | 112 | 10 | 8.192 | 0.30035 |
| 20 | 89 | 7 | 5.657 | 0.33563 |
| 50 | 65 | 5 | 3.022 | 0.18255 |
| 100 | 48 | 5 | 1.993 | 0.04699 |
| 500 | 11 | 2 | 0.365 | 0.04902 |

The familywise result is specific to these eight frequency cutoffs, this lexicon and this first-order conditional null. It is **not** a manuscript-wide or discovery-wide p-value. The conditional model fixes first-three symbols rather than resampling coherent whole-page trails, so the two diagnostics answer related but distinct questions. Both are empirical restrictions on a hypothetical partial-GP-English interpretation, not evidence for any inferred cipher.

## Decision

Retain the image-backed PENTHOU and HOME occurrences as real ciphertext spellings, with no source-authenticated English plaintext status. The broad fourth-rune familywise result does not justify a new source-free decoder or adjusting key positions around apparent words. A genuinely new path would need a *separate, preselected original manuscript instruction* that chooses a target word, key, operation or withheld plaintext segment. Stop expanding dictionaries and lexical cutoff families without such a selector.

**Reproduce:** [Node22 CommonJS single-file test](../sims/lp2_wordstart_prefix_markov_sft.cjs). It validates the complete original corpus, constructs exact Euler-trail controls, computes exact Poisson-binomial tails, and checks the seed-locked 20,000-draw threshold-family correction. This produces no unknown plaintext and makes no change to the [authoritative research state](../results/README.md).
