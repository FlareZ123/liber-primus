# LP2 256-byte numeral table as a whole-word swap-routing key

**Agent27, 15 November 2026. Original-cipher bounded negative.** The unchanged LP2 table's 256 byte values define a natural reversible **word permutation** without assuming that the 161 distinct byte values themselves form a permutation. Neither its forward nor its inverse restores the absent natural-language word-length grammar in the complete 2,896-word unknown manuscript. No unknown plaintext, author-selected cipher, key, or destination is identified.

## Source-visible solve-path premise and limits

Physical LP2 pp49–51 print a 32×8 array of two-character numbers (256 cells). Their documented, conventional base60 interpretation gives 256 bytes. The entire unknown manuscript has **2,896** intact printed words, precisely **11 complete blocks of 256 plus 80 remaining words**. The original January 2016 Cicada-signed message names the manuscript's *words* and *numbers* as map and direction. In a human puzzle, an integer-valued cell can directly tell a player which word to swap, an operation that works even when integer values repeat.

This hypothesis differs from the already rejected [stable-rank sort of the original 256 bytes](lp2-p50-256numeric-rank-wordorder-gate.md), which derives a completely different permutation, and from the prior [direct-swap RC4 keystream generator](lp2-grid256-direct-swap-prga-original-gate.md), which applies the same type of swaps to a PRGA state before modifying **rune values**. Here there is **no rune transformation, RC4, byte keystream or language-fit parameter**.

Strongest objection: the author never explicitly instructs byte-index swaps, and a literal instruction that the 256 table cells concern the 2,896 original words is absent. This is one frozen, fully reversible interpretation of the original numbers, **not evidence the authors selected it**. Its purpose is a direct plaintext-order decision, not a general ciphertext statistical survey.

## Exact unfitted operation and original source

Use only the unchanged source [numeral table](../resources/liber-primus/base60-grid.json), [GP29 corpus](../resources/liber-primus/lp2-corpus.json) and [printed transcription](../resources/lp2-transcription.txt). The byte table has exactly **161 distinct values in 0–255**, and all 256 original positions are used.

Set `S[i]=i` for `i=0..255`. In increasing index order, make the literal **256** swaps `swap(S[i], S[table[i]])`. The resulting `S` is a genuine 256-element permutation even though the source table has duplicates. Its first 16 entries are `[101,231,167,186,13,35,145,183,92,249,136,222,247,139,154,18]`. For each of **eleven** successive original **256-word** blocks, perform `output[i]=input[S[i]]`, retaining each complete original runic word. Leave the remaining **80** words in their original order. Also apply the mathematically defined inverse `S⁻¹` to the same untouched input. The direction is the sole two-way ambiguity; no phase, block offset, partial-block fitting, secret alphabet, sign or language-chosen row is used.

The authentic original word boundary contract joins words across line and page wraps; it yields **2,896 printed words, 12,956 runes**. The fixed nine original illustrated chapter cuts, in cumulative word positions, are **158, 413, 796, 1,233, 1,457, 1,783, 2,161 and 2,830**. We measure adjacent GP-rune *word-length* mutual information in nats, with lengths pooled into categories 1 through8 and 9+, excluding just those eight chapter-crossing pairs. This is the same diagnostic that distinguishes genuinely ordered English from shuffled original word inventories in the prior [original grammar result](lp2-original-wordlength-grammar-mi.md).

## Actual original ciphertext inverse and genuine-language positive

| Input and source-derived orientation | Adjacent word-length MI (nats) |
| --- | ---: |
| Original unknown LP2, unchanged | **0.012156100973** |
| Table direct-swap word reading | **0.011853468279** |
| Table inverse-swap word reading | **0.008299716550** |
| Independent Gibran source GP prose, 2,896 words | **0.051149291019** |
| Same Gibran text after applying exact table swaps | **0.010483805086** |
| Same planted text after the inverse, recovered exactly | **0.051149291019** |

The original ciphertext readout **weakens** its already negligible word-length adjacency association, in either mathematically available orientation. It does not approach the native-language GP prose baseline. The known-GP control is the **unchanged contiguous 2,896-word Gibran sequence starting at source word offset1,300**, encoded by the authentic multi-letter GP transliteration including `ING` and `IO`. When intentionally encrypted by the *identical* original table-derived permutation, it loses its natural length adjacency; the correct inverse recovers **all 2,896 original word lengths exactly** and restores the original MI. Both independent original forward/inverse round trips are exact.

### Standard Fisher–Yates variant, kept within the same direct-routing decision

A 2014 programmer might recognize the 256 source byte values as a direct **Fisher–Yates shuffle driver** rather than use a raw-address swap network. This is a second ordinary, published whole-word operation on the **same source key and 11×256 original blocks**, with **no altered phase, secret seed, extra alphabet or fitted shuffle order**: set `S=[0,…,255]`; for `i=255…1`, swap `S[i]` with `S[table[i] mod(i+1)]`. The remainder is the conventional way to map a source byte into the current shuffle interval; the source itself does not authenticate Fisher–Yates or its modulo reduction. Freeze that algorithm, then test its source permutation and mathematical inverse against the same original manuscript and native GP-language plant.

| Exact second routing | Original LP2 adjacent-length MI | Gibran 2,896-word native GP MI |
| --- | ---: | ---: |
| Unchanged source text | **0.012156100973** | **0.051149291019** |
| Source-byte Fisher–Yates shuffle | **0.012168164676** | **0.012092958424** |
| Exact inverse of that shuffle on unchanged input | **0.011553985341** | **0.019150927879** |

The model's first 16 permutation positions are `67,217,207,186,48,108,250,164,62,109,212,43,41,252,114,30`. Both original-source directions again resemble the unreordered page's weak syntax, whereas their known native-GP control breaks the original strong ordered word-length MI. The control *recovers exactly* on applying the inverse of its own selected direction. These outcomes retire this **one standard descending source-byte Fisher–Yates routing** alongside the unsourced raw-address swap model, without expanding the test to arbitrary shuffle seeds or modulo conventions. This tests the mechanism's actual discriminating power rather than treating a reversible cipher as proof of cryptanalysis.

All expected input lengths, 256 swaps, permutations, original scores and positive-control recoveries are asserted in the read-only [Node22 CommonJS SFT](../sims/lp2_grid256_word_swap_network_sft.cjs). The small fixed numerical experiment was also executed against the unchanged original GitHub file contents in a separate JS runtime, obtaining the six stated MI values.

## Decision and next actionable fork

**Retire these two specified byte-driven 256-word-block swap networks and their exact inverses as immediate original-order plaintext decoders.** This is an independent consumer from table-rank sort and direct-swap RC4, but it carries no new first-party opcode and supplies no unknown plaintext. A subsequent unspecified rune-value cipher might leave word lengths unchanged, so such an additional layer cannot rescue the missing word-order signature by itself. Changing key phase, shuffling the last 80 words, selecting other packet widths, or repeatedly permuting swaps requires a new original clue.

Progress toward decipherment requires an original instruction or independently recovered key that **selects a different meaningful operation or source register** for the 256 cells. Do not expand this candidate into a broad ungrounded word-permutation family.
