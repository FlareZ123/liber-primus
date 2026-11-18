# zeroF exception alphabet and selector source gate

## Decision

The frozen zeroF exception **alphabet and order are source-derived**. Its exact nonzero-cell selector, `raw byte mod 8`, is not source-fixed.

The eight symbols used by the committed zeroF transform are exactly:

`[F, TH, EO, NG, OE, AE, IA, EA]`.

This is not an arbitrary eight-rune subset. The canonical Gematria Primus transliteration has exactly seven two-character rune spellings, in GP order:

`TH, EO, NG, OE, AE, IA, EA`.

Prepending `F`, which is GP index0 and is independently exceptional in solved p56 through the transparent/non-key-advancing plaintext-F rule, reproduces the frozen zeroF register exactly at GP indices `[0,2,12,21,22,25,27,28]`. The existing implementation itself constructs the register from those source properties rather than hard-coding a fitted rune list.

The table also supplies an independent cardinality-eight fact: it is physically 32 rows by 8 columns. That makes an eight-state receiver plausible. It does not choose `raw value mod 8`.

## Exact selector ambiguity

On the 196 non-leading-zero table cells, the frozen base60 `B mod 8` selector agrees with the literal physical column index on only **21/196** cells and differs on **175/196**. A human solver therefore has at least two equally short source-visible eight-way registers before any ciphertext is inspected:

1. the printed column number;
2. the numeric token value reduced modulo8.

Nothing in the original table marks the second interpretation as preferred.

The radix ambiguity is stronger. Repository source work preserves both the base60 reading and the documented drop-`f` base59 reading. The validated leading-zero / low-value class is identical under both readings, but the nonzero selector is not: for **196/196** non-leading-zero cells,

`base60(token) mod 8 != base59(token) mod 8`.

Thus every nonzero exception choice in the frozen zeroF rule depends on choosing the base60 numeric interpretation first. That choice is not authenticated by the low60 association itself.

For reference, the base60 selector histograms are ordinary rather than a one-copy register. Across all 256 cells, `B mod8` counts are `[34,40,27,26,33,29,40,27]`; on the 196 non-leading-zero cells they are `[25,33,19,18,25,25,29,22]`.

## Historical/source boundary

The exact seven digraph rune spellings are part of the original Gematria Primus alphabet and were already treated as a source fact in Director #1347. F's special status has an authenticated solved-LP2 control in p56. The eight-column table geometry is original source material.

No first-party p49-p51 mark, solved-LP operation, or authenticated 2012-2014 instruction located in this bounded lane selects `token value mod8` as the receiver for those eight symbols. Earlier eight-column work likewise found that the table width alone does not define a changing-state update or cipher operation.

This gate therefore preserves the **eight-symbol register** as a source-motivated component while withholding source status from the **byte-mod8 selector**.

## Reproduction

`sims/lp2_zeroF_exception_source_gate_sft.cjs` derives the special set from the canonical GP transliteration, asserts its exact order, checks the original 32x8 table geometry, compares value-mod8 to physical-column indexing, and compares base60-mod8 to drop-f-base59-mod8.

The test does not decode unknown LP2 text and does not vary the zeroF transform. Shared CI PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44394358832

## Consequence

The structural zeroF result remains reproducible, but its nonzero branch is still underselected. Future work may reuse `[F,TH,EO,NG,OE,AE,IA,EA]` as a source-derived register. A historical decoder claim needs an independent source clue that chooses the indexing operation, especially the radix and `mod8` reduction. Without that clue, changing the selector after observing ciphertext would be parameter rescue rather than a human-readable solve path.
