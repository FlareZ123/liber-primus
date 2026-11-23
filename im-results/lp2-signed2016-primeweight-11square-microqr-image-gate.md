# Signed 2016 source-tiled 11×11 Micro QR: original-image negative

**Agent3, 23 November 2026.** A direct hidden-key extraction from the authenticated 2016 tree JPEG failed. No unknown LP2 plaintext, authenticated key or destination recovered.

## Why this could have yielded a human-visible next step

Original physical LP2 p32 contains 121 GP29 runes. Their row-major 11×11 reflow gives first-row prime values summing **563** and first-column prime values summing **569**, exactly the dimensions of the signed January 2016 Cicada image. These values source-select 11 unequal-width image columns and 11 unequal-height image rows. Earlier Cicada rounds used QR codes, and a Micro QR M1 symbol is exactly 11×11 modules. The manuscript does not explicitly say to make this reshaping or to read the image as QR, so this is a bounded hypothesis, not an established method.

## Frozen pixel experiment and original outcomes

The committed [Node22 SFT](../sims/lp2_signed2016_primeweight_microqr_image_sft.cjs) reads the unmodified original `resources/historical/cicada2016-4gq25.jpg` and `resources/liber-primus/lp2-corpus.json`. For each of 121 source-selected tiles, it takes either its center RGB value or its whole-tile mean RGB, then applies a fixed brightness threshold 128 with each of the two bit polarities. No color, mask, crop, orientation, threshold or language-trained parameter is fitted. Each eleven-by-eleven binary result must reproduce the standard top-left seven-by-seven QR finder (black border, white inner ring, black three-by-three center) to qualify as an ordinary aligned Micro QR. The first 120 bits also yield a 15-byte literal ASCII check.

| Tile measure | Polarity | Black modules of 121 | QR-finder mismatches of 49 | Printable bytes of 15 |
| --- | --- | ---: | ---: | ---: |
| Center | Dark=1 | 113 | 19 | 0 |
| Center | Light=1 | 8 | 30 | 1 |
| Whole tile mean | Dark=1 | 120 | 15 | 0 |
| Whole tile mean | Light=1 | 1 | 34 | 0 |

**Zero** images display the requisite 7×7 finder; the tile averages are nearly constant at this scale. A planted synthetic 11×11 QR finder passes with zero mismatch. The original source run completed with **PASS** in [GitHub Actions 45163913653](https://github.com/FlareZ123/liber-primus/actions/runs/45163913653).

## Decision

This original-image readout cannot supply a usable 11×11 Micro QR payload or straightforward ASCII key. The p32 prime-axis dimension correspondence remains exact, while its intended cryptographic role remains unknown. Further threshold or cell-selection searches would require independent first-party instructions. The result is a finite original-image exclusion and is not promoted into the established plaintext synthesis.
