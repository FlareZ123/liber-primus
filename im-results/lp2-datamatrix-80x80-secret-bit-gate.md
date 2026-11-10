# Terminal 80×80 Data Matrix: an all-secret rune-bit obstruction

**Result class:** exact source-conditional exclusion of one human-recognizable 2D code interpretation. The unknown LP2 plaintext and its true key remain unsolved. This candidate arose from the previously documented (retrospectively noticed) bookend square division, and is **not** established author intent.

## Candidate and original-source discriminator

The sole repeated adjacent two-word ciphertext pair places a first segment break at global offset **6,561 = 81²**; the remaining **6,395 = 80² − 5** runes fit an 80×80 binary symbol after inserting five unspecified modules. ECC200 **Data Matrix** is a standard 80×80-barcode format, so it gives a completely specified, falsifiable static-symbol hypothesis rather than an arbitrary raster image. [Data Matrix ECC200 symbol-size table](https://docs.dataflex.dev/reports/explanations/barcode-types/data-matrix/) and [80×80 data-region table](https://www.onbarcode.com/kb/barcode-faq/data-matrix/) show 16 data regions of **18×18**, arranged 4×4, with a **20×20** bordered cell block for each. The required borders are a solid left and bottom and alternating top and right [finder structure](https://docs.cognex.com/cvl_900/web/en/cvl_vision_tools/Content/Topics/VisionTools/Data_Matrix.htm).

The exact model is: put the 6,395 canonical unsolved **terminal** runes in consecutive reading order into an 80×80 matrix; insert **five arbitrary, freely chosen missing modules** at any locations; assign each of the 29 rune identities one arbitrary, unknown bit (0/1), with no requirement to use any predefined alphabet parity. Allow four scan routes (row-major, row-serpentine, column-major, column-serpentine), each under all eight square rotations/reflections, and both polarities (implicitly absorbed by the arbitrary rune-to-bit assignment). The interior data and all ECC200 Reed–Solomon content are completely unrestricted; only mandatory finder modules are tested.

## Exact missing-module-agnostic exclusion

Partition every candidate 6,400-module traversal into **eight disjoint 800-module bands**. At most five of those bands can contain a missing module, so at least **three bands are unchanged**. In any unchanged band, the number of omitted modules before the band is constant, one of 0,1,2,3,4,5. For each scan route, symmetry, band, and such prefix count, score the required finder modules against the original rune identity. Give **each of the 29 runes its own arbitrary bit**, minimizing errors independently within that band: if one rune occurs a times where a dark module is mandatory and b times where a light module is mandatory, its exact minimum errors are `min(a,b)`. Summing gives a true lower bound even when every band chooses a different secret alphabet.

All **32** route/symmetry combinations and all **8×6** band/prefix states fail: even the easiest original intact band requires **16** finder-module mismatches. Sorting the eight band-wise minima, the three best bands across all combinations jointly require **at least 51** mismatches. Any actual placement of only five insertions leaves at least three bands intact, so **every** such placement needs at least **51** wrong finder bits under even arbitrarily optimized, band-dependent secret rune-to-bit lookup tables.

| Finding | Exact value |
| --- | ---: |
| Original terminal GP rune count | 6,395 |
| Missing free modules | 5 |
| Legal 80×80 ECC200 data regions | 16 of 18×18, each with 20×20 border |
| Reading/order transformations | 4×8 = 32 |
| Intact-band prefix-state configurations per route | 8×6 = 48 |
| Minimum finder mismatches in any unbroken band | 16 |
| **Universal original lower bound, all five insertions and unknown binary alphabets** | **51** |
| Synthetic genuine barcode, five hidden omissions, arbitrary secret GP parity bit alphabet | **0** |

This lower bound is stronger than trying a few known rune-to-bit mappings: a secret single-rune alphabet, five freely inserted modules and arbitrary full image orientation cannot repair the required ECC200 finder pattern. The self-contained positive plant supplies a valid 80×80 ECC200 mandatory finder with random interior bits, encodes using a concealed GP29 binary mapping, removes modules at original raster positions **13, 499, 1,207, 3,456, 6,383**, and the same algorithm reports a bound of **0**. It demonstrates that the gate admits a genuine encoded symbol using exactly the declared source length and missing-module model.

## Independent source-visible parity clocks

The same all-secret eight-band proof can grant **separate hidden binary alphabets** under simple public pixel-phase clocks. Their original lower bounds, with all five insertions and 32 traversals, are **16** finder errors for independent maps on even/odd target row, **16** on even/odd column and **34** on even/odd checkerboard parity `(row+column) mod 2`. Thus none of those three natural two-phase repairs rescues direct terminal ECC200 encoding.

Granting **four independent** rune-bit tables indexed by the pair `(row mod 2, column mod 2)` *does* reduce the finder-only obstruction to **zero**. That is expected: ECC200's mandatory black/white perimeter at 20-module tile boundaries is itself completely determined by the pair of row/column parities. This is **not** a successful original data-channel decryption or evidence of a valid Reed–Solomon codeword. The test therefore exposes exactly where the key-independent finder restriction stops: a position-aware four-state clock can satisfy this particular necessary condition and would require a separate original-payload or source-rule test.

| Static output alphabet scope | Guaranteed finder-bit corrections |
| --- | ---: |
| One arbitrary secret table per rune | 51 |
| Two tables by row parity | 16 |
| Two tables by column parity | 16 |
| Two tables by checkerboard parity | 34 |
| Four tables by both row/column parity | 0 (finder only; not an authenticated barcode) |

## Scope

This rejects **direct single-rune-to-one-bit** rendering with static rune identities, a source-ordered 80×80 cell raster, up to five insertions, the declared 32 conventional orientation/scan orders, and exactly the ECC200 mandatory borders. It does **not** reject a position-dependent key, pre-transposition/cryptographic decoding before barcode rendering, variable-length bit representation, independent multi-rune codewords, nonstandard matrices, a different cyclic start, or a plain 80×80 image without ECC200 finder structure. The 81² / 80²−5 segmentation itself remains a retrospective hypothesis; these negatives are conditional and do not establish that Cicada attempted a barcode.

**Reproduce:** `node sims/lp2_datamatrix_80x80_allsecret_finder_sft.cjs` from the repository root or another working directory. Uses only Node.js and `resources/liber-primus/lp2-corpus.json`; exact assertions cover genuine source counts, 51 original bound, and zero-mismatch synthetic control.

**Related prior source-framing work:** [bookend and square structure](../results/README.md#bookend-phrase-and-exact-internal-endpoint) and [the distinct 81×81 QR finder test](../sims/lp2_81square_qr_finder_gate.cjs). This result screens the **80×80** terminal half and a different established 2D symbology.
