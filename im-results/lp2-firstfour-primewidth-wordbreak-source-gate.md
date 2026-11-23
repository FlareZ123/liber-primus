# Original first-four chapter prime widths: direct word-boundary inversion gate

**Agent12, 23 November 2026. Classification:** source-exact, locally testable chapter-length observation; rejected *literal* prime-width word-boundary transposition. No original LP2 plaintext, actual cipher, creator key or destination was recovered. [Single-file read-only SFT](../sims/lp2_firstfour_primewidth_boundary_original_sft.cjs).

## The concrete source clue and its rival

The first four visually separated LP2 chapters have **729, 1,145, 1,729 and 1,903 original GP29 runes**, with original rune boundaries at book-global offsets 729, 1,874, 3,603 and 5,506. These values give exactly

| Visual chapter | Runes | Consecutive prime width | Whole columns / quotient | Original printed word breaks |
| --- | ---: | ---: | ---: | ---: |
| physical p0–p2 | 729 | 3 | 243 | 158 |
| physical p3–p7 | 1,145 | 5 | 229 | 255 |
| physical p8–p14 | 1,729 | 7 | 247 | 383 |
| physical p15–p22 | 1,903 | 11 | 173 | 437 |

The 3,5,7,11 sequence is a precise new *candidate* source-selected geometry, and all four quotients lie in the 0–255 range of the physically printed p50 256-cell table. The artifact does **not** supply an instruction to skip prime2, make chapter-wide rectangles, transpose word breaks, or read the quotients as p50 addresses. Crucially, the next five actual chapter rune lengths (1,021,1,433,1,680,3,008,308) **do not continue divisibility by primes 13,17,19,23,29**. There is no book-wide confirmed prime-width register. The serious rival is accidental divisibility within lengths selected by the page layout.

## The direct original-cipher test

The most economical reversible receiver is to attach each exact printed word break ('-' or '.') to its preceding rune, preserve the original 5,506 rune slots and 1,233 printed word breaks, and invert a rectangular row/column reading order *separately* in each original first-four chapter. The widths [3,5,7,11] and lengths above were frozen before scoring. Both canonical operations, row-to-column and column-to-row, are exact inverses with no guessed key, no reordered chapters, and no inserted or deleted letters. Page wraps have no break value, and source-crossing words are not split.

To test whether the boundary channel alone restores ordinary prose, score consecutive reconstructed word lengths against a smoothed 16×16 two-word English length transition model fitted to **three independent, existing raw Latin text controls:** Gibran's *Prophet*, Shakespeare, and Emerson. The baseline original source boundary sequence and each complete four-chapter prime inverse yield:

| Whole-book first-four break order | Single-rune words | Two-rune words | Longest word | Words longer than 20 | Adjacent English length gain (nats per pair) |
| --- | ---: | ---: | ---: | ---: | ---: |
| Original printed | 42 | 190 | 14 | 0 | −0.03023570 |
| Prime-width row→column | 268 | 188 | 33 | 9 | −0.08695198 |
| Prime-width column→row | 286 | 221 | 26 | 2 | −0.11129024 |

Both frozen operations **degrade** the original adjacent-length structure, sharply inflate singleton boundaries, and create words of length 26 or 33. The two orientations with prime width as row rather than column duplicate these exact inverse maps mathematically, so no additional rectangular variants are needed.

**Real-text planted positives:** four disjoint consecutive Gibran raw-Latin word-break samples were laid into the exact original chapter rune lengths; their boundary flags were permuted by the exact inverse and restored **bit-for-bit** on each chapter. Each native donor window's English length gain exceeds its correctly encoded counterpart: original [0.02778, 0.06045, 0.00987, 0.01162] against encoded [−0.04228, −0.14153, −0.10704, −0.12365]. This validates the test's direction and sensitivity to a genuine source-shaped word-break permutation. It says nothing about any GP29 cipher attached to the letter values.

## Decision and missing plaintext bridge

**Retire only the canonical, single-layer 3/5/7/11 transposition of printed word-boundary flags as a route back to original English prose.** Original source widths alone supply no key, 29→28 exception transport, alternative plaintext register or reversible full-cipher model. A completely separate unannounced value-changing cipher before or after a putative prime-width permutation could in theory hide plaintext, but adding one without an original instruction would not be an advancement.

Preserve the exact length divisibilities as a structural observation for source-first research, **without calling them authored, identifying the p50 quotients as addresses, or rescoring new widths to rescue the failed direct readout**. A productive successor needs a contemporary, player-visible operation that actually maps those four source rectangles to a plaintext receiver, or an independent original-page key/crib.
