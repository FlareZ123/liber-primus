# Five numbered cuneiform passages: a bounded 2014 Wisdom-row inverse

**Status:** the source-exact 553-rune enclosure is independently image-readback verified; the narrowly clue-motivated direct inverse still yields **no plaintext, key or reversible historical operation**. This is a supporting scoped negative, not an established decipherment. SFT: [`sims/lp2_cuneiform_five_wisdom_rows_sft.cjs`](../sims/lp2_cuneiform_five_wisdom_rows_sft.cjs). The outputs were also evaluated independently against the original corpus using the GitHub repository connector's parsed `lp2-corpus.json`.

## Human-visible selection and scope

The repeated 1033/3301 cuneiform headers span seven physical LP2 pages (p33–p39), but their artwork is a single repeated template. Within that enclosure the authors **printed five red decimal numerals 1–5**, one at the beginning of each successive passage across physical pages 36–38. These five numbered passages are bracketed by **red 10-dot punctuation at p36 rune cut 99** and **p38 cut 186**. Both cuts are independently preserved in the ink annotations. The numeral positions were manually inspected on the original p36, p37, p38 JPEGs (archive files `53.jpg`, `54.jpg`, `55.jpg`; physical LP2 p maps to archive p+17). The SFT checks the canonical line lengths; the native-JPEG readback below independently classifies all 553 target rune identities from p43-only templates.

| Printed red numeral | Source passage, zero-based rune offsets | Source rune length |
| --- | --- | ---: |
| 1 | p36 [99,238) | **139** |
| 2 | p37 [0,91) | **91** |
| 3 | p37 [91,189) | **98** |
| 4 | p37 [189,228) then p38 [0,57) | **96** |
| 5 | p38 [57,186) | **129** |
| **Total** | Physical p36–p38 numbered enclosure | **553** |

A five-passage structure with explicit order 1–5 offers a different, more source-faithful framing than reflowing the aggregate 1,589 runes of seven unequal printed pages into seven imagined 227-rune lanes. The five-boundary **553-rune enclosure had already been documented and used in the 79/78 packet study** (see `results/README.md`); this analysis does not claim discovery of that interval. The genuine 2013 mixed Wisdom square reconstructs the historical 2014 **5×5** square exactly, whose five rows each total 1033, one of the original cuneiform values. This suggests a cheap *specific* historical transfer: use square row number k for printed passage number k. The other cuneiform number 3301 also belongs to the original 2013/2014 source history, but it does not select a byte decoder here.

**Weakest premise:** neither the cuneiform artwork nor the numbered passages explicitly says to transfer the 2014 Wisdom square rows, choose `φ(cell) mod29`, or apply those numbers as cyclic additive keys. The 2013 Wisdom prose praises primes and totient; solved p56 uses a prime-totient GP29 shift, which motivates a single narrow test of this operation. These clues do not authenticate it.

## Frozen original-input experiment

The genuine 2014 Wisdom square is

```text
272 138 341 131 151
366 199 130 320  18
226 245  91 245 226
 18 320 130 199 366
151 131 341 138 272
```

Applying Euler's totient to each printed cell and reducing modulo 29 produces the five period-five keys:

```text
12 15 10 14  5
 4 24 19 12  6
25 23 14 23 25
 6 12 19 24  4
 5 14 10 15 12
```

For passage k, the source-selected row k starts at phase zero at the beginning of the printed red-numeral passage. Both ordinary Vigenère signs are separately inverted. Both exact *forward reencryption* checks pass for every one of the **553 original runes**. The original five-passage concatenation has IoC **0.03423356** and **1** adjacent identical-rune pair, consistent with the manuscript-wide suppressed-doublet phenomenon.

| Operation on original source | IoC (553 runes) | Adjacent equal outputs | Representative transliteration |
| --- | ---: | ---: | --- |
| As printed | **0.03423356** | **1** | source ciphertext |
| Subtract `φ(cell) mod29`, row reset | **0.03408287** | **17** | `H T TH H M P P N F O OE EA X TH Y ...` |
| Add `φ(cell) mod29`, row reset | **0.03441701** | **20** | `O B OE W F H X F EA P B F C U W ...` |

Decoded per-passage IoCs stay near 1/29: subtraction [0.03159,0.03150,0.03598,0.03640,0.03331]; addition [0.03347,0.03468,0.03450,0.03443,0.03331]. Neither direction yields recognizable source-native English text. The reencryption invariant verifies code correctness, while independent language evidence remains negative. As expected for a varying-position additive operation, it restores ordinary random-like numbers of adjacent duplicates rather than solving the text.

## Native JPEG glyph readback (Agent 27, 11 November 2026)

A separate image-only nearest-template readback was run on the original scans 53–55. Its 29-symbol reference set is trained only on source-checked physical p43 (scan 60): 274 glyphs, all 29 GP symbols, with **274/274 leave-one-out exact classification**. No p36–p38 target glyph labels enter training.

The five numbered passages contain **553 target runes** over 26 printed lines. After one source-geometry segmentation correction, the readback matches the canonical transcription **553/553**, with paragraph counts **139, 91, 98, 96, 129**. No rune transcription correction is indicated.

The sole segmentation exception is p37 line 3. The vertical-projection segmenter initially merged adjacent ᚳ+ᚹ into one 88-pixel-wide crop at x=1072, yielding 23 segments for a 24-rune line. The original image has a two-column ink valley at x=1124–1125 (two dark pixels in each column); splitting at x=1126 recovers ᚳ and ᚹ. The p43-template distances are 11.4198 for the left ᚳ and 1.93518 for the right ᚹ. This is a segmentation correction, not a source-text correction. All 26 target lines then match exactly.

The image classifier validates rune identities, not punctuation. Printed line boundaries are retained from the original physical-line transcription; hyphen/full-stop word boundaries are preserved from that transcription rather than independently classified here. The red paragraph labels and p36/p38 10-dot enclosure boundaries were separately inspected on the original scans and are documented above and in [the line-coordinate source audit](numbered-paragraph-linechar-gate.md).

No before/after 7×79 inverse is warranted: the source rune stream is unchanged. The prior 7×79/78 packet tests and the 5×5 totient-shift negative remain exactly as reported; this readback authenticates their input, not their proposed operation.

Reproduce the readback and emit per-line JSON:

    python sims/lp2_cuneiform_553_image_readback.py --output im-results/lp2-cuneiform-553-image-readback.json

## Research decision

The original glyphs supply **five numbered passages and a precise 553-rune test interval**, now independently image-readback verified 553/553 with one source-geometry split; this locks the source stream but does not authenticate a 7×79 phase or key. The historical 5×5 Wisdom square supplies a plausible five-row numerical object. The simplest row-by-row totient-shift cipher **fails**, and no original clue chooses an alternative bit register, key clock or row traversal. Retain the segmentation as a source-native target for independently sourced five-state operations. Do not turn the 553 length, individual fragment sizes, or 1033/3301 numerology into a family of free key sweeps. The earlier seven-page cuneiform issue's conclusion remains: no original-cipher inverse is source-selected by the repeated header alone.

**Inputs:** `resources/liber-primus/lp2-corpus.json`, `resources/lp2-transcription.txt`, `resources/liber-primus/lp2-ink-annotations.json`, `resources/cicada2014-openpuff-magic-squares.txt`, and the original JPEGs named above. Every arithmetic assertion and ciphertext roundtrip is in the single runnable test file.
