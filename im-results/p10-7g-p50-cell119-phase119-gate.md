# p10 “7 G” → p50 cell119: source cross-link and direct-key gate

**Status: provisional original-artifact clue plus a bounded negative consumer test. No unknown LP2 plaintext, authentic key, complete cipher, endpoint, or final destination is recovered.** The multiplication and downstream use remain hypotheses.

## Source-led selector

Original physical p10 (resources/liber-primus/27.jpg) prints an isolated decimal **7** followed by a complete one-rune word **ᚷ (G)** at page-local rune offset **169**:

~~~text
... ᛋᛒ-ᚠᛞᛇ-ᚩᚦᛏ-7-ᚷ-ᛚᛄᛖᚫ ...
~~~

The hyphens in the transcription mark word boundaries, not arithmetic operators. This is the only isolated decimal numeral inside ordinary unknown-page prose; the other five digits (1–5) are numbered-list labels on pp36–38. In Gematria Primus, G has zero-based index 6, one-based ordinal **7**, and associated prime **17**. A plausible, but not explicitly printed, multiplication gives (7	imes17=119). Earlier Cicada stages used source-visible arithmetic products, making this a plausible human attempt rather than an authenticated instruction.

## Three original locations selected by 119

1. The only two isolated red three-rune spans in the original LP2 ink annotations are on p3 and p39, both at page-local rune offset **119**, bracketed by red 13-dot marks. The previously established solved-LP1 GP29 Atbash outputs are **SCY** and **UDP**; SCY can spell SKY under the manuscript's C/K transliteration ambiguity. This is the pre-existing result in [the red119 report](lp2-p3-p39-red119-atbash-sky-udp.md), not a new decryption by this experiment.
2. The original p49–p51 numerical table contains 32×8 = 256 two-character tokens in physical row-major order. Its one-based **119th** cell is physical **p50 row 5, column 7**, token **0Z**. Under the conventional base-60 alphabet, 0Z = 35; (35mod29=6), which maps back to **G**. Also, (35=5	imes7), equal to that cell's page-local row×column coordinates.
3. The coordinate check is conditional: if the table is numbered as one continuous 32-row object, the same cell is global row 15, column 7, and 15×7 is not 35. Page-local row numbering is a natural visual reading of the printed p50 segment, but is not explicitly labelled. The token 0Z also occurs at cell 96, and ten table cells reduce to GP index 6; the G residue alone is therefore not unique. The 119th-cell lookup is unchanged by the specific base59 alternative that omits lowercase f, because 0Z uses neither f nor a later lowercase digit.

The five numbered-list controls do not reproduce the same fixed-point relation: their first following runes and prime products are L/73, N/58, D/267, NG/316, and H/115. The products 267 and 316 lie outside the 256-cell table; the in-range lookups do not reduce to the corresponding rune. Only the isolated p10 7–G pair yields the 119th-cell G return.

## Direct whole-book consumer: negative

The simplest source-shaped use of the pointer is to start the existing 256-byte p49–p51 table at its one-based 119th entry, reduce each byte modulo 29, and use that period-256 sequence as a continuous additive/subtractive GP29 key over the original p0–p55 rune stream. This tests exactly one phase, both standard signs, and no fitted reset, reversal, or permutation.

Inputs were pinned by Git blob IDs in the reproducer: LP2 corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, base60 grid 4698c0806e6bab06a39cfbc3c3283b862de58b35, 256-grid 39c4f098566fc5eba9d6738416a2fd193f800701, transcription 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7, ink annotations 3c52f209ce6bd7b138eaa2d4a9323526952ba9f9, and Gibran control df260a07d56bf5998d40a6360b6132c35c252d10.

| Measure | Raw ciphertext | Phase-119 C−K | Phase-119 C+K |
|---|---:|---:|---:|
| Mean native-GP trigram log score | −12.27632833 | −12.30534017 | −12.30229465 |
| Index of coincidence | 0.03447840 | 0.03446621 | 0.03448477 |
| Complete non-overlapping 256-rune windows | — | 50 | 50 |
| Windows at or below worst held-out native-GP window (−9.22531953) | — | 50/50 | 50/50 |

