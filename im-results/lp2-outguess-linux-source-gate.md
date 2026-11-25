# OutGuess 0.2.1 on original LP2 JPEGs: false-header and capacity gate

**Status:** negative for OutGuess 0.2.1 with the default key and the eight source-derived candidate keys tested here. This is not a general exclusion of JPEG/DCT steganography, arbitrary passwords, or other algorithms.

## Human-solver hypothesis

Earlier Cicada stages used OutGuess, so a solver familiar with the prior rounds could reasonably try the historically recognizable JPEG extraction operation on the original LP2 images. That history motivates a bounded test; it does not establish that LP2 reused OutGuess.

The discriminating prediction was a coherent payload under a source-derived key, with positive-control behavior on known LP1 carriers and no equivalent false header on a same-pipeline non-carrier control.

## Inputs and reproducibility

- Canonical repository inputs: `resources/liber-primus/00.jpg` through `74.jpg`.
- Archive indices `00–16`: LP1 positive controls.
- Archive indices `17–72`: LP2 unknown pages p0–p55.
- Archive indices `73–74`: solved LP2 p56–p57 controls.
- OutGuess source pinned to the 0.2.1 release commit [`26fe8df0d693cf229d33f5bccd2757b344dfdbf3`](https://github.com/resurrecting-open-source-projects/outguess/tree/26fe8df0d693cf229d33f5bccd2757b344dfdbf3), built on Ubuntu Linux with `CFLAGS="-O0 -g"`. The bundled JPEG-6b configuration was set with `jpeg-6b-steg/jconfig.h -> jconfig.cfg`.
- Default-key extraction was run against all 75 originals. Eight source-derived key strings were tested against all 56 unknown LP2 pages (448 candidate runs): `3301`, `33011033`, `circumference`, `firfumferenfe`, `FIRFUMFERENFE`, `welcome`, `instar`, and `pilgrim`.
- The synthetic control was generated as a 6×9-inch PostScript page, rendered by Ghostscript at 400 DPI, then re-encoded by ImageMagick at quality 92 with the ICC profile extracted from original `17.jpg`. It has the same 2400×3600 geometry, density, profile and blank page margins, with dense dummy text rather than puzzle content.

Reproducer: [`sims/lp2_outguess_linux_source_gate.py`](../sims/lp2_outguess_linux_source_gate.py). Manual workflow: [`.github/workflows/manual-outguess-linux-sft.yml`](../.github/workflows/manual-outguess-linux-sft.yml). Diagnostic source patch: [`sims/patches/outguess-0.2.1-safe-capacity.patch`](../sims/patches/outguess-0.2.1-safe-capacity.patch).

## Results

### Positive controls

Thirteen of the 17 LP1 controls produced nonempty extraction output; eight produced recognizable PGP-signed messages: archive pages **0, 1, 2, 3, 10, 11, 12, 13**. This demonstrates that the pinned extractor can recover the historical LP1 carriers in this environment.

No LP2 unknown page or candidate-key run produced a PGP-signed-message marker.

### LP2 default key

Sixteen unknown pages produced a 58,152-byte output: LP2 p0, p4, p26, p40–p48 and p51–p54. Every one of those outputs has approximately 7.996–7.997 bits of entropy per byte, and all sixteen share the same SHA-256 hash for their first 1,417 bytes:

`b597c2a6809cecc6d0e4ce842391f96a4a0f3dffb82092d02ddaf9d3e98b3f22`

None contains a PGP signed-message marker or recognizable file signature.

The default-key extractor reads the same header on the synthetic control: **seed 41408, length 58,152 bytes**. The control has 163,982 usable bits (20,498 bytes), so the claimed 58,152-byte payload is rejected as too long. The control therefore reproduces the header without carrying the alleged payload. It does not reproduce the full 1,417-byte output prefix because it cannot supply the claimed length.

The remaining LP2 pages do not provide a contrary result. The unpatched extractor raised SIGFPE on 39 pages; one additional page (p32) rejected the claimed length explicitly because 58,152 bytes exceeded its 49,172-byte capacity.

### Source-derived keys

Across all 56 unknown pages, the eight keys produced **448 runs, 262 nonempty outputs, and zero PGP-signed messages**. Nonempty-output counts by key were:

| Key | Nonempty runs |
|---|---:|
| `3301` | 24 |
| `33011033` | 56 |
| `circumference` | 12 |
| `firfumferenfe` | 24 |
| `FIRFUMFERENFE` | 56 |
| `welcome` | 25 |
| `instar` | 55 |
| `pilgrim` | 10 |

The exact historical uppercase spelling `FIRFUMFERENFE` is especially diagnostic: it returns a 9,474-byte high-entropy output on all 56 LP2 pages, with the same header **seed 41002, length 9,474 bytes**. The synthetic control returns the same 9,474-byte high-entropy, non-PGP output under that key, with the same seed/length header. Its output has 7.980377 bits per byte and 0.384 printable-ASCII fraction. Thus the key-specific header and apparently successful extraction are also reproducible on a non-carrier control.

The control reads the other candidate-key headers as well; where the claimed length exceeds its available capacity, it rejects the extraction rather than yielding a message. The candidate runs therefore do not supply an LP2-specific receiver or plaintext.

## Why the unpatched run crashed

In OutGuess 0.2.1, `iterator_adapt` computes an integer `skipmod` from the remaining usable coefficient bits and the claimed data length. For these false headers, the quotient can truncate to zero. `iterator_next` then evaluates an ARC4-derived value modulo `skipmod`, causing SIGFPE.

The diagnostic patch checks the iterator state and exits with an explicit insufficient-capacity error when the next skip would be zero. It does not alter successful extraction paths. With the guard applied, the 39 SIGFPEs become clean capacity rejections; the 16 capacity-length outputs and the control behavior remain unchanged.

## Decision

Retire this specific branch: **OutGuess 0.2.1, its default key, and the eight source-derived keys tested above**. The common default prefix, repeated seed/length headers, high-entropy outputs, and same-pipeline control show why the apparent extractions are not evidence of LP2 plaintext. Do not continue unconstrained password guessing without a new source clue that selects a key.

This result does **not** exclude other JPEG/DCT techniques (for example, JSteg or F5), other OutGuess versions, a different source-authenticated key, color/chroma channels, or non-JPEG image channels. Those remain separate hypotheses and require their own clue-constrained tests.

## Runs

- Unpatched crash diagnosis: [GitHub Actions run 45659337495](https://github.com/FlareZ123/liber-primus/actions/runs/45659337495).
- Final patched scan, eight keys across all 56 LP2 pages, and candidate-key control runs: [GitHub Actions run 45664085973](https://github.com/FlareZ123/liber-primus/actions/runs/45664085973). The workflow uploads the complete JSON run report as `lp2-outguess-021-original-image-sft` (14-day artifact retention).
- External prior analysis: [Dukotah's LP2 steganography verdict](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/analysis/stego/STEGO-VERDICT.md).
