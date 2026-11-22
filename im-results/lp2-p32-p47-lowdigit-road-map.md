# p32–p47 low-digit road-map cross-link

**Status:** intermediate structural hypothesis. No plaintext, key, or complete decipherment recovered. Keep this in im-results; do not promote it to results/README.

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

The selected rune length 32 points back to p32. The selected GP-prime sum is exactly 2013, the year of Cicada's first round. That historical-year match was observed after computing the selection and is therefore supporting context, not an independently pre-registered prediction.

## Interpretation and limits

The strongest provisional structure is a p32/p47 pair: the p32 selected-word sums independently point to 47 through both 13×47 and 47², while p47's selected-word rune length points back to 32. The p32 selected-word length 42 also meets the existing FIND -> p28 low-digit route. The 11-cycle's 47 and 76 states align with p47's page number and p55's marked 76-rune endpoint.

This is a navigation/readout hypothesis, not a cipher solution. The 54/36 cycle is source-anchored, but applying it to every page word and aggregating selected word lengths/sums is an inferred extension. The 28/256 basin and p32's 6/22 selected words are not, by themselves, decisive statistical evidence; the simple uniform-address binomial tail for at least six hits is about 0.027 before accounting for page-wide selection. Word segmentation is transcription-derived and p47 has not yet had a dedicated original-image adjudication. The 2013-year match is post hoc.

Several direct key transfers have already failed: using the p50 11-cycle as an additive GP29 key on p55 (full 76 and inner 23), using the p47 selected 32-rune stream as an additive key on p32, concatenating the p32/p47 selected streams plus the two cycle states as a 76-symbol key for p55, and applying the p56 prime-totient clock to p47 from prime ordinals 47 or 115. None yielded plaintext. Do not repeat generic Vigenere/prime-totient variants without a new source instruction.

## Next decisive work

1. Independently verify p47's word segmentation against original scan 64; no p47-specific result report was present in the repository inventory.
2. Look for a first-party operation that consumes the 32-rune p47 selected stream. The 2013 XOR method is historically real, but do not transfer it to GP29 without a source-supported byte serialization.
3. Test whether the p32/p47 reciprocal aggregate is a deliberate human-readable map, using a locked prediction from the original page art or historical wording rather than further numerical fitting.
4. Treat p55's marked offset 76 as a plausible later receiver, not as a proven decryption target; the direct 11-cycle additive key test is negative.

## Reproduction

Run from the repository root:

    python3 sims/lp2_lowdigit_road_page_map.py

The script reads only the original transcription, the current GP29 corpus and the p50 base-60 byte table. It prints per-page selected-word aggregates, the low-digit cycle basins, the p32/p47 selected words and the unique dual-square signature.
