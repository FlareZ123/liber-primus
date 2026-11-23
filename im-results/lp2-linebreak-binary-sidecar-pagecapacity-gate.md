# Page-local line-break sidecar capacity under original anti-repeat constraints

**23 November 2026, Agent16. Result: conditional information-theoretic exclusion, not a decipherment.** The physical original p0–55 manuscript provides 540 internal printed-line joins across its 55 rune-bearing pages. Although 540 nominal binary sites exceed the 430.561-bit aggregate sidecar lower bound for a universal GP29 encoder constrained to each original page's repeat count, the bits are distributed unevenly. **Fourteen pages individually have too few one-bit internal line joins for a universal page-local injective anti-repeat encoder.** No unknown plaintext, author-selected cipher or side-information mechanism was recovered.

## Motivation and original source

The original unknown LP2 contains 12,956 GP29 glyphs, 12,901 within-page successors and only 86 repeated adjacent glyphs. Collision-rejection mechanisms that discard overwritten characters or key proposals generally lack a unique inverse unless the missing information is stored elsewhere. Original physical line breaks are a conceivable auxiliary channel. The manuscript's glyph widths already explain much of the source-visible line placement, as independently shown in the earlier printed-line greedy-width study; this test does not assume linebreak steganography has been established.

Inputs are the unchanged resources/liber-primus/lp2-corpus.json and resources/liber-primus/lp2-transcription.txt, preserving all physical page breaks and internal slash-delimited printed lines. The genuinely runeless p50 is excluded. There are exactly **540** page-internal printed-line joins on the remaining 55 pages.

## Necessary page-local information bound

For a fixed page of L GP29 runes containing at most k equal adjacent pairs, define N=L−1 within-page transitions. The fraction of all 29^L possible ciphertext strings in that restricted class is exactly

    B(L,k) = sum_{j=0}^k binomial(N,j) (1/29)^j (28/29)^(N−j).

A universal encoder accepting *all* GP29 plaintexts of length L and emitting a ciphertext restricted to that set needs an additional auxiliary channel with at least 1/B distinct states. Thus the required number of binary sidecar bits is at least −log2 B(L,k). A strictly page-local channel offering **at most one independent bit for each internal printed-line join** on that page has at most 2^J distinct states, where J=printed-lines−1. Whenever J<−log2 B, injectivity is impossible by the pigeonhole principle, irrespective of any pre-shared secret key.

## Exact original witnesses

| Original page | Rune length | Observed within-page doublets | Internal one-bit line-join sites | Required sidecar bits |
| --- | ---: | ---: | ---: | ---: |
| p5 | 263 | 0 | 11 | 13.264 |
| p13 | 272 | 0 | 11 | 13.720 |
| p17 | 273 | 0 | 11 | 13.770 |
| p28 | 269 | 0 | 11 | 13.568 |
| p31 | 269 | 0 | 11 | 13.568 |
| p49 | 66 | 0 | 2 | 3.291 |
| p52 | 263 | 1 | 8 | 9.891 |
| p54 | 232 | 2 | 3 | 6.264 |

The **complete fourteen failing page IDs** are p5, p7, p13, p14, p15, p17, p28, p31, p37, p38, p40, p49, p52 and p54. All page-local deficits together sum to 430.561201 bits against 540 nominal binary join sites, so a book-global pooling scheme is *not* excluded by this count. Nor is a system with more than one encoded bit per join, movable line-break positions, restricted source-language plaintext, coded auxiliary punctuation, or a permitted higher repeat count.

## Research decision

Retire the narrow **universally lossless, page-local, one-bit-per-existing-internal-linebreak anti-repeat code**. A viable proposal must identify a real original-authored side channel or lossless rule and show a complete inverse on untouched original ciphertext. The existence of a sufficient global bit budget does not establish that line breaks were authored as side information. These calculations do not identify the true ciphertext mechanism and do not advance the authenticated plaintext count.

Reproduction: [source-locked Node.js 22 CommonJS test](../sims/lp2_linebreak_binary_sidecar_capacity_sft.cjs) recomputes all original source lengths, printed-line joins, repeat masks and exact binomial CDF bounds and asserts the fourteen failing pages. Its source inputs and assumptions are fixed, with no cryptographic key search or candidate plaintext.
