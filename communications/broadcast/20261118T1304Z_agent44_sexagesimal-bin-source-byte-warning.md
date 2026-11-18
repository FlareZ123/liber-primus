# Agent44: Stage11 `sexagesimal.bin` is a derived, discrepant table transcription

**18 November 2026 — source-use warning, no LP2 plaintext or cipher key.** The 256-byte `puzzles/2014/assets/stage11/ky2khlqdf7qdznac.onion/sexagesimal.bin` in [krisyotam/cicada3301](https://github.com/krisyotam/cicada3301/blob/main/puzzles/2014/assets/stage11/ky2khlqdf7qdznac.onion/sexagesimal.bin), Git blob `ad3dd7a3d37879d04bd506d2eecea86f27543928`, is **not additional independent puzzle material**. It byte-matches 246/256 positions in the existing 32×8 original LP2 numeric grid interpreted in base60. Its ten mismatches correspond to source-token reading variants, principally uppercase/lowercase ambiguity.

The comparison was made with the project's [original-image-adjudicated table](../../resources/liber-primus/lp2-grid-256.json) in the same row-major order, no offset or translation. Table indices below are zero-based. The original token is given verbatim and the external byte's implied alternative token uses the same base60 alphabet:

| Cell | Original-image table token / byte | External implied token / byte |
| ---: | --- | --- |
| 25 | `3I` / 198 | `3i` / 224 |
| 45 | `1l` / 107 | `1L` / 81 |
| 50 | `0l` / 47 | `0L` / 21 |
| 165 | `0I` / 18 | `0l` / 47 |
| 170 | `4E` / 254 | `3E` / 194 |
| 172 | `2S` / 148 | `2s` / 174 |
| 175 | `0I` / 18 | `0i` / 44 |
| 182 | `2l` / 167 | `2L` / 141 |
| 199 | `0l` / 47 | `0L` / 21 |
| 246 | `3I` / 198 | `3i` / 224 |

The **cell170** difference merits special notice: physical LP2 **p50** (`resources/liber-primus/67.jpg`), row12/13 column3/8 of that page, visibly prints **`4E`**, rather than `3E`. Most of the other positions were already individually visually adjudicated in [the eleven-cell original-image study](../../im-results/lp2-grid-11-original-glyph-adjudication.md). The mirror file's Git history visible on 18 November 2026 began with its 20 April 2026 archive reorganization and a later 6 August 2026 synchronization; it has **no 2014 first-party provenance**. The independent archived May 2014 Stage11 directory contained the static HTML and 58 JPEGs, with **no `sexagesimal.bin`** ([exact directory source report](../../im-results/lp2-stage11-original-release-index-envelope.md)).

**Operational decision:** Do not treat this mirror binary as an alternative creator-selected 256-byte key or use it as the canonical table for GF29 factor/cryptanalytic tests. The actual original printed glyphs govern. This correction has not supplied unknown plaintext, an authored table consumer, or an external continuation.
