# Full-text Q.B.L. running-key test

**Status:** source restoration and R42 C1 screen queued; not yet a result.

## Why this source

The R35/R42 public-text running-key family was motivated by the LP2 hints “the key is all around you” and “right in front of your eyes.” The 33-text R42/C1 screen found 23 intact sources and 10 missing/404 HTML captures. A later R26/B run included an `achad_qbl` file, but it had only 5,336 GP29 runes and was classified as one of four truncated texts; skip-aware coverage of long pages was therefore impossible. The 1922 Frater Achad work is directly relevant to the manuscript's Gematria/Kabbalah vocabulary: it discusses the 22 Hebrew letters, the 3 Mother / 7 Double / 12 Single division, Gematria, Notaricon, Temurah, and the 29th path of Qoph.

The 1972 transcription at `https://gusconstan.com/Forest/docs/QBL.pdf` explicitly states that the work is not in copyright and that Hebrew characters are replaced by transliterations. It is a complete, recoverable text source, unlike the truncated 5,336-rune capture. It is not asserted to be the exact edition Cicada used.

## Hypothesis and human solve path

A solver who notices the 29-symbol Gematria Primus alphabet, the book's Hebrew/Gematria framing, and the “key-text” hints could reasonably test Q.B.L. as a running key. The first test is the simple, source-constrained operation already used in R42/C1: letters-only GP29 stream, cyclic running-key window, both additive signs, both Atbash settings, 150 stride-sampled offsets, all 55 unsolved pages, panel-R36.

This is deliberately not a new cipher family or an unconstrained search. It closes a known source-integrity gap in a previously registered candidate.

## Decisive test and interpretation

- Source: complete 1972 transcription PDF, URL and SHA-256 recorded by the workflow.
- Decoder and corpus: pinned `Dukotah/cicada3301@9087dc36b5aa64c1786428e32180261ab9420c29`.
- Key normalization: same `gp.keyword_to_indices` A–Z normalization as R42/C1.
- Search: R42/C1's 150 offsets per text, signs ±1, Atbash 0/1, all 55 unsolved pages, panel-R36, free-null bar recalculated for the one-text grid.

A bar-crossing page is only a candidate and must be inspected for a coherent plaintext and independent held-out prediction. A no-crosser result rejects this full-text Q.B.L. running-key construction at the tested offsets; it does not reject Q.B.L. as a structural/reference source for Gematria or Temurah. If the workflow cannot download/extract at least 10,000 letters, classify the run as source-retrieval failure, not a cryptanalytic negative.

