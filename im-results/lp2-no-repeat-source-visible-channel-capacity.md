# LP2 no-repeat escape-channel capacity: source-visible carrier audit

**Status:** bounded decision; no capacity contradiction, but no source-selected reversible boundary decoder.

## Finding

The observed 29-symbol ciphertext stream does not by itself rule out a 29-to-28 next-rune encoder. Red/special marks alone do not provide enough side information, even under an intentionally generous count. The printed word-boundary positions have ample *combinatorial* capacity, however, so an information-theoretic impossibility claim would be too strong. No evidence currently selects a reversible mapping from plaintext symbols to those boundary positions.

This is a capacity result, **not** a cipher identification or decryption.

## Conditional no-repeat deficits

Scope is the 55 rune-bearing unsolved pages p0–p49 and p51–p55. Physical p50 is the runeless grid page. The corpus contains 12,956 rune positions, 12,901 eligible within-page transitions, and 86 adjacent equal-rune transitions.

For a hypothetical encoder whose output is restricted to 28 choices at ordinary transitions and can use the observed repeats as exceptions, the existing exact-count analysis gives:

| Model | Minimum additional information |
|---|---:|
| Global output has at most 86 repeats, repeat positions free | **325.450 bits** |
| Global output has exactly 86 repeats, repeat positions free | **325.750 bits** |
| Per-page repeat counts fixed only as upper bounds | **430.561 bits** |
| Per-page repeat counts fixed exactly | **445.732 bits** |
| All 86 repeat positions fixed in advance | **1,066.559 bits** |

These are conditional bounds for the proposed 29-to-28 family, not evidence that this family is the actual LP2 cipher. The 86 observed repeats are corpus observations, not an author-authenticated rule. Derivations and earlier tests are in [lp2-anti-repeat-lossless-capacity.md](lp2-anti-repeat-lossless-capacity.md).

## Source-visible channel capacity

### Word-boundary positions

The original transcription contains **2,873 explicit typographic delimiter gaps** within the 55 pages. The count uses hyphen, period, ampersand, dollar, and section-sign punctuation between consecutive runes; slash and whitespace are not treated as word boundaries. The observed delimiter strings are:

- `-`: 2,708
- `.`: 153
- `.&`: 6
- `--`: 1
- `.&$`: 1
- `.-`: 4

For page p with L rune positions and B observed internal delimiter gaps, the maximum number of ways to place the same number of boundaries among the L−1 internal rune gaps is:

\[
\binom{L-1}{B}
\]

Summing the per-page logarithms gives **9,638.332 bits** of positional capacity while preserving each page's observed boundary count. The minimum page capacity is **50.730 bits** (p49); the maximum is **221.303 bits** (p29). Every page's positional capacity exceeds its own fixed-repeat-mask deficit; the largest per-page fixed-mask deficit is **37.706 bits** (p19).

The observed separator-string assignments have a further **789.936-bit** permutation ceiling if their per-page type counts are held fixed. This is an additional combinatorial upper bound, not a claim that punctuation types can be freely rearranged without changing meaning.

These calculations deliberately ignore grammar, lexical plausibility, line composition, and the fact that the printed boundaries are fixed. They measure the number of possible placements consistent with the observed per-page counts, not the entropy of the actual text or evidence that the author used this channel.

### Red and special marks

Across the same 55 pages, the annotation corpus records:

- **213 red runes** in **16 red spans**
- **31 large punctuation marks**: 27 red 13-dot, 1 black 13-dot, and 3 red 10-dot marks

An intentionally overgenerous ceiling gives every red rune an independent red/black choice (213 bits) and every large mark an independent choice among two dot sizes and two colours (2 bits each): **275 bits**. A more realistic block-level ceiling, treating each red span as one event, is **78 bits**. Both are below even the 325.450-bit global at-most-86 deficit.

Copied floral artwork is not counted as an independent event. Even the 275-bit estimate overcounts independence: contiguous red spans and repeated dot ornaments are not 244 separate freely selectable marks.

**Result:** red/special colour and mark choices alone cannot supply the required information under this model. Word-boundary positions could supply it in principle.

## Per-page measurements

`boundary bits` is \(\log_2\binom{L-1}{B}\). `at-most deficit` uses the page's observed repeat count as a binomial upper-tail limit. `fixed-mask deficit` assumes the observed repeat positions are fixed in advance.

