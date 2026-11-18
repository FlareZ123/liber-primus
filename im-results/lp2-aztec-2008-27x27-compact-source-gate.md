# A period-available compact Aztec layout and the original 27×27 LP2 opening

**18 November 2026, Agent37. Classification: a new historical-codec comparison and a decisive *direct-rendering* negative. No recovered unknown-page plaintext, key, key clock, original cipher, decoded barcode, or destination.**

## Independent original-page inputs and why the code is plausible enough to check

The authenticated May 2014 LP2 physical pages p0, p1 and p2 contain **262, 266 and 201 Gematria Primus runes**, respectively: exactly **729** original runes in printed reading order. This admits a **27×27** array with no missing symbol. The previously independently established p32 tree-bearing page has **121** source runes, exactly **11×11**. The original terminal p55 has **76** ciphertext runes; the separately printed p49–51 numerical grid has **256** two-character cells, conventionally yielding 256 candidate bytes under the *unproved* base60 interpretation. These lengths were known individually, but their joint fit to a specific standardized graphical code has not been treated here as a key or original instruction. **Direct examination of the original 17.jpg, 18.jpg, 19.jpg and 49.jpg page images confirms these are typeset prose lines, not printed 27-column or 11-column barcode matrices. The proposed square layouts require a new, unauthenticated reflow of a multi-page text tape; this is the most serious source objection to the candidate.**

A pre-2014 publicly specified executable format has the following **independently published** structure:

