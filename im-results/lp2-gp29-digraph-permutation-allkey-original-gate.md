# GP29 two-rune substitution: exact all-key English-register obstruction

**Agent 3, 22 November 2026.** This is a deliberately bounded **negative**, with no recovered LP2 plaintext, key, or original author instruction. It tests a different static-permutation architecture from previously documented one-rune, feedback and Bifid gates. The original p50 uses paired numeral glyphs, suggesting a cheap digraph-codebook question, although those numerals do **not** themselves command this cipher.

## Key-independent mathematical test

Pair the original GP29 glyphs two at a time, restarting the pair boundary at each of the 55 rune-bearing physical pages. The proposed cipher applies an arbitrary secret bijection

`f: {0,..,840} -> {0,..,840}`, with `x=29a+b` for every plaintext pair and `y=f(x)` for the corresponding ciphertext pair. For a page-local variant, give **each page an entirely independent arbitrary 841-element permutation**. The last unpaired glyph on every odd-length page passes unchanged and is excluded from the statistic.

A bijection cannot alter whether two input digraphs are equal. Thus the **number of equal digraph pairs within each page** is an exact invariant under every possible secret key, including `(841!)^55` independent page keys. Likewise, pooling all original page-aligned digraphs is invariant if a single key is shared across the book.

Against the exact canonical original `resources/liber-primus/lp2-corpus.json`:

| 55-page original register | Original equal ordered digraph pairs | Eligible ordered pairs | Collision rate |
| --- | ---: | ---: | ---: |
| One secret bijection across every page | **50,962** | **41,750,982** | **0.0012206180** |
| Independent secret bijection per page | **910** | **792,550** | **0.0011481925** |

Both read **6,462 full digraphs** out of the original 12,956 runes (32 odd-page tails excluded). Any fixed secret digraph-substitution inverse produces *exactly the same* corresponding collision totals on its decrypted output.

## Source-native comparison, positive sensitivity

Encode two independently published English reference texts into the established GP29 transliteration, using `QU→CW, V→U, K→C, Z→S` and longest-match rune digraphs. Sample 12,956-rune **contiguous, unscreened** windows with stride6,400, cut to **the identical 55 physical page lengths** and restart pairing at the same spots. No English window is selected or fitted by its score.

| Native-GP control | Unscreened full-book windows | Minimum pooled collision rate | Minimum within-page collision rate |
| --- | ---: | ---: | ---: |
| Shakespeare, original 218,800 GP runes | 33 | **0.0053869871** | **0.0058494732** |
| Gibran, original 63,114 GP runes | 8 | **0.0060834497** | **0.0071162703** |
| **Original LP2** | 1 exact book | **0.0012206180** | **0.0011481925** |

The smallest Shakespeare within-page rate is **5.09×** the original. The controls do not constitute a discovery-wide statistical p-value or a language-independent impossibility theorem. They exclude the stated family as an explanation of ordinary uncompressed source-native GP English under these reference models.

Two genuine-English full-length positive plants give every page a fresh independently randomized **841-way secret substitution** (fixed xorshift seed `0x5cf28e`). Both recover exactly **12,924/12,924** encrypted runes, preserve each page collision count, and leave the 32 odd-position tails untouched. This establishes invertibility and the all-secret equality argument without assuming the actual key.

## Cryptanalytic decision

This particular word-boundary-agnostic **page-reset digraph-codebook** interpretation is unable to hide source-English digraph redundancy, even when all 55 secret tables are free and unrelated. Avoid searching its enormous key space for English p0–55. A key that evolves *within* pages, a plaintext compression layer, non-GP original text, or changing pair clocks is outside the test and requires an independent source clue. None is supplied by the p50 two-character printing alone.

Reproduce on Windows Node.js22, from repository root, using [the single-file exact source SFT](../sims/lp2_gp29_digraph_permutation_allkey_sft.cjs). Original-source numeric rates and both independently permuted positive plants were also recomputed directly against repository source reads in this invocation. No status change to the authoritative recovered-plaintext synthesis is warranted.
