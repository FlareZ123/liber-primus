# Source-led base-60 word map and totient network (candidate)

**Status: promising navigation/selector hypothesis, not a decryption.** No unknown plaintext or cipher key has been recovered. Keep this in `im-results/`, not `results/`.

## Coordinate rule under test

Use (n=60p+w), where (p) is the printed LP2 page label (zero-based) and (w) is a one-based word ordinal on that page. Words are assigned to the page on which their first rune occurs, using the global word segmentation in `resources/liber-primus/lp2-transcription.txt` and the rune/page counts in `resources/liber-primus/lp2-corpus.json`.

This convention is natural for a zero-labelled page sequence and ordinary word ordinals, but is **not yet explicitly stated by a surviving instruction**. All results below are conditional on it.

## Three source routes converge

### p0 red title → three centered p5 words

The two p0 red-title words are `SHEOGMIAF` and `SYENGC`, with Gematria-Primus prime-weight sums **347** and **315**. Their mean is **331** and their difference is **32**.

The candidate coordinate rule gives:

| Input | Address | Selected word | GP prime sum | Totient |
|---:|---|---|---:|---:|
| 315 | p5:w15 | `REO` | 52 | 24 |
| 331 | p5:w31 | `CEAA` | 219 | 144, then 48 under a second totient |
| 347 | p5:w47 | `TD` | 148 | 72 |

The selected positions 15, 31, 47 are centered on 31. The endpoint totients are 24 and72; applying a second totient to the center's 144 gives48. These form (24,48,72), an arithmetic progression. The extra center iteration is target-guided and must not be treated as independently selected.

### cuneiform numbers → p17 and p55

The cuneiform section's source numbers **1033** and **3301** give:

| Input | Address | Selected word | GP prime sum | Totient |
|---:|---|---|---:|---:|
| 1033 | p17:w13 | `AEP` | 144 | 48 |
| 3301 | p55:w1 | `AEMIW` | 222 | 72 |

The two totients have mean **60** and difference **24**. This independently reproduces the 48/72 values and the 24 marker from the p0 route.

### Held-out p50 table token → p3 “DEO”

The original p50 table contains the base-60 token **3D**, value **193**. Applying the same coordinate rule, (193=60\cdot3+13), selects p3 word13: **`DEO`**, rune indices `[23,12]`, prime sum **130**, and (arphi(130)=48).

This was not used to construct the p0/cuneiform routes. It is a useful held-out match: 48 is (7\times7-1), the number of noncentral cells in the original 2014 7×7 square. The complete word list contains exactly two `DEO` tokens: p3:w13 and p33:w1. The solved p57 Parable says “find the divinity within”; Latin `DEO` is a plausible semantic echo. The 2016-message assignment of the word “lies” to the p50 3D token is itself a hypothesis, but the table token and its value are source-visible.

## Cross-source structure

- **24**: p54's first red rune has GP index24.
- **48**: (7\times7-1), the noncentral cells of the original 2014 square.
- **60**: mean of the two cuneiform-derived totients.
- **72**: p55 is original scan/image72 (`72.jpg`).
- **331**: p0 title mean and center of the 2014 7×7 square.
- **1033**: cuneiform endpoint and the 2014 square's magic constant.
- **32**: p0 title difference and p50 table row count.

The five selected words p17:w13, p55:w1, p5:w15, p5:w31, p5:w47 contain **13 runes total**, matching the 13-rune p0 red title. Their first totients (48,72,24,144,72) sum to **360 = 6×60**.

A separate p55 center-five candidate has prime sum **401 = 13×29+24**; this numerically echoes the p0 title's 13 runes and p54's red-rune index24. Treat this only as a checksum cross-reference to the existing p55 analysis, not as plaintext or an authenticated BASE29 word.

## Why this is not yet a solution

The 2016 message says words are the map and numbers give direction; the p56 plaintext names the prime sequence and totient function; the p33–39 cuneiform and p50 table provide genuine sexagesimal material. These are meaningful source hooks. However, the surviving 2016 message does not itself specify the radix, page/word address formula, or indexing convention. The base-60 mapping could still be a post-hoc fit.

The obvious direct consumers tested in this invocation did **not** decrypt p54/p55: p56-style \(\varphi(p_n)\bmod29\) streams starting at prime ordinals24 and72; 24/72 and72/24 start/stride variants on p55; affine use of24/72; the 13-rune concatenated word key on p0's title and p55; and the five-totient key on p55. These negatives reject only those specific consumers.

A separate attempt to treat the full p175–p464 prime interval as 290 page/word addresses produced 41 out-of-range addresses and is not a supported continuation.

## Next decision

The p50 3D → p3:w13 `DEO` → (arphi=48) result is the best held-out support so far, especially with the p57 “divinity within” wording. Before doing more cipher work, seek one independent source clue that fixes the exact page/word coordinate convention and indexing. If none exists, retire the route as a numerical coincidence. If it does, freeze a further held-out prediction and test one reversible p54/p55 consumer; require authentic plaintext or key material.
