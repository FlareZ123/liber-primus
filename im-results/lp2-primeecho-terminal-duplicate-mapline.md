# Historical prime_echo exhaustion at p55: source-selective line boundary and two-word p27 handoff

**Agent2 source observation; Agent27 Director #1506/#1511 correction and follow-up, 18 November 2026. Status: the finite historical source sharply selects a p55 physical line break. The earlier three-word `CX / DJU / BEI` object is invalid under canonical parsing; a narrower complete-word handoff survives because the first intact pair after boundary300 is `DJU / BEI`, whose only other adjacent occurrence is p27 line2. No unknown plaintext, authenticated LP2 key, or direction operator is recovered.**

## 1. Finite historical source and exact exhaustion

The pinned 2013 Cicada OS `prime_echo` artifact supplies exactly **464 ordinary primes from 2 through 3301** and then stops. It pauses exceptionally after **1033** and **3301**. Under the already-established p56 sign+ / literal-plaintext-F-transparent inverse, applied here as a candidate operation on original p54-p55:

- p54-p55 contains 308 runes;
- exhaustive source-bounded first-exhaustion over all 464 initial cursors and both authentic ciphertext-F branches gives **41 path histories at 36 distinct rune boundaries**;
- eight histories hit physical line ends, at five distinct boundaries: **19, 40, 57, 80, 300**;
- every one of the 41 exhaustion histories consumes terminal prime **3301** on its final keyed rune, so 3301 consumption itself is tautological within this first-exhaustion sample;
- restricting to cases where 3301 lands on a **physical line end** still leaves eight histories at those five boundaries, so “consume3301 on the last rune of a line, then exhaust” does **not** uniquely select boundary300;
- exactly **three** histories ever consume both historical pause values 1033 and 3301;
- those three alone carry the earlier pause1033 as well; their 3301 positions are all terminal-chapter rune299, immediately before boundary300;
- those three are starts167/167/168 and all first exhaust at **boundary300**, immediately after p55 printed line3;
- their 1033 item is consumed at p54 offsets **5/6**, inside the original nine-rune red title.

A matched source-only control takes the last 308 original runes of each of the nine visual chapters and asks whether the same finite-list family first exhausts exactly at the start of the chapter's final rune line. The exact path counts are:

```text
0 / 0 / 0 / 0 / 0 / 0 / 0 / 0 / 3
```

Only p54-p55 is positive. This is a genuine source-selectivity result for the **physical line boundary** under the tested finite-prime family.

### #1619 exact player-visible pause semantics

The extracted 2013 `prime_echo` shell source resolves what the two exceptional values actually did for a contemporary player. Ordinary primes are printed with a **0.05-second** delay. Exactly `1033` and `3301` are followed by `sleep 2`, a forty-fold longer visible hold. There is no prompt, input read, state variable, screen clear, sound, branch, or reset at either special number.

At **1033** the display pauses mid-line after printing `1033<TAB>`, then resumes on the same line with1039. At **3301** the same two-second hold occurs after the final prime. Only after `prime_echo` exits does the parent `cicada` script clear the screen and display the signed `@1231507051321 / The key is all around you` message for ten seconds.

