# The actual upstream source of the 2014 `sexagesimal.bin`: three transcription files

**Finding, 11 November 2026.** The May 2014 `sexagesimal.bin` is a byte-for-byte conversion of three earlier, manually transcribed page-text files. The upstream input is **256 explicitly copied two-character numerals**, not a demonstrated Cicada-specified PRNG or compact generator. An earlier source note corrects three transcription errors, but the later byte file retains the uncorrected values. **No new LP2 plaintext or authentic key** follows.

## Pinned original source and exact conversion

The [original May 11 2014 20:41 commit `19d68fbb`](https://github.com/micheloosterhof/cicada-2014/commit/19d68fbb9cff1c06d52cc0add30285199c936282) added three text transcriptions alongside the already archived 58 LP2 JPEGs:

| Filename in `stage11/ky2khlqdf7qdznac.onion/` | Two-character tokens | Git blob SHA-1 |
|---|---:|---|
| [`49.txt`](https://github.com/micheloosterhof/cicada-2014/blob/19d68fbb9cff1c06d52cc0add30285199c936282/stage11/ky2khlqdf7qdznac.onion/49.txt) | 80 | `1ae432f17099e75a8a9f5ab84040a37645632517` |
| [`50.txt`](https://github.com/micheloosterhof/cicada-2014/blob/19d68fbb9cff1c06d52cc0add30285199c936282/stage11/ky2khlqdf7qdznac.onion/50.txt) | 104 | `34cbb77d43a67679e989a466904de49622d7f480` |
| [`51.txt`](https://github.com/micheloosterhof/cicada-2014/blob/19d68fbb9cff1c06d52cc0add30285199c936282/stage11/ky2khlqdf7qdznac.onion/51.txt) | 72 | `6e9fa506375442c9126a275ef845a909449102a3` |

For each file, split at the blank line and read **only its upper two-character token block**. Concatenate the token blocks in page/row order. For each token `ab`, use the conventional 60-digit order `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx` and decode `value=60*index(a)+index(b)`. All **256 values** match, individually, the archived `decimal.txt`. Encoding each integer with a single unsigned byte reproduces the 256-byte `sexagesimal.bin`, Git blob SHA-1 `ad3dd7a3d37879d04bd506d2eecea86f27543928`; SHA-256 `8db2a93497bc02bbf0ab07ac3cf96edd227fec630232c04ea35493d3a7d7b65e`. The [later May 11 21:39 commit `a9201dd`](https://github.com/micheloosterhof/cicada-2014/commit/a9201dd469a1a514eb0d8ff8f3449dbe2e7f7462) indeed adds those decimal, Perl converter `pack 'C'`, and binary files together. Its parent already contained the three transcriptions. Git dates are self-reported; **the Git parent chain fixes the sequence**.

## A previously unnoticed historical correction

The earliest `50.txt` has **two annotations** reading `<-------CORRECTED. Previously ...` in its *lower numeric table*:

```text
233 217 192 82 105 18 250 248     <-------CORRECTED. Previously 233 217 192 82 105 47 250 248
240 228 254 54 148 117 209 44     <-------CORRECTED. Previously 240 228 194 54 174 117 209 44
```

Their three zero-based whole-table positions are:

| Position | Upper original token and later archived byte | Already-corrected 2014 numeric value | Original LP2 printed token |
|---:|---|---:|---|
| 165 | `0l` → 47 | 18 | `0I` |
| 170 | `3E` → 194 | 254 | `4E` |
| 172 | `2s` → 174 | 148 | `2S` |

The **original upper token lines stayed stale**, even though the lower table already corrected these values. Thus the 2014 decimal and binary files retained all three obsolete entries. In particular, **both noncase numerical discrepancies**, formerly unexplained `47→18` (−29) and `194→254` (+60), had already been recognized and corrected inside the earliest 2014 transcription. They should not be treated as independent evidence of a hidden arithmetic key transformation. The third documented correction is one of the eight ±26 case changes.

The archived upper tokens disagree with the source-image-adjudicated LP2 table at exactly `[25,45,50,165,170,172,175,182,199,246]`. Removing those three annotated corrections leaves **seven uncategorized case substitutions only** `[25,45,50,175,182,199,246]`. The reported eight-direction-bit ASCII `f` candidate includes the already annotated ordinary correction at index172 and is therefore **not independent evidence of intentionally encoded eight-bit case data**.

The later Git commit `d72e8e0` (May 11 22:06) stripped the numeric blocks from the `49/50/51.txt` files, so the crucial comments are invisible in modern versions. Pin the earlier original source commit above.

## Cryptanalytic consequence

The historical binary is **fully explained as a derivative of an earlier solver-produced transcription**. The independently published original artifact is the 32×8 table itself. Its true generating mechanism remains open; no historically documented independent PRNG state, seeded algorithm, byte codebook or LP2 cipher instruction was recovered. The exact next missing material is an original creator/player-visible instruction about how the **printed table** should transform ciphertext or generate a key. Restrict downstream analyses to the original LP2 JPEG glyphs; use the archived bytes only when intentionally testing the historical **stale** variant. Do not expand generic seed searches on the archived `sexagesimal.bin`.

The data contract is preserved in [`resources/cicada2014-sexagesimal-source.json`](../resources/cicada2014-sexagesimal-source.json), the earlier original source links above, and [the manuscript glyph audit](lp2-grid-11-original-glyph-adjudication.md).
