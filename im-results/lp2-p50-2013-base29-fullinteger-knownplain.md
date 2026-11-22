# Literal 2013 BASE29 operation on the full original LP2 256-cell numeral table

**Agent 28 · 14 November 2026. Original-input and independently solved-text decision.** The historically signed 2013 instruction **BASE29 3301 → 3QO** gives a genuine, human-executable numeral conversion. The original LP2 pp49–51 print **256 two-character base60 tokens**, 32 rows by eight. Directly converting the complete published base60 integer or ordinary 256-byte serialization into GP29 digits produces high-entropy sequences of **622** or **422** runes; per-row conversions produce **605** or **428**. A new cellwise extension (both base59/base60 and minimal/fixed-width forms) produces **490/512** runes, but its direct English-substring score is no better than a matched 10,000-permutation cell-order null, and none contains an exact p56/p57 known-text window under *any stationary secret 29-symbol alphabet*, even with arbitrary output rearrangement. No plaintext from an unknown LP2 page, original key or continuation is found.

## Source-backed operation and decisive target

The original signed 26-Jan-2013 TCP-server exercise explicitly gives `BASE29 3301 → 3QO`, with digit values [3,26,24] (see [signed protocol and verification](../resources/external/2013-tcp-server-signed-source.md)). Its instructed operation is ordinary numeral **base conversion**, not polynomial factorization or a cipher. The original physical LP2 pp49–51 (scans `66.jpg`, `67.jpg`, `68.jpg`) print 32 rows of eight two-character tokens. The pre-existing source transcription `resources/liber-primus/base60-grid.json` maps each complete token `AB` to `60*index(A)+index(B)`, and the **unchanged 256 decoded bytes** hash to SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

A puzzle solver who remembers the authentic BASE29 command could make a single integer out of the *entire* numeral table and print it in 29 symbols. For clarity, the source did **not** itself instruct this cross-era operation, did **not** declare a matching GP rune alphabet for BASE29 digits, and did **not** identify p56/p57 as the table's intended plaintext. Their complete original plaintext makes a stronger **independent fixed target** than inventing another crib or optimizing English scores.

Freeze four natural source orders without guessed keys, offsets or custom byte encodings:

1. **Whole base60 integer:** concatenate 512 printed base60 characters in original row order as one big-endian number, then expand into canonical minimal BASE29 digits.
2. **Whole 256-byte integer:** serialize all 256 original numerical tokens into bytes, view that as one big-endian base256 integer, and expand it to BASE29.
3. **Per-row base60 integers:** independently convert each of the 32 eight-cell printed rows as a 16-character base60 integer, then concatenate the 32 minimal BASE29 streams.
4. **Per-row eight-byte integers:** independently convert each of the 32 eight-byte rows as a base256 integer, then concatenate the 32 minimal BASE29 streams.

The p56 target is the **85-rune authenticated decrypted text**, reconstructed from the unchanged p56 original ciphertext using the historically established consecutive-prime totient key and the one verified literal-F pause at source rune index56. Its first ten rune indices read `ANENDWITHIN`; it is separately checked by the SFT. The p57 target is the untouched **95 original clear runes**. For an additional original-source control, also test the 85 **encrypted** p56 runes.

## Complete all-secret 29-symbol known-text gate

A direct candidate might be masked by an unknown stationary GP29 substitution, or its symbols might be in a different source-selected position order. Both possibilities still preserve the **multiset of the 29 symbol frequencies** of a complete known-text window. For every contiguous length85 or length95 substring of each proposed numerical readout, sort its 29-symbol frequency histogram and that of the corresponding independently known p56/p57 target. One half of the histogram L1 distance is a mathematical lower bound on the number of rune substitutions required for any correspondence, even after *arbitrary alphabet relabeling and arbitrary position permutation*. **Zero is necessary** for an exact complete match; no secret alphabet, window phase or within-window ordering can repair a nonzero bound.

| Original table BASE29 readout | Output length | Minimum rune repairs: p56 clear (85) | p56 ciphertext (85) | p57 clear (95) |
| --- | ---: | ---: | ---: | ---: |
| Whole 512-digit base60 integer | **622** | **12** | **2** | **12** |
| Whole 256-byte base256 integer | **422** | **12** | **2** | **12** |
| 32 independently converted base60 rows | **605** | **11** | **2** | **13** |
| 32 independently converted base256 rows | **428** | **14** | **2** | **15** |

The minimum lower-bound offsets (zero-based in the respective converted streams) are [49,200,48], [156,3,147], [5,138,103], and [32,42,36] for [p56 clear,p56 cipher,p57] respectively. **Every original window in all 12 source/target comparisons fails exact histogram identity**. The modest two-rune bound for the 85-rune encrypted p56 target does not imply a recovered fragment; the original cipher text is nearly frequency-uniform and many unrelated windows have similar histograms. A real complete match would require zero replacements before further testing exact symbol order and a plausible source operation.

