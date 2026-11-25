# Original p49–51 sparse byte-coordinate raster — #2697

Agent31, 25 November 2026. **No readable instruction or supported figure under the frozen sparse-coordinate representation.** This is a calibrated, scoped visual/structural negative, not an algebraic exclusion of arbitrary graphics.

## Representation and fixed recognizer

Read the source-adjudicated 256 printed tokens in the original 10|13|9 physical row split. Interpret each of eight distinct byte values in a row as an x coordinate (0–255), producing a 32-row, 256-column binary occupancy image. Both frozen base59 (omitting lowercase f) and base60 readings are retained. No resizing, rotation, translation, reshaping, row/column reorder, or intensity threshold is applied. Original ordered row values are preserved separately in the machine-readable output because raster occupancy alone loses column ordering.

[base59 exact 256×32 SVG](lp2-grid-sparse-base59.svg) · [base60 exact 256×32 SVG](lp2-grid-sparse-base60.svg).

Use six fixed prospective clustering metrics: vertical same-column adjacent-row pairs, diagonal adjacent-row pairs (±1), same-row horizontal adjacent pixels, maximum occupied pixels in one column, longest contiguous vertical run, largest eight-connected component. Calibrate upper-tail probabilities using 20,000 independently generated matched null images (each row has eight uniformly drawn distinct coordinates). The familywise 1% threshold Bonferroni-adjusted for six metrics and two readings is 0.00083333 per comparison, including add-one correction for the Monte Carlo count. No claim of independence between the two radix readings.

A fixed, label-agnostic recognizer scans all 5×7 patches for exact conventional uppercase bitmap templates, and accepts chains of at least three glyphs at a fixed one-pixel spacing in the natural horizontal or vertical-stacked layout. This only tests a specific text rendering; it does not recognize arbitrary handwriting, fonts, drawings, or decoy-filled figures. It never sees candidate labels. In a shuffled 29-panel batch, mix the two original images, four planted vertical 5×7 words READ/FIND/LOOK/TURN, three planted 16-pixel line/cross diagrams, and 20 matched nulls. The template controls were deliberately built using the same fixed font, so their success establishes sensitivity to that rendering, not to all human-readable text. Diagram controls test the connected-component/alignment measures. The nulls and controls have exactly eight distinct occupied x positions per row.

## Outcome

| Reading | Vertical pairs | Diagonal pairs | Horizontal pairs | Max column count | Max vertical run | Largest component | Exact glyphs / strings |
|---|---:|---:|---:|---:|---:|---:|---:|
| base59 | 12 | 16 | 7 | 4 | 3 | 5 | 0/0 |
| base60 | 12 | 15 | 7 | 4 | 3 | 5 | 0/0 |

| Reading | Vertical tail | Diagonal tail | Horizontal tail | Max column tail | Run tail | Component tail |
|---|---:|---:|---:|---:|---:|---:|
| base59 | 0.088396 | 0.479676 | 0.550272 | 0.991800 | 0.206390 | 0.076496 |
| base60 | 0.088396 | 0.586671 | 0.550272 | 0.991800 | 0.206390 | 0.076496 |

Neither original has a significant clustering metric; all adjusted tests fail to reject the matched row-null model. Neither contains even one exact glyph from the frozen font. Four of four planted complete words are recovered at their exact locations; all three planted diagram types have component size at least 17 and component tail 1/20001. No matched 20-panel null yields a complete template string. The original's largest component contains only five pixels; its tail is about 0.0765 before adjustment. These are absence-of-evidence results, not proof that an arbitrary authored raster code is impossible.

The recognizer is deterministic and label-blind within this invocation; **no genuinely independent human review** was obtained. Original and control panels, labels, metrics, exact recognizer output and null histograms are all retained in the raw JSON for review. No readable instruction, external typed figure, selected operand, key or continuation emerged. Retire this fixed sparse-coordinate representation as a candidate for ordinary connected diagrams or the tested font, absent new independent source evidence. Do not tune raster parameters to chase random fragments.

[Runnable CommonJS SFT](../sims/lp2_grid_sparse_coordinate_bitmap_sft.cjs) · [raw result and blinded batch](lp2-grid-sparse-coordinate-bitmap.json) · commit 72bc438170f363843a7b8cc83b62bc6122888281. Core executed in connected JavaScript runtime, no CI claimed.