- [ISO/IEC 24778:2008, Aztec Code](https://cdn.standards.iteh.ai/samples/41548/3cb3794694674dfa863f2afad9dc2f54/ISO-IEC-24778-2008.pdf), §5.1.1, defines the **11×11 compact core**, including a mandatory concentric **9×9 finder bullseye**. Its data field is read in a two-module clockwise spiral around the core.
- Its Table 1 gives a four-layer compact **27×27** symbol with **76 eight-bit codewords**. Exactly **27²−11²=608=76×8** binary data-field modules surround an 11×11 core. **These 76 codewords include error-correction words; they are not 76 printable plaintext bytes.**
- §4.2(f) and Annex A independently define **256 optional Aztec “Runes”**. Each is an **11×11 module barcode carrying exactly one byte (0–255)**, formed from a compact core with its error-corrected mode message. This exact **(121 modules, 256 values)** pair is more constraining than the isolated numeral 256; the original p32 likewise has 121 printed symbols, while the p49–51 table has 256 cells. These Aztec *runes* are machine-readable black/white tags, **not Cicada's 29 GP rune letters**. [Period-standard-compatible technical description](https://barcodeguide.seagullscientific.com/Content/Symbologies/aztec_rune.htm). No first-party source selects the symbol alphabet, the printed table as a byte dictionary or an AztecRune consumer.

Thus a historically available human-readable code grammar happens to connect the original sources' **729, 121, 76 and 256** lengths. The critical objections are substantial: no Cicada-authenticated source mentions Aztec Code or a 27-wide row order, the 121-runic p32 text is printed in six horizontal text lines rather than an 11×11 square, and its symbols do not occupy the middle 121 cells of p0–2, and it is easy to retrospectively prefer a fitting standardized size. A real decoder requires an independently selected rune-to-bit or other binary serialization before interpreting the data-field/RS codewords.

## Decisive source-original fixed-finder test

Rather than hunt 29 unknown bit assignments to fit a desired plaintext, test the compulsory **9×9 central finder** first. ISO §5.1.1.1 specifies a dark central module and four alternating surrounding rings, dark at Chebyshev radii **0,2,4**, light at **1,3**. A valid, non-obscured Aztec symbol has **81/81** matching modules, allowing the reversed reflectance convention. The test uses the **untouched 29-symbol source-index tape** in exactly two *hypothetical square reflows* of original prose:

1. The three original opening pages concatenated and laid out 27×27, with the 9×9 center at coordinates rows/cols **9–17** (0-based).
2. Original p32 reshaped, **without an original square layout**, into 11×11, with the 9×9 center at rows/cols **1–9**.

To grant the candidate maximum decoding freedom, at each 9×9 center count the original rune identities in required light and dark cells. For **every possible fixed secret function** assigning a binary color to each of 29 GP rune identities, the mathematically exact smallest number of failing center modules is the sum, over input symbols, of **min(light_count,dark_count)**. Also test the one-step modular GP29 ciphertext difference register on each square, initialized at the first symbol, before looking at any language score. This enumerates all **2²⁹** stationary color maps *implicitly and exhaustively* without fitting one.

| Original 9×9 input/register | Conflicting distinct input symbols | Minimum mismatched finder cells, all 2²⁹ maps | Best 5 native ordinal bitplanes, including complement |
| --- | ---: | ---: | ---: |
| p0–2 27×27, rune indices | **20** | **24/81** | **48/81** |
| p0–2 27×27, first difference mod29 | **14** | **21/81** | **48/81** |
| p32 11×11, rune indices | **16** | **19/81** | **47/81** |
| p32 11×11, first difference mod29 | **18** | **23/81** | **48/81** |

No orientation/reflection or complement repairs these contradictions: a centered concentric target has the same dark/light ring classes under all square dihedral symmetries. The result is **key-independent** for the entire class of stationary GP29 rune-to-single-binary-module renderers, raw or direct GP29 first difference. An independently planted 9×9 finder on both sizes yields **0** mismatches under the same evaluator.

[Original-corpus Node.js 22 single-file test](../sims/lp2_aztec_compact_27x27_finder_original_sft.cjs) explicitly asserts all page lengths, 256-table size, 608-bit data capacity, every impossibility count and two positive patterns. It uses the repository's original-source canonical ordinal transcriptions. [Successful Windows-latest Node.js 22 CI run 44220535188](https://github.com/FlareZ123/liber-primus/actions/runs/44220535188) ran the complete original corpus SFT, asserted all five bounds, and printed the expected positive-control passes. No new imaging, hidden watermark, or source-selected binary preprocessing is asserted.

### A single source-selected layered escape: the actual 2014 XOR operation

One independent construction could defeat the plain center test without a ciphertext-fitted cipher: replace the **embedded 11×11 center** (rows/cols 8–18) of p0–2 with a binary superposition of original p32's 121 source rune indices, using the **five-bit integer XOR** operation genuinely witnessed in the 2014 Cicada challenge. A full 121-rune source-to-source alignment is specified by those two natural squares; no phase, shift, or key is fitted.

On all 121 exact original samples, let `Z[i] = p0p1p2_center[i] XOR p32[i]` in ordinary unsigned five-bit integers (0–31). The 9×9 center of this new 11×11 intermediate still contradicts the required finder under **every possible stationary 32-symbol-to-binary assignment**: **11 source-symbol identities occur on both bullseye colors, forcing at least 14 of81 mismatched modules**, and the best of five native XOR-bit planes (or their complements) scores only **49/81**. This is a separately pinned two-source negative, now included in the same runnable SFT, rather than a rescue by secret bit-assignment tuning. It rejects exactly this source-aligned 2014-style XOR; arbitrary other core-generating operations remain unfixed and untested.

## Decision

**Reject a literal compact-Aztec 27×27 barcode rendered as the unchanged original p0–2 GP runes, or the 11×11 finder rendered as unchanged p32 runes, under *any* fixed rune-to-dark/light mapping.** The same exact rejection holds for first GP29 differences, and for the historically motivated five-bit source-center XOR p32 transfer just tested. There is no need to search bitplanes, secret stationary 29-symbol black/white alphabets, mirrored source order, or other purely binary relabellings of these direct registers.

The historically credible barcode grammar remains a **speculative clue coincidence**, not a solution. A layered/stego or page-replacement interpretation could escape the fixed-finder obstruction, but would require a *first-party source selector* that actually names Aztec Code, specifies the inter-page assembly and binary register, and predicts at least one intact original dataword. Without that independent selector, fitting an arbitrary bitmask/rotation/RS error payload would repeat exactly the unconstrained search this project is retiring. No unknown LP2 plaintext has been recovered.