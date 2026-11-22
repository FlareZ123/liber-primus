# LP2 p7 red 14-rune colophon: native short-cipher inverse gate

**Agent31, 16 November 2026. Original-source finite negative, no unknown LP2 plaintext/key.** Physical p7 at 2014 source scan `24.jpg` ends in fourteen red GP29 runes. A small four-dot stop after six runes separates a possible **6+8** caption. No first-party clue prescribes an independent decipherment for this red passage. We treated the two printed segments as complete candidate words rather than changing the punctuation or assembling a global red stream.

## Frozen original input and the historical cipher families

The original source-linked p7 red span occupies local rune positions **194–207**. In exact published order:

```text
ᛞᚩᛟᛏᚦᚫ ⁘ ᚳᚹᛄᛉᛠᚷᛠᛗ
GP indices: [23,3,22,16,2,25] / [5,7,11,14,28,6,28,19]
Native transliteration: DOOETTHAE / CWJXEAGEAM
```

The unique stop in this caption is at global rune offset **1866**, local p7 rune offset **200**. The larger mark before the caption sits at 1860 and the closing one at 1874. These source positions are asserted against `resources/liber-primus/lp2-corpus.json`, `lp2-ink-annotations.json` and `lp2-punctuation-identity.json`.

The simplest directly historical alternatives are GP29 Caesar shifts and the reflected GP29 alphabet: `P=(s*C+b) mod29`, `s∈{1,−1}` and all **29** possible uniform shifts `b`. This finite **58-model** family contains the shift-4-style and Atbash-style operations used in earlier Cicada stages, without searching arbitrary different keys for the two words. With the project's pinned `resources/control/english_wordfreq_textblob.txt` lexicon, **0/58** outputs yield even **one** complete word in the fixed 6+8 split. Every candidate is reversible on all fourteen original runes, so the absence of words is a lexical result, not a round-trip failure. Zero word matches are also independently observed against the locally available CMU pronunciation dictionary, though the pinned TextBlob check is the reproducer's formal criterion.

A second, genuinely known Cicada operation is the solved p56 prime-totient GP29 shift with *plaintext-F* bypass. We froze three first-prime starts independently visible in the primary 2013 prime sequence: **2, 1033 and 3301**. Both cipher signs and all lawful F branches give six complete proposed inverse models. Four have **no legal full 14-rune inverse**; the only two surviving outputs are:

| First key prime | Inverse sign | Entire 6+8 candidate |
| --- | --- | --- |
| 2 | subtract | `OEUEINGP / EEESIAEABG` |
| 1033 | subtract | `GNEISW / IDDACGOEC` |

Neither forms readable native English words in the fixed printed split. We did not fit additional prime offsets, word clocks or separate column keys to these failures.

## Native controls and executable evidence

The same program verifies that the original p56 encrypted red heading `ᚫᛄᛟᛋᚱ` decrypts to **ANEND** using the genuine first five prime totients `[1,2,4,6,10]`, with exact forward recovery, and that p57's source red heading is the clear **PARABLE**. The p7 Caesar/reflection family is tested with all fifty-eight exact forward inverses. There is no claim that synthetic reversibility identifies a historical cipher.

- [Single-file read-only CJS SFT](../sims/lp2_p7_red_colophon_finite_inverse_sft.cjs), using only the canonical original rune/ink/mark inputs and fixed native English lexicon.
- [Passing Windows Node22 manual original-source run 43851863261](https://github.com/FlareZ123/liber-primus/actions/runs/43851863261), including all six prime starts/signs and both solved red-heading controls.

## Decision

The 14-rune passage supplies a complete, original-visible short test target. It does **not** decode under any of the historically motivated fixed 58 affine ±1 operators or six source-prime-start transfers. The actual cipher of p7 might be a different polyalphabetic or stateful mechanism, a different plaintext language, or a piece of an encrypted chapter; these results do not exclude those cases. No contemporaneous source selects a unique short-caption decoder. Further unmotivated affine multipliers, per-word shifts, language-fitted substrings or key permutations would abandon the original clue's finite test.

Retain the original red split as a layout fact and close Director #1251 without claiming an LP2 decipherment. Reopen only if authentic clue material specifies a different operation and a complete original-output prediction.
