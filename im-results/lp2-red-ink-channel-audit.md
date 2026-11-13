# LP2 red-ink channel audit

## Question

Does the red ink in the original LP2 pages provide a separate plaintext stream, a simple key for the black text, or a variable dot-matrix data channel?

This was selected after indexing the external [Dukotah/cicada3301 Round 43 synthesis](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/SYNTHESIS.md) and its [image-channel inventory](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F2-inventory/image-channels.md). Four of six blind agents independently elevated red ink as an underexplored physical channel. The test below is limited to the original LP2 images and the repository's existing red-span annotations; it does not assume the external interpretation is correct.

## Source data and method

- Original JPEGs: LP2 pages 0–57 correspond to archive files `17.jpg`–`74.jpg` (e.g. LP2 p49 is `66.jpg`, p57 is `74.jpg`).
- Rune stream and red-span locations: `resources/liber-primus/lp2-corpus.json` and `resources/liber-primus/lp2-ink-annotations.json`.
- Reproduction implementation: `sims/lp2_red_dot_glyph_inventory.py`. It uses an HSV red mask (H≤10 or H≥170, S≥50, V≥60), connected components, dot-component size 60–140 px with 7–12 px width/height, and 28 px proximity clustering.
- The annotations contain 18 red spans across 15 pages: 0, 3, 6, 7, 8, 15, 23, 27, 33, 39, 40, 53, 54, 56, 57. Their total is 225 runes. The known plaintext red span on p57 is `PARABLE`.

## Findings

### 1. Red runes are not a direct plaintext stream

The 225-rune red-only stream contains all 29 GP symbols. Its index of coincidence is **0.033214**, close to the uniform 29-symbol expectation (1/29 = 0.034483). There is one adjacent-equal pair within the 18 spans (the `LL` pair in the p27 span), giving **1/207 = 0.483%**. The 29 fixed Caesar shifts were inspected; none yields readable text.

The red and black rune distributions are very similar: Jensen–Shannon divergence is **0.01803 bits**. The red spans therefore look like a selected subset of the same 29-symbol ciphertext alphabet, not a separate natural-language register. The known p57 title `PARABLE` is an exception at the solved end of the book, not evidence that the other red spans are plaintext.

### 2. The simplest red-as-key reading fails

A frozen global test treated the red-only sequence as a repeating GP29 Vigenère key for the black-only stream, with no fitted phase or key transformations. Both signs remain random-like:

| Operation | Output IoC | Adjacent-equal rate |
|---|---:|---:|
| Black − repeating red key | 0.034496 | 3.571% |
| Black + repeating red key | 0.034450 | 3.222% |

Neither output exhibits recovered plaintext. This rejects the simplest direct repeating-key use; it does not exclude a source-selected positional selector or more complex key schedule.

### 3. Red dot matrices are fixed punctuation classes, not per-instance bits

The original-image segmentation finds **35 red dot clusters** across LP2: **30 13-dot**, **4 10-dot**, and **1 23-dot**. This matches the red large-punctuation inventory in `lp2-ink-annotations.json`; the separate black 13-dot mark is not included in the red mask.

The internal dot topology is stable within each class, up to small raster/threshold variation:

- 13-dot glyph: three staggered columns with **4 / 5 / 4** dots.
- 10-dot glyph: the same three-column lattice with **3 / 4 / 3** dots.
- 23-dot glyph: five staggered columns with **4 / 5 / 5 / 5 / 4** dots.

Thus the apparent dot matrices are repeatable punctuation glyphs distinguished by dot-count class. Their individual instances do not supply changing binary patterns. The 23-dot form occurs once, at the end of p57; it is consistent with a terminal punctuation class rather than a stream of independent bits.

## Disposition

The obvious red-channel readings—direct Caesar plaintext, a global repeating-red-key Vigenere, and variable per-instance dot-matrix bits—remain negative. A new cross-channel count relation is source-constrained: on unknown pages p0–55, **13 of the 16 red-rune spans begin with a red dropcap**; the three unmarked spans are p7@194, p15@9 and p53@128. This gives 13/16 = 0.8125, a candidate rejection probability for the soft key-skip model. With q=1/29, 86/12,901 within-page repeats imply an MLE suppression probability 0.81210; 13/16 predicts 85.82 repeats. This is compatible, not proof: the approximate 95% interval is 0.772–0.852, and the likelihood barely distinguishes 13/16 from the fitted value.

The separate 30-mark red 13/10-dot stream on p0–55 is 27 ones and three zeros: 111111111111111111111001110111. Direct dot-stream and dropcap-sequence key/seed constructions tested under Perl 5.14 drand48, Python 2.7 MT, glibc rand and RC4 did not yield a valid plaintext path; direct periodic use of the 13 dropcaps also failed. Red ink should therefore remain a source-derived parameter/selector channel, not be promoted to plaintext or a confirmed key. Do not continue generic Caesar shifts, arbitrary matrix traversals or unconstrained seed searches without a new source-selected operation. [Detailed gate and bounded tests](lp2-red-ink-1316-filter-parameter-gate.md).

## Reproduction

From the repository root, with the supplied original image archive:

```bash
python sims/lp2_red_dot_glyph_inventory.py \
  --zip /mnt/data/liber-primus-jpegs.zip \
  --output im-results/lp2-red-dot-glyph-inventory.json
```

The script also accepts `--image-dir` for an extracted `00.jpg`–`74.jpg` directory. It emits per-page dot-cluster coordinates and the red/black stream statistics.
