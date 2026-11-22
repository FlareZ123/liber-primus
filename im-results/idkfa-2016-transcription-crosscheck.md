# 2016 IDKFA transcription cross-check

## Result

The 2016 repository [aautcsh/idkfa](https://github.com/aautcsh/idkfa/tree/b6f00d0f7bcbdff495dcd13954af4829d8cf5bcc) contains a historical full-book rune transcription at [data/liber](https://github.com/aautcsh/idkfa/blob/b6f00d0f7bcbdff495dcd13954af4829d8cf5bcc/data/liber). Comparing it with the current original-JPEG-derived LP2 corpus gives:

- **55 exact page matches** among the 57 rune-bearing LP2 pages represented in the old transcription.
- The old file omits **LP2 p50**, whose current corpus entry is \`numeric_grid_only\` with zero runes; p50 is the 32×8 numerical table rather than a rune-text page.
- Two pages differ by exactly one rune each:
  - **p24, rune offset 172 (zero-based):** old transcription \`A\` (\`ᚪ\`), current corpus \`AE\` (\`ᚫ\`). Original image \`41.jpg\` confirms the AE glyph; its shape matches another AE glyph on the same page.
  - **p57, rune offset 80 (zero-based):** old transcription \`E\` (\`ᛖ\`), current corpus \`Y\` (\`ᚣ\`). Original image \`74.jpg\` confirms the Y rune at the end of \`DIVINITY\`; the old transcription reads \`DIVINITE\`.
- No other rune differences occur in the 57 represented LP2 pages.

This is a **transcription-integrity result, not a decryption**. It supports the current corpus and identifies two errors in the historical transcription. Do not change the canonical corpus on the basis of the old file.

## Pinned inputs

| Input | Pinned identity |
|---|---|
| Historical solver repository | [aautcsh/idkfa](https://github.com/aautcsh/idkfa) |
| Source commit | \`b6f00d0f7bcbdff495dcd13954af4829d8cf5bcc\` |
| Historical raw transcription | [data/liber](https://github.com/aautcsh/idkfa/blob/b6f00d0f7bcbdff495dcd13954af4829d8cf5bcc/data/liber) |
| Historical transcription Git blob SHA-1 | \`b670f9a89884da8c2bb8f1afa78bf5f1be409d92\` |
| Historical translation notes | [assets/liber-primus-translation.txt](https://github.com/aautcsh/idkfa/blob/b6f00d0f7bcbdff495dcd13954af4829d8cf5bcc/assets/liber-primus-translation.txt) |
| Current canonical corpus | \`resources/liber-primus/lp2-corpus.json\` |
| Current corpus Git blob SHA-1 | \`054f2a0f780b7d46901acbe3d9bf4f0ac1801165\` |

The blob identifiers above are the Git object IDs returned for the pinned files. The exact source commit is retained so later branch changes cannot silently alter the comparison.

The old repository's \`js/lib/source.js\` defines \`%\` as the page delimiter, \`/\` as the line delimiter, \`-\` as the word delimiter, \`&\` as the paragraph delimiter, \`$\` as the segment delimiter, and \`§\` as the chapter delimiter. Splitting \`data/liber\` on \`%\` yields 72 text-page chunks. Its translation notes state that JPEG numbering begins at the first Liber Primus page and is offset by 17 relative to LP2 page numbering.

The alignment is:

| Historical chunk(s), zero-based | LP2 page(s) | Outcome |
|---|---|---|
| 15–38 | 0–23 | 24 exact matches |
| 39 | 24 | One A/AE disagreement at rune 172; original JPEG confirms AE |
| 40–64 | 25–49 | 25 exact matches |
| — | 50 | Omitted from rune transcription; numeric-grid-only page |
| 65–70 | 51–56 | 6 exact matches |
| 71 | 57 | One E/Y disagreement at rune 80; original JPEG confirms Y |

The mapping reflects 15 preceding LP1 text chunks, the 57 LP2 rune-text pages, and omission of p50's non-rune numerical table. It is not a simple fixed page offset after p50.

## Original-image adjudication

The original JPEG archive supplied for this project has SHA-256:

\`094f3f8bc508159bda033482706a2d9bf516c8b8a324d87d41c5ee3696c075ea\`

- \`41.jpg\` (LP2 p24): SHA-256 \`62148ef272d17bcedf5df30f6cc9e52df127113c18c1cf57ea92c75feedfce80\`. The disputed glyph is on line 8, at approximately x=1303–1336, y=1990–2104 in the 2400×3600 image. Its form matches the page's unambiguous AE glyph on line 5, not the A glyph.
- \`74.jpg\` (LP2 p57): SHA-256 \`1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b\`. The disputed rune is the final symbol of \`DIVINITY\`; the original image shows \`ᚣ\`, not \`ᛖ\`.

The historical transcription is therefore useful as an independent check, but its two disagreements must not be copied into the canonical corpus.

## What the 2016 solver repository does—and does not—establish

The repository is a historical solver attempt, not an LP2 solution. Its README describes a dictionary/sequence-search engine and records solved sections 0–6, 15, and 16, with other paragraphs still unsolved. Its \`translation.txt\` records known operations including:

- \`DIVINITY\` with a downward shift in reversed Gematria;
- \`FIRFUMFERENFE\` with a downward Gematria shift;
- \`φ(prime)\` with an upward Gematria shift for the known p56 page;
- default-Gematria substitution for the known p57 page.

Its \`engine.js\` implements the known \`φ(prime)\` stream and F passthrough. These are useful historical corroborations of already-known solved-page methods, not new keys or plaintext for LP2 p0–55. The \`word-guesses\` file is dictionary-generated conjecture and was not used in this comparison.

No LICENSE file was present in the pinned repository tree. The external transcription is linked and hash-pinned here rather than copied into \`resources/\`.

## Reproduction

Run:

\`\`\`sh
python sims/idkfa_2016_transcription_crosscheck.py \\
  --source /path/to/aautcsh-idkfa/data/liber \\
  --corpus resources/liber-primus/lp2-corpus.json
\`\`\`

The script verifies both Git blob IDs, parses the historical page delimiters, applies the explicit LP1/p50 alignment, and emits every page-level mismatch. It does not inspect images; the two visual adjudications above were made directly against the pinned original JPEG bytes.
