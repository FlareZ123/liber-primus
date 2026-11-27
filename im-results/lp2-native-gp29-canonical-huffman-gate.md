# Fixed native-GP canonical Huffman transport — original frame gate

**Decision (27 November 2026, #3133): retire this exact direct native-GP Huffman/BASE29 carrier.** No original frame satisfies its mandatory EOF and canonical integer framing. There is no recovered unknown plaintext, key, or authenticated compression instruction.

## Premise and frozen receiver

The historical BASE29 teaching command supplies a positional digit convention and earlier Cicada stages use compressed payloads. No authenticated artifact selects Huffman, these weights or this sentinel convention. This is a finite exploratory representation test, distinct from the prior headed/DEFLATE byte transports and Tunstall/arithmetic models. The [existing byte transport analysis](lp2-dualfactor-deconvolution-base29-compressed-transport.md) tests different codecs and filters.

The [CommonJS SFT](../sims/lp2_native_gp29_canonical_huffman_sft.cjs) was committed as `2c4ecb87ba4493cc227c712ee4c75e0b224b69ce` before scoring any original frames. Use the pinned native solved records (blob `1b064ef6d85819b7d96adaff31a82d1ec551598f`) and LP2 corpus (blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`). Train one 30-symbol binary tree on WARNING, WELCOME, WISDOM and KOAN1 (1,636 native runes) with one EOF per record and Laplace +1 per symbol. Merge by (weight, smallest descendant symbol), use ordinary canonical Huffman assignment by (code length, GP ordinal), EOF ordinal29. The EOF code is `111111110` (9 bits). Do not fit the tree to the original.

Sender: concatenate native GP codewords and one EOF, prepend a binary 1 sentinel (preserves the exact length including initial zero bits), interpret as a positive integer, emit its shortest big-endian BASE29 digits. Receiver: reject leading zero digits; remove the single sentinel from the canonical binary expansion; parse the complete prefix tree; require EOF exactly at the final bit. No guessed trimming, padding, hidden key, alternate clock, or offset. A positive integer determines one bit length and one parsing; a successful receiver re-encodes the complete digit frame exactly. The natural source reset alternatives are the 55 rune-bearing pages, nine established chapter intervals (729,1145,1729,1903,1021,1433,1680,3008,308), and the full 12,956-rune book. Printed word cuts are not assumed to represent native plaintext cuts.

## Results

All five disjoint held-out native records (LOSS OF DIVINITY, jpg107–167, jpg229, p56, p57; 1,343 runes) recover exactly, with 678/281/82/78/86 encoded GP digits respectively. All 20 mutations reject: a prefixed zero digit, an appended zero or one bit after EOF, and a removed last bit on each control. Held-out per-rune bigram log gain over uniform ranges +0.554825 to +0.692047 (Laplace-one trained on the four fixed records). No original language score was calculated on an illegal frame.

| Outcome | Original frames (65) |
|---|---:|
| Exact final EOF / canonical replay | **0** |
| EOF before final bit | 25 |
| Ends on partial codeword | 25 |
| Ends on codeword boundary but without EOF | 11 |
| Noncanonical leading zero | 4 |

Matched nulls: 128 independently generated sequences at each original frame length for each of two models, uniform GP29 and symmetric 29-state repeat-suppressed Markov with repeat probability 86/12945 (seed 0x3133c0de). Of 8,320 frames/model, 3 uniform and 1 low-repeat frames are legal; all four are page-size, with no chapter/book successes. These are descriptive matched null counts: the real page, chapter and whole-book frames overlap and do not constitute 65 independent observations. A legal frame alone would be weak evidence because arbitrary digits can end at a valid EOF by chance.

Full [machine-readable output](lp2-native-gp29-canonical-huffman-output.json), including codebook, controls, original rejection categories, and null draws aggregated per frame. The exact committed run function was fetched and executed in connected V8; the standalone Node wrapper was not separately executed. The test excludes only this direct single-tree, sentinel, EOF, whole-frame receiver. No independently selected alternative tree, framing, or ciphertext preprocessing is established; do not tune those freedoms in response to the negative. The next decision requires a first-party compression/serialization selector or an independent representation.
