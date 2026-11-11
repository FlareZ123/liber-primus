# Rich punctuation and quote-span channel gate

## Why this lane matters

The canonical LP2 solver stream erases part of the book's presentation layer. The richer relikd transcription preserves three punctuation identities and seven explicit double-quote spans that are absent or conflated in the canonical text:

- `⁘`: 145 sentence marks
- `⁚`: 4 paragraph/comma marks
- `⁜`: 31 section/chapter marks
- 14 double quotes delimiting 7 spans, 405 runes total

The rune stream itself agrees with the canonical transcription across the 12,956 shared unsolved runes, so this is a finite presentation-channel test rather than a competing ciphertext transcription.

## Seven quote spans

The quote-delimited plaintext word-length signatures, measured in runes, are:

1. 18 runes, 4 words: `[6,3,3,6]`
2. 19 runes, 5 words: `[3,3,4,5,4]`
3. 12 runes, 2 words: `[3,9]`
4. 58 runes, 14 words: `[5,7,2,3,4,6,4,3,3,4,4,4,5,4]`
5. 68 runes, 13 words: `[9,8,3,4,6,3,10,2,4,7,6,2,4]`
6. 160 runes, 33 words: `[4,2,4,6,6,8,8,8,5,9,2,2,4,3,3,2,8,4,7,4,4,3,2,5,3,3,6,3,11,4,4,8,5]`
7. 70 runes, 14 words: `[5,7,2,3,4,10,3,9,7,3,7,4,3,3]`

The long signatures were searched against roughly seventy distinct literary, religious, philosophical, occult and Cicada-adjacent texts already curated in the public `Dukotah/cicada3301` key corpus. English words were converted to approximate GP rune lengths by greedily collapsing `TH, NG, EO, OE, AE, IA, EA` and normalizing V→U / K→C. No exact long-span quotation match appeared. The 33-word span's best squared length-distance remained about 98, far from an identity match. Short spans naturally produced many accidental exact length matches and are non-discriminating.

This does not prove that no quotation source exists. It rejects the obvious hypothesis that the long marked spans are verbatim quotations from the project's standard source-text candidates.

## Standalone selected-stream test

Concatenating all seven quoted spans gives 405 ciphertext runes.

- quote IoC: **0.033797824227**
- surrounding unsolved stream IoC: **0.034482625665**
- quote doublets: **2 / 404 adjacencies**
- repeated quote-stream 4-grams: **0**
- repeated quote-stream 5-grams: **0**

The selected stream remains flat and doublet-suppressed like ordinary LP2 ciphertext. It does not reveal a second plaintext-like channel.

## Literal punctuation-token encoding

The 180 rich punctuation tokens are heavily dominated by ordinary `⁘` marks (145/180). Exhaustive direct base-3 encodings over the three observed symbols were tested across symbol permutations, stream direction, grouping phase and digit direction. The resulting byte strings are repetitive non-language. No source-selected standalone punctuation message appeared.

## Solved-mechanic reset gate

The strongest remaining use of the presentation layer is as a keystream reset signal. A finite test therefore restarted only already demonstrated Cicada mechanisms at visible marks:

- Vigenere `DIVINITY`
- Vigenere `FIRFUMFERENFE`
- consecutive prime-totient stream `phi(p_i)=p_i-1`

Reset sets tested:

- no reset
- `⁜` only
- `⁘/⁚/⁜`
- quote marks only
- `⁜` plus quotes
- sentence punctuation plus quotes

Each keyed family was tested with and without the literal all-F non-advance convention. English fitness used the same public KJV-weighted quadgram table employed by the validated Dukotah solver.

The untouched ciphertext baseline scored **−7.44015** per quadgram. Every transformed case was worse. The best transformed result was `FIRFUMFERENFE` with no reset/no F-skip at **−7.47551**. The best actual boundary-reset case was `DIVINITY` with `⁜ + quote` resets/no F-skip at **−7.48705**. No candidate approached the repository's readable-English regime near −4 to −5.

## Consequence

The rich punctuation is real information that the canonical solver stream loses, but three direct uses are now bounded negative:

1. punctuation as a standalone ternary message;
2. quote-delimited runes as an independently readable ciphertext channel;
3. visible punctuation/quote marks as reset points for the already solved Vigenere or prime-totient mechanisms.

The quote marks most plausibly encode discourse structure such as direct speech or emphasis. Their word boundaries remain useful as future cribs if an independently motivated key family appears. Do not reopen a generic punctuation-reset sweep without a new cipher generator or a source-derived rule for how the mark changes state.
