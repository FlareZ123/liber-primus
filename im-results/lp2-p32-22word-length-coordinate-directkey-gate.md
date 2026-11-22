# Original p32: 22 printed word lengths as eleven 11×11 coordinates

**Agent41, 15 November 2026. Original-input bounded negative.** No unknown LP2 plaintext, authentic key, or independent operator recovered.

## Exact source and finite clue-to-operation chain

The genuine signed 5 January 2016 Cicada message says “Liber Primus is the way. Its words are the map. Their meaning is the road, and their numbers are the direction.” It accompanied a **563×569** tree image. As independently documented in [the corrected tree121 source synthesis](lp2-tree121-signed2016-source-gate.md), p32's inferred 11×11 GP-prime first-row and first-column sums equal **563 and 569**, respectively. Crucially, a **13 November 2026 image-lineage correction proves the 2016 oak and p32's blurred tree are different source images**, so an identical-tree selector is **retracted**. The numerical relation alone does not establish a creator-selected matrix or word-coordinate map. The original physical p32 contains **121 runes = 11²**. The original JPEG prints those runes as **six ordinary text lines with a tree illustration**, not as a visible 11×11 grid. An 11×11 square is therefore a **researcher-imposed row-major reshape** motivated by the number 121 and the separate signed tree image; no authored instruction explicitly selects that reshape. Its actual **22 complete printed words** have lengths

`[1,3,5,11,5,5,3,11,6,9,5,8,4,9,4,8,2,3,2,8,5,4]`.

Every source word length lies in 1..11, and 22 original word lengths can make **11 one-based (row,column) coordinate pairs on that inferred 11×11 array**. Original word breaks are retained. These source words concatenate to exactly all 121 original GP29 indices. In the same corpus/transcription, no other original LP2 page has exactly 22 printed words or 121 runes, although uniqueness is not proof of an intentional map. **No first-party signed instruction specifies which pairing or what to do with coordinate output.**

Test only four natural source-order interpretations, without reordering words or fitting to plaintext: adjacent pairs versus 11+11 parallel halves, in either row/column orientation. Read eleven GP29 indices directly from p32:

| Pairing | Coordinate orientation | Eleven GP29 values (0-based) | GP transliteration |
| --- | --- | --- | --- |
| Adjacent | first = row | `[25,14,20,2,2,23,20,15,17,10,27]` | `AEXLTHTHDLSBIIA` |
| Adjacent | first = column | `[2,0,20,1,17,21,3,12,8,1,14]` | `THFLUBNGOEOHUX` |
| Parallel halves | first = row | `[27,27,9,16,23,17,17,26,27,19,27]` | `IAIANTDBBYIAMIA` |
| Parallel halves | first = column | `[21,19,19,23,21,15,17,7,27,9,14]` | `NGMMDNGSBWIANX` |

None is a recognizable plain-language instruction. As a single minimal direct-cipher consumer, repeat each 11-rune GP key on the **immediately following original physical p33 and p34**, resetting from each page's first rune, and try both reversible GP29 additive signs. Thus eight variants, no fitted phase/seed/key, 475 original target runes across p33 (214) and withheld p34 (261).

## Exact original test and limits

| Pairing/orientation | Subtractive IoC p33 / p34 | Additive IoC p33 / p34 |
| --- | --- | --- |
| Adjacent row-first | 0.03321487 / 0.03368700 | 0.03295160 / 0.03348070 |
| Adjacent column-first | 0.03264446 / 0.03533746 | 0.03396077 / 0.03433540 |
| Halves row-first | 0.03317099 / 0.03471854 | 0.03268834 / 0.03454170 |
| Halves column-first | 0.03444342 / 0.03395225 | 0.03409240 / 0.03551429 |

Baseline ciphertext p33=**0.03308323**, p34=**0.03336281** versus the independent solved-p57 native GP29 control **0.06270997**. None of the original output streams is a recognizable sentence; all stay uniform-like. The eight native code inverses exactly reencrypt all **475 original glyphs** and recover an independent **475-GP-rune** planted solved-page positive; these checks prove only model implementation and invertibility.

**Decision:** This original p32 word-length-to-coordinate construction is a plausible **capacity and map hypothesis**, but the simplest directly testable 11-key p33–34 operation fails. The missing ingredient for proceeding is an independently observable **pairing selector plus a prescribed next operation**, rather than more language-tuned key families. This result does not affect unrelated signed-image checksum observations.

## Reproduction

[Single-file Node22 CommonJS original test](../sims/lp2_p32_22word_length_coordinate_original_sft.cjs), passing [Windows manual Actions run 43711208793](https://github.com/FlareZ123/liber-primus/actions/runs/43711208793). The SFT parses source words from the actual LP2 transcript, reproduces 121 original p32 GP indices, asserts all four coordinate readouts, decrypts/reenciphers 475 original p33–34 indices, and checks a source-native solved-text positive. This is intermediate evidence; `results/README.md` is not changed because no authentic decoding was obtained.
