# Source-labeled 80×80 ECC200: exact Reed–Solomon exclusion

**Classification (11 November 2026):** A fully reproducible, source-conditional negative for a direct ECC200 barcode reading of terminal Liber Primus. No new plaintext, historical cipher, key, or destination was recovered. Reproducer: [Node.js 22 single-file test](../sims/lp2_datamatrix_five_ordinal_rs_allsecret_sft.cjs), [successful manual CI](https://github.com/FlareZ123/liber-primus/actions/runs/42942931537).

## An exact but unconfirmed square framing

The only repeated 3+3-rune ciphertext word pair first ends at global rune **6,561=81²**. The terminal text has **6,395=80²−5** GP runes. Five actual printed red Arabic ordinal headings on physical pp36–38 occur at global rune-start offsets **[8805,8944,9035,9133,9229]**. Inserting each heading as a single position in the terminal square supplies the following 80×80 positions, all zero-based:

| Heading | Linear slot | Row | Column |
| ---: | ---: | ---: | ---: |
| 1 | 2244 | 28 | 4 |
| 2 | 2384 | 29 | 64 |
| 3 | 2476 | 30 | 76 |
| 4 | 2575 | 32 | 15 |
| 5 | 2672 | 33 | 32 |

The 80×80 symbol size is valid ECC200 Data Matrix. The original 81²/80² division was previously identified; the five specific insertion coordinates here replace the earlier arbitrary missing-module model. Reading numerals as binary positions is a **hypothesis**, without an independently authentic Cicada instruction.

## Every phase-secret bit lookup is determined by the original mandatory border

A standard 80×80 ECC200 matrix has sixteen bordered 20×20 regions with an 18×18 interior each. Its mandatory border module value depends only on the two coordinate parities: **(even,even)=1, (even,odd)=0, (odd,even)=1, (odd,odd)=1**. Grant an unknown bit to *each of the 29 GP runes independently at each of four public row/column-parity phases*, totaling **116 arbitrary secret binary assignments**.

The SFT checks four source scan orders (row, serpentine row, column, serpentine column) with all eight rotations/reflections. In all 32 original-source layouts, **1,216** mandatory finder modules are occupied by actual original runes; all five inserted printed numerals occur inside data regions. Every one of the 29 rune identities occurs on a border in each of the four phases. Thus every **116/116** hidden lookup bits is forced, with zero contradiction, and **0** independent bit-map entries remain.

The entire resulting bit image is therefore fixed by public row/column parity, independent of the original rune symbols, except for the five numeral modules. This closes the earlier [finder-only four-phase loophole](lp2-datamatrix-80x80-secret-bit-gate.md).

## Exhaustive ECC200 parity contradiction

The [80×80 symbol attributes](https://gs1ec.org/contenido/wp-content/uploads/2026/02/GENERAL-SPECIFICATIONS-STARDAR-2026.pdf) specify **456 data plus 192 error codewords**, interleaved as **four blocks of 114 data + 48 error bytes**. The SFT reconstructs the 72×72 ECC200 Utah/corner placement following [ZXing's open-source placement algorithm](https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/datamatrix/encoder/DefaultPlacement.java) and evaluates each 48-syndrome GF(256) Reed–Solomon block, using primitive polynomial **0x12d** and roots α¹…α⁴⁸ following [ZXing error-correction logic](https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/datamatrix/encoder/ErrorCorrection.java).

The script exhausts **4 scans × 8 orientations × 2⁵ independent numeral-bit choices = 1,024** candidate original-input symbols. Each would require **0 of 192** nonzero Reed–Solomon syndromes to be a valid ECC200 symbol. The **smallest** observed number is **187 of 192** nonzero syndromes; the maximum is **192 of 192**. The two best source cases are `(route 0, symmetry 6, five-bit flip mask 30)` and `(route 2, symmetry 2, flip mask 30)`.

An independent positive control creates four 114-byte message blocks, computes their 48-byte checks using exact GF(256) generator division, places all 648 codewords in the same Utah/corner map and recovers them bit-for-bit. Its Reed–Solomon syndrome count is **0/192**. Both original tests passed in [manual GitHub Actions CI](https://github.com/FlareZ123/liber-primus/actions/runs/42942931537).

## Scope and consequence

This **excludes direct one-rune/one-bit ECC200 decoding** under a single rune map or four secret parity-phase maps, including all five original numeral bits, all 32 declared scans and orientations, and unrestricted hidden maps in those families. It leaves nonlinear pre-decryption, variable-length rune coding, unconstrained per-position keys, other matrix formats, and the entire underlying Liber Primus puzzle unresolved. The square framing remains interpretive and should not be presented as an established historical step.

**Run:** `node sims/lp2_datamatrix_five_ordinal_rs_allsecret_sft.cjs` from the repository root. No compiled dependencies, external network or fitted plaintext are needed.