The native-GP control contains 62,696 runes; the first 40,000 train the smoothed trigram model, and 22,441 held-out 256-rune windows calibrate native-language scores. Every one of the 50 full candidate windows under either sign scores below even the worst native window. Against 512 deterministic shuffled permutations of the same key multiset, the fixed phase scores are not exceptional: add-one upper-tail p=0.7797 for C−K and p=0.7836 for C+K. Exact inverse round trips and both planted native-GP sign controls pass; those validate implementation, not key identity.

## Additional global-coordinate reading: a 48×35 chapter shape

A second, explicitly provisional reading treats the isolated p10 token pair “7 G” as a global table coordinate: row 7, column G (the seventh column, with A–H inferred rather than printed). In the continuous 32×8 p49–p51 table, global row 7 / column 7 is \`2a\`, base-60 value 156, and \(\varphi(156)=48\). The existing prime-product path \(7\times17=119\) selects the one-based 119th cell \`0Z\), base-60 value 35. These two readings therefore give

\[
48\times35=1680,
\]

exactly the p33–p39 rune count.

This is a structural hypothesis, not a decipherment. The table has no printed A–H column labels or global row numbers. The \(\varphi=48\) factor is also not rare within this table: 13 of 256 cells have totient 48, and the token \`2a\` itself occurs three times (global coordinates row 2/column 3, row 7/column 7, and row 24/column 2). Thus the 48 factor is not an independent selector; only the assumed global 7G coordinate picks this particular occurrence, and that coordinate convention is not printed. A p50-page-local row-7 / column-G reading instead selects \`1C\` (72), whose totient is 24; the 48 factor depends on treating the three printed pages as one continuous grid and using its global row origin.

Two simple consumers of the 48×35 shape were tested against the original 1,680-rune chapter, transferring the authentic p56 prime-minus-one schedule as an explicit hypothesis:

| Candidate | Fixed operation family | Best GP bigram log score | Raw chapter | Held-out native GP |
|---|---|---:|---:|---:|
| One 48×35 rectangle | Row-major/column-major transpose, both layer orders, both signs, literal-F skip on/off | −4.616359 | −4.707453 | −2.656791 |
| 48 consecutive 35-rune blocks | Each block is 5×7; historical 2014 column order 1736254 or its inverse, both layer orders, both signs, literal-F skip on/off | −4.608520 | −4.707453 | −2.656791 |

Neither output contains recoverable language; both remain near the ciphertext baseline and far from native English. Exact planted round trips pass for both layer orders, so the negative result is not explained by a broken inverse.

For the blockwise candidate, all 5,040 possible seven-column orders were exhaustively enumerated. For each order, the maximum score over the eight non-key choices (two layer orders × two signs × two F rules) was retained. The observed maximum for the two historical key conventions has familywise add-one upper-tail \(p=0.153\). The historical order is therefore not exceptional under this test; the modest score improvement does not identify it as the intended key.

The independent 5×7 magic-square tensor inverse is already negative in [the p33–p39 tensor report](lp2-p33-39-stage10-magic-tensor5x7.md). The p50 pointer-chase also does not provide a new selector: the two p10-derived starts enter the already documented dominant 11-cycle, whose basin contains 252 of 256 states ([pointer-cycle gate](lp2-terminal-ps-prime-mean-dual-pointer-gate.md)).

**Decision:** retain the 48×35 factorization as a provisional structural hypothesis only. The direct phase-119 period-256 table key fails; the global 48×35 transpose plus p56 prime schedule and the blockwise historical 5×7/7-column consumer also fail to recover native language. The exhaustive permutation comparison gives no evidence that the historical column order is exceptional. Do not expand into arbitrary phases, row/column permutations, or additional cipher layers without a new source clue selecting them. The 7G coordinate reading remains unverified, and the p3/p39 SKY/UDP interpretation still has no source-selected consumer; do not infer a port or send network traffic.

## Reproduction

Run from the repository root with Node.js 22:

~~~sh
node sims/lp2_p10_7g_p50_cell119_phase_sft.cjs
node sims/lp2_p10_7g_48x35_gate_sft.cjs
~~~

The script verifies source blob IDs, all six printed-number controls, the exact 119th table token and page-local coordinate match, both red-triad offsets, the full 12,956-rune ciphertext, native-GP control, fixed phase-119 inverses, planted positives, and the deterministic shuffled-key null.
