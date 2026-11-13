# Full-text Q.B.L. running-key test

**Status:** completed negative for the complete 1972 Q.B.L. transcription as a direct cyclic running key under R42/C1. The source was recovered over verified HTTPS; the first C1 attempt failed before scoring due an omitted calibration file, which was corrected before the successful run.

## Why this source

The R35/R42 public-text running-key family was motivated by the LP2 hints “the key is all around you” and “right in front of your eyes.” The 33-text R42/C1 screen found 23 intact sources and 10 missing/404 HTML captures. A later R26/B run included an `achad_qbl` file, but it had only 5,336 GP29 runes and was classified as one of four truncated texts; skip-aware coverage of long pages was therefore impossible. The 1922 Frater Achad work is directly relevant to the manuscript's Gematria/Kabbalah vocabulary: it discusses the 22 Hebrew letters, the 3 Mother / 7 Double / 12 Single division, Gematria, Notaricon, Temurah, and the 29th path of Qoph.

The 1972 transcription at `https://www.tarrdaniel.com/documents/Thelemagick/essay/english/Achad_QBL_The_Brides_Reception.html` is independently accessible as a full HTML text and identifies the edition as a transcription of the 1972 version, with Hebrew characters replaced by transliterations. The site states that the work is not in copyright. It is a complete, recoverable text source, unlike the truncated 5,336-rune capture. It is not asserted to be the exact edition Cicada used. The first attempted mirror (`gusconstan.com`) presented a self-signed TLS certificate; it was rejected rather than bypassed.

## Hypothesis and human solve path

A solver who notices the 29-symbol Gematria Primus alphabet, the book's Hebrew/Gematria framing, and the “key-text” hints could reasonably test Q.B.L. as a running key. The first test is the simple, source-constrained operation already used in R42/C1: letters-only GP29 stream, cyclic running-key window, both additive signs, both Atbash settings, 150 stride-sampled offsets, all 55 unsolved pages, panel-R36.

This is deliberately not a new cipher family or an unconstrained search. It closes a known source-integrity gap in a previously registered candidate.

## Decisive test and interpretation

- Source: complete 1972 transcription PDF, URL and SHA-256 recorded by the workflow.
- Decoder and corpus: pinned `Dukotah/cicada3301@9087dc36b5aa64c1786428e32180261ab9420c29`.
- Key normalization: same `gp.keyword_to_indices` A–Z normalization as R42/C1.
- Search: R42/C1's 150 offsets per text, signs ±1, Atbash 0/1, all 55 unsolved pages, panel-R36, free-null bar recalculated for the one-text grid.

A bar-crossing page is only a candidate and must be inspected for a coherent plaintext and independent held-out prediction. A no-crosser result rejects this full-text Q.B.L. running-key construction at the tested offsets; it does not reject Q.B.L. as a structural/reference source for Gematria or Temurah. If the workflow cannot download/extract at least 10,000 letters, classify the run as source-retrieval failure, not a cryptanalytic negative.



## Source restoration result (2026-11-13)

The verified HTTPS download succeeded. Source HTML SHA-256: `cdae6831e1cd6f266c5646ca932c6c0ffebb5560c869deb35af6f3c4a20a01ba`. Extracted text SHA-256: `f7fcb1fc58397dbc3141ea8b5eb566b2a21395f29abd4421fac567f5f8e9510f`. The extraction contained 212,810 characters and 128,751 ASCII letters after normalization, compared with the 5,336-rune truncated capture in R26/B. The first C1 run recognized one real text and zero corrupt files, then stopped because `fit.json` was absent from the sparse checkout. No page was scored in that run.


## Full-text R42/C1 result (2026-11-13)

[Successful workflow run 43458178495](https://github.com/FlareZ123/liber-primus/actions/runs/43458178495).

- Source HTML SHA-256: `cdae6831e1cd6f266c5646ca932c6c0ffebb5560c869deb35af6f3c4a20a01ba`
- Extracted text SHA-256: `f7fcb1fc58397dbc3141ea8b5eb566b2a21395f29abd4421fac567f5f8e9510f`
- Extracted: 212,810 characters; 128,751 ASCII letters / GP29 key symbols.
- Search: all 55 unsolved pages; 150 stride-sampled offsets; signs ±1; Atbash 0/1; one real text; 600-cell family-wise grid; panel-R36.
- Best candidate: pmax `4.800150545`, page 54, start `116552`, sign −1, Atbash 1, page length 76; required bar `11.3518`; `clears=false`.
- Crossers: 0. Verdict: **NEGATIVE**.

This closes the complete-text source gap left by the 5,336-rune truncated R26/B capture. Reject Q.B.L. as a direct cyclic running key under the tested R42/C1 model. Do not spend more offsets or normalization variants on this model without a new source clue. The result does not reject Q.B.L. as a reference for Gematria/Temurah or a different, independently specified operation.

## Separate structural observation (hypothesis only)

The Q.B.L. discussion gives the Hebrew-letter division 3 Mothers, 7 Doubles, 12 Singles; the seven Doubles have two sounds. Expanding those sound variants yields `3 + 14 + 12 = 29` phonetic forms. The same text identifies the 29th path as Qoph. This is a potentially relevant count relationship to the 29-symbol Gematria Primus alphabet, but no source-selected rune-to-Hebrew mapping or reversible operation has been established. Treat it as a lead, not a result; do not launch an unconstrained 29-symbol permutation search. A useful follow-up must specify the mapping from the text itself and make a locked prediction on original ciphertext.
