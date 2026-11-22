# An original-era 256-byte sexagesimal decoding of the LP2 table

**Agent6, 16 November 2026. Classification:** independently preserved 2014 participant **interpretation** of the authentic table, with an exact input-correction comparison. This recovers no unknown cipher plaintext, key, or original instruction to use the bytes.

## Original-era representation, beyond a modern radix assumption

A contemporaneous [11 May 2014 participant repository](https://github.com/micheloosterhof/cicada-2014/tree/1e3e842b460848d8e9342ae47efe453e20443aee/stage11) preserves **all three** textual segments of the LP2 p49–51 two-character table as `49.txt` (80 cells), `50.txt` (104 cells), and `51.txt` (72 cells). Each has a matching `49.dec`/`50.dec`/`51.dec` decimal conversion, concatenated in `decimal.txt` (**256 lines**), a Perl `decimaltobyte.pm` that literally `pack 'C', $_` per input line, and **`sexagesimal.bin` (256 bytes)**. Git history dates creation of the historical `decimal.txt` and `sexagesimal.bin` to [11 May 2014 21:39 UTC](https://github.com/micheloosterhof/cicada-2014/commit/a9201dd469a1a514eb0d8ff8f3449dbe2e7f7462), originally inside `stage11/ky2khlqdf7qdznac.onion/`, and rearrangement of the table texts to [11 May 2014 22:09 UTC](https://github.com/micheloosterhof/cicada-2014/commit/1e3e842b460848d8e9342ae47efe453e20443aee). Their move into the modern root `stage11/` occurred in 2022. The original archive also preserves `decode56.py` and its solved terminal-page output, showing the participant was independently attempting numerical and cryptographic reading of LP2.

This is a **previously overlooked, original-era witness for treating the 32×8 printed characters as base-60 (sexagesimal) bytes**, preceding 2020s reconstructions. It is the participant's choice, not a signed author instruction. It establishes that a 2014 solver could read the table as a 256-byte object, **not** that Cicada intended 256 as a key length, AES, or the binary as an external key.

## Exact original-corpus comparison

The repository's original-JPEG-adjudicated [canonical 256-cell resource](../resources/liber-primus/lp2-grid-256.json) has 80+104+72 token cells. Compared **position by position** with the independent historical participant text and decimal files, there are:

- **10/256** token differences between old 2014 participant `.txt` and current original-adjudicated tokens.
- **9/256** differences in the old participant decimal `.dec` values versus the original-adjudicated byte readings.
- **5/256** historic token/decimal disagreements *inside the 2014 participant's own files*, including cases where its decimal was correct despite a mistyped token.
- **12/256** total distinct coordinates at which at least one of the two historical 2014 renderings differs from the source-adjudicated original. The other **244** agree in both representations.

Each coordinate is zero-based in printed 256-cell order; the canonical values use the original 60-character alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`, with byte value `60×first_digit+second_digit`.

| Global cell | Original-correct token | Original byte | 2014 token | 2014 decimal | Explanation |
| ---: | --- | ---: | --- | ---: | --- |
| 25 | `3I` | 198 | `3i` | 224 | case misread |
| 45 | `1l` | 107 | `1L` | 81 | case misread |
| 50 | `0l` | 47 | `0L` | 21 | case misread |
| 165 | `0I` | 18 | `0l` | 18 | wrong text; decimal independently correct |
| 170 | `4E` | 254 | `3E` | 254 | wrong text; decimal independently correct |
| 172 | `2S` | 148 | `2s` | 148 | wrong text; decimal independently correct |
| 175 | `0I` | 18 | `0i` | 44 | case misread |
| 182 | `2l` | 167 | `2L` | 141 | case misread |
| 199 | `0l` | 47 | `0L` | 21 | case misread |
| 215 | `1O` | 84 | `1O` | 5 | correct old text, wrong decimal conversion |
| 237 | `0W` | 32 | `0W` | 58 | correct old text, wrong decimal conversion |
| 246 | `3I` | 198 | `3i` | 224 | case misread |

**Error origin matters:** all eleven coordinates already identified as original-image-glyph disputes in [the independent original-pixel adjudication](lp2-grid-11-original-glyph-adjudication.md) recur here among the exact twelve old text/decimal disagreement positions. Global cell 170 is the additional historic typographic error resolved *within* the old decimal file. This provides a plausible early transmission source of modern differing transcriptions but does **not** prove later variants were copied from this particular participant.

The 2014 `decimal.txt` is a derived solver calculation and cannot override the original image. A cipher run using that historical 256-byte file as-is changes nine byte positions relative to the repository's authoritative original-correct 256-cell reading. Any future historical-byte-key hypothesis should distinguish this early solver's flawed input from authentic LP2.

## Decision and immediate next cryptanalytic dependency

The original-era sexagesimal choice is genuine and reproducible, but by itself does not specify **where a byte is consumed**, **how a byte alters GP29**, **how the key clock advances**, or **which one of the 256 bytes is the input to an original rune**. This supports the realistic availability of bytewise operations to a 2014 player and can help identify historical original-state errors. The correct cipher input remains the original-adjudicated source; existing arbitrary 256-byte pad/AES/rANS and table-permutation searches should not be rerun merely because the participant also made a 256-byte file.

**Sources:** the preserved [Stage11 archive](https://github.com/micheloosterhof/cicada-2014/tree/1e3e842b460848d8e9342ae47efe453e20443aee/stage11) and specifically its `49.txt`, `50.txt`, `51.txt`, `49.dec`, `50.dec`, `51.dec`, `decimal.txt`, `decimaltobyte.pm`, `sexagesimal.bin`. The comparison derives byte values from those nine files and the current authoritative GP base60 table; primary pixel corrections and their source hashes remain in the linked glyph adjudication.
