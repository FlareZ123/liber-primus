# Original p50 numeric 32×8 table is not a direct Data Matrix 8×32 binary symbol

**22 November 2026, Agent3.** The 256 original two-character numeral tokens across physical LP2 pp49–51 are printed in **32 rows × 8 columns** (source scans 66.jpg, 67.jpg, 68.jpg). A 90° rotation yields **8 rows × 32 columns**, exactly one of the **six ISO/IEC 16022 ECC200 rectangular Data Matrix barcode formats** available long before Cicada's 2014 puzzle. That geometric coincidence permits a cheap decisive test of a recognizable, human-decodable, independent original-artifact operation. The result is a strict **no-go for every static original-token-to-binary-module translation**, including unknown arbitrary lookup tables. No new LP2 plaintext was recovered.

## Why an 8×32 Data Matrix would be recognizably constrained

The historical [GS1 DataMatrix introduction (2014)](https://gs1ca.org/documents/standards/GS1-DataMatrix-Introduction-and-technical-overview-v.pdf), table 1.2.2-2, lists an **8×32** Data Matrix rectangular symbol with **two 6×14 data regions**. Each 6×14 payload area has a one-module-wide finder/timing border, so the entire symbol comprises **two adjoining 8×16 finder-bordered regions**. As required by ISO/IEC 16022 ECC200:

- Left edge and bottom edge of each 8×16 region are solid black.
- Top edge and right edge alternate black and white.
- The top-right module is white; the bottom-left/bottom-right corners are black.

These mandatory, payload-independent border modules are an **exact prediction**. The original 256 printed values supply their candidate module symbols under any chosen global static function `f(original two-character token) → {black,white}`. Before attempting any decoder or searching thousands of bit predicates, ask whether the same printed token is ever **forced to be both black and white** on the finder borders. If so, no such conversion exists, regardless of the interior modules or the choice of `f`.

The 8×32 shape can be obtained from the 32×8 printed object in four rectangular orientations (reflect rows, reflect columns, both or neither after transposition). The other four plane symmetries are these same orientations viewed along the two axes.

## Exact original-corpus no-go

Input: original raw text tokens, **unchanged**, from [`resources/liber-primus/base60-grid.json`](../resources/liber-primus/base60-grid.json), especially the `rows` property. The derived `byte_rows` and base59/base60 interpretations are **not** used. The source notes independently verify eleven previously disputed cells against the physical scans but do not purport to audit all 256 cells; the conclusion is about the committed original-token transcription, and relevant witness tokens can be checked visually if contested.

Each orientation fixes **88 finder cells: 66 black, 22 white**. Group all fixed-border positions by their exact original token. Any token appearing on both colors yields a logical contradiction; assigning the token to its majority border color still incurs the stated **minimum unavoidable number of incorrect finder modules**.

| 8×32 orientation after transposition | Distinct conflicting exact tokens | Minimum unavoidable incorrect finder modules | Example original witness |
| --- | ---: | ---: | --- |
| Unreflected | 6 | 6 | `22` at source r9,c1 and r14,c1 must be black and white |
| Reverse module rows | 4 | 4 | `1K` appears at conflicting finder positions |
| Reverse module columns | 4 | 4 | `2M` appears at conflicting finder positions |
| Reverse both axes | 5 | 5 | `1K` appears at conflicting finder positions |

For the unreflected 8×32 orientation, source table entries at **r9,c1** and **r14,c1** are both the exact token `22`. Both would lie on the top timing edge of the rotated matrix; the first top-edge module is required to be black and the second white because their column parities differ. No threshold, arithmetic parity, primality classification, byte bit plane, lookup table or other **deterministic per-token** binary rule can distinguish identical source tokens. The remaining three orientations have their own independent conflicts.

A synthetic positive fixture with exact 8×32 ECC200 border colors encoded as two distinct raw token labels returns zero conflicts. This controls the logical gate and the region framing. There is no uncertain language-score threshold or cherry-picked token-to-bit rule.

## Decision and limits

**Eliminated:** The source 32×8 numerical grid is **not a directly recodable ECC200 8×32 symbol** under any location-independent `f(raw two-character token) → one binary module`, in any rectangular orientation, assuming the committed token transcription matches the original on the cited witness cells. A further sweep of parity, threshold, modulo classes, bit planes or static token dictionaries for such a direct 2D barcode cannot succeed.

**Unresolved:** A position-dependent mask or keystream, nonlocal rearrangement, ciphertext transfer, split across multiple symbols, an external key, or a different graphical protocol would require an independently printed/archived operation. This bounded result has no bearing on those possibilities. The geometry alone is insufficient evidence that the creators intended Data Matrix.

**Executable original-corpus SFT:** [`sims/lp2_p50_8x32_datamatrix_value_to_bit_source_sft.cjs`](../sims/lp2_p50_8x32_datamatrix_value_to_bit_source_sft.cjs). The test reads only the committed original-token transcription, verifies the shape and positive fixture, enumerates all four rectangular orientations, counts conflicting raw source tokens and prints original coordinates and required colors for contradictions. It is a cheap no-go, with no unknown decoder parameters.
