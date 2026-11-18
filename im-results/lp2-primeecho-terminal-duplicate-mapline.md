# Historical prime_echo exhaustion at p55: source-selective line boundary, complete-word map rejected

**Agent2 source observation; Agent27 Director #1506/#1511 correction, 18 November 2026. Status: the finite historical source sharply selects a p55 physical line break, but the proposed three-complete-word navigation object is invalid under the canonical 2,896-word parsing. No unknown plaintext, authenticated LP2 key, or direction operator is recovered.**

## 1. Finite historical source and exact exhaustion

The pinned 2013 Cicada OS `prime_echo` artifact supplies exactly **464 ordinary primes from 2 through 3301** and then stops. It pauses exceptionally after **1033** and **3301**. Under the already-established p56 sign+ / literal-plaintext-F-transparent inverse, applied here as a candidate operation on original p54-p55:

- p54-p55 contains 308 runes;
- exhaustive source-bounded first-exhaustion over all 464 initial cursors and both authentic ciphertext-F branches gives **41 path histories at 36 distinct rune boundaries**;
- eight histories hit physical line ends, at five distinct boundaries: **19, 40, 57, 80, 300**;
- exactly **three** histories ever consume both historical pause values 1033 and 3301;
- those three are starts167/167/168 and all first exhaust at **boundary300**, immediately after p55 printed line3;
- their 1033 item is consumed at p54 offsets **5/6**, inside the original nine-rune red title.

A matched source-only control takes the last 308 original runes of each of the nine visual chapters and asks whether the same finite-list family first exhausts exactly at the start of the chapter's final rune line. The exact path counts are:

```text
0 / 0 / 0 / 0 / 0 / 0 / 0 / 0 / 3
```

Only p54-p55 is positive. This is a genuine source-selectivity result for the **physical line boundary** under the tested finite-prime family.

## 2. Canonical word-boundary correction

The earlier report treated each rune span on a physical line as a printed word. That is wrong for this source format. The repository's canonical word parser, already used across word-level research, treats `/` and whitespace as physical wrapping and **does not flush a word at a line or page break**. On p0-p55 it reproduces the established source totals:

- **12,956** runes;
- **2,896** complete printed words;
- **32** words crossing physical page boundaries.

Under that parser, p55 ends with these three complete words:

| complete word | physical lines | global frequency |
| --- | --- | ---: |
| `CEAIMCX` = `ᚳᛠᛁᛗᚳᛉ` | starts line3, ends line4 | 1 |
| `DJU` = `ᛞᛄᚢ` | line4 | 2 |
| `BEI` = `ᛒᛖᛁ` | line4 | 2 |

The finite-prime boundary is global rune boundary12948. The spanning word `CEAIMCX` occupies global runes12944..12949. Therefore boundary300 cuts it **after 4 of its 6 runes**, leaving only the final two-rune suffix `CX` on line4.

So the line-local display

```text
CX / DJU / BEI
```

contains one **continuation fragment** followed by two complete words. It is not a three-word suffix and does not begin at a complete-word boundary.

The p34 line10 `CX` used as the purported duplicate destination has the same problem: it is the final line-wrapped suffix of the complete word `BGCX`, which starts on p34 line9. Across the entire canonical p0-p55 word graph there are **zero complete words exactly equal to `CX`**.

## 3. What survives

Two observations remain valid:

1. The finite historical `prime_echo` family, with both authenticated pause values required, sharply selects the p55 line3/line4 **physical line break** among the tested source-bounded exhaustions.
2. `DJU` and `BEI` are genuine complete words. They occur exactly twice and remain adjacent at both p27 line2 and p55 line4.

The stronger proposed object does not survive. The line-local `CX` repetition is a repetition of **word-ending fragments created by physical wrapping**, not a repeated complete word. Therefore the signed 2016 phrase “Its words are the map” cannot, without an additional source cue, justify treating `CX / DJU / BEI` as three mapped words.

## 4. Director decisions for #1506 and #1511

For **#1506**, the boundary-selectivity half is positive while the completion gate fails: the untouched suffix does **not** start at a complete-word boundary and the claimed three-word map object is not present in the canonical word graph. Downstream direction arithmetic must not inherit the earlier confidence.

For **#1511**, the frozen feature was defined over three consecutive complete words. The target fails before any permutation null is meaningful. The canonical graph has **90 frequency-2 word types** and exactly one complete three-word window whose three word types all have frequency2: `BF / DJU / BEI` at p27 line2. The p55 terminal material is `CEAIMCX / DJU / BEI`, with frequencies **1 / 2 / 2**. The exact frozen #1511 conjunction has **zero observed matches**.

This correction is stronger than a rarity estimate because it removes the target event from the stated sample space.

## 5. Reproduction

- `sims/lp2_primeecho_terminal_mapline_sft.cjs` reproduces the finite-prime exhaustion census, 1033/3301 holdout, matched chapter control, and the canonical boundary-inside-word correction.
- `sims/lp2_terminal_completeword_graph_sft.cjs` reconstructs all 2,896 complete printed words and asserts the p55/p34 wrap behavior, complete-word frequencies, the unique all-frequency2 triple, and zero frozen #1511 matches.
- Source transcription: `resources/liber-primus/lp2-transcription.txt`.
- Original p55 image: `resources/liber-primus/72.jpg`.

No language score, GP-sum direction rule, candidate plaintext, extended prime sequence, or tuned skip law is used.
