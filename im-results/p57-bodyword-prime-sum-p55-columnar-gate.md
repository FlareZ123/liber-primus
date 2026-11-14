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

## Direct three-clause remainder key (bounded negative)

The separate p57 source analysis gives the three body-clause prime sums `[1259,1031,1229]`; reducing them modulo the red PARABLE heading sum `449` gives `[361,133,331]`, and reducing those three values modulo 29 gives the fixed GP29 key `[13,17,12]`. The parable's wording about a small key and a lock makes this a plausible direct three-symbol additive key for the 76-rune p55 page. It is a source-motivated hypothesis, not an explicit cipher instruction.

Only the two phase-zero repeating-key readings were tested, in printed clause order:
- `P = C − K mod 29`: IoC **0.02807017544**
- `P = C + K mod 29`: IoC **0.03508771930**
- Raw p55 IoC: **0.03789473684**

Both outputs are nonlinguistic and have lower IoC than the original. The fixed implementation round-trips all 76 original runes and a 76-rune planted control under each sign. No phase, reversal, key permutation, alternate modulo, or additional cipher family was searched. The [reproducer](../sims/p57_clause_residue_p55_key_gate.cjs) asserts the source residues, key, outputs, and exact round-trips.

This retires only the direct three-symbol GP29 additive use of the p57 clause remainders on p55. It does not invalidate the historical 133/331 association or establish that the clause sums were intended as a key.

## Three-clause totient key on the p55 word interiors (bounded negative)

A distinct, source-constrained reading combines two explicit p57/p56 clues rather than reusing the earlier clause-remainder key:

- The three p57 body clauses (excluding the red PARABLE heading) have GP-prime sums **[1259, 1031, 1229]**, each prime.
- The adjacent solved p56 cipher establishes the prime-totient step phi(p)=p-1, and p57 says “find the divinity within.”
- “Shed our own circumferences” selects the strict interior of each complete p55 printed word: remove its first and last rune, ignoring the single carried rune at p55's start. The 16 complete words yield **43 interior runes**, grouped with lengths **[2,0,0,4,4,0,11,4,2,0,5,5,0,4,1,1]**.

Taking each clause prime's totient and reducing modulo 29 gives the fixed three-symbol GP29 key:

~~~
phi([1259,1031,1229]) = [1258,1030,1228]
key = [11,15,10]
~~~

Apply the authentic p56 subtraction direction continuously from the first interior rune, repeating this three-symbol key. No phase, reversal, key permutation, per-word reset, or fitted operation is used.

**Ordinary continuous subtraction (no F bypass)** produces:

~~~
HATHAHNGTNWDPMOANMMOYGIRHBTHOETHWAAEOLCUTNGWPFHMUW
~~~

It is not readable English. The only interior ciphertext F is at offset 11. If p56's literal-plaintext-F bypass is transferred, there are exactly two possible readings:

| Reading of interior ciphertext F at offset 11 | Key symbols consumed | Output | F emitted by a key-consuming step (invalid under p56 rule) |
|---|---:|---|---|
| Treat it as literal plaintext F | 42 | HATHAHNGTNWDPFREARLDIAIAICCEOEOOYYHEALRAFTHLTHBANDAEH | offset 32 |
| Treat it as encrypted | 43 | HATHAHNGTNWDPMOANMMOYGIRHBTHOETHWAAEOLCUTNGWPFHMUW | offset 38 |

Neither branch is compatible with the p56 forward rule: every plaintext F must be literal and must not consume a key symbol, yet each branch creates another plaintext F at a nonzero ciphertext position. The fixed 43-rune implementation round-trips an independent 43-rune p57 plaintext plant exactly, including its literal-F position; this validates the arithmetic and clock, not the authenticity of the proposed key.

The [reproducer](../sims/p57_clause_totient_key_p55_interior_gate.cjs) asserts the original p55 word parse and 43-rune interior, recomputes the three p57 clause prime sums from the canonical transcription, asserts the key, prints both outputs and both F-rule failures, and verifies the p57 positive control.

This retires only the fixed **p57 clause-prime -> Euler-totient -> GP29 repeating key on p55 strict word interiors**. It does not establish that p57's parable is a p55 cipher instruction or that the p56 F-bypass applies to p55.

## Decision and scope

Retire the direct repeating 19-symbol GP29 additive key in both signs and the direct three-symbol clause-remainder GP29 additive key in both signs; also retire the fixed p57 clause-prime → Euler-totient → GP29 key on p55 strict word interiors. Retire the p57-body-prime-sum → p55 19-column transposition in both standard directions and both key orders, and the per-column rotations modulo four. Preserve the exact 19-body-word / 76-rune dimensional fit and the 2016 “words/numbers” clue as observations, but do not extend these candidates into alternate key encodings, phases, widths, or transposition families without an independent source instruction. No source-selected p55 decoder or plaintext has been established.

**Reproducer:** [sims/p57_bodyword_prime_sum_p55_columnar_gate.cjs](../sims/p57_bodyword_prime_sum_p55_columnar_gate.cjs). It asserts the 20-word source parse, the 19 body-word sums, both direct additive outputs and a 76-rune positive-control round trip, four columnar outputs, both per-column rotation controls, and the matched 47,959-window Gibran control.
