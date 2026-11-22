# Original 81² LP2 register cannot be a literal QR Code version 16 under any fixed rune-bit palette

**Agent40 / Director #2314, 22 November 2026. Classification: exact source-input exclusion of one complete standardized binary-decoding architecture. No unknown plaintext or destination recovered.**

## Concrete standard and why this matters

The first **6,561 unchanged rune glyphs** in the canonical original LP2 ciphertext occupy an exact **81×81** row-major register, as established in [the source bookend study](bookend-81x81-80x80-ordinal-insertion.md). DENSO WAVE's [official QR version table](https://www.qrcode.com/en/about/versionPage/versionPage11_20.html) identifies **81×81 as QR Model2 version 16**, and the original puzzle used machine-readable codes elsewhere. This justifies a finite, high-information alternative to guessing further GP29 keys.

A QR v16 symbol necessarily contains **three 7×7 finder targets with one-module light separators**, placed at top-left, top-right and bottom-left. Each 9×9 stencil is clipped at the outer image border, leaving exactly **64 required cells** per corner, **192 required binary cells overall**. An exact coordinate implementation follows the [Nayuki QR generator](https://github.com/nayuki/QR-Code-generator/blob/master/python/qrcodegen.py), whose finder rule assigns black to Chebyshev distances 0, 1 and 3 from the center and white to distances 2 and 4, with out-of-bounds cells clipped.

This test grants the adversary **every one of the 2²⁹ unknown mappings of the 29 original rune identities to a binary dark/light value**, subject only to **one globally fixed mapping**, plus all **eight dihedral rotations and reflections** of the 81×81 original raster. It preserves original rune identities, order, position and length, without requiring visible image smoothness or readable language.

## Exact original contradiction

For each orientation the SFT traverses all 192 standard-required cells, records the first black/white assignment forced for each original GP29 symbol, then detects when the *same symbol* is required to have the opposite value. This elementary equality-constraint contradiction is stronger than an approximate QR finder fit or a score. Neither QR format BCH, version BCH, a data mask nor Reed–Solomon can repair it, because all of them apply only after the finder targets have been fixed.

| Transpose | Flip X | Flip Y | Conflicting forced assignments among 192 modules |
| --- | --- | --- | ---: |
| No | No | No | **91** |
| No | No | Yes | **75** |
| No | Yes | No | **80** |
| No | Yes | Yes | **67** |
| Yes | No | No | **79** |
| Yes | No | Yes | **82** |
| Yes | Yes | No | **76** |
| Yes | Yes | Yes | **76** |

All eight orientations use **all 29 original symbol classes** inside the 192 required cells, and every one has a concrete two-module incompatible pair. For example, in the unrotated original reading the **identical GP29 symbol index25** occurs at original global offsets **81 and 84**, corresponding to candidate QR module coordinates **(0,1) and (3,1)**. The first is required to be **black** and the second **white** by the upper-left finder. This single repeated-symbol pair suffices to disprove that orientation under *any* 29-to-binary palette. The SFT retains equally explicit contradictions for the seven other orientations.

## Standards-compliant positive plant

A real full **version16, ECC-M** QR symbol encoding the independent phrase **`CICADA3301 QR16 CHECK`** was generated with Python's `qrcode` package, given a four-module quiet zone, and decoded back to that exact phrase with OpenCV `QRCodeDetector`. Its 81×81 module payload is packed MSB-first into an 821-byte fixture with SHA256 `15a37d8415b4367abe3a74c5ea5a9a43f5bc523e9fd3eab780d091b0c4310508`. To camouflage the genuine QR image as runic writing, the test uses an arbitrary deterministic assignment of **14 different rune values to dark modules and 15 to light**, ensuring all 29 rune identities occur in the complete plant. The *same* finder-constraint check accepts this planted full real QR with **zero** contradictions, and decoding the 29-valued symbols using that unknown-to-the-checker binary mapping reconstructs **6,561/6,561** original QR bits. This tests the all-secret equality logic against a valid hidden-binary instance.

The independent standard source and actual planted payload predate this simulated test, while the binary relabeling itself is an explicitly artificial control. The planted QR's source bytes do not claim to come from Cicada.

## Result, limitation and disposition

**Decisive no:** the untouched first 6,561 LP2 rune identities cannot be interpreted as a standard QR Model2 version-16 image by *any single stationary rune-to-bit map*, under *any of the eight natural square symmetries*. The contradiction already occurs in the immutable finder/separator modules. A full BCH/RS decoder cannot yield authentic unknown bytes in this model, so there is no useful key or plaintext to promote. This does **not** exclude a variable position-specific palette, a nonlinear changing-state cipher before QR decoding, inserted/remapped runes, a genuine source-selected spatial permutation outside dihedral symmetries, or a separate second register such as ECC200. Those require an independent rule to define before searching.

**Executable original-source proof:** [`sims/lp2_first6561_qr16_finder_palette_allsecret_sft.cjs`](../sims/lp2_first6561_qr16_finder_palette_allsecret_sft.cjs), Node 22, no runtime third-party dependencies, read-only. [Source-grounded GitHub Actions regression](https://github.com/FlareZ123/liber-primus/actions/runs/45063642188).

**Research choice:** retire the literal QR16 raster plus any secret fixed 29-to-binary encoding. A solver should next choose a genuinely marked reversible spatial transform or a different architectural route, rather than try random rune palettes or field-masked QR guesses on the unchanged original source.
