# p32–p47 low-digit road-map cross-link

**Status:** exact intermediate arithmetic; actionable navigation interpretation retired by source-first gate #3086. No plaintext, key, or complete decipherment recovered.

## Source-selected inputs

The p50 32×8 table is represented by 256 base-60 bytes in resources/liber-primus/lp2-grid-256.json. Define the low-digit transition

    T(x) = bytes[x] mod 60, for 0 <= x < 256.

The 2016 PGP-authenticated message supplies the vocabulary anchors ROAD/PATHS = GP0 54 and FOUND = GP0 36. The existing p28 low-digit report shows that these form the two-cycle 54 ↔ 36 under T. Across the full 256-state map, the cycles are fixed points 9 and 6 plus the two-cycle {54,36}; the latter has a 28-state basin.

Separately, the 2016 signed-message route report selects p32 through the EPIPHANY/SEEKS/THE/DEVOTED clause. The route from SEEKS=71 reaches p32 after 23 transitions, and p50[32]=115 enters the 11-cycle

    115 -> 247 -> 192 -> 0 -> 203 -> 68 -> 199 -> 47 -> 76 -> 114 -> 197 -> 115.

The original ink annotations record p32's red 13-dot punctuation at rune offset 121; p32 has 121 runes. They also record p55's red 13-dot punctuation at rune offset 76; p55 has 76 runes. Thus the selected p32 page and the later 11-cycle state 76 both coincide with the marked endpoints of original pages.

## Word-level low-digit map

Using the current canonical transcription, word boundaries are obtained by treating hyphens and periods as separators, removing slash line-wraps, ampersands, dollar markers and whitespace. For each word, compute GP0 as the sum of its rune indices. Follow T from that GP0 value and select the word exactly when its terminal cycle is {54,36}. The script sims/lp2_lowdigit_road_page_map.py reproduces the full page inventory and asserts the p32/p47 values below.

### p32

Six of 22 parsed words enter the ROAD/PATHS/FOUND cycle:

| 0-based word | Transliteration | Rune length | GP0 | GP-prime sum |
|---:|---|---:|---:|---:|
| 3 | WNGHWBMSOEEIIA | 11 | 171 | 613 |
| 7 | HOMEXWDSLFD | 11 | 150 | 540 |
| 12 | UBHEA | 4 | 54 | 196 |
| 13 | WNGUHEONGIAEAJ | 9 | 136 | 497 |
| 14 | SPTHT | 4 | 46 | 160 |
| 17 | EAROE | 3 | 54 | 203 |
| **Total** | | **42** | **611** | **2209** |

The aggregate identities are exact:

- Selected rune length: 42, equal to GP0(FIND); the existing low-digit route has T(42)=28, pointing to p28.
- Selected GP0 sum: 611 = 13 × 47.
- Selected GP-prime sum: 2209 = 47².

Across pages p0–p55 with runic text, p32 is the **only** page whose selected-word GP0 sum is 13m and selected-word GP-prime sum is m² for the same integer m in 0–55. Here m=47, independently naming p47. This is the strongest new cross-page signature. The factor 13 is consistent with p32's original 13-dot endpoint marker.

### p47

Eight of 59 parsed words enter the same cycle:

| 0-based word | Transliteration | Rune length | GP0 | GP-prime sum |
|---:|---|---:|---:|---:|
| 10 | IAYEOEIAGAEFNW | 11 | 166 | 626 |
| 21 | LTI | 3 | 46 | 163 |
| 22 | AEJE | 3 | 54 | 205 |
| 29 | AENG | 2 | 46 | 180 |
| 39 | HTH | 2 | 10 | 28 |
| 42 | EOBOEAE | 4 | 76 | 286 |
| 48 | LEOEA | 3 | 60 | 223 |
| 58 | AOAAE | 4 | 76 | 302 |
| **Total** | | **32** | **534** | **2013** |

The selected rune length 32 points back to p32. The selected GP-prime sum is exactly 2013, the year of Cicada's second public round (the first was in 2012). That historical-year match was observed after computing the selection and is therefore supporting context, not an independently pre-registered prediction.

## Interpretation and limits

