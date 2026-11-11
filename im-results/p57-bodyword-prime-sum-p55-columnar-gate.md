# p57 19 body-word prime sums as a p55 19-column key: bounded negative

**Classification:** bounded source-motivated key/transposition tests. The p57 page has a separate PARABLE heading and 19 body words; p55 has 76 = 4×19 runes. The 19 body-word GP-prime sums were tested as a repeating 19-symbol GP29 additive key in both signs, a 19-column transposition key in both standard directions and key orders, and a per-column rotation modulo four. None recovers plaintext; the additive candidates score below raw p55 and every tested native Gibran window. No unknown LP2 plaintext or key is recovered.

## Source-fixed structure

The original p57 transcription contains 20 printed words overall:
- red heading: **PARABLE** (one word, treated separately);
- body: **19 words**, ending with **EMERGE**.

This corrects the earlier shorthand “19-word parable”: the 19-word count applies to the body, not the whole page. Three words cross printed line wraps; the parser rejoins them before counting.

The 19 body words, in order, and their GP-prime sums are:

| # | Body word | Prime sum |
|---:|---|---:|
| 1 | LIKE | 184 |
| 2 | THE | 72 |
| 3 | INSTAR | 280 |
| 4 | TUNNELING | 339 |
| 5 | TO | 66 |
| 6 | THE | 72 |
| 7 | SURFACE | 246 |
| 8 | WE | 86 |
| 9 | MUST | 186 |
| 10 | SHED | 232 |
| 11 | OUR | 21 |
| 12 | OWN | 55 |
| 13 | CIRCUMFERENCES | 451 |
| 14 | FIND | 151 |
| 15 | THE | 72 |
| 16 | DIVINITY | 376 |
| 17 | WITHIN | 115 |
| 18 | AND | 215 |
| 19 | EMERGE | 300 |

The p55 page contains 76 runes, exactly four rows of 19. The 2016 signed message's “words are the map” and “numbers are direction” language motivates using the 19 body-word prime sums as a 19-column order key. This is a hypothesis, not an established cipher instruction.

## Frozen operations

The p55 rune stream was arranged row-major as 4×19. The 19 body-word prime sums were sorted stably ascending and descending, breaking ties by original word position. Both standard transposition directions were tested:

1. Fill columns in key order from the ciphertext stream, then read rows.
2. Write ciphertext row-major, then read columns in key order.

No heading word was included in the 19-key; the terminal body word EMERGE was included. No phase, alternate width, padding, or key fitting was used.

## Results

The four outputs are:

**Columnar decryption, ascending key**
\`\`\`
MDSCMIAXEAPEANGWUHUCMEOESTHEOEASAGFFEAESBNGWXUCSDAETHIEOBSXBIMBELRDCEOTHIAFTHMGCEIHGIXIEOBJPEOE
\`\`\`

**Columnar decryption, descending key**
\`\`\`
MXIAMCSUEAHEAUCNGPEWEOMDSGASEAEOWENGFBXAEFSSCUTHDSBEOITHRILXEDMBTHBEOCAEIAECGMTHBGEOIIJIHOEXEPF
\`\`\`

**Row-write / column-read, ascending key**
\`\`\`
EOUEAMGCECWBBSAEUIATHSEAHTHAENGXJXXCCIAEOSBTHHGDNGCDEOMIEOEAAMEESMEIBFEOOEMWPTHBSSIIRFEFLGUDPIX
\`\`\`

**Row-write / column-read, descending key**
\`\`\`
DPIXFLGUIRFEBSSIMWPTHBFEOOESMEIAMEEMIEOEANGCDEOTHHGDIAEOSBXXCCAEUIATHSEAHTHAENGXJWBBSGCECEOUEAM
\`\`\`

None is readable English. Using the same GP encoder and English quadgram control as the p27-title/p55 audit:

| Stream | Mean base-10 log quadgram score |
|---|---:|
| Raw p55 | −6.791722 |
| Decrypt ascending | −6.831879 |
| Decrypt descending | −6.818998 |
| Read columns ascending | −7.144503 |
| Read columns descending | −6.774076 |
| Worst native 76-rune Gibran window | −5.231302 |
| Median native 76-rune Gibran window | −4.215196 |

The best candidate (descending row-write/column-read) improves on raw p55 by only 0.0176 and remains well below even the worst of 47,959 native Gibran windows. The slight score change is not evidence of plaintext.

### Per-column rotation control

Because the target has four rows and the same 19 body words supply 19 column values, a second simple “numbers are direction” reading is to rotate each p55 column vertically by its corresponding body-word prime sum modulo 4. The 19 offsets are:

\`\`\`
[0,0,0,3,2,0,2,2,2,0,1,3,3,3,0,0,3,3,0]
\`\`\`

Both rotation signs were tested, with no phase or alternate modulus:

**Rotate by +sum mod 4**
\`\`\`
NGAEMEBSEOCEOSUCXDAEFBEBCUWISEAOECEAMEAGDTHNGLIAASDIAPRWHBXMEMCPHXGEOMSEOTHTHFBTHFXIIEOEIGJUSEI
\`\`\`

**Rotate by −sum mod 4**
\`\`\`
NGAEMRBSEOCEOSMCPHAEFEOMBCUWFSEAOECEAMEOEIGNGLSESDIAPEWHBXMEUCXDXGBESEOTHTHIBTHFXIIEAGDTHJUIAAI
\`\`\`

Their matched native-Gibran quadgram scores are −6.887693 and −6.874852, both below raw p55 (−6.791722) and far below the worst native 76-rune Gibran window (−5.231302). This direct column-rotation reading is also negative.

## Direct additive GP29 key

The same 19 body-word prime sums define a natural 19-symbol key after reduction modulo 29:

```
[10, 14, 19, 20, 8, 14, 14, 28, 12, 0, 21, 26, 16, 6, 14, 28, 28, 12, 10]
```

Because p55 contains exactly four 19-rune rows, repeat this key in printed order across all 76 runes. Test only the two direct additive readings, (P=C-K\pmod{29}) and (P=C+K\pmod{29}), with no phase, reversal, or reordering.

**Subtraction output**
```
JJFMEAUOSWSLNWAEJUEAEOWATBPNXSSIAMNHYTHWNGPWCPPDNNDIAGFEWNGDFFWTGCTHBEOIAWBHGTIIAHIABYTHEGF
```

**Addition output**
```
THINUSFTHPTHSROIHIEAYWIASSYAAEPXPOEMOETHFXGMJTHAEREOOLAEOEYRAELSYEOEACXUAEOETNGNDTWRJIJTHUFAEFTUL
```

Using the same GP transliteration expansion and English quadgram model as the columnar tests:

| Stream | Mean base-10 log quadgram score |
|---|---:|
| Raw p55 | −6.791722 |
| Direct subtraction | −7.147347 |
| Direct addition | −7.013395 |
| Worst native 76-rune Gibran window | −5.231302 |
| Median native 76-rune Gibran window | −4.215196 |

Both additive outputs are worse than the raw page and far below the native-language controls. The exact 76-rune positive-control plant also round-trips under the same fixed 19-symbol implementation; that validates the arithmetic, not the key's authenticity.

This is a distinct test from sorting the 19 sums into a columnar permutation or rotating each column modulo four. It does not test a reversed key, alternate phase, or a different cipher family.

## Decision and scope

Retire the direct repeating 19-symbol GP29 additive key in both signs, the p57-body-prime-sum → p55 19-column transposition in both standard directions and both key orders, and the per-column rotations modulo four. Preserve the exact 19-body-word / 76-rune dimensional fit and the 2016 “words/numbers” clue as observations, but do not extend these candidates into alternate key encodings, phases, widths, or transposition families without an independent source instruction. No source-selected p55 decoder or plaintext has been established.

**Reproducer:** [sims/p57_bodyword_prime_sum_p55_columnar_gate.cjs](../sims/p57_bodyword_prime_sum_p55_columnar_gate.cjs). It asserts the 20-word source parse, the 19 body-word sums, both direct additive outputs and a 76-rune positive-control round trip, four columnar outputs, both per-column rotation controls, and the matched 47,959-window Gibran control.
