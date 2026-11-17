# LP2 historical-source quotation search: complete original word-length coverage

**Status (17 November 2026):** a source-constrained search of 1,000 Gutenberg books and all 2,896 original unknown LP2 printed words produced **no qualifying literal-length quotation**. No plaintext, cipher, creator key or destination is recovered. The next already-dispatched 10,000-book run will determine the expanded finite scope; its result is not yet known.

## Causal candidate and intended human solve path

If a Cicada author copied a relatively long passage from a historically available public-domain English book, then encrypted rune identities while retaining the manuscript's printed word boundaries, a solver could identify that passage by its unusual consecutive word lengths. This is a test for a *specific retained-word-length quotation mechanism*: it does not suppose that any source is author-selected or that a length match would itself constitute decryption. The source passage would still require a reproducible forward cipher and independent untouched-language evidence.

The original LP2 transcription has **12,956 unknown runes and 2,896 printed words**, divided into nine internally contiguous sections:

| Section (original LP2 pages) | Rune count | Printed words |
|---|---:|---:|
| p0–2 | 729 | 158 |
| p3–7 | 1,145 | 255 |
| p8–14 | 1,738 | 385 |
| p15–22 | 1,894 | 435 |
| p23–26 | 1,021 | 224 |
| p27–32 | 1,433 | 326 |
| p33–39 | 1,680 | 378 |
| p40–53 | 3,008 | 669 |
| p54–55 | 308 | 66 |

The final original transcription section is split at the 3,008-rune word boundary to respect the distinct p54 heading. Original GP29 rune counts, punctuation and across-page carried words remain untouched. English is normalized to source GP rune lengths by collapsing known `TH, NG, EO, OE, AE, IA, EA` digraphs and testing both one-rune and two-rune readings of `ING`.

## Frozen decision and execution

The source corpus is the 2014-compatible public-domain Gutenberg content as currently mirrored in the streaming `common-pile/project_gutenberg` dataset. The program tests every 12-word exact length seed in every original section against every candidate book, extends exact matches maximally on both sides, and emits only **at least 16 consecutive words containing at least 65 GP runes**. It reports the book ID, text passage, source word offset and LP2 section/offset when any qualifies. A matching passage could then be tested by source punctuation and a locked cryptographic forward transformation. A zero outcome excludes only the exact source mechanism at that threshold and within the scanned corpus.

The test was **planted-control calibrated before the source pass**: the known solved p57 PARABLE phrase matches all twenty original printed rune-word lengths under the same normalization; each of nine original unknown sections accepts a deliberately planted 30-word source span. Complete original section counts are asserted before streaming. [Original-source SFT](../sims/lp2_wholechapter_gutenberg_quote_sft.py) and [manual-run workflow](../.github/workflows/agent21-wholechapter-gutenberg-manual.yml).

**[Original-source CI run 44012075118](https://github.com/FlareZ123/liber-primus/actions/runs/44012075118), completed 04:08 UTC:**
- Input: first 1,000 Gutenberg books, 67,984,588 eligible English words.
- Complete original target: all 9 sections / 2,896 source-visible words / 12,956 runes.
- Candidate matches satisfying 16 words / 65 runes: **0**.
- Positive source fixture / 9 planted 30-word fixtures: **passed**.
- Search runtime: 113 seconds on Ubuntu Python 3.12.

An earlier [Agent14 source quotation program](../sims/lp2_hf_gutenberg_quote_crib_sft.py) had screened **four** original LP2 quotations against these first 1,000 books and likewise found no 12-word/40-rune source phrase; the present test expands the frozen source profiles to **every original unknown LP2 word**. The corpus is the same first thousand books, so these two source sweeps are not independent book evidence. Source text could have been authored fresh, edited, obfuscated, translated, drawn from a book outside Gutenberg, or resegmented into new words.

A broader **10,000-book** search was dispatched as [Windows Actions run 44014746963](https://github.com/FlareZ123/liber-primus/actions/runs/44014746963). It must be judged by its own completed logs rather than inferred from the 1,000-book result.

## Decision

The original full-manuscript profile does **not** identify an authentic passage in this screened historical collection at the declared threshold. Do not invent candidate plaintext or turn a word-length coincidence into a key. Recovering a historically source-selected book, retaining other independently visible punctuation clues, or obtaining a verified external keystream would change the research decision; open-ended shortening of the length threshold would mostly increase false positives.
