# p10 inline 7 → p7 red14 additive key: transparent-F inverse rejected

**Agent 9, 25 November 2026. Classification: bounded original-cipher negative.** This test recovers no unknown plaintext, authentic key, or intended page pointer. It retires one low-cost human-path hypothesis and leaves the meaning of p10's standalone 7 unresolved.

## Clue → operation → expected output

Original physical p10 (archive image 27.jpg) contains the only standalone black decimal 7 in the unknown rune pages, between printed word separators. A player could reasonably read it as a reference to physical p7. Original p7 (archive image 24.jpg) has one isolated red span, exactly 14 runes, bounded by red 13-dot marks. The frozen hypothesis was that the entire red span, in printed order, is a repeating GP29 additive/Vigenère key for p10.

This is deliberately the raw red rune sequence, not the previously studied red-word products or polynomial. The expected output was ordinary GP29 prose, retaining p10's original word boundaries and punctuation.

## Exact source and prior-work boundary

- Target: canonical physical p10, all **263** original GP29 rune indices in printed order, resources/liber-primus/lp2-corpus.json.
- Selector: standalone black **7**, original physical p10, archive 27.jpg, line 8. It is not a GP29 rune and is not inserted into the ciphertext tape.
- Key: p7's sole red span at zero-based offsets **194–207**, exactly **14** original GP29 runes, source-anchored by resources/liber-primus/lp2-ink-annotations.json and lp2-corpus.json.
- Exact key runes: ᛞᚩᛟᛏᚦᚫᚳᚹᛄᛉᛠᚷᛠᛗ.
- Exact GP29 key indices: [23,3,22,16,2,25,5,7,11,14,28,6,28,19].
- Original JPEG SHA-256: p7 24.jpg = 91a726a7dd59c6caa4d736b9ce72ceba0a2fa827d6b69a2d4057562b9303636c; p10 27.jpg = 1716e282c1d5e8a9ff911c01621e9b195d4728c7fa55ac857176a473eaba3239.

Exact prior overlap was checked. Director #2794 and lp2-p10-mixed-numeral-prime-triplet.md tested the p10 inline 7's prime-sum flanks and 16 fixed triplet receiver laws; they did not use p7's raw red span as a key. lp2-p10-7g-lp1-page7-outguess-gate.md tested literal 7G, 7 and GP-prime 17 as OutGuess passwords for LP1 07.jpg, not an LP2 GP29 Vigenère transfer. The p7→p8 polynomial/fixed-point work uses derived whole-word products, not this raw 14-rune key on p10. No exact prior report for this receiver was found.

## Frozen inverse and validation

The precommit is workplace/agent9-p10-inline7-p7-redkey-precommit.md; the read-only reproducer is sims/lp2_p10_p7_red14_vigenere_sft.cjs.

Use the established GP29 additive inverse with transparent plaintext-F hold: if ciphertext C=F (index 0), emit F and do not advance the key; otherwise emit P=(C−K[j mod 14]) mod 29 and advance j. No phase, rotation, reversal, sign fit, page reset, alternative target or other cipher family was allowed. A nonzero ciphertext symbol that decodes to F is impossible under this model, because the forward transparent-F encoder would have emitted literal F and held the key.

The original-source checks all passed: p7 annotation and canonical indices agree on the exact 14-rune key; p10 transcription and canonical corpus agree on all **263/263** rune positions; the literal inline 7 is present and is not counted as a rune.

## Original result

The inverse consumed **256** key positions and passed through **7** literal ciphertext Fs. It encountered **seven exact transparent-F contradictions**:

| p10 rune offset | Cipher C | Key position | Key K | Proposed P |
|---:|---:|---:|---:|---:|
| **32** | 2 | 4 | 2 | **0 (F)** |
| 43 | 23 | 0 | 23 | 0 (F) |
| 65 | 11 | 8 | 11 | 0 (F) |
| 179 | 25 | 5 | 25 | 0 (F) |
| 183 | 14 | 9 | 14 | 0 (F) |
| 211 | 14 | 9 | 14 | 0 (F) |
| 239 | 14 | 9 | 14 | 0 (F) |

The first contradiction at offset **32** is decisive. The exact transparent-F forward replay then differs from the original at **223/263** positions (first mismatch offset 32). Thus this is not a reversible original-page decode under the frozen model.

For completeness, the provisional arithmetic output (not valid plaintext after the first contradiction) is retained below. Its GP29 IoC is **0.03509128378** and it has **10** adjacent equal pairs; those descriptive values do not override the exact model contradiction.

~~~text
J-JH-YXMAEJ-ABEAX-MAECENGYEO-P/
B-TJO-IUTHLEBU-D-FUU-STHP-ME.FTA/
F-SPSY-PI-TJCM-PIA-PXGYL-D/
NE-FEATHEATF-OT-BMEOEOTH-TH-RCWOE-/
IAUIHYIAA-TEADJ-EOOADP-IIAX-DSN./
DNEO-GMNEO-SEA-OUJ-EAJTUXTX-IX/
PO-GMSLLWIAF-GII-POTH-EAAEHDOE-POX/
OE-PREAFODEAF-OEU-FNGT-IAAC-7-NG-NGCMG/
.OWOLG-FJ.OO-FNBRN-THEOEARM-OEIA/
UHEDJO-XYEO-EONG-OETHRCOEFO-LSE-RG/
H-OEOJ-PGW-EGWGRUJHOMY-ITHJ/
F-FCEAEJBUOC-SMBNGTING-IDMTHMTH-D-/
~~~

The deterministic implementation control used p57-native GP29 symbols, filtered only where a non-F symbol would collide with the transparent F marker. It produced a 263-rune plant and recovered **263/263** exactly (276 source symbols examined, 13 skipped for that collision). This validates the implemented rule; it is not evidence for the p10 hypothesis.

## Decision

Retire the exact hypothesis **p10 inline 7 → p7 raw red14 → repeating GP29 additive key with transparent-F hold**. Do not tune the key phase, rotate/reverse the red span, switch target pages or search other cipher families on this basis. The test does not establish whether the 7 is a page pointer, arithmetic operand or part of the adjacent 7G token; those are separate interpretations and require a new source-selected operation.

This is an intermediate negative in im-results/, not an established manuscript result. No update to results/README.md is warranted: no overall conclusion changed, and all unknown LP2 pages remain unsolved.
