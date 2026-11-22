# Original 10/13/23-dot punctuation: no simple GP29 checksum

**Decision:** source-exact bounded negative for [Director issue #2210](https://github.com/FlareZ123/liber-primus/issues/2210). The original marks remain real structural data. **No authenticated key, original unknown-page plaintext or checksum-derived state residue has been recovered.**

## Source-first decision

The complete original-image-matched [ink annotation](../resources/liber-primus/lp2-ink-annotations.json) contains **36 large dot events**: 31 thirteen-dot marks, four ten-dot marks, and one 23-dot terminal mark. A [page-preserving canonical source](../resources/liber-primus/lp2-corpus.json) holds all **13,136** runes, including the **12,956** unsolved-page runes. Large marks sometimes appear before a passage, sometimes after one, and sometimes twice at the exact same physical rune offset. The chapter punctuation is visually real; conjectures such as ASCII control characters have previously been constrained by [actual line breaks and solved p56 key-clock behavior](lp2-punctuation-solved-clock.md).

A natural human-solver interpretation is that a visible mark of size `m ∈ {10,13,23}` certifies a GP-rune checksum for its adjacent text. Restrict the family to the three source-literal numerical aggregations, **sum of zero-based GP rune indices**, **sum of one-based GP ordinal values**, and **sum of GP rune-prime values**, and the two literal marker-residue readings, `sum % m = 0` and `sum % 29 = m`. Both interpret the mark itself as the source of the residue or modulus and need no arbitrary numerical key.

There are two print-faithful scope conventions: keep the runic text continuous between adjacent marks even across physical page breaks (thus preserving all original cross-page whole words), or allow an actual physical page boundary to begin/end a delimited span. In each case a mark may close the **preceding** span or open the **following** span. These yield exactly **24** frozen tests (3 aggregates × 2 congruences × 2 scopes × 2 directions). Empty spans are excluded: notably the dual p7 mark at the same offset and the p14-final/p15-start pair. A checksum of an empty span would misleadingly pass every zero-residue rule.

The transmitted p56 SHA-512 hex digest is not a rune and supplies no GP symbol. The independent solved p56 positive control reproduces all 85 known plaintext runes with the actual prime-totient cipher and its one original literal-F exception. The 95 visible p57 runes are independently known cleartext.

## Authentic solved pages distinguish candidate checksums from real punctuation

Take consecutive source-visible intervals between the internal marks on each solved page. The prime-weight sums are:

| Page/register | Intervals (rune positions, end exclusive) | Dot count at ends | Prime sums | Remainders modulo dots |
| --- | --- | --- | --- | --- |
| p56 printed cipher | 0–5, 5–45, 45–85 | 13, 10, 13 | 285, 2027, 1872 | **12, 7, 0** |
| p56 recovered plaintext | same | 13, 10, 13 | 311, 1924, 1685 | **12, 4, 8** |
| p57 original cleartext | 0–7, 7–95 | 13, 23 | 449, 3519 | **7, 0** |

The p56 actual plaintext fails a prime-sum-divisibility checksum at **all three** authentic punctuation sites. Only the last segment of printed p56 cipher and the p57 body happen to be divisible by their closing dot count, but these are mixed output registers and do not authenticate a uniform rule. The analogous GP0 and GP1 checks also fail consistently across solved contexts. No coherent source-selected exception distinguishes these sites from their neighbors.

## All original marks against a matched-placement null

Retain the exact 36 original physical marker offsets, their types, and the lengths of all nonempty visible spans. For each of the **13,136** possible cyclic shifts of the original 13,136-rune tape against the fixed marks, recompute the same 16 checks. This exact control retains the authentic GP29 symbol distribution, rune adjacency and marker spacing, and randomizes only their relative phase. It is a placement control, not a claim about how Cicada chose the punctuation.

| Source span scope and mark direction | Nonempty | GP0 divisible | GP1 divisible | Prime divisible | GP0 mod29=dots | GP1 mod29=dots | Prime mod29=dots |
| --- | ---: | --- | --- | --- | --- | --- | --- |
| Continuous; before | 34 | 3 (.513) | 2 (.753) | 3 (.504) | 0 (1.000) | 1 (.696) | 0 (1.000) |
| Continuous; after | 33 | 4 (.278) | 2 (.747) | 0 (1.000) | 0 (1.000) | 1 (.686) | 0 (1.000) |
| Page-local; before | 34 | 4 (.282) | 2 (.760) | 3 (.500) | 1 (.695) | 2 (.324) | 1 (.692) |
| Page-local; after | 23 | 3 (.281) | 3 (.267) | 1 (.857) | 0 (1.000) | 1 (.544) | 1 (.548) |

No original rule beats its corresponding source-length-matched null convincingly, even before adjusting for the 24 candidate interpretations. In the most literal continuous mark-closing prime-sum rule, **3 of 34** source intervals pass; the all-shift null averages **2.663** and yields at least 3 matches in **50.38%** of source rotations. Original prime-divisible examples are the p39 interior span ending at red119, the p56 final 40 printed runes, and the p57 final 88 clear runes. The remaining 31 complete runic spans contradict that same proposed checksum.

The source-internal short positive is exact native-GP arithmetic. The real cipher positive is stronger: the independent solved p56 inverse recovers **85/85** expected runes and correctly ignores its non-rune digest.

## Research decision

**Close this finite simple checksum family.** Neither the authentic solved passages nor the complete original source markers indicate a consistent GP0/GP1/GP-prime checksum with literal 10/13/23 dot counts. Under the specified low-parameter model there is no independently constrained residue to transfer to an unknown page, so adding offsets, selected exceptions, custom moduli or a tuned marker window would turn this into an unconstrained search.

This is deliberately narrower than concluding punctuation is meaningless. A mark might still be a record boundary, a direction, a glyph/ink selector or a stateful operation if an author-visible source specifies it. The nearby strong next research decisions concern source-selected *reversible* consumers of printed keys and actual unknown ciphertext, rather than further scalar residue coincidences.

**Exact original-input SFT:** [Node.js 22 CommonJS script](../sims/lp2_10_13_23_marker_checksum_original_sft.cjs), including the authentic p56 solved-regression and all **13,136 × 24** circular placement comparisons. It preserves original source, color, duplicate mark offsets, page boundaries and cross-page rune continuity.