The strongest provisional structure is a p32/p47 pair: the p32 selected-word sums independently point to 47 through both 13×47 and 47², while p47's selected-word rune length points back to 32. The p32 selected-word length 42 also meets the existing FIND -> p28 low-digit route. The 11-cycle's 47 and 76 states align with p47's page number and p55's marked 76-rune endpoint.

This is a navigation/readout hypothesis, not a cipher solution. The 54/36 cycle is source-anchored, but applying it to every page word and aggregating selected word lengths/sums is an inferred extension. The 28/256 basin and p32's 6/22 selected words are not, by themselves, decisive statistical evidence; the simple uniform-address binomial tail for at least six hits is about 0.027 before accounting for page-wide selection. The p47 printed-group segmentation has been independently adjudicated against original scan 64; the 59 groups and eight selected spans agree. See [source check](lp2-p43-p48-source-first-human-solve-path-gate.md#p47-original-image-word-boundary-adjudication). This establishes the printed groups, not their identity as plaintext words. The 2013-year match is post hoc.

Several direct key transfers have already failed: using the p50 11-cycle as an additive GP29 key on p55 (full 76 and inner 23), using the p47 selected 32-rune stream as an additive key on p32, concatenating the p32/p47 selected streams plus the two cycle states as a 76-symbol key for p55, and applying the p56 prime-totient clock to p47 from prime ordinals 47 or 115. None yielded plaintext. Do not repeat generic Vigenere/prime-totient variants without a new source instruction.

## Source-first continuation decision (#3086, Agent12, 26 November 2026)

Direct inspection of original scans 49 (physical p32), 64 (p47) and the already documented adjacent artwork shows the following player-visible distinctions, independently of any selected-word arithmetic:

* p32 is a six-line terminating page with a single blurred tree below its text and a terminal red punctuation mark. No selected group is individually addressed by that tree, colored, numbered or connected to a line/path.
* p47 is a twelve-line page within the bilateral botanical frame. [The previous original-raster gate](lp2-p43-p48-source-first-human-solve-path-gate.md) establishes pixel-identical framing across p42–49; it is not a unique visual pointer to p47 or a group selector. The existing p47 source segmentation is accepted; it was not re-adjudicated here.
* The stronger independently visible art link is **p32 ↔ p55**, the blurred and pale detailed renditions of a specific tree, with a known source-raster correspondence. [Existing held-out crown/whole-atlas tests](lp2-p32-p55-blurred-tree-correspondence.md) already establish this and separately reject the 2013 forest wording as a complete decoding opcode. It does not choose p47 as an intermediate receiver. The paired red13 terminal marks likewise do not choose a per-word aggregate or graph traversal direction.

The [signed 2016 original](../resources/historical/cicada2016-4gq25-outguess.asc) associates words, meaning and numbers with navigation. Even granting the existing ROAD/FOUND two-cycle, that instruction does not say to retain every word entering its basin, to use GP0 as the initial address rather than prime sum, to add rather than concatenate the selected values, or to carry any one of rune length / GP0 sum / GP-prime sum into another page. On a two-cycle terminal *membership* also does not identify a stopping phase. The displayed p32→47 and p47→32 arithmetic was already observed, so neither can serve as an untouched prediction. The previous [p48 word→grid direction test](lp2-p48-word-prime-coordinate-p50-grid-gate.md) failed its locked adjacent-address prediction; another unconstrained graph aggregation is not a substitute.

**Decision:** no independently visible cue fixes a unique continuation, group selection and receiver. Preserve the original exact 611=13×47, 2209=47² and 32-return arithmetic as an unpromoted observation; retire it as an actionable route. Do not construct a new page scan, product/square search, cycle variant, XOR or additive consumer. Only a new independently specified source operation on a fixed unseen receiver would reopen it. No new candidate plaintext or key, and no new computation is warranted on this premise.

## Reproduction

Run from the repository root:

    python3 sims/lp2_lowdigit_road_page_map.py

The script reads only the original transcription, the current GP29 corpus and the p50 base-60 byte table. It prints per-page selected-word aggregates, the low-digit cycle basins, the p32/p47 selected words and the unique dual-square signature.