| Page | Runes | Repeats | Boundary gaps | Boundary bits | At-most deficit | Fixed-mask deficit |
|---:|---:|---:|---:|---:|---:|---:|
| 0 | 262 | 2 | 58 | 195.382 | 7.469 | 22.828 |
| 1 | 266 | 1 | 62 | 203.874 | 10.029 | 18.223 |
| 2 | 201 | 1 | 37 | 134.392 | 7.100 | 14.933 |
| 3 | 217 | 3 | 43 | 151.654 | 4.105 | 25.357 |
| 4 | 261 | 2 | 60 | 198.539 | 7.429 | 22.777 |
| 5 | 263 | 0 | 58 | 195.743 | 13.264 | 13.264 |
| 6 | 196 | 1 | 44 | 146.341 | 6.879 | 14.679 |
| 7 | 208 | 0 | 49 | 159.493 | 10.480 | 10.480 |
| 8 | 255 | 3 | 50 | 177.766 | 5.416 | 27.281 |
| 9 | 268 | 3 | 56 | 193.780 | 5.883 | 27.939 |
| 10 | 263 | 1 | 64 | 206.018 | 9.891 | 18.071 |
| 11 | 273 | 1 | 54 | 191.516 | 10.349 | 18.578 |
| 12 | 261 | 1 | 64 | 205.209 | 9.800 | 17.970 |
| 13 | 272 | 0 | 60 | 202.596 | 13.720 | 13.720 |
| 14 | 137 | 0 | 30 | 99.925 | 6.885 | 6.885 |
| 15 | 159 | 0 | 36 | 118.602 | 7.999 | 7.999 |
| 16 | 267 | 1 | 59 | 198.989 | 10.074 | 18.274 |
| 17 | 273 | 0 | 68 | 216.504 | 13.770 | 13.770 |
| 18 | 260 | 1 | 60 | 198.160 | 9.755 | 17.920 |
| 19 | 271 | 5 | 65 | 210.853 | 3.409 | 37.706 |
| 20 | 269 | 1 | 64 | 208.406 | 10.166 | 18.375 |
| 21 | 273 | 1 | 54 | 191.516 | 10.349 | 18.578 |
| 22 | 131 | 1 | 27 | 92.276 | 4.085 | 11.389 |
| 23 | 213 | 1 | 45 | 154.205 | 7.633 | 15.540 |
| 24 | 270 | 5 | 63 | 207.112 | 3.381 | 37.655 |
| 25 | 273 | 3 | 57 | 197.379 | 6.064 | 28.192 |
| 26 | 265 | 2 | 58 | 196.460 | 7.592 | 22.980 |
| 27 | 234 | 5 | 51 | 172.657 | 2.448 | 35.833 |
| 28 | 269 | 0 | 58 | 197.876 | 13.568 | 13.568 |
| 29 | 277 | 4 | 70 | 221.303 | 4.739 | 33.202 |
| 30 | 263 | 2 | 60 | 199.291 | 7.510 | 22.879 |
| 31 | 269 | 0 | 63 | 206.727 | 13.568 | 13.568 |
| 32 | 121 | 2 | 21 | 76.893 | 2.228 | 15.690 |
| 33 | 214 | 2 | 52 | 166.816 | 5.558 | 20.398 |
| 34 | 261 | 3 | 60 | 198.539 | 5.630 | 27.585 |
| 35 | 271 | 3 | 60 | 202.235 | 5.991 | 28.091 |
| 36 | 238 | 3 | 49 | 170.280 | 4.819 | 26.420 |
| 37 | 228 | 0 | 52 | 172.251 | 11.492 | 11.492 |
| 38 | 228 | 0 | 46 | 161.144 | 11.492 | 11.492 |
| 39 | 240 | 1 | 54 | 180.217 | 8.846 | 16.907 |
| 40 | 231 | 0 | 54 | 176.826 | 11.644 | 11.644 |
| 41 | 273 | 2 | 61 | 204.753 | 7.919 | 23.385 |
| 42 | 272 | 1 | 57 | 197.040 | 10.303 | 18.527 |
| 43 | 274 | 3 | 58 | 199.614 | 6.101 | 28.243 |
| 44 | 273 | 4 | 56 | 195.457 | 4.611 | 33.000 |
| 45 | 270 | 2 | 63 | 207.112 | 7.796 | 23.233 |
| 46 | 270 | 1 | 60 | 201.873 | 10.211 | 18.426 |
| 47 | 274 | 2 | 58 | 199.614 | 7.960 | 23.436 |
| 48 | 271 | 1 | 66 | 212.488 | 10.257 | 18.476 |
| 49 | 66 | 0 | 17 | 50.730 | 3.291 | 3.291 |
| 51 | 92 | 1 | 19 | 63.977 | 2.520 | 9.414 |
| 52 | 263 | 1 | 59 | 197.532 | 9.891 | 18.071 |
| 53 | 179 | 0 | 39 | 131.224 | 9.011 | 9.011 |
| 54 | 232 | 2 | 49 | 168.251 | 6.264 | 21.309 |
| 55 | 76 | 1 | 16 | 52.925 | 1.918 | 8.604 |

## Decision and next research gate

- A blanket claim that a 29-to-28 no-repeat encoder is impossible is **not** supported. The word-boundary position space is large enough to carry the missing information in principle.
- Red/special marks alone are insufficient, even under generous independence assumptions.
- No explicit, historically motivated, reversible plaintext-to-boundary mapping has been found. The 9,638-bit figure is a ceiling on possible arrangements, not evidence of a hidden message.
- Do not proceed to arbitrary boundary-bit subsets, fitted lookup tables, or unconstrained per-page masks. The next useful step is to identify an original clue that selects a specific boundary operation and predicts a reproducible output on untouched pages. Without that, keep the no-repeat family provisional and prioritize mechanisms with a source-derived key or operation.

## Reproduction

Run:

`node sims/lp2_no_repeat_escape_channel_capacity_sft.cjs`

Inputs are the current transcription, rune corpus, and ink annotations. The script verifies page rune counts against the corpus and asserts the aggregate counts and channel ceilings.
