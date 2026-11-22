# Stage04 18-token text-guide transfer to all LP2 red spans

**Status (12 November 2026, Agent32; Director Issue #653): bounded negative.** The authentic 2014 Stage04 18-GP-token Vigenère operation is reproducible and its original onion-host control passes. Applying that exact operation at offset zero independently to all 18 original LP2 red spans (225 runes) yields no complete coherent instruction. No unknown LP2 plaintext, key, black-passage prediction, or Cicada continuation was recovered. Retire this exact key-transfer hypothesis; do not rescue it with phase, direction, key, or boundary tuning.

## Frozen source-selected operation

The historical 2014 Stage04 instruction was **LET THE TEXT GUIDE YOU**; its source-derived key phrase is **WELCOME PILGRIM TO THE**. The archived implementation is **sims/stage04_small_image_vigenere_repro.cjs**, pinned there to **neuroretransmit/cicada@ade9a02889ef8acbc8cde8edbfd0a785c369f4c3**.

The successful GP-tokenized key is exactly 18 symbols. Its fixed shifts in the archived reversed lookup order are:

[22, 11, 9, 24, 26, 10, 11, 16, 19, 9, 23, 25, 19, 10, 13, 26, 27, 11]

Use the same forward rune-order operation as Stage04:

P[j] = runeKeys[(index(C[j]) + key[j mod 18]) mod 29]

The key clock resets to zero for each complete red span. Every rune consumes one key symbol, including literal F. No phase, reversal, alternate line/span grouping, F mask, or fitted shift is introduced.

One source nuance matters: the archived legacy sourceKeyToShifts() helper peeks at TH without consuming the H and therefore emits **19** shifts. The same archived reproducer's corrected gpRuneKeyToShifts() consumes TH as one Gematria Primus rune, emits the 18 shifts above, and is the variant that exactly recovers the historical control. This test uses that explicitly source-documented, GP-corrected 18-token path rather than the 19-shift helper.

## Positive control and original-input checks

The original Stage04 ciphertext:

ᚦᛗᛞᛇᚠᛗᚪᚱ5ᚢᚫᛝᚱᛝ3ᛠᛗᛇᚠᛡ

decodes to rune sequence ᚪᚢᚩᚹᚣᚠᚷᛚ5ᛚᚳᛋᚠᛄ3ᚾᚩᚾᛡᚾ. Its GP transliteration alternatives contain exactly one normalized archived host:

**AUOWYFGL5LKZFJ3NONION**

The positive control consumes exactly 18 key symbols and passes. This validates the key serialization, direction, and rune-order implementation before the LP2 application.

The original LP2 inputs are **resources/liber-primus/lp2-ink-annotations.json**, **lp2-corpus.json**, and **lp2-transcription.txt**. The full transcription contains **13,136 runes**, matching the corpus; every one of the 18 annotation spans matches its page-local canonical rune slice. The spans total **225 runes**. Original hyphen word separators and ordinary full-stop punctuation are retained. The separately annotated 10/13/23-dot glyphs and physical line-wrap slashes are not treated as lexical punctuation.

Input blob SHAs:
- lp2-corpus.json: 054f2a0f780b7d46901acbe3d9bf4f0ac1801165
- lp2-ink-annotations.json: 3c52f209ce6bd7b138eaa2d4a9323526952ba9f9
- lp2-transcription.txt: 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7

## All 18 original red-span outputs

The table reports every full decoded rune stream and its canonical GP transliteration, preserving original hyphen and ordinary-period boundaries. Transliteration alternatives such as C/K, S/Z, NG/ING and IA/IO do not change the rune outputs.

| Physical page @ local rune offset | Runes | Decoded runes | Full output with original boundaries |
| --- | ---: | --- | --- |
| p0 @ 0 | 13 | ᚻᛗᛡᛡᚩᚠᚾᛏᚳᚷᛇᛒᚪ | HMIOIOOFNT-CGEOBA |
| p3 @ 0 | 16 | ᛈᛟᛝᚩᛖᛋᛈᚩᛋᛚᛁᛁᛡᚣᛉᛗ | POE-NGOESPOSLIIIO-YXM |
| p3 @ 119 | 3 | ᚷᚳᛄ | GCJ |
| p6 @ 71 | 11 | ᛒᛡᛞᛇᛏᛏᚾᚦᚹᛞᚷ | BIODEO-T-TNTHW-DG |
| p7 @ 194 | 14 | ᛏᛉᚦᛄᛠᚷᛏᛞᚢᛞᛟᚦᛖᚠ | TX-THJEAG.TDU-DOE-THEF |
| p8 @ 0 | 12 | ᚹᛝᛞᛉᛡᚪᚢᛝᛝᛟᚣᛈ | WNGDX-IOAUNGNGOEYP |
| p15 @ 0 | 9 | ᛟᛇᚠᛉᛝᚾᚻᚾᛉ | OEEOFX-NGNHNX |
| p15 @ 9 | 11 | ᛈᛇᚢᚱᚦᛄᛠᚫᚷᚾᛋ | PEOUR-THJ-EAAEGNS |
| p23 @ 0 | 16 | ᛞᚷᛏᛏᚩᚪᚳᛟᚠᚣᚱᚻᚷᛡᛞᛞ | DG-TTOACOE-FYR-HGIODD |
| p27 @ 0 | 19 | ᛇᚪᚷᛋᛇᛈᚷᛇᛡᚠᛇᚻᚠᚠᚱᛒᛈᛏᚷ | EOAG-SEOPGEOIOFEOHFFR-BPTG |
| p33 @ 0 | 10 | ᛏᛞᛞᚠᚣᛚᚷᛞᛡᛋ | TD-DFYLGDIOS |
| p33 @ 91 | 8 | ᛉᛈᛝᚳᚣᛋᚱᛠ | XPNG-CYSREA |
| p39 @ 119 | 3 | ᛚᛏᚪ | LTA |
| p40 @ 0 | 8 | ᛟᛚᛠᛝᚩᚱᚹᚪ | OELEA-NGORWA |
| p53 @ 128 | 51 | ᚾᚪᛏᚹᛇᛒᛠᛠᛝᛖᚦᚦᚢᛉᛄᛚᚫᛈᛒᛝᛝᛚᛄᚢᛞᛋᛒᚱᚳᚱᛞᛇᚣᛚᚾᚩᚫᛒᚾᚹᛏᛋᛗᛁᛟᚫᛠᚣᛞᛞᛟ | NATWEO-BEAEANG-ETHTHU-XJLAEPBNGNGLJU-DS-BRC-RD-EOYLNOAE-BNWTS-MIOEAEEA-YD-DOE |
| p54 @ 0 | 9 | ᛒᚢᚢᛖᚪᛇᚫᚣᚾ | B-UUEAEOAEYN |
| p56 @ 0 (solved control) | 5 | ᛖᛟᚦᛁᚢ | EOE-THIU |
| p57 @ 0 (solved control) | 7 | ᚷᚷᛈᛗᛉᚢᚠ | GGPMXUF |

## Held-out clue and mode-change controls

The p3 and p39 isolated red triplets retain their separate, previously documented LP1 Atbash readings:

- p3 ᛈᛞᚦ → **SCY** (the provisional SKY spelling)
- p39 ᛡᚳᛋ → **UDP**

Those are **not** outputs of the 18-token text-guide operation: under this test they become **GCJ** and **LTA**. The Atbash readings remain a distinct local observation; this experiment neither authenticates nor invalidates their intended status.

The solved p56 red text is **AN END** and is prime-totient encrypted; the solved p57 red text is **PARABLE** and is clear. Held out as mode-change controls, the text-guide transform yields **EOE-THIU** and **GGPMXUF**, respectively. These controls must not be used to tune or select the unknown-span key.

## Decision and scope

None of the **16 unsolved** complete red-span outputs is a coherent original-source-normal instruction. A few short fragments can be made to look suggestive only by abandoning complete word/span boundaries; that is explicitly not evidence and was not pursued. Consequently there is no frozen red-span message from which to predict an untouched black passage, and no reason to run a dependent full-body decoder.

**Close Director Issue #653:** retire this exact transfer of the authentic 2014 Stage04 18-token key to LP2 red spans. Do not run alternate phases, reverse direction, change key phrase, select substrings, or add arbitrary F handling. This does not exclude other independently source-selected LP2 ciphers or per-page mode changes, and it does not alter the separate provisional p3/p39 Atbash observations.

**Reproducer:** sims/lp2_red_textguide_18_key_original_sft.cjs. It reads the original repository corpus, ink annotations and printed transcription, checks the authentic Stage04 host control, verifies every red span against original page-local indices, and emits all full outputs. No new CI workflow or dependency is required.
