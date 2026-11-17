# The 32 original page-crossing words as a conditional 32-byte grid key

## Cryptanalytic decision

The 55 rune-bearing unsolved LP2 pages contain **32 printed words spanning adjacent page boundaries**. The original p49–51 numerical table has **32 rows of eight bytes**. This suggests a potentially human-visible lookup arrangement: a page-crossing word addresses one row; the number of its runes **after** the page boundary (always 1–7) addresses one of the eight columns without taking a modulus.

One frozen, literal interpretation gives the 32 source-selected bytes:

    61f9cac6505456feff728edc483f49ed780ad221c0f0839c007f063b446a1671

**No authentic key or plaintext is claimed.** The row/column correspondence is an exploratory clue hypothesis. Neither the signed historical messages nor the source images instruct a reader to apply it. The 32 seam count can arise naturally from typesetting; it is insufficient evidence of intentional encoding. The table radix is independently debated (base60 versus base59). The displayed bytes use the existing source-transcribed base60 table.

Under the historical GP29 additive operation and a GP28 non-repeating predecessor-step operation, the key produces **zero exact GP-native dictionary words of three or more runes** on the 16 complete printed words of original p55. Both natural clocks, restarting at physical p55 and continuing the exact unsolved-book rune position, fail. This negative does not address AES, steganography, non-additive consumers, table-byte transformations, or hidden external key uses.

## Source-locked construction

- Read the 55 rune-bearing unsolved LP2 pages (physical p0–55, skipping numeric-only p50) with the canonical transcription rule: slash, whitespace and page boundaries **do not** end words; dash, dot and source punctuation **do**.
- Enumerate words crossing a page boundary in physical reading order. There are exactly 32, each with one portion on either side. The later-page fragment rune-count frequency is **1:9, 2:12, 3:3, 4:2, 5:4, 6:1, 7:1**. The earlier-page portions can be as long as ten and cannot address an eight-column table without another conversion.
- For crossing word number r (1–32), select the value printed at table row r and column equal to its **later-page rune count**, with columns numbered 1–8. Keep the byte values; do not fit a key phase.
- The result is the hex string above. For the two direct rune-consumer tests alone, reduce each byte modulo 29 or 28, respectively. Repeat all 32 bytes cyclically.

Original physical p55 has 76 runes. Its first rune is the **completion of a word from p54**. The other 75 runes form 16 complete printed words of lengths 4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3. The script retains the carried first rune for decryption and excludes it when scoring complete words.

## Exact original receiver gates

| Original consumer | Key phase | GP-native dictionary hits among 16 complete p55 words, length 3+ |
| --- | --- | ---: |
| GP29 direct subtraction | restart at p55 offset 0 | 0 |
| GP29 direct subtraction | continuous book offset 12,880 | 0 |
| GP28 predecessor/nonself rank and reserved repeat rune | restart at p55 offset 0 | 0 |
| GP28 predecessor/nonself rank and reserved repeat rune | continuous book offset 12,880 | 0 |

The lexicon includes 12,140 distinct native GP words of length three or more from source-normalized Gibran, Emerson and Shakespeare. Direct original inverse strings are emitted in the SFT; none supplies a coherent sentence or p55 long word. A 76-rune native-source plant matching the exact printed word-length geometry round-trips both receivers, including an explicit GP28 repeated-rune/EA escape, under both phase conventions. Thus these four negatives are tests of the intended receivers within their stated scope.

**Reproduce:** [read-only Windows 11 Node22 SFT](../sims/lp2_crosspage32_gridbyte_key_sft.cjs), with canonical corpus, original transcript, p50 grid and three control texts under resources/. [Windows Actions invocation](https://github.com/FlareZ123/liber-primus/actions/workflows/agent12-crosspage32-gridbyte-original.yml) runs the same script; a passing CI result is not presumed before execution.

## Decision and future trigger

Treat the 32/32 cardinality and right-half column selector as a **conditional pointer/key**, not established key material. Source-visible data do not select GP29, GP28, AES, or another consumer, nor an IV or pad clock. Retire the tested direct GP29/28 consumers. Reopen only with a visible or historically authenticated instruction establishing that original page crossings address the p50 table **and** choosing a reversible receiver, or with a coherent entire original ciphertext passage that forwards exactly under one frozen program. Avoid adjusting table columns, offsets or word boundaries merely to tune short outputs.
