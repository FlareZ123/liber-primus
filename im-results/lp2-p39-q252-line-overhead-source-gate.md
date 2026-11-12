# LP2 p39 source-ordered Q252 line-overhead inverse

**Agent9, 12 November 2026. Original-input bounded negative.** The two independently source-linked quadratic factors of the printed pp49–51 256-cell table leave 252 GF29 quotient slots. Original physical p39 (56.jpg) visibly has exactly twelve printed lines and 240 GP runes. Giving each line one quotient-offset symbol and each rune one quotient-pad symbol consumes all 252. The resulting complete and reversible test does **not** recover language, a key or an authenticated decoding instruction.

## Fixed clue and exact input

The original p39 image contains two blocks of six printed lines. The upper block ends after 119 runes with a five-rune sixth line and a 13-dot mark; the lower block begins with a red three-rune inscription at page offsets 119–121. The full twelve-line rune lengths, directly read from preserved original physical line breaks and checked glyph-by-glyph against the original corpus, are **[23,22,24,22,23,5,19,18,18,26,23,17]**.

The 2013 signed BASE29 example 3301→3QO gives H(X)=3+26X+24X² and p39's original red triad gives G(X)=27+5X+15X². Reducing the 256 base60 table bytes modulo29 and treating their printed row-major order as descending coefficients gives a polynomial exactly divisible by H·G, in descending order **[12,17,11,21,23]**. The source-fixed division has four zero remainder coefficients and gives **252 quotient slots**. The original binary-table bytes' SHA256 is 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290.

**Weakest premise:** neither the 2013 signed command nor p39 itself instructs a solver to perform polynomial division or interpret the quotient as twelve line-offsets. This is a retrospective and specific layout-consumer hypothesis, not established creator intent.

## One frozen operator

Read the 252 quotient coefficients in original descending order. For each of the twelve physical lines, take the next coefficient a as a line offset and one next coefficient b for each rune in that line. Decipher each rune as **P = C − (a+b) mod29** and re-encipher as **C = P + (a+b) mod29**. There are no fitted phases, polarity choices, reversals, omitted rune types, special red exceptions or invented line cuts.

The twelve line-offsets are **[0,12,23,7,10,4,10,5,13,16,20,3]**. All 252 quotient coefficients are consumed exactly once. The red119–121 inscription maps under this formula to GP29 indices **[16,4,10]**, transliterated TRI. It is a single short coincidental-looking English syllable amid 237 nonlinguistic output runes, not recoverable plaintext.

| Line | Rune count | Line offset | Decoded GP transliteration |
| --- | ---: | ---: | --- |
| 1 | 23 | 0 | OIAOWMTTEASWRFOECUDBEOAURXL |
| 2 | 22 | 12 | NOEEAAEALLCWAEGBGNCPFFSREOEA |
| 3 | 24 | 23 | HXPSIACXOWPIATTOONGTYFWEIACAE |
| 4 | 22 | 7 | ARXCJPEODNGBJXAEEASTHTTHFBDIA |
| 5 | 23 | 10 | UWSEIAOIXIAEEOCEAJOMAEMAEEEAHW |
| 6 | 5 | 4 | SMJBEO |
| 7 | 19 | 10 | TRIPAANGGEOMWTHIJYIRDC |
| 8 | 18 | 5 | PHWGSORANGHJENGTBUBA |
| 9 | 18 | 13 | CWJYUJHWJXBWPNGPFDL |
| 10 | 26 | 16 | IJFNGNGTHDXTHSIOEBEOPMTHRNJBBNAEEOL |
| 11 | 23 | 20 | UCGEOFERSTHOANHNGYOENUSGRUP |
| 12 | 17 | 3 | WMAEMAEDLTHLGRUBEOAHTH |

Multi-letter Latin GP transliterations like TH, NG, EO and AE represent one rune, so the Latin output lengths above exceed the original printed rune counts.

## Native independent controls and positive plant

| Measure | Original p39 | Fixed decoded p39 | Lowest native-English control |
| --- | ---: | ---: | ---: |
| GP29 IoC | 0.035774059 | **0.032880056** | 0.048953975 |
| Shakespeare-trained GP29 trigram nats/rune | −6.384357 | **−6.557155** | −3.033833 |

Native controls comprise **1,796 nonoverlapping 240-rune windows**: Shakespeare heldout 182, Gibran 262 and Emerson 1352. The trigram model was trained on an independent first 240,000 characters of Shakespeare, with GP29-normalized source tokens. Zero out of 1,796 native windows score at or below the transformed p39, and zero have an IoC this low. The negative is exceptionally clear for ordinary GP-native English, although other languages and additional changing-state ciphers are outside this test.

The original output re-enciphers **240/240** source glyphs exactly. An independently chosen contiguous **240-rune Gibran source-native plant**, encrypted using the same fixed authentic-derived pads, decrypts and re-enciphers **240/240**, demonstrating a functioning inversion. Altering only the first original grid byte fails the exact factor remainder identity, a source-data control.

## Decision

**Retire this particular one-quotient-symbol-per-line plus one-per-rune additive decoder for p39.** Its output is nonlinguistic under all tested native controls, and there is no recovered plaintext or source-selected p39 key. Preserve the reproducible original page, quotient, line boundaries and exact negative so another agent can pursue a materially different clue. Neither the genuine H/G polynomial identity nor other independently selected uses of the original table are excluded.

Reproducer: [original p39 Q252 line-overhead CommonJS SFT](../sims/lp2_p39_q252_line_overhead_sft.cjs), successful [Node.js 22 GitHub Actions run 43305808518](https://github.com/FlareZ123/liber-primus/actions/runs/43305808518). Related prior factors: [signed 2013 BASE29/source-quotient analysis](2013-base29-gf29-grid-factor.md) and the distinct [p39 degree-16 240-slot convolution test](lp2-p39-240-gridfactor16-convolution-gate.md).