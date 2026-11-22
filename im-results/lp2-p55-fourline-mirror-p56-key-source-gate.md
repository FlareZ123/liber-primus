# Original p55 four-line reflection under the genuine p56 prime/totient cipher

**Agent 32, 17 November 2026. Classification: bounded original-source mechanism test.** No unknown Liber Primus plaintext or key was recovered. The only complete native-F inverse among eight fixed page-layout readouts is a reversal of each original printed line. All three surviving output tapes are nonprose, so the algebraic survival is **not** a p55 decipherment.

## What selects the test

The original image `72.jpg`, physical LP2 p55, has a facing-winged insect beneath a pale tree. The genuine following plaintext p57 parable says “the end is only the beginning,” and p55 prints four separate lines of GP29 runes. These facts permit a bounded question: if a solver reads the printed lines backward, does the following page's independently known prime-totient/F-transparent operation recover native plaintext? Neither the artwork nor parable specifically commands per-line reversal, so the tested operation is a **hypothesis**, not an authenticated cipher instruction.

The exact source text `resources/liber-primus/lp2-transcription.txt` and independent `lp2-corpus.json` agree on **76** original p55 runes in four printed lines of lengths **24, 22, 22, 8**. The last printed line contains the already-known terminal six-rune `DJU BEI` pair. No rune was corrected or reclassified. The original p56, 85 ciphertext runes, and the published solved-native `AN END` plaintext are held independent of p55.

## Exact native cipher, exhaustive inverse, and results

Use p56's established encryption literally: `P=F` emits ciphertext `F` without consuming a prime; any other `P` emits `C=P+φ(prime[k]) mod29` and consumes exactly one successive prime beginning at 2. A ciphertext `F` may therefore represent a transparent plaintext F or an encrypted non-F. An exhaustive dynamic program retains **every** legal key-pointer history and rejects only symbol-inconsistent branches. The original published solved p56 plaintext forward-encrypts to **all 85/85 original ciphertext runes**, consuming **84** prime shifts; its 85-rune native-GP plaintext has IoC **0.0700280112**.

The only eight orientations included were fixed before checking content: original, complete global reversal, reverse each line, reverse line order, odd/even printed-line boustrophedon, and those two boustrophedon choices after reversing line order. All use the same authentic prime-2 start, addition sign, transparency and GP29 alphabet. Exact zero-based first fully impossible ciphertext offsets are:

| Original source order | First impossible offset |
| --- | ---: |
| As printed | **39** |
| Reverse all 76 runes | **17** |
| Reverse each of four lines, retain line order | **none**, 3 complete legal paths |
| Reverse the order of four lines | **19** |
| Odd lines as printed, even lines backward | **62** |
| Even lines backward, odd lines as printed | **39** |
| Reverse line order, alternate even lines backward | **17** |
| Reverse line order, alternate odd lines backward | **19** |

All three complete paths under **reverse-each-line** consume **74** primes, re-encrypt to the exact reflected original ciphertext, and produce GP29 IoCs **0.03192982**, **0.03298246**, **0.03508772**. For each one the *first reversed printed word*, the original last three-rune `BEI` in reverse, decodes as GP `T TH O` (transliteration **TTHO**). The complete outputs are nonlinguistic:

1. `TTHOAACHNFOOOEEAUTHTHLBPEAIACCYROATHFDGIACCNGIAEOTHBNNGGHPIYSNGSEAGSEODPBXJGLAXHTHHAESEAUMUWPAEI`
2. `TTHOAACHNFOOOEEAUTHTHLBPEAIACCYROATHINGTHPUEAMBTYAEPOSRIAFIYSNGSEAGSEODPBXJGLAXHTHHAESEAUMUWPAEI`
3. `TTHOAACHNWYUTAEAIAAEXSWAAEEAULAEEAOEIAFNGTHPUEAMBTYAEPOSRIAFIYSNGSEAGSEODPBXJGLAXHTHHAESEAUMUWPAEI`

## Cryptanalytic decision

A full legal p56-F-aware inverse is **not** sufficient to infer plaintext. In particular, the p55 reflection's only legal original output family remains flat-distribution gibberish, and the first complete word is nonnative under its original printed boundary. The exact mechanism has no second independent source selector, and source-authenticated solved p56 plaintext is substantially more structured. Retire this specific **reverse-individual-lines + genuine p56 prime2/F-skip direct plaintext** reading while preserving the faint geometric observation; arbitrary rotations, sign flips, new key phases and extra layers lack an original instruction.

Reproduce with the standalone, read-only Node.js 22 CommonJS [original-source SFT](../sims/lp2_p55_fourline_mirror_p56_key_gate_sft.cjs), which asserts the 85/85 authentic p56 control, four p55 source-line lengths, all eight exact reachability results, three full surviving paths, and byte-exact re-encryption. The exact output strings and original inputs are stable; this report claims neither human-approved layout semantics nor an unknown-page plaintext.
