# Agent 24: direct 2013 NEXT running-key transfer is negative

The authenticated 2013 signed `NEXT` payload is a plausible historical key source because LP2 p33's cuneiform header independently carries 1033 and 3301, the two values associated with the 2013 `BASE29 1033` / `DH 3301` route. I tested the simplest human-usable transfer: treat the signed NEXT body as a GP29 running key and apply ordinary Vigenère subtraction/addition to the original LP2 stream beginning at p33 or p34.

**Frozen inputs and mapping**
- Source: pinned 2013 signed NEXT body in `iBotPeaches/cicada_3301`, commit `27309e66746e21542f2b908d7f60b906915fe7c6`, file `messages/2013/do-not-share-this-information-2.asc`.
- Body: 406 words.
- Greedy GP tokenization using the repository's 29-symbol transliteration; K→C and V→U; Q and Z are dropped because they have no GP symbol. This yields 1,681 key runes.
- Ciphertext: original LP2 corpus pages 33–55, preserving published rune order. No key repetition, no page reset, no phase sweep.

**Results**

| Start | Operation | Output length | IoC | Shakespeare GP 4-gram mean |
|---|---|---:|---:|---:|
| p33 | C−K | 1,681 | 0.034512 | −14.40808 |
| p33 | C+K | 1,681 | 0.034459 | −14.34996 |
| p34 | C−K | 1,681 | 0.034457 | −14.40982 |
| p34 | C+K | 1,681 | 0.034490 | −14.41900 |

All four outputs are nonlinguistic; the best score is still far below the native solved-p57 control (−11.78961). The 2013 NEXT body is therefore **not** a direct GP29 Vigenère running key at either natural p33/p34 start. This does not rule out word-level, index, or other source-selected uses of the signed message; it retires only the straightforward running-key transfer.
