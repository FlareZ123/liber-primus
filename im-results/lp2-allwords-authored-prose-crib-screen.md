# Entire unsolved LP2 word-length crib screen against fixed prose and Cicada LP1

**Original-cipher candidate-plaintext screen, 11 November 2026, Agent 42:** none of the four frozen sources supplies an uninterrupted ≥12-word passage with exactly the same original word lengths as any portion of the complete 2,896-word LP2 ciphertext. This is a bounded known-text search; it neither decrypts ciphertext nor rules out original authored prose or other books. The code recovered a planted 16-word reference passage inside an otherwise untouched original-LP2 word-length sequence.

## Source-motivated question

A conventional word-preserving polyalphabetic cipher could leave whitespace and the lengths of the original GP-rune words unchanged. If the unknown manuscript borrowed an extended passage from **Cicada's own solved LP1**, **Gibran's The Prophet**, **Emerson's Essays** or a **Shakespeare excerpt**, a long, contiguous match in *word lengths* would select an independently sourced candidate plaintext crib, subsequently requiring actual rune-level cipher authentication. The sources are already preserved under `resources/`; no web guesses or missing books are fetched.

The canonical parser `sims/lp2_word_pages.cjs` normalizes printed line and page wraps and finds **2,896 words containing 12,956 unknown runes**. For each of the four fixed sources, use two explicit orthographies: raw Latin-letter word lengths, and the historical greedy GP rendering that contracts `TH NG EO OE AE IA EA` into one rune each. Remove only LP1 editorial markdown headings and bracketed editorial notes. Build an exact eight-word length-vector index from the *whole* unknown ciphertext, search the whole original source in order, and maximally extend any eight-word matches in both directions. Record source and LP2 positions, original page, and full matching text. No cipher keys, arbitrary plaintext guesses, edits to the book, or language-model re-ranking enter this screen.

## Exact executed outcomes

[Successful full-source CI run 42973182756](https://github.com/FlareZ123/liber-primus/actions/runs/42973182756) runs the [standalone CommonJS source screen](../sims/lp2_allwords_reference_length_crib_sft.cjs) on Node 22, with a planted **16-word GP-encoded Shakespeare sequence** injected at known LP2 word index 1,000. The same exact search recovers the planted source starting at Shakespeare word 900 for a stretch of **at least 16 matching words**.

| Frozen reference | Word count | Longest exact raw-letter length match | Longest exact greedy-GP length match |
| --- | ---: | ---: | ---: |
| Gibran, *The Prophet* | 15,733 | **9** | **9** |
| Emerson, *Essays* | 77,932 | **10** | **9** |
| Shakespeare excerpt | 55,407 | **9** | **9** |
| Cicada's solved LP1 | Repository reference, including headings removed | **0 at ≥8** | **0 at ≥8** |

The longest 10-word raw-letter matches are original LP2 **physical p17, word 910** versus Emerson word 72,743, beginning “THOUGHTS AND LAWS IN HIS OWN BREAST HE STUDIES THE,” and **physical p46, word 2,514** versus Emerson word 48,612, beginning “THE GOOD MAN WILL BE THE WISE MAN AND THE.” Neither continues beyond ten words; the same LP2 regions do not show a corresponding stronger GP-contracted match. These are low-specificity word-length coincidences across a large trial corpus. They do **not** establish that the letters or meaning correspond to the manuscript.

## Cryptanalytic decision

No complete long source crib is available from these four exact corpora under the two frozen orthographic rules, despite the explicit planted-recovery control. Further quotation searches need a source-visible author, book or independently identified candidate passage. Treat a mere ten-word length match as an exploratory index only; do not optimize a key around it. This leaves independently authored text, other languages, abbreviation/normalization changes, transformed word boundaries and any candidate cipher mechanism open.
