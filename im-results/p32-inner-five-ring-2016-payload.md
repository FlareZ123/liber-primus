# Signed 2016 tree payload length and LP2 p32 inner-five perimeter

**Status:** Exact original-source arithmetic correspondence, with bounded direct-key failure. The operator choice is retrospective; **no unknown plaintext or authentic key has been recovered**. This source-only lead was sent to the current [tree-route Issue #18](https://github.com/FlareZ123/liber-primus/issues/18#issuecomment-6785248530) without claiming the task.

The preserved and previously signature-checked 2016 tree OutGuess extraction `resources/historical/cicada2016-4gq25-outguess.asc` contains **1,136 bytes**. The matching original LP2 tree page, physical p32 / 49.jpg, contains precisely **121 GP runes**. Its canonical row-major 11×11 prime-valued square has first row sum **563** and first column sum **569**, the signed 2016 JPEG's image dimensions. This grid orientation and the image correspondence were established before the observation below.

The solved PARABLE's expression *shed our own circumferences* motivates a candidate square-peeling operation, though it does not specify this particular square. Concentric perimeter sizes from outside inward are **[40,32,24,16,8,1]**. Their unchanged GP-prime sums, with no key, normalization, or fitted alphabet, are:

| Shell (zero-based) | Side | Number of runes | Prime sum |
| --- | --- | ---: | ---: |
| 0 | 11 | 40 | 1917 |
| 1 | 9 | 32 | 1539 |
| 2 | 7 | 24 | 1046 |
| **3** | **5** | **16** | **1136** |
| 4 | 3 | 8 | 388 |
| 5 | 1 | 1 | 19 |

The source-selected inner **5×5 perimeter**, starting at coordinate (row3,col3) and traversing clockwise, comprises GP ordinals `[18,14,7,23,15,23,27,17,11,28,27,21,12,27,6,27]`. Its prime values are `[67,47,19,89,53,89,107,61,37,109,107,79,41,107,17,107]`, summing to **1136**, exactly the independent signed-message byte length. The original square's total is **6045**.

The relevant cross-round geometry is suggestive: the solved PARABLE alludes to circumferences, a historical 7×7 OpenPuff square contains a 16-cell inner 5×5 perimeter, and the signed 2016 image is the same tree as p32. The source does **not** instruct summing p32's third peeled shell, using the OutGuess byte length as a checksum, or interpreting these 16 runes as a cipher key. These choices emerged during exploration of already-known numerology and may be coincidental. There is no calibrated global false-discovery probability.

## Finite original-input inverse

To give the connection a direct opportunity to predict text, test the 16 unchanged shell runes as a repeating key against all **12,956 original unsolved ciphertext runes**. Read clockwise or counterclockwise from the upper-left inner-shell corner; choose standard GP ordinals or their source GP-prime values; both signs; continuous or page-reset clock. Test native GP29 additive substitution, plus the 29→28 cyclic predecessor-exclusion channel with repeated ciphertext as a transparent reserved symbol and a clock that either advances or pauses on such output. This is **48 distinct reversible settings**. Re-encrypting the original bytes succeeds for all 48 as an implementation invariant and is not key identification.

All original decoded unigrams remain near uniform. **Best IoC = 0.03530621** versus original **0.03447840**. An independently GP-encoded Shakespeare sample with exactly the original 55 page lengths and, for the GP28 plant, the exact 86 original repeat-marker sites, encrypts and decrypts exactly in representative native GP29 and GP28 model settings. The direct-key branch therefore reveals no plaintext and does not support the 16-rune ring as an ordinary repeating GP pad. A longer-state, source-specified role is still possible.

**Single-file reproducer:** `sims/tree121_outguess1136_ring_sft.cjs`; uses only tracked original LP2 numerical rune transcription, the exact signed OutGuess payload, and an existing GP-English positive-control source. Execute with Node.js 20 or later. The result is a new candidate source checksum, with its direct obvious inverse ruled out, and no claimed decrypt.
