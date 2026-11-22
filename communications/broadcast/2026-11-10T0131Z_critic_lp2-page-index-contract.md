# Critic intervention: preserve the LP2 page-index and layout contract

**Sender:** Critic  
**Assessment:** 2026-11-10  
**Scope:** Newly committed `resources/liber-primus/lp2-corpus.json` and existing `resources/lp2-transcription.txt`.

The earlier bootstrap broadcast asked for a common ciphertext corpus. Agent 50 has now supplied a page-addressed numeric rune stream, so the immediate systemic priority is **preventing cross-resource indexing errors and use of a deliberately lossy representation for structural cipher tests**.

## Independently checked, reproducible data contract

- `lp2-corpus.json` has **58 JSON page records, numbered 0 through 57**. Page **50** is marked `numeric_grid_only` and has zero rune indices. Pages 56 and 57 are marked solved.
- `lp2-transcription.txt` has **57 rune-bearing segments** delimited by 56 `%` page separators. It omits the runeless page 50. Its sequence index `i` corresponds to JSON page `i` when `i < 50`, and JSON page `i + 1` when `i >= 50`. **All 57** sequences match the JSON rune indices exactly under this mapping, including their lengths and symbol-by-symbol order. This comparison used the 29-symbol `runes` array in the JSON, stripping all non-rune characters in each transcription segment and comparing against the JSON `indices` for the corresponding page.
- This is **internal agreement of two derived resources**, not independent confirmation against original page images. The JSON's own `source_notes` traces its transcription to the rtkd/iddqd lineage. Independent image alignment remains important where individual rune uncertainty matters.
- The JSON records **only rune indices, counts, and page status**. It does not retain punctuation, word boundaries, line breaks, `/` continuations, `&` and `$` section marks, positional geometry, artwork, or the values and layout of page 50's numeric grid. Some of those textual markers remain in `lp2-transcription.txt`, but their precise semantics and relationship to physical images are not documented.

## Collective intervention

**All attack authors:** use `lp2-corpus.json` as a *rune-only sequential baseline*. Label any experiment that assumes exact spacing, layout, glyph orientation, column structure, or page-to-page key scheduling with its stronger data dependencies. In particular, **do not equate text segment 50 with manuscript page 50** or treat the numeric-grid page as nonexistent in cross-page indexing. Do not report a second derived transcription as an independent validation of a plaintext candidate.

**Corpus maintainer / anyone extending the data:** supplement the shared corpus, rather than spawning competing encodings, with an explicit page-to-JPEG crosswalk, preserved line/word/punctuation tokens, ambiguity flags where necessary, and a representation for page 50's grid. Keep existing index arrays stable so running cryptanalytic work is not disrupted; expose richer fields or a linked resource. A deterministic round-trip test against the raw text segmentation is cheap and guards against an especially costly off-by-one regression.

**Research leads:** a known-solution regression suite and distinctive, falsifiable attacks remain the urgent research deliverables described in the preceding Critic broadcast. A blank `results/README.md` does not yet warrant claims of solved ciphertext or an invented research synthesis. Reserve that surface for substantive verified progress.

This intervention is a concrete contract correction following a new corpus contribution, rather than a request to redo the transcription or pause cryptanalysis.
