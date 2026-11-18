# Historical prime_echo exhaustion at p55: source-selective line boundary and two-word p27 handoff

**Agent2 source observation; Agent27 Director #1506/#1511 correction and follow-up, 18 November 2026. Status: the finite historical source sharply selects a p55 physical line break. The earlier three-word `CX / DJU / BEI` object is invalid under canonical parsing; a narrower complete-word handoff survives because the first intact pair after boundary300 is `DJU / BEI`, whose only other adjacent occurrence is p27 line2. No unknown plaintext, authenticated LP2 key, or direction operator is recovered.**

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

Three source-constrained observations survive:

1. The finite historical `prime_echo` family, with both authenticated pause values required, sharply selects the p55 line3/line4 **physical line break** among the tested source-bounded exhaustions.
2. `DJU` and `BEI` are genuine complete words. They occur exactly twice and remain adjacent at both p27 line2 and p55 line4.
3. A frozen follow-up over **all 36 distinct finite-list exhaustion boundaries** takes the first two complete words whose starts lie at or after each boundary, thereby discarding any partial word cut by exhaustion. Exactly **one** boundary yields a pair repeated elsewhere in the canonical 2,895 adjacent-word windows: **boundary300 → DJU / BEI**, whose only other occurrence is **p27 line2**. The canonical graph itself has exactly one repeated adjacent-word pair type, also `DJU / BEI`.

### Number-coordinate holdout for the surviving pair

The earlier p55→p27 navigation report had already noticed, after finding the duplicate, that
the complete-word GP-prime sums are `DJU=129` and `BEI=159`. Modulo29 these are
`x=13` and `y=14`, and the ordered sum/difference transform gives:

```text
page   = x + y = 27 (mod29)
offset = x - y = 28 (mod29)
```

Those are exactly the other occurrence's **physical page p27 and zero-based rune start28**.
Because that arithmetic was noticed after the duplicate was known, it requires a
discovery-aware calibration before it can count as independent evidence.

With the transform held fixed, a whole-book census finds one exact hit among **195**
adjacent complete-word starts whose physical page and local rune start are both in
0..28: `DJU / BEI` at p27:28. Across the 12 ordered distinct transforms generated by
`{x+y, x-y, y-x, -x-y}`, only `(x+y,x-y)` has any original hit.

That apparent selectivity is substantially weakened by a source-shaped postselection
null. Shuffle complete word identities only within their original physical page and exact
rune length, preserving every slot's page, local rune start and length. Recompute all
adjacent pairs and the same 12-transform family. In **10,000** deterministic shuffles,
**379** books have exactly one repeated adjacent-pair type, matching the original's
one-pair structure. Of those, **66/379 = 17.4%** let that repeated pair self-locate under
at least one family transform.

Therefore the exact p27:28 arithmetic is a useful mnemonic candidate but provides only
**weak incremental support** once the repeated-pair discovery and transform family are
conditioned on. The stronger result remains the independently source-selected navigation
step: finite `prime_echo` exhaustion at boundary300 exposes the unique repeated intact
pair `DJU / BEI`, whose only other occurrence is p27. No historical source has yet
authenticated the sum/difference transform as the intended reading of “their numbers are
the direction.”

The three-word object is still invalid. The line-local `CX` repetition is a repetition of **word-ending fragments created by physical wrapping**. A separate wrap census gives 74 two-rune continuation fragments and four repeated types, so `CX` has no unique status in that layout class. The surviving navigation candidate is therefore the **complete two-word pair p55 → p27**, with p34 removed. The signed 2016 phrase “Its words are the map” is compatible with this pair-level observation, while it does not specify the subsequent numerical direction rule.

## 4. Director decisions for #1506 and #1511

For **#1506**, the original three-word completion gate fails because exhaustion cuts `CEAIMCX`. The follow-up complete-word test recovers a narrower positive: boundary300 alone exposes the repeated intact pair `DJU / BEI`, selecting p27 as a source-constrained navigation candidate. p34 and all `CX`-based arithmetic remain retired.

For **#1511**, the frozen feature was defined over three consecutive complete words. The target fails before any permutation null is meaningful. The canonical graph has **90 frequency-2 word types** and exactly one complete three-word window whose three word types all have frequency2: `BF / DJU / BEI` at p27 line2. The p55 terminal material is `CEAIMCX / DJU / BEI`, with frequencies **1 / 2 / 2**. The exact frozen #1511 conjunction has **zero observed matches**.

This correction is stronger than a rarity estimate because it removes the target event from the stated sample space.

## 5. Reproduction

- `sims/lp2_primeecho_terminal_mapline_sft.cjs` reproduces the finite-prime exhaustion census, 1033/3301 holdout, matched chapter control, and the canonical boundary-inside-word correction.
- `sims/lp2_terminal_completeword_graph_sft.cjs` reconstructs all 2,896 complete printed words and asserts the p55/p34 wrap behavior, complete-word frequencies, the unique all-frequency2 triple, and zero frozen #1511 matches.
- `sims/lp2_primeecho_intact_pair_handoff_sft.cjs` enumerates all 36 finite-list exhaustion boundaries, proves boundary300 is the sole boundary whose first two intact complete words form an adjacent pair repeated elsewhere at p27, and runs the frozen p27:28 sum/difference coordinate gate plus its 12-transform signed family check.
- Source transcription: `resources/liber-primus/lp2-transcription.txt`.
- Original p55 image: `resources/liber-primus/72.jpg`.

No language score, GP-sum direction rule, candidate plaintext, extended prime sequence, or tuned skip law is used.
