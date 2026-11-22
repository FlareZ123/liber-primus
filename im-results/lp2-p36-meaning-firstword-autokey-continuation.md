# Numbered p36–38 MEANING: source-seeded autokey continuation on intact original text

**Agent16, 22 November 2026. Classification: bounded failed continuation, no unknown plaintext or key recovered.** This tests the *next reversible operation* required by the established four-rune p36 item-1 `MEANING` candidate. It does not re-score or re-derive that local match, nor does it vary keys, phases, word boundaries, or source pages to rescue it.

## The source-selected first receiver and its genuine alternative

The original image `53.jpg` marks the beginning of the first of five numbered passages with a red `1-` and a red ten-dot bracket above. The two ten-dot marks surrounding the whole authored five-part block have column counts (3,4,3), as fixed in the original image audit. The first complete printed four-rune word following `1-` is the literal original GP29 index sequence **[20,2,12,22]**. A previously reported source-alphabet candidate subtracts **[1,3,3,1]** to obtain **[19,28,9,21] = M-EA-N-NG = MEANING**; it has not been established as the true plaintext.

A natural historically recognizable *next* operation is GP29 **autokey**, an elementary extension of the already solved LP1 Vigenere family. Once the first four symbols are decoded, either the previous four *plaintext* symbols or the previous four *ciphertext* symbols supply the next key. This exactly predicts all 135 remaining original runes in the 139-rune first numbered item, without another password. The four-item holdout is fixed by red labels 2–5, with seeds `[item,3,3,item]` and no adjusted offset. This is a testable hypothesis; no original author instruction explicitly selects autokey here.

For key length four and the GP29 indices `C[i]`, the two complete inverse rules are:

- **Plaintext autokey:** `P[i] = C[i] - (i<4 ? seed[i] : P[i-4]) mod29`
- **Ciphertext autokey:** `P[i] = C[i] - (i<4 ? seed[i] : C[i-4]) mod29`

The opposite addition sign is included as a fixed control. All operations use original physical word boundaries only for rendering and evaluation, not for resetting the four-step state.

## Exact original input and numerical results

Source: `resources/liber-primus/lp2-transcription.txt` and `lp2-corpus.json`. Extract the literal `1-` through `5-` segments, preserving the section-4 word that crosses from original p37 into p38 and stopping item5 at the source-visible section-ending mark. The exact unit lengths are **139,91,98,96,129 GP29 runes**, with **30,20,25,19,28 complete words**. No single page wrap is treated as a word break.

| Authored item | Rune count | Plain-autokey subtraction IoC | Cipher-autokey subtraction IoC | Plain-autokey addition IoC | Cipher-autokey addition IoC |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1 | 139 | 0.033885935 | 0.034720050 | 0.035971223 | 0.035449901 |
| 2 | 91 | 0.035653236 | 0.028327228 | 0.031990232 | 0.032967033 |
| 3 | 98 | 0.037450032 | 0.033662950 | 0.031348622 | 0.037870818 |
| 4 | 96 | 0.037500000 | 0.032894737 | 0.032236842 | 0.032894737 |
| 5 | 129 | 0.035004845 | 0.033187984 | 0.035004845 | 0.034641473 |

The **first nine complete words** under the two historically plausible subtraction continuations read (GP29 transliteration is hyphenated to preserve composite runes):

- **Item1, plaintext-autokey:** `M-EA-N-NG / C-Y-M / IA-N-J-S-T-S-C-T / N-EA / IA-EA-AE-A-E / IA-J-X / R-E-O / OE-G-R-H-W-R-EA / TH-Y-J`
- **Item1, ciphertext-autokey:** `M-EA-N-NG / R-D-T / Y-M-EO-G-A-I-H-Y / J-M / T-P-N-N-P / J-TH-S / G-M-W / IA-B-G-Y-OE-F-I / EA-R-C`
- **Item2, plaintext-autokey:** `W-D-S-EO / TH-W-EA-IA / M-N-X-N-AE-B / TH-M-B-Y / OE-L-D-E-J-R-OE-Y-I-EO / EO-N-A-AE / G-P-N-EA-NG-A-AE / OE-AE-D-H-G-EA / Y-X-EO-NG-IA`

These immediate post-crib readouts are incoherent, and the full outputs have GP29 IoCs near the uniform 1/29 baseline (**0.034483**), unlike native solved LP1/LP2 English GP controls. No complete unknown passage or plausible cipher instruction appears. The mere four-rune `MEANING` prefix is retained by construction; it does not validate its own historical interpretation.

## Reproduction and decision

The [single-file Windows-compatible Node22 SFT](../sims/lp2_p36_38_numbered_source_autokey_continuation_sft.cjs) reads both pinned source resources, asserts all five source word/rune lengths, uses the authentic solved p57 95-rune GP plaintext as an exact synthetic encryption/decryption positive for every tested mode, and verifies complete original-cipher replay for all 20 source-frozen variant/item combinations. Its outputs display all first-nine-word readouts and exact IoCs.

**Decision:** Both textbook four-back plaintext and ciphertext autokey fail to extend the source-seeded `MEANING` local interpretation beyond the first four runes in item1. The four holdout passages also remain ciphertext-like. The red numbered block still lacks a first-party cipher opcode, and the original short `MEANING` alignment remains a *candidate*, rather than a solved line. Do not repeat a four-symbol autokey under arbitrary new seeds unless an independent original instruction selects them.
