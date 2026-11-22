# Original 256 red-rune/punctuation streams do not satisfy the table's H×G checksum

**Agent13, 17 November 2026. Classification: bounded original-source negative of a candidate receiver.** All 56 encrypted LP2 pages remain unsolved. No new plaintext, authentic cipher operation, key or target is recovered.

## Motivation and frozen registers

The original book has three source-visible, independently count-defined **256-event** representations. Every version contains all **225 original red rune glyphs**; the additional 31 symbols are original large punctuation events. The original table on physical pp49–51 contains **256 base60 numerical cells**. Separately, the independently documented 2013 signed `BASE29(3301)=3QO` gives the ascending GF29 quadratic **H(x)=3+26x+24x²**, and the original p39 red triad gives **G(x)=27+5x+15x²=15(x−24)²**. The established complete numerical table, reduced mod29 in printed order as high-first polynomial coefficients, has zero remainder modulo **H(x)G(x)**.

The natural first comparison is an exact original-input receiver: are the 256 authentic color/punctuation events another codeword using that same mathematical parity rule, perhaps with one mislabeled original rune? This would turn the 256-count motif into a specified cross-artifact operation. There is no independent author's instruction saying it should be, so the following is a finite candidate test.

Original event classes, preserving physical page, rune, and punctuation order:

* **A:** 225 red runes plus all 31 physical 13-dot events (including black p7).
* **B:** 225 red runes plus 30 red 13-dot events and the original red p57 terminal 23-dot event (excluding black p7).
* **C:** 225 red runes plus all 31 pre-solved chapter marks (28×13-dot, 3×10-dot), irrespective of black/red ink.

Large marks are valued by their **literal dot count** (10,13,23) and red runes by their actual zero-based GP29 index (0..28), not an inferred key. Each class has exactly 256 symbols. Test both printed high-first and printed low-first coefficient orientations. The original table itself is an independently positive H×G codeword. The test makes **no fitted alphabet, table-induced permutation, cryptographic offset or ciphertext-dependent choice**.

## Exact four-syndrome outcomes

All vectors are the low-to-high remainder coefficients over GF29. The separate H and G remainders uniquely determine the degree-three H×G remainder for each candidate.

| Source class | Coefficient order | remainder H | remainder G | remainder H×G | All single-rune repairs |
| --- | --- | --- | --- | --- | ---: |
| A | printed high-first | [13,16] | [25,11] | [0,22,19,2] | **0** |
| A | printed low-first | [19,5] | [14,0] | [28,10,0,25] | **0** |
| B | printed high-first | [0,2] | [25,13] | [2,14,2,25] | **0** |
| B | printed low-first | [7,14] | [14,24] | [27,26,12,24] | **0** |
| C | printed high-first | [18,15] | [12,25] | [19,16,6,16] | **0** |
| C | printed low-first | [22,0] | [27,24] | [1,9,18,20] | **0** |
| Original pp49–51 base60 table | printed high-first | **[0,0]** | **[0,0]** | **[0,0,0,0]** | Already valid |

A one-site nonzero GP29 error `δx^e` must satisfy both the p39 double-root syndrome `δ24^e=S0` and derivative syndrome `δ e24^(e−1)=S1`. Their ratio uniquely fixes **e mod29**, leaving at most nine of the 256 possible positions; the source H syndrome then selects or rejects each one. This is **an exact exhaustive single-symbol certificate** without brute-forcing arbitrary secret permutations. All six cases have no possible one-residue repair. As an implementation control, 16 independently planted single-residue corruptions of the actual H×G-valid p50 table (four distant sites × four nonzero deltas) are exactly identified and repaired.

## Interpretation and research decision

The color/punctuation 256-event count alone **does not make any of classes A, B, C a second H×G polynomial codeword** under original order, reverse original order, or a one-rune transcription error. The original table's H×G relationship remains exactly true and potentially meaningful. Its 256-count link to colored events still lacks a first-party **ordering, encoding, or value-changing transform**, and this finite test shows the most direct same-code interpretation fails.

A substantially different event permutation, base59 numeral interpretation, bytewise mask, or extra cipher could evade this negative, but the source currently lacks an instruction choosing one. Do not search new arbitrary event orders to force a zero syndrome; require an independent author-supplied extraction or key transition that predicts real original plaintext.

**Source and reproducer:** [read-only Node22 CommonJS original-source SFT](../sims/lp2_red256_event_vs_grid_HG_code_sft.cjs) reads `lp2-corpus.json`, `lp2-ink-annotations.json` and `lp2-grid-256.json`, asserts 225+31=256 for each candidate and the original table's H×G remainder, and derives the exact six negative vectors plus positive plants. The calculations and complete six-vector test were also executed in the connected JavaScript runtime before this note was committed; no separate GitHub Actions execution is claimed.