This sharpens the historical interpretation. The source genuinely marks **1033 then3301 as ordered pause/hold events**, and the p55 boundary300 histories are uniquely the first-exhaustion histories that consume both. The source supplies no reset or alternate cipher state at1033. Consumers that require one are historically unsupported unless another clue independently provides it. The exact reconstruction and extracted blob hashes are preserved in [the #1619 report](lp2-primeecho-player-visible-pause-semantics.md).

### #1580 terminal-prime accounting

The complete 41-history accounting separates the endpoint from the discriminant. Because 3301 is the final entry in the finite historical list, **all 41** first-exhaustion histories consume 3301 exactly one rune before their exhaustion boundary. The line-end subset is:

| start index | start prime | 3301 consumed at terminal offset | exhaustion boundary |
| ---: | ---: | ---: | ---: |
| 445 | 3137 | 18 | 19 |
| 424 | 2953 | 39 | 40 |
| 407 | 2801 | 56 | 57 |
| 385 | 2663 | 79 | 80 |
| 386 | 2671 | 79 | 80 |
| 167 | 997 | 299 | 300 |
| 167 | 997 | 299 | 300 |
| 168 | 1009 | 299 | 300 |

Therefore **3301-at-a-line-end is not a boundary300 selector**. The selective condition remains the two-pause chain already frozen by #1506: only starts167/167/168 consume the earlier exceptional pause1033 and later consume3301, and all three then exhaust at boundary300. In those histories 1033 lands at terminal offsets5/6 inside p54's red title, while 3301 lands at offset299 at the p55 line3 end. This distinction rules out treating prime3301 alone as the procedural reason to choose that line break.

### #1557 line-break word-carry census

The boundary300 cut is ordinary in the manuscript's typography rather than a distinctive instruction to treat `CX` as a separate object. A canonical census of every physical break between two rune-bearing printed lines gives:

- **539** physical rune-line breaks in p0-p55;
- **388/539 (71.99%)** fall inside a canonical complete word;
- **151/539** coincide with a complete-word boundary;
- the exact p55 geometry, a six-rune word split **4/2**, occurs **13 times** manuscript-wide, on p6, p8, p9, p11, p17, p28, p32, p37, p43, p45, p47, p52 and p55.

The nine visual-chapter final-line starts used by #1506 are `2/8, boundary, boundary, 1/6, 3/5, 2/3, 1/3, boundary, 4/2`. Thus **6/9** chapter-final line starts also split a carried word. p55 is the only 4/2 member of that nine-case panel, but the same 4/2 typography occurs twelve other times elsewhere in the original source, so that small-panel uniqueness does not supply a source-visible opcode.

Director #1557 therefore follows its negative fork: retain finite `prime_echo` as a selector for the p55 physical line break, while **retiring the carried-word split and `CX` fragment as clues absent independent source evidence**. The canonical consumer must ignore the mere fact that the boundary lands inside `CEAIMCX`. Reproducer: [`sims/lp2_linebreak_wordcarry_census_sft.cjs`](../sims/lp2_linebreak_wordcarry_census_sft.cjs), Windows Node22 [PASS 44395318808](https://github.com/FlareZ123/liber-primus/actions/runs/44395318808).

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


### Independent GP0-table offset28 removes the retrospective coordinate dependency

A later, independently reproduced navigation grammar supplies the p27 offset without using the postselected sum/difference transform above.

Solved p57 has canonical GP0 `FIND=42`. Original p50 cell42 is `0S`, whose base60 and base59 readings are both **28**. A separate signed-2016 GP0-table circuit reproduces the same operation on authenticated 2016 words. Since finite `prime_echo` exhaustion already selects **p27** through the unique repeated intact pair `DJU / BEI`, the two source routes combine as:

`prime_echo terminal pair → p27`

`p57/2016 FIND → table byte28 → p27 rune offset28`.

Original p27 offset28 is exactly the start of `DJU`, followed immediately by `BEI` at offset31. The older `(x+y,x-y)=(27,28)` arithmetic remains retrospective and should stay classified as a weak mnemonic.

This materially strengthens the **p55 → p27:28** handoff while still stopping short of plaintext recovery or a reversible unknown-rune decoder. See [p57/p50 bridge](lp2-p57-divinity-p50-center13-bridge.md) and [signed-2016 GP0 table circuit](lp2-2016-gp0-table-word-pointer-circuit.md).

### Provisional continuation to the p50 printed-token bracket

A new follow-up applies the already-frozen 2016 GP-prime / 58-page word-address hypothesis to the **source-selected intact pair**, without changing its arithmetic. On the p27 copy, `DJU=129` maps to p13:w2 `NAEWG`, whose sum166 maps to the rune-free **p50 local index2**. The adjacent `BEI=159` branch takes 14 word-map steps before merging into the same p27 `DJU` node and therefore reaches the same p50 index2. Across all 2,916 adjacent page-local segment pairs, only three have the broader topology "second eventually reaches first and first terminates on p50"; all three are nested on this trajectory, so convergence itself is not treated as rare evidence.

The authenticated 2016 word `lies` independently selects adjacent **p50 local index3** under the same frozen hypothesis. Those two selected printed tokens are `3L,3D`. Their only other occurrences in the 256-cell table are reversed at local indices48,47, giving the radix-independent interval **`3L 3D [43 tokens] 3D 3L`**. Exhausting every printed-token `A B ... B A` bracket finds this as the sole instance. Its exact midpoint is the table's unique printed token **`13`**.

Conventional base60 supplies one further finite semantic continuation: the first enclosed token `2r=173` addresses clear p57:w2 **THE**, then `THE=72` addresses **FOLD**, whose already documented recursive route reaches p56 **END**. Under the lowercase-f-omitting base59 fork, `2r=170` instead addresses p54:w2 `IADPNGUWAM`. This is a conditional base60 discriminator downstream of the still-provisional 58-page address rule.

The result adds a concrete continuation to the p55 -> p27 handoff. It does not recover unknown plaintext or authenticate the address grammar. Full scope, controls, the direct historical-key negative, and reproduction are in [the terminal/p50 bracket report](lp2-terminal-p50-token-bracket-handoff.md) and [SFT](../sims/lp2_terminal_p50_bracket_wordmap_sft.cjs), Windows Node22 [PASS 44403562261](https://github.com/FlareZ123/liber-primus/actions/runs/44403562261).

## 4. Director decisions for #1506 and #1511

For **#1506**, the original three-word completion gate fails because exhaustion cuts `CEAIMCX`. The follow-up complete-word test recovers a narrower positive: boundary300 alone exposes the repeated intact pair `DJU / BEI`, selecting p27 as a source-constrained navigation candidate. p34 and all `CX`-based arithmetic remain retired.

For **#1511**, the frozen feature was defined over three consecutive complete words. The target fails before any permutation null is meaningful. The canonical graph has **90 frequency-2 word types** and exactly one complete three-word window whose three word types all have frequency2: `BF / DJU / BEI` at p27 line2. The p55 terminal material is `CEAIMCX / DJU / BEI`, with frequencies **1 / 2 / 2**. The exact frozen #1511 conjunction has **zero observed matches**.

This correction is stronger than a rarity estimate because it removes the target event from the stated sample space.

## 5. Reproduction

- `sims/lp2_primeecho_terminal_mapline_sft.cjs` reproduces the full 41-history finite-prime exhaustion census, exact 1033/3301 consumption offsets, the eight-history/five-boundary 3301 line-end accounting from #1580, matched chapter control, and the canonical boundary-inside-word correction. Windows Node22 [PASS 44394714513](https://github.com/FlareZ123/liber-primus/actions/runs/44394714513).
- `sims/lp2_terminal_completeword_graph_sft.cjs` reconstructs all 2,896 complete printed words and asserts the p55/p34 wrap behavior, complete-word frequencies, the unique all-frequency2 triple, and zero frozen #1511 matches.
- `sims/lp2_primeecho_intact_pair_handoff_sft.cjs` enumerates all 36 finite-list exhaustion boundaries, proves boundary300 is the sole boundary whose first two intact complete words form an adjacent pair repeated elsewhere at p27, and runs the frozen p27:28 sum/difference coordinate gate plus its 12-transform signed family check.
- Source transcription: `resources/liber-primus/lp2-transcription.txt`.
- Original p55 image: `resources/liber-primus/72.jpg`.

No language score, GP-sum direction rule, candidate plaintext, extended prime sequence, or tuned skip law is used.
