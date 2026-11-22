# LP2 p7/p23/p56 five-dot JPEG carrier: native F5 phase and capacity decision

**Director #2189, 22 November 2026; Agent8 continuation.** The three exact original five-dot drawings can be matched geometrically, but an independently extractor-verified 32-byte F5 message does **not** survive even a same-orientation JPEG re-encode, let alone the original reflection/re-encoding needed to align the three DCT grids. A whole-source-plate F5 payload cannot be decided by converting/reflection-aligning one original JPEG and subtracting or extracting its coefficients. A calibrated **post-transform** F5 positive does extract. The exact original JPEG data also show that the strictly uniform-black central 8×8 blocks have extremely little nonzero AC capacity, especially p56; most candidate AC sites are on edges. No authentic payload, LP2 key, unknown plaintext, or final destination was recovered.

This closes **the proposed phase-aligned F5 known-cover comparison** at its explicit engineering/source-selection blocker. It does not rule out a page-specific F5 payload embedded *after* image transformation, a shared payload present before reuse, non-F5 coefficient encoding, a keyed edge-only channel, or a first-party external image carrier.

## Frozen original sources and comparisons

| Physical page | Original JPEG | SHA-256 |
| --- | --- | --- |
| p7 | `resources/liber-primus/24.jpg` | `91a726a7dd59c6caa4d736b9ce72ceba0a2fa827d6b69a2d4057562b9303636c` |
| p23 | `resources/liber-primus/40.jpg` | `d31a23cb3a2e50b505e1c468ffbb0106f5353f469bb5958b87ab929fc88decee` |
| p56, solved | `resources/liber-primus/73.jpg` | `a4c1c9ae1246c3197fc1d7bd0155cbc97f60d4bba84a104d45f180feab1814dc` |

The source-registered transformations are p7→p23 `(x, y)→(x, 3674−y)`, and p7→p56 `(x, y)→(2401−x, y−419)`. Their respective original JPEG 8×8 block phases are nonaligned. Pre-existing original-source analysis measured p7/p23 grayscale mean absolute error 0.075148 and p7/p56 0.346225, almost entirely from antialiased dot boundaries: [exact original coefficient/phase audit](lp2-original-jpeg-reused-plate-coefficient-gate.md), [three-page stencil census](lp2-p23-p56-halfturn-five-dot-handoff.md).

## Positive-calibrated F5 transform gate, executed before this continuation

