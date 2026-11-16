# Original 256-event red-ink candidate versus p49–51 table: all-secret lookup obstruction

**Classification: scoped original-input negative, 16 November 2026 (Agent10).** No unknown-page plaintext, creator key or historical original-cipher mechanism has been recovered. [Exact source-reading SFT](../sims/lp2_red256_table_byte_allsecret_sft.cjs).

## Why this particular route deserves a bounded decision

The derived ink inventory `resources/liber-primus/lp2-ink-annotations.json` records **225 red GP29 runes and 31 graphic 13-dot marks** across the complete LP2 release, including solved pp56–57. Selecting exactly those two classes gives **256 ordered source events**, numerically matching the **256 two-character numeral cells** printed on pp49–51. This source-visible coincidence invites a human to pair red events, in normal physical page order, with the printed numerical field, in its actual 32×8 row order.

The rival explanation is simpler: red lettering and paragraph marks serve ordinary manuscript layout, while the number table has a separate role. The 256 equality depends on choosing 13-dot punctuation while omitting 10-dot and 23-dot marks. The ink metadata is a derivative original-image transcription; this test does not independently authenticate all 225 red glyph identities. The disputed p0 title has been separately resolved in original pixels as **13 red title runes followed by the large 13-dot mark at rune offset13**, so the test keeps the corrected p0 boundary.

## Complete secret-key test on the original input

Freeze the 225 GP29 values as symbols 0–28 and each 13-dot graphic as symbol 29. At a printed rune offset shared by a marker and a later red rune, place the marker first: punctuation follows the previous rune. Concatenate source events by physical page and page-local offset. This yields an exact **256-symbol candidate tape**, beginning at GP indices

`15,8,18,3,6,19,27,0,15,26,18,21,5,29,29,20,...`.

Freeze the canonical base60 table's 256 decoded bytes in printed row-major order (SHA-256 **`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`**). Ask whether **any** secret static deterministic lookup `f(byte) -> GP29-or-marker` could reproduce the whole red tape at the same offsets. Allow all 256 output assignments and every arbitrary 30-symbol mapping. The same byte occurring twice must produce the same event symbol, regardless of the hidden lookup table. For each input byte, selecting its most frequent observed paired event achieves the best possible fit over **all** such lookup tables.

| Preselected original-table traversal | Distinct byte values | Conflicting byte values | Unavoidable wrong events |
| --- | ---: | ---: | ---: |
| Printed forward (32×8) | 161 | 66 | **90 / 256** |
| Completely reverse printed order | 161 | 68 | **93 / 256** |
| Printed rows, each row read right-to-left | 161 | 68 | **90 / 256** |

Thus **no fixed byte-to-symbol table exists under any of these three directly visible alignments**. This is an exhaustive all-secret impossibility within the specified architecture, rather than a failed guessed password or statistical language-score threshold.

The 31 source marker event indices are `13,14,31,32,36,37,49,50,51,66,79,80,90,102,103,120,121,141,142,153,154,163,164,168,169,229,239,240,246,247,255`. Only **6 of 31** sit in the last cell of a row when the 256 events are partitioned into 32 consecutive groups of eight. The event marks therefore do not automatically define the published eight-token row boundaries.

A source-length positive plant assigns each original byte value the fixed secret event `(17*byte+11) mod30` and recovers **0 contradictions**. This demonstrates that the obstruction identifies an actual repeat-consistency failure under a fully functional static lookup model. The original source retains a minimum of 90 contradictions.

## Cryptanalytic consequence and remaining route

The 225+31=256 numerical correspondence is worth preserving as a **candidate clue**, without promoting it to an authenticated serialization. The natural static table-to-red-symbol decoder is impossible on the unchanged source input even with an arbitrary secret lookup. A source-selected permutation of the 256 event positions, a clock/stateful mapping, or treating punctuation as instructions rather than symbols could alter that conclusion. Such a model must first obtain its order or state rule from a manuscript clue, and then recover authentic plaintext or a known independent key rather than retuning it to these 256 events.

The next decisive experiment requires an **independently chosen source rule** for consuming table values, preferably one that predicts the real p49 prologue and holds out the p51–52 sentence. Neither this negative nor the red-event count identifies that rule. Do not repeat arbitrary fixed lookup-table searches on the three tested alignments.

**Reproduce:** `node sims/lp2_red256_table_byte_allsecret_sft.cjs`. Inputs are the three canonical, unchanged repository resources named in the script. The original pixel originals are `resources/liber-primus/17.jpg` through `74.jpg`. Source counts, table-byte hash, exact minimum contradictions, marker positions and an unrestricted fixed-secret lookup plant are asserted.
