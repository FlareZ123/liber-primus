# Onecool 2017 LP2 transcription: complete original-scan adjudication

## Decision

Director issue #3380 asked whether any of the **30 minimal rune edits**
between the August 2017 `onecool/3301-public` LP2 JSON and the current
image-corrected corpus identifies a canonical transcription error.

**Result: 30/30 sites resolve from the original 2400×3600 scans, with zero
ambiguous sites and zero canonical corrections.** The current corpus matches
the printed manuscript at every disputed rune position. The split is 18
historical substitutions, six historical omissions, and six historical-only
insertions. No plaintext, key, language score, or downstream cipher output
was used to choose a reading.

The exact edit list is reproduced by
`sims/lp2_onecool_2017_numeric_transcription_gate_sft.cjs` (workflow run
`46129355600`, artifact `onecool-2017-numeric-transcription-gate`).
Physical LP2 page p maps to original source JPEG `17+p.jpg`; offsets below
are zero-based current-corpus rune offsets. Line numbers are source-text
lines and local positions count runes only.

| page | JPEG | offset | line:local | 2017 → current | original-scan adjudication |
|---:|---:|---:|---:|---|---|
| p1 | 18 | 70 | 4:0 | F ᚠ → L ᛚ | current L |
| p6 | 23 | 68 | 4:0 | A ᚪ → O ᚩ | current O |
| p8 | 25 | 53 | 4:3 | A ᚪ → AE ᚫ | current AE |
| p8 | 25 | 213 | 11:6 | A ᚪ → O ᚩ | current O |
| p10 | 27 | 169 | 8:18 anchor | extra W ᚹ | printed **7**, not rune |
| p12 | 29 | 165 | 8:16 | A ᚪ → O ᚩ | current O |
| p15 | 32 | 6 | 1:6 | D ᛞ → Y ᚣ | current red Y; independently predicted by held-out lower-red/grid DH state (1/29 glyph variants) |
| p17 | 34 | 150 | 7:14 | omitted AE ᚫ | visible AE |
| p17 | 34 | 151 | 7:15 | omitted IA ᛡ | visible IA |
| p24 | 41 | 172 | 8:15 | A ᚪ → AE ᚫ | current AE |
| p27 | 44 | 5 | 1:5 | A ᚪ → O ᚩ | current red O |
| p29 | 46 | 165 | 8:3 | M ᛗ → O ᚩ | current O |
| p30 | 47 | 23 | 2:3 | A ᚪ → O ᚩ | current O |
| p30 | 47 | 39 | 2:19 | A ᚪ → O ᚩ | current O |
| p31 | 48 | 223 | 10:22 | AE ᚫ → W ᚹ | current W |
| p33 | 50 | 100 | 7:9 | W ᚹ → B ᛒ | current B |
| p33 | 50 | 117 | 8:7 | W ᚹ → B ᛒ | current B |
| p35 | 52 | 269 | 12:20 | X ᛉ → EA ᛠ | current EA |
| p36 | 53 | 0 | 1:0 | E ᛖ → Y ᚣ | current Y |
| p36 | 53 | 99 | 6:0 anchor | extra U ᚢ | printed **1**, not rune |
| p37 | 54 | 0 | 1:0 anchor | extra TH ᚦ | printed **2**, not rune |
| p37 | 54 | 91 | 5:0 anchor | extra O ᚩ | printed **3**, not rune |
| p37 | 54 | 189 | 10:0 anchor | extra R ᚱ | printed **4**, not rune |
| p38 | 55 | 57 | 4:0 anchor | extra C ᚳ | printed **5**, not rune |
| p38 | 55 | 126 | 7:4 | A ᚪ → O ᚩ | current O |
| p39 | 56 | 36 | 2:13 | omitted N ᚾ | visible N |
| p57 | 74 | 23 | 2:3 | M ᛗ → E ᛖ | E in TUNNEL |
| p57 | 74 | 65 | 4:11 | omitted E ᛖ | E in CENCES |
| p57 | 74 | 76 | 5:4 | omitted I ᛁ | I in DIVINITY |
| p57 | 74 | 77 | 5:5 | omitted N ᚾ | N in DIVINITY |

## Numeral contamination is exact

All six historical-only insertions are visibly printed Arabic subsection
labels: **1, 2, 3, 4, 5, 7**. Onecool encoded their shapes as GP runes
U, TH, O, R, C, W respectively. They occur exactly at the numbered line
starts and are layout metadata, not ciphertext. This explains the entire
historical insertion/deletion imbalance without any cipher assumption.

### Independent p15 state cross-check

After this image adjudication was completed, the p15 lower-red11/number-square
state route supplied a genuinely independent check on the disputed p15
offset6. That coordinate lies in the withheld upper red span. Deriving the
DH23 state without it predicts upper word2 descriptor
`(L,S,P)=(5,8,26)`; exhaustive substitution of all 29 GP glyphs at
offset6 leaves only **Y/index26**. The onecool **D/index23** reading instead
gives `(5,5,23)`. See
`sims/lp2_p15_offset6_transcription_holdout_sft.cjs` and
`im-results/lp2-p15-red-dh-state-packet.md`.

## Consequence

The canonical LP2 ciphertext and all derived rune-index resources stay
unchanged. The 2017 stream is not an alternate source reading at these 30
sites; its disagreement set is fully explained by glyph substitutions,
omitted printed runes, and numeral/rune category errors. Active
cryptanalytic mechanisms consuming the current canonical corpus therefore
keep identical inputs.

For the separate lineage task (#3381), the six numeral absorptions plus the
18 substitution coordinates are now a locked historical error fingerprint.
They can be compared against older transcriptions without counting the 2017
copy as independent source evidence.
