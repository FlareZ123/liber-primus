# Complete p33 black-word register against the authentic 2014 three-square stream

**Classification: source-structural observation and a bounded negative direct inverse; no unknown plaintext, key, or authored decoding instruction.** Physical p33's 49 printed black word starts include one word whose final two runes are on p34. Counting all complete words yields **198 original GP29 runes**, exactly twice the number of numerical cells in the original 2014 Stage7 OpenPuff magic-square file: `5²+7²+5²=99`. This supplies a naturally complete 99-pair receiver, previously obscured by the 196-rune p33-only cut. The pairwise direct 2014-square operations tested below produce no recognizably readable GP-native message.

## Independent source inputs and human-solve premise

- Unmodified p33–p34 source: `resources/lp2-transcription.txt`, checked against `resources/liber-primus/lp2-corpus.json`. P33 has 214 runes, of which 10+8 form two red headings; the remaining 196 black rune positions are 49 printed black word starts, split **21+28** between headings. P33 ends with glyph `ᛒ`; p34 begins `ᛗᛒ-`. The complete 49th word is therefore `ᛒᛗᛒ`, making **198**, including precisely two rune positions from p34. No padding or guessed symbols are inserted.
- Period-compatible key candidate: the original OpenPuff-extracted `resources/cicada2014-openpuff-magic-squares.txt`, 99 integers in printed `25+49+25` order; source reproduction and byte identity are documented in `im-results/cicada2014-stage7-chain-reproduction.md`. The three original matrix row sums are 3301, 1033, and 1033.
- Possible 2014 human route: notice p33's historically relevant 1033/3301 numerals, recall the authenticated three-square file, then use the physically complete 49 words to obtain 99 successive **two-rune** pairs. The source fixes the word carry and ordered numbers. **Neither the 2014 source nor the manuscript instructs pairing adjacent GP runes, reducing square numbers modulo 841, or applying arithmetic; this remains the missing author-selected opcode.**

This experiment differs from the previously executed **91+8=99** first-portion Hill test (`im-results/lp2-p33-91plus8-stage10-three-square-gate.md`), the p33-only 49-word/196-rune tests, the seven-page 1680-rune tensor test, and the separate five numbered-item 553-rune 7×79 matrix test.

## Frozen original-pair inverses

For 99 consecutive ciphertext pairs `(c0,c1)` in physical reading order, interpret `C=29c0+c1` in `0..840`; each historical numerical cell gives `K=cell mod841`. Evaluate the two natural finite, lossless arithmetic models with each sign:

1. **Base29 integer with carries:** `P=(C ± K) mod841`; emit its two base29 digits.
2. **Independent GP digits:** write `K=29k0+k1`; emit `((c0 ± k0) mod29,(c1 ± k1) mod29)`.

The table below is over the exact original 198-rune outputs; no phases, key shifts, matrix reorderings, alphabet fitting, transparent F convention, or language-driven switch was admitted.

| Candidate | Original 198-rune GP29 IoC | Full original replay | Source-native GP control |
| --- | ---: | --- | --- |
| Original untransformed register | 0.0336358509 | source baseline | n/a |
| Base29 integer minus | 0.0388145414 | 198/198 | 198/198 |
| Base29 integer plus | 0.0338409475 | 198/198 | 198/198 |
| Independent digit minus | 0.0363533815 | 198/198 | 198/198 |
| Independent digit plus | 0.0343536892 | 198/198 | 198/198 |

A solved p57 native-GP control has a much higher direct concentration (about 0.0627). The actual minus-carry output begins `YDPIHFMWDGEAAEFNEAMDPMNGXYIASALDOEHDFIAPHEUNSOEYSOEGOEAEDSADHMPTHRLOCHIIAGNPFJIMIAIOETEO`. These outputs contain no sustained recognizable native prose, and the 198-runic source does not identify a meaningful recovered instruction. The script checks both signs, both paired addition laws, 198/198 exact forward re-encryption, 198/198 authentic p57 native-GP synthetic positive, and a wrong-order key control.

**Exact incompatibility for multiplication.** A further natural fully paired model `C=K×P (mod841)` is impossible at original pair indices `6,18,40,58` (zero based). Authentic square values there are `812,812,232,232`, each divisible by 29, while original pair-cipher values are `821,247,603,515`, all **nonzero** modulo29. Consequently no `P` satisfies those four equations. The reverse direction `P=K×C` is many-to-one at those values, so cannot constitute a completely reversible original cipher absent extra supplied information. This is an exact, source-based obstruction to only the stated 99-slot multiplication law.

## Decision and reproducibility

The complete 49-word/99-pair alignment is genuine physical arithmetic with two historically authentic original operands. All four minimal additive pair decoders fail to produce recognizable native-GP prose; the direct multiplicative source law is algebraically impossible on original ciphertext. The historical material does **not select** the pair serialization or a cipher operation. No additional guessed alphabet or rescue layer is licensed by this observation.

**Reproduce:** `sims/lp2_p33_complete49word_2014_magic99_pair_sft.cjs` reads only committed original files, performs all assertions and prints the exact outputs. Run it through existing manual Windows Node22 workflow `.github/workflows/manual-readonly-commonjs-sft.yml`; Windows Node22 **PASS**, [GitHub Actions run 45066304664](https://github.com/FlareZ123/liber-primus/actions/runs/45066304664), head commit `1fa1e907815fadb376ad7d386f3e68aecf3bea7d`; all original-source assertions, controls, and replay checks succeeded. This is supporting `im-results/` evidence and does not change `results/README.md`'s established claim that all 56 unknown LP2 pages remain unsolved.

**Next causal fork:** a contemporaneous first-party clue, genuinely independent of the 198-rune language output, would have to choose the pair operation and how the three 25/49/25 sections are to be consumed. Otherwise retire this finite direct-pair path and prioritize a source-derived first opcode on one of the actual five numbered pp36–38 items rather than extending combinatorial pair scans.
