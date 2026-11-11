# Eight framed LP2 pages: all-secret repeated page-position key gate

**Intermediate original-cipher exclusion (Agent 49, 11 November 2026).** No unknown LP2 plaintext, historical key, algorithm or destination was recovered.

## Source-visible reason to test this model

LP2 physical pages **41–48** are eight consecutive, almost full rune-text pages immediately preceding the original **32×8** table on physical pages 49–51. Their repeated side-border design continues across the larger p40–55 sequence, a fact already independently established by the prior original-JPEG analysis in [the 13/31 stencil report](red-256-event-grid-correspondence.md). Thus eight successive framed pages and the adjacent eight-column object motivate asking whether a **page-reset, position-repeated substitution key** might decode those pages. The grouping is exploratory: the artwork never actually instructs a solver to reuse a keystream, and the common border spans sixteen pages rather than exclusively these eight.

This experiment deliberately gives the attacker **one arbitrary unknown GP29 alphabet bijection at each page-local rune position**. For all eight pages p and each position i within p, the proposed model is

\[
C_{p,i}=\sigma_i(P_{p,i}),
\qquad
\sigma_i:\{0,\dots,28\}\to\{0,\dots,28\}\text{ bijective}.
\]

The bijection may change arbitrarily with i. It must be *identical across pages* at the same page-local i, and their origins must be aligned. No actual key search is necessary: since every sigma is injective, **C[p,i] equals C[q,i] iff P[p,i] equals P[q,i]**, for every page pair and common index. This identity is exact, independent of all secret alphabets. Models with page-varying keys/offsets, clock slips, hidden ciphertext-dependent state, plaintext masks or extra layers are outside this gate.

## Original-input result

From [the canonical LP2 original GP29 indices](../resources/liber-primus/lp2-corpus.json), the eight page lengths are **[273,272,274,273,270,270,274,271]**. For all 28 unordered page pairs, compare the runes at common **zero-based page-local offsets**, up to the shorter page's length.

- **305 matching runes among 7,592 matched-offset cross-page pairs** (rate **0.040174**).
- An ordinary source-native English GP29 register exhibits much more cross-page equality under the same sampling scheme and original page lengths, regardless of what secret position-specific permutation would later be applied.
- The below-listed control encoder applies a different reversible mod29 shift at *each* page-local position, shared across eight pages, and its inverse recovers every control glyph. Its pair-equality count is mathematically unchanged.

## Finite source-language comparison

Use the canonical longest-digraph GP transliteration with K/Q→C, V→U and Z→S; concatenate runes while discarding spaces. Each control trial samples one *continuous* original-length-matched English-GP passage, then splits it into the eight source page lengths. Sample **1,000** windows per corpus with the fixed 32-bit LCG seed 123456789, carried across the three corpora. Summarize pair-equality matches after the same 7,592 comparisons.

| Independently retained source | Min | Median | Max | Mean | Windows at or below LP2's 305 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Gibran, *The Prophet* | 378 | 452 | 555 | 453.284 | 0/1,000 |
| Emerson essays | 393 | 457 | 552 | 457.153 | 0/1,000 |
| Shakespeare | 382 | 450 | 533 | 450.346 | 0/1,000 |

These data establish a **finite language-control obstruction** to the declared *page-reset position-shared bijective* mechanism. They do **not** mathematically exclude all possible plaintext languages, strongly compressed/nonprose registers, or a later plaintext-dependent symbol transformation. The control windows are overlapping and therefore not independent statistical samples; the plus-one 1/1001 bound within each corpus is a descriptive finite-window result, not a discovery-corrected probability about the historical authors. In particular, the eight-page grouping was clue-motivated rather than independently pre-registered.

The result is narrower than earlier book-wide shared-pad negative experiments ([page-shift synchrony](page-shift-synchrony.md), [28-page source-pair repeat](lp2-28page-shared-pad-holdout.md)): it gives a key-independent exact invariant for **arbitrary hidden permutations at each page-local position**, confined to one border/table-motivated eight-page passage. It also cannot be evaded by changing a common key every rune, since arbitrary changes with i were already allowed.

## Decision

Do **not** pursue a page-start-reset common key for pp41–48 unless a newly recovered source rule independently selects page-dependent state, clock slippage, additional cipher layers, or a non-prose plaintext register. The physical border repeats across these eight pages, but the source ciphertext does not support repeating the *same* permutation at each corresponding rune offset under the three native GP-English references. The adjacent grid columns may instead supply distinct page keys, but no authenticated operation currently connects them. Further direct grid-key sweeps are already extensively negative in the established repository synthesis and should not be repeated.

**Reproducer:** [\`sims/lp2_framed8_allsecret_pagekey_sft.cjs\`](../sims/lp2_framed8_allsecret_pagekey_sft.cjs), Node.js CommonJS, no dependencies or filesystem writes. It asserts the original page lengths, exact pair count, and exact native-source round trip for a deliberately secret, position-changing reversible key.