The earlier Agent8 script [`sims/lp2_fivedot_f5_phase_calibration_sft.py`](../sims/lp2_fivedot_f5_phase_calibration_sft.py) and dispatch-only [Windows workflow](../.github/workflows/lp2-fivedot-f5-phase-manual.yml) were run on 22 November 2026, [PASS run 44999286466](https://github.com/FlareZ123/liber-primus/actions/runs/44999286466). They pin the three actual image hashes, register two target reflections, and use the official Go `0verkilll/f5@v1.0.0` encoder/extractor with a known **synthetic** 32-byte payload and test password. None of those synthetic bytes is proposed as an LP2 key.

| Pinned source relation | Original F5 positive | Same orientation, JPEG re-encoded | Reflected then JPEG re-encoded | F5 positive embedded after transform |
| --- | --- | --- | --- | --- |
| p7→p23, vertical flip | **32/32 exact** | **Extraction fails**, `k=130` invalid | **Extraction fails**, `k=30` invalid | **32/32 exact** |
| p7→p56, horizontal flip | **32/32 exact** | **Extraction fails**, 93/3106 bogus claimed bytes | **Extraction fails**, `k=91` invalid | **32/32 exact** |

These are actual source/crop controls, not a generic theoretical assertion. Because even a single native Q92 re-encoding corrupts the certified embedded payload, no extraction that relies on such a re-encoded image is calibrated for detecting a real native-DCT F5 message shared between the original JPEGs. Comparing reblocked coefficients or treating DCT shrink events in re-encoded controls as message bits would violate the original-coefficient gate. This calibration intentionally did **not** attempt password hunting or claim negative F5 results from the actual originals.

## New native quantized-AC capacity census

To identify the remaining mechanically plausible region without re-encoding, the new [C99/libjpeg reproducer](../sims/lp2_fivedot_native_ac_capacity_sft.c) reads the **native** quantized luminance DCT arrays using `jpeg_read_coefficients`. A separate original JPEG scanline decode classifies blocks as (a) all 64 pixels black under a fixed RGB-derived grayscale threshold or (b) touching the dark dot edge but not fully black. Only nonzero 63 AC entries in these independently classified 8×8 blocks are counted. The source-registered crops are fixed to scan24 x740–1619/y2800–3259, scan40 x740–1619/y414–873, scan73 x781–1660/y2381–2840. Thresholds 64, 75, and 90 give **identical strict interior and edge counts**.

| Image | Fully black 8×8 blocks | Native nonzero ACs inside | Edge 8×8 blocks | Native nonzero edge ACs | Edge share of all motif ACs |
| --- | ---: | ---: | ---: | ---: | ---: |
| p7 | 187 | **292** (124 abs1, 32 abs2, 136 abs≥3) | 162 | **6,095** | **95.43%** |
| p23 | 194 | **107** (45 abs1, 16 abs2, 46 abs≥3) | 160 | **6,399** | **98.36%** |
| p56 | 195 | **22** (15 abs1, 1 abs2, 6 abs≥3) | 154 | **5,872** | **99.63%** |

An F5 reader using only the native **strictly all-black-block region**, skipping coefficients that are zero, has at most the displayed 292/107/22 usable coefficient slots on the inspected original JPEGs. Even at one recoverable bit per nonzero coefficient, a standard 32-bit F5 payload-length header would leave optimistic integer-byte payload limits **32/9/0**. Actual F5 matrix coding is less efficient in slot usage. This is a **region-limited extractability ceiling on the observed final JPEG coefficient arrays**, not a bound on all possible image encodings or earlier unobservable modified coefficients. Near-black edge blocks, where essentially all available native ACs occur, are specifically outside this tiny-core bound.

The code has no key/password selection, fitted detector threshold or JPEG re-encode. C99 and libjpeg native runs on the maintainer-provided byte-exact originals reproduce all counts. Threshold 125 includes substantial edge antialiasing as “black” and should not be used to redefine a feature after looking at the coefficient output.

## Mechanism decision

The source-visible repeated stencil motivates checking image payloads. However, the only already authenticated operation here is image reuse under reflection, and the original transformation loses the DCT-domain identity required for a known-cover F5 mutation test. Certified F5 positives show that attempting to restore that identity through JPEG recompression destroys the payload. The strict center of the black dots is an implausible source for a common, self-contained F5 message even before the key-selection question, because solved p56 has fewer than the 32 nonzero ACs needed just for standard framing. The edges retain ample capacity but have no source-authored bit selection, password, frame, or independent clean parent.

**Stop at this blocker.** Do not charge more phase correction, generic stego scans or arbitrary password tests to this motif. An author-era clean source plate, actual embedded-byte artifact, or signed instruction selecting a *post-template* DCT receiver would be necessary to reopen. No 150-rune untouched GP29 decryptor exists to test.

## Reproduction details

- Original-source inputs: `resources/liber-primus/{24,40,73}.jpg`; keep the printed physical-page versus archive-scan offset straight.
- Control: [Windows F5 PASS 44999286466](https://github.com/FlareZ123/liber-primus/actions/runs/44999286466), source program `sims/lp2_fivedot_f5_phase_calibration_sft.py`.
- Native C99 code: `sims/lp2_fivedot_native_ac_capacity_sft.c`. Compile with a standard C99 libjpeg package, and invoke once per original scan with its source scan number and matching path; it emits original scan, threshold, core and edge block counts, and AC amplitude buckets as machine-readable CSV. Native original-source counts are archived in the table above.
- Earlier distinct F5 positive: [Q92 calibrated original shared-margin study](lp2-f5-q92-shared-stencil-original-gate.md), which did not cover the central dot motif.
