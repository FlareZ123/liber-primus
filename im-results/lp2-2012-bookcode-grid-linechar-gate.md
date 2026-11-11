# The historical 2012 Cicada book-code operation does not directly decode the 256-byte LP2 table

**Decision, 11 November 2026 (Agent 36):** Reusing the documented 2012 `line:character` book-code operation directly on adjacent byte pairs of the LP2 physical pp49–51 table fails a necessary source-index test. Only **14/128** pair addresses exist in the archived *Agrippa* text and **36/128** exist in the archived *Encyclopaedia Britannica* volume, versus **20/20** and **19/19** valid addresses in the corresponding original historical book codes. This is a bounded, reproducible negative for one real earlier-Cicada operation applied to the later author's printed numeric table. No LP2 plaintext, authentic key, or continuation is recovered.

## Human solve-path premise and sources

The 2012 [archived original book-code solution](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2012/006-two-book-codes/README.md) identifies two actual texts: the 1911 *Encyclopaedia Britannica* 11th edition, volume 6, slice 3 (*Chitrai–Cincinnati*), and William Gibson's *Agrippa*. The participant archive preserves both the original `line:column` input coordinates and the [exact Python decoding routines](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2012/006-two-book-codes/books). The two solutions were historical onion addresses; their use as a later cipher key is a hypothesis, not an instruction.

The original LP2 pages 49–51 visibly print 32 rows of eight two-digit sexagesimal tokens. The established byte representation gives a source-ordered **256-byte** grid. A human remembering the earlier coordinates could read four **(line, character)** pairs per printed eight-cell row, creating a direct 128-character book-code candidate without guessing a private key. The operation and two book references are independently documented, but treating each numeric byte as one coordinate is a *new, unsupported transfer*. The test fixes this simplest direct pairing rather than optimizing row orders, source books, or digit orientations against expected plaintext.

Original inputs:

- [32×8 table](../resources/liber-primus/base60-grid.json), Git blob `4698c0806e6bab06a39cfbc3c3283b862de58b35`, preserved printed row-major 8-byte entries. Base60 byte reduction is a preexisting derived interpretation, not an original author-verified byte encoding.
- Historical participant [Agrippa source](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2012/006-two-book-codes/books/agrippa.txt), Git blob `673ba225d1277945f2d2e5056bf025db8e89bb92`. The archived 2012 program skips the first five source lines; literal source pair `L:C` chooses zero-based line `L−1` thereafter and column `C−1`.
- Historical [Britannica source](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2012/006-two-book-codes/books/31447.txt), Git blob `8cba4356812ff852e3fe9c88e80ab1e9b5b8670c`. The archived program locates the first literal `CICADA` line, at source zero-based line **15,388**, then chooses line `heading+L`, column `C−1`.
- The exact [numeric source-line widths and original historical coordinates](../resources/derived/2012-bookcode-linewidths.json) preserve this test independently of later link availability. No copyrighted book prose has been reproduced.

The historical `L:C` references are strictly positive. A zero line or zero column is invalid under both original book-code conventions. For the original LP2 table, first row bytes are `[203,231,167,186,97,237,126,183]`, interpreted as addresses `(203,231)`, `(167,186)`, `(97,237)`, `(126,183)`. All four first-row addresses already exceed the corresponding archived book-line widths for both sources.

## Exact source-pair test and original positive control

| Source and exact historical line rule | Valid source code pairs | Original LP2 table valid /128 | Zero-coordinate failures | Character column out of bounds |
| --- | ---: | ---: | ---: | ---: |
| Agrippa: five-line skip, then `L−1,C−1` | **20/20** | **14/128** | **2** | **112** |
| Britannica: first `CICADA` heading, then `L,C−1` | **19/19** | **36/128** | **2** | **90** |

All candidate table rows are within the selected source-line interval, so the **invalid line** count is zero in both cases. Most failures are the direct character index exceeding the actual line width. The exact original 2012 coordinate lists instead fall within their respective source widths, confirming the historical coordinate rule and editions used by the test. Direct extraction from the pinned original participant texts produces the character portion of the archived outputs; reinserting the explicitly specified numeral words (`2` and `6`) reproduces the two historical book-code outputs `sq6wmgv2zcsrix6t.onion` and `eq6emgv2ehsrix6t.onion`, with the latter's source capital `H` normalized case-insensitively. This authentic-code regression supplies a real historical positive control; the grid outputs themselves are overwhelmingly non-addressable.

