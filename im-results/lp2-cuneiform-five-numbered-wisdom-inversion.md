# Five numbered cuneiform passages: source-square row masks and five-way matrix mixing

**Status (updated 13 November 2026):** the exact printed 553-rune, five-numbered passage enclosure was independently image-readback verified. Three source-led operation families have been tested: direct numbered-row totient masks, a five-passage column interleave followed by the known p56 totient cipher, and a five-way 5×5 matrix mix whose key comes literally from the original LP1 Wisdom square. These finite inverses produce **no unknown plaintext, authenticated cipher, key or continuation**. Their results are documented and reproducible below. They do not establish an impossibility result for any unknown two-layer or externally keyed encryption.

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

## Five-passage column mixing under the solved prime-totient key

A separate finite inverse addresses the source-interpretive **MIX** word identified by the historically mapped p36/p55 Wisdom-square route (see [direction-map source analysis](2014-magic-square-direction-map.md#nested-word-sum-instruction-candidate-mix)). The manuscript visibly enumerates exactly five passages with rune lengths **139, 91, 98, 96, 129**. Read their first runes in number order 1→5, then their second runes in the same order, continuing column-by-column and skipping exhausted passages. Reverse-number order 5→1 is the opposing direction. This is an invertible, variable-height five-column interleave with no guessed fillers or fitted indices.

The only next cryptographic operation in this bounded test is the known solved-p56 **GP29 prime-totient key**: for the j-th runic symbol in the mixed sequence, `k_j=(prime(j+1)-1) mod29`, starting at the first prime 2 and resetting at the source 10-dot enclosure. Both additive signs were tested. The unchanged as-printed sequence is the baseline, giving six exact models. The original 553-rune stream has IoC **0.03423356**, and the candidate inverses yield:

| Read order | Subtract shift IoC | Add shift IoC |
| --- | ---: | ---: |
| As printed | **0.03418115** | **0.03479702** |
| Column interleave 1→5 | **0.03466599** | **0.03462012** |
| Column interleave 5→1 | **0.03476426** | **0.03482323** |

All six outputs have no discernible GP-native plaintext opening and remain near the uniform 29-symbol IoC of 0.03448. The exact inverses fully restore all **553/553** original symbols. These results reject only the specified interleave followed by a source-reset direct prime-totient additive mask. The source does not authenticate the meaning of MIX, the columnwise reading rule, or application of p56's otherwise page-specific key to the numbered passages. No unknown plaintext or key was recovered. [Single-file reproducible test](../sims/lp2_five_numbered_mix_primephi_sft.cjs) reads the canonical source, asserts five authentic boundaries, verifies both lossless interleaves, and pins the six original IoCs.

## LP1 Wisdom 5×5 matrix applied to the five numbered streams

**Agent48's original-source test, 13 November 2026.** The previous tests used the five Wisdom *rows as separate five-symbol keys* or merely interleaved the five passage streams. A materially different possibility is to combine the five simultaneously aligned ciphertext symbols by an actual invertible linear **5×5 mixing matrix** over GF(29), using the visible complete Wisdom square itself. The source contains two independent motivations: five numbered passages, and the authentic 2014 square's exact five-by-five geometry. The original LP1 text also names the totient operation. The [separate p36/p55 LP1-word navigation study](2014-magic-square-direction-map.md) conjectures an instruction word \`MIX\`, but that word is derived through interpretive steps and **is not authenticated plaintext**. A human could try matrix mixing, yet neither manuscript gives an explicit Hill-5 cipher command or fixes a cross-stream key schedule.

The five original passage lengths are **139, 91, 98, 96, 129**. The shortest is exactly **91**, yielding a well-defined common prefix of **455 GP29 positions** in **91 five-symbol column vectors**. The remaining **98 symbols** are preserved as source and *not* interpreted by this test. No alignments are fitted, and no encryption is assumed to reset at printed line wraps. Two **independently supplied** 5×5 invertible matrices are considered: (a) source Wisdom cell integers modulo29, determinant **3**, and (b) the original LP1-instructed Euler φ of each source cell modulo29, determinant **28**. For each, the original printed orientation and its transpose give exactly **four** direct inverse interpretations. In every case, calculate the exact GF29 inverse and decode the aligned ciphertext vector; the source matrix forward-multiplies the output back to the original rune vector.

The source matrix is:

    272 138 341 131 151
    366 199 130 320  18
    226 245  91 245 226
     18 320 130 199 366
    151 131 341 138 272

It reproduces row/column totals 1033. Its cellwise \`φ(n) mod29\` matrix is:

    12 15 10 14  5
     4 24 19 12  6
    25 23 14 23 25
     6 12 19 24  4
     5 14 10 15 12

**Original-input outcome:**

| Direct original-source matrix inverse | Invertible GF29 determinant | IoC, 455 decoded symbols | Same 455 original ciphertext symbols |
| --- | ---: | ---: | ---: |
| Raw Wisdom / printed | **3** | **0.03358667764** | **0.03448709880** |
| Raw Wisdom / transposed | **3** | **0.03494215036** | 0.03448709880 |
| Totient Wisdom / printed | **28** | **0.03408045699** | 0.03448709880 |
| Totient Wisdom / transposed | **28** | **0.03471946556** | 0.03448709880 |

Each candidate produces disconnected ciphertext-like GP tokens; for example, the first passage's raw printed inverse begins \`NGWREDTHIAWMREONGJAIBLYRRYEGPAHRLEAWOEEAEA...\`, whereas the φ printed inverse begins \`ONPLCGUEOEMTTOYXMEOEAETEAWLFAEWALHOOCN...\`. No sustained readable GP-native prose appears in any of the five independently recovered streams. Exact inverse-to-forward source replay succeeds **455/455** for each of the four source models; more importantly, each also encrypts and recovers a **455/455 independently solved p57-GP plaintext plant** using precisely the declared matrices. These assertions, determinants, source indices, counts and output frequencies were **executed as checked-in JavaScript with actual remote GitHub source data under a V8 Node-module adapter**. No native Node22 Actions execution is claimed.

[One-file read-only CommonJS SFT](../sims/lp2_five_numbered_wisdom_square_mixing_sft.cjs) reproduces the entire test from \`resources/liber-primus/lp2-corpus.json\`. This excludes **only the four direct 5×5 same-index mixed-column source-square inverses on the natural 91-vector common prefix** as a plaintext explanation; an unknown per-position secondary pad, alternative stream start, or an authored variable-length completion would be a different model requiring external evidence. Direct matrix reuse produces no key or plaintext. Unless a historical clue gives an independently selected mixing instruction and 98-rune tail-handling grammar, additional arbitrary rotations, matrix mutations or language-fitted phases are not warranted.


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
