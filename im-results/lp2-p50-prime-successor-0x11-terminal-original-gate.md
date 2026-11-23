# Original p49–51 prime-neighbor path into conditional 0x11 and p55

**Agent 2, 23 November 2026. Classification: a source-motivated, newly enumerated three-cell path with two narrowly rejected original p55 inverse contracts. No decrypted unknown LP2 plaintext, authenticated key, or destination.** This report supplies the complete falsifiable source readout and explicit failures rather than another speculative navigation expansion.

## The exact printed path

The 2014 Liber Primus scans `66.jpg`–`68.jpg` (physical pp49–51) print 256 two-symbol numerals in 32 rows of eight. On the original final table page `68.jpg`, three spatially adjacent cells are:

| Step | Zero-based table index | Row, column | Printed token | Conventional base60 byte |
| --- | ---: | --- | --- | ---: |
| Start | 220 | (27,4) | `0w` | **58** |
| West | 219 | (27,3) | `0x` | **59** |
| North | 211 | (26,3) | `11` | **61** |

The explicit primitive is: **from a cell, move to any of its eight immediate neighbors whose byte is the least prime strictly greater than the current byte**. It makes the two moves `58 → 59 → 61`, because the least primes above 58 and 59 are 59 and 61. Exhaustively applying that fixed rule from **every** of the 256 cells gives **eight directed edges and one directed three-cell path**, exactly `[220,219,211]`; no other source cell begins a path of three or more. This is a concrete new use of the original prime cue, an independent alternative to the newly reported seven high-band ±1 edges.

Both the cue and the decoding ambiguity matter. Solved LP1 explicitly says **“THE PRIMES ARE SACRED”** and the authenticated 2016 message says **“their numbers are the direction.”** Those statements motivate inspecting prime successor moves on a numeric map, but neither prescribes base60, king-neighbor adjacency or a start location. The conventional base60 interpretation is pinned in `resources/liber-primus/base60-grid.json`. A competing 59-symbol alphabet omitting lowercase f changes these three values to **57, 58, 60**, which do **not** form a successive-prime path. This is evidence conditional on the conventional base60 reading, not a proof of that radix.

## Source-paired recipient prediction

This path passes through the **same two independently ordered cells** already identified by the signed 2016 words **WAY → MAP** under GP-prime indexing:

- GPprime(WAY) = **219**, literally `0x`;
- GPprime(MAP) = **211**, literally `11`, physically one cell north.

Their literal ordered tokens concatenate to **`0x11`**, conventional hexadecimal **17**. Independently, physical p55 `72.jpg` has **exactly 17 page-local printed rune fragments**, with lengths `[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`: a one-rune `NG` carry from the last word on p54, followed by 16 complete words. It contains 76 original ciphertext runes. A complete scan of all **57 rune-bearing LP2 physical pages** yields **p55 alone** with 17 page-local fragments under the pinned page separators. That last uniqueness is a property of the original text layout; treating 17 as a page-selection command remains interpretive. The separate LP1 release also has 17 sheets, a concrete competing recipient for this numeral.

This extends the earlier [WAY–MAP pair note](../workplace/lp2-signed-way-map-dual-gp-prime-0x11-original-candidate.md) by supplying a *third original printed neighbor* and an exact prime-successor operation. The earlier note already established the literal `0x11` adjacency; it did not report this prime path. There is still no source instruction to take the result as a key or to decrypt the p55 runes.

## The constrained original-cipher consumer

A human could reasonably test the two simplest full-p55 uses of the newly source-selected numeric object without adding an unknown key.

**1. Direct three-number GP29 key.** Reduce the original conventional-byte prime path `[58,59,61]` modulo29 to `[0,1,3]`, repeat over all **76** unchanged p55 runes and apply the additive GP29 operation. Both arithmetic directions fail to recover a readable phrase or full native-GP passage: original p55 IoC is **0.03789474**, while `C+key` gives **0.03228070** and `C−key` gives **0.02947368**. There is no phase, offset, language-fitted parameter or page splice in these two decisions.

**2. Literal circumference with hexadecimal stride17.** Solved p57 says to shed circumferences; the 32×8 table's first clockwise outer perimeter has exactly **76 bytes**, matching p55's complete original ciphertext length. Read that first perimeter clockwise from top-left. Hexadecimal `0x11=17` is coprime to 76, with inverse stride **9** modulo76. Freeze the direct GP29 subtraction `P_i=C_i−outer[(17i) mod76] (mod29)` and the inverse-order clock using stride9 as the single direction rival. Both preserve every original source position and round-trip exactly through their declared forward cipher. Their output IoCs are **0.03052632** and **0.03508772**. Neither yields connected native-GP language. These trials deliberately do not introduce a separate secret, clock reset, arbitrary start point or plaintext F-bypass mask. They reject only the two declared direct outer-ring consumers.

The conditional picture is thus specific: an original three-step numeric path, a plausible 17-fragment receiver, two full original-p55 inverses that fail. The path has **no demonstrated plaintext-changing operation** beyond the two rejected simple interpretations.

## Matched layout control, limitations and decision

To avoid treating a short path as exceptional merely because it was noticed, keep the exact original 80|104|72-cell inventory of the three separate 2014 JPEG table regions, and shuffle cells **only within their own physical page** using xorshift32 seed `0x3301b059`. In 50,000 predeclared conditional reshuffles, **6,256** have some three-cell next-prime neighbor path (plus-one **0.1251375**), and **408** contain the *exact value triple* 58→59→61 (plus-one **0.0081798**). The exact triple is somewhat rarer; the existence of an arbitrary next-prime triple is quite ordinary. Neither tail adjusts for retrospectively choosing the prime-successor statistic or combining it with the previously noticed WAY/MAP/17 coincidence. These frequencies therefore **cannot authenticate** an author-selected traversal.

**Decision:** preserve the source-precise `0w → 0x → 11` relationship and the unique p55 fragment-count match as a conditional clue candidate. The strongest unfulfilled premise is a first-party statement selecting **next-prime spatial movement** together with the **hexadecimal 17 readout** and a **symbol-changing p55 receiver**. Direct modulo29 triple-pad and canonical 76-cell rim-step subtraction are now finite negatives; repeating them with fitted starts, signs, F branches or new strides would be another unconstrained search. No evidence warrants changing the authoritative unsolved-page synthesis.

**Exact read-only reproducer:** [Node.js 22 CommonJS SFT](../sims/lp2_p50_prime_neighbor_0x11_p55_ring_original_sft.cjs). Its inputs are the repository's existing unchanged numeric grid, canonical 58-page GP rune corpus and original-form transcription; it asserts every coordinate, every source token, exact fragment-count uniqueness, all original-p55 outputs, round-trip for both ring variants, and the fixed-seed conditional shuffle counts.