[Executable standalone CommonJS SFT](../sims/lp2_2012_bookcode_grid_linechar_gate_sft.cjs) verifies all **128** original byte pairs against both exact source-width arrays, the **20** and **19** historical code coordinates, both complete outcome vectors, and the first four source-grid addresses. It reads the existing canonical table and the new numeric, source-identified line-width record without network access.

## Alternative native two-digit token coordinate, original 2012 books

The first gate treats **two adjacent printed tokens** as a `line:column` pair. A second natural, independently declared interpretation instead reads **each individual two-character sexagesimal token** as its own coordinate: `L = 1 + first base60 digit`, `C = 1 + second base60 digit`. The +1 converts zero-based printed digit values to the historical book code's positive one-based addresses. This creates exactly **256** potential output characters, preserves the manuscript's printed 32×8 order and avoids any arbitrary key. The first digit of every printed byte is 0–4, so only five source lines can ever be addressed. That unusual severe restriction is a strong prediction of the model, not a tuning choice.

Under the original source editions, this yields **72/256 valid Agrippa addresses** (184 columns out of bounds) but **256/256 valid Britannica addresses**, because the first five lines after the archived `CICADA` entry have original lengths **[73,70,71,71,69]**, all longer than the maximum second-digit value of 59. The exact five public-domain source lines have been frozen in [source-derived original line evidence](../resources/derived/2012-bookcode-linewidths.json), with the document's source Git hash and heading offset. Therefore this Britannica interpretation is *syntactically valid* and merits an actual decoded-text test instead of being discarded on column admissibility alone.

The raw 256-character output, taking source characters in row-major printed order, starts ` sria Cce  tlpc yyren a dsoarde...`; reading the original 32×8 table column-by-column starts ` eydiamoe fdte,ha  saoccH...`. Both are mostly scattered letters and spaces from the limited source excerpt, with no independently meaningful plaintext. The [same standalone SFT](../sims/lp2_2012_bookcode_grid_linechar_gate_sft.cjs) now trains a 27-symbol (A–Z plus space) conditional-trigram model on the **independent pinned Shakespeare 300k-character reference**, after mapping other punctuation to spaces. Each fixed reading is compared with **1,000 deterministic Fisher–Yates permutations of the *same* 256 decoded characters**, preserving the source-specific symbol histogram as a matched null:

| Fixed original-table read order | Mean trigram log score | Null-mean / SD | Shuffle upper-tail p |
| --- | ---: | ---: | ---: |
| Row-major | **−4.65164610** | −4.69400531 / 0.15672284 | **0.4005994** |
| Column-major | **−4.59509687** | same | **0.2657343** |

The fixed `0x19331914` xorshift32 shuffle sequence, alphabet normalization, KAT-like first 21 output characters and exact p-values are checked by the reproducible SFT. Both readings remain typical of the matched character-reordering null, even though every Britannica coordinate exists. **No plaintext/key or independent confirmation of the digit-splitting rule is found.** The evidence rejects these direct English/plaintext interpretations only, not a later keyed cipher hypothetically applied to the 256-character source-derived output.

## Scope and next decision

The direct adjacent-byte pair variant fails the source-addressability gate under both exact 2012 editions. The additional each-token two-digit variant fails the Agrippa source-addressability gate, while its valid Britannica extraction behaves like random ordering of a five-line source excerpt rather than recoverable English plaintext. It says nothing about another edition, base59 as a different numerical transport, an independently specified coordinate remapping, a 2012 book used to derive a key instead of plaintext, or a genuinely new encoding of LP2's textual runes.

The transfer has no independent instruction fixing the table pairing beyond the eight-cell row layout; that is its weakest assumption. The positive historical controls demonstrate that the cheap necessary-condition gate is reliable for a real 2012 book-code input. With **92–114 of 128 adjacent-byte pairs invalid**, no additional string scoring or speculative repairs are justified in that direct branch. The separate, syntactically valid Britannica per-token readout has received its own independent matched-null decision; further decryption layers would need a primary clue selecting them. A successor needs an independently selected reversible reinterpretation of the table, not an orientation sweep intended to rescue this model.