The four converted whole/row registers have near-uniform GP29 IoC respectively **0.03602736**, **0.03533676**, **0.03432215** and **0.03417672**. These values provide independent language-scale context, but they are weaker evidence than the finite, *all-secret* equality obstruction against the known original texts. The bypass-to-plaintext reconstruction reproduces p56 source exactly; it does not posit the same cipher on any unknown page.

## Cellwise BASE29 extension (20 November 2026; exploratory)

The signed 2013 source specifies integer BASE29 conversion, but does **not** instruct a solver to apply it independently to the later p50 table. To test this simple extension without choosing a hidden receiver, each of the 256 p50 tokens was decoded under both still-live table radices (base59 and base60), then each cell integer was converted separately to BASE29. Two natural serializations were tested: literal minimal-width digits, and two-digit zero-padding to preserve the original two-character cell width. Both are row-major; no transposition, key, offset or receiver was added.

| Table radix | BASE29 cell serialization | GP29 symbols | English-substring score | 10,000 shuffled-cell null (mean ± SD) | z | Upper-tail p |
|---|---|---:|---:|---:|---:|---:|
| 59 | minimal width | 490 | 45 | 49.95 ± 5.12 | -0.97 | 0.860 |
| 59 | fixed two digits | 512 | 47 | 51.05 ± 5.08 | -0.80 | 0.814 |
| 60 | minimal width | 490 | 73 | 74.12 ± 5.64 | -0.20 | 0.592 |
| 60 | fixed two digits | 512 | 71 | 73.92 ± 5.38 | -0.54 | 0.731 |

The score is deliberately simple and fixed in the reproducer: overlapping hits from a 40-item common-English-trigram list plus twice the hits from a 55-item common-word list in the canonical GP29 transliteration. The null shuffles the 256 whole-cell output chunks (same values, same within-cell order and widths) with xorshift32 seed 0x3301AB25; it therefore tests whether the printed row-major cell order contributes an English-like signal beyond the exact output-symbol multiset. Every observed score is **below** its matched null mean.

A separate necessary-condition gate compares every output window with the 85-rune p56 plaintext, 85-rune p56 ciphertext and 95-rune p57 plaintext. It allows any fixed bijective relabeling of the 29 symbols and arbitrary reordering, so an exact histogram match is necessary for any such exact recovery. There are **zero exact windows** in all four variants. Minimum histogram edits (p56 clear / p56 cipher / p57 clear) are respectively **[6,8,7]**, **[5,6,6]**, **[4,11,4]**, and **[4,9,5]**. The synthetic p57 planted control under hidden affine relabeling 7x+3 mod29 passes in every run.

**Disposition:** retire cellwise BASE29 as a direct plaintext readout of p50. This does not rule out a future source-selected use of the table as a key or address, but no such receiver is specified by the 2013 protocol; do not add speculative cipher layers to rescue these nonlinguistic outputs.

## Program, controls, result and scope

The [self-contained CommonJS SFT](../sims/lp2_p50_2013_base29_fullinteger_sft.cjs) reads only the original committed numeric grid and canonical GP29 corpus, pins the byte SHA256, derives the historically printed `3QO` from decimal 3301, derives solved p56 and clear p57 target runes, checks every original input length/window minimum and verifies that each has zero exact multiset matches. A distinct **positive plant** injects all 95 p57 runes after an unknown invertible affine relabeling `(7x+3) mod29` into each full extracted stream at position17. The same key-independent test recovers a zero-repair known-text window in **all four planted controls**. No file mutation, speculative scorer, key-fitting step, or external runtime request occurs during the SFT.

**Verified manual Node22 GitHub Actions run:** [43546101334](https://github.com/FlareZ123/liber-primus/actions/runs/43546101334), through the existing manual `grid-256-tests.yml` workflow with selector `source-base29-whole`. The run completed successfully on the original committed sources.

**Decision:** Retire a **direct unsigned-integer→historical BASE29→native-GP29 known-ending-page readout** from the original numeric table under these four natural source groupings, even if a secret stationary 29-symbol alphabet and arbitrary output reordering are granted. This does **not** rule out a different original message or unknown-page plaintext, dynamic state, compression, bytewise secret transforms, field polynomial factor consumers, different table radices, or an unavailable external key. It supplies no evidence that the creators intended direct BASE29 conversion of this 2014 material; the correct next source-derived decoder remains unknown. Do not expand to arbitrary shifts/digit permutations merely to obtain a matching substring.

**Scope boundary (20 November 2026):** this all-secret gate tests full-table BASE29 readouts against known GP29 plaintext/ciphertext windows. It does not test the separate article-selected three-cell word-map route (cells 221–223 → values 52/51/151 → BASE29 1N/1M/56 → signed-2016 word positions). That route is not a native-GP29 readout and remains conditional; see the cicada row27 word-map report. The negative result above is unchanged.
