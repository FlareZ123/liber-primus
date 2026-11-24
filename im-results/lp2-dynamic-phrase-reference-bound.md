# Dynamic phrase references: direct BASE29 printed-record model fails the original dictionary-growth bound

**Agent13 · Director #2583 · 2026-11-24.** No unknown plaintext or authenticated dynamic dictionary grammar. The specific direct LZ78-like printed-group transport is impossible with an empty or 29-entry initial dictionary, even allowing an arbitrary distinct base29 digit assignment separately for each record and noncanonical leading zeros. This is a reachability bound rather than a language-score search.

## Source semantics and missing input

The original signed [2013 book code](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/001-232.jpg/232.jpg.asc) explicitly says to identify a book and contains chapter:verse:character records with two standalone literals. The original signed [2014 book code](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/001-twitter/zN4h51m.jpg.asc) uses four coordinate fields and standalone literals. The earlier [exact reproduction](cicada-organizer-bookcode-consumption-convention-gate.md) establishes the source-dependent character policies. In both examples the target carrier already exists and reading one record does not change it. No observed record installs its output as a new addressable phrase. The signed [2013 BASE29 command](../resources/external/2013-tcp-server-signed-source.md) is an integer conversion with most-significant digit first. The signed [2016 clue](../resources/historical/cicada2016-4gq25-outguess.asc) associates words, meaning and numbers with navigation, but supplies no dictionary initialization, reference/literal split, update, terminal flag or reset rule. The earlier static book-code and entropy-packet negatives (#769, #505) do not establish a dynamic inverse.

A possible minimal construction would treat each printed group as a variable-width integer reference followed by one literal rune: start with an empty phrase at index 0, emit dictionary[index] plus the literal, append that emitted phrase to the dictionary. The printed group separator frames the record. This is an independently intelligible *conditional model*, not a source-authenticated operation. We grant 29 extra preinitialized phrases as a favorable alternative without requiring their contents. There is no need to choose them because the existence of any legal address is testable before dictionary expansion.

## Exact bound

At zero-based record j the largest possible index is s+j, where s is the number of extra initial dictionary entries. The pointer is the printed group except its final rune. A bijective GP29 digit mapping must give different runes different numerical values. For any pointer sequence, assigning 0 to its first distinct rune, 1 to the next distinct rune, and so on produces its **minimum possible** base29 value over all 29! bijections. Proof: integer order on equal-length radix strings is lexicographic; the first differing assignment dominates the entire suffix. This allows leading zeroes and even independently chooses the best assignment for each record, a strict relaxation of one shared secret mapping. If the minimum exceeds s+j, no dictionary contents, digit permutation, literal identity or plaintext can repair the reference. Resets or fewer than one new entry per prior record only decrease the available range. Even a terminal pointer-only exception cannot explain the earlier failures.

The canonical source parser joins page-spanning words and removes only visual line breaks and structural separators. Source blobs: corpus `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`, transcription `43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7`.

| Scope | Impossible even with per-record digit bijection | Impossible in canonical GP index order |
|---|---:|---:|
| 2,896 original words, empty initial dictionary | 907 | 1,723 |
| 2,896 original words, grant 29 additional seed phrases | 897 | 1,712 |
| Start after both red rubric words of p0, grant 29 additional seed phrases | 896 / 2,894 | 1,711 / 2,894 |

The first original group has indices `15,8,18,3,6,19,27,0`. Its seven pointer digits are distinct and the minimum is **22,002,393**, exceeding 29 at the first record. Even excluding the red heading, the first black group is `2,11,6,25`, minimum pointer 31 > 29. At record 1353 (zero-based), the minimum pointer implies an initial seed of at least **13,087,536,581,915,377** extra entries under the one-entry growth rule. This is an exact lower bound for the proposed address layout, not a measured size of a real dictionary.

## Constructive control

A direct greedy LZ78 encoder using the native 95-rune clear p57 produces 55 ordinary records (maximum length 3) and a one-rune final already-known phrase. An explicit terminal reference (control-only flag) gives exact 95/95 replay; both the ordinary GP-index and per-record permutation lower-bound checks reject zero of the ordinary records. The exact analysis function was executed in the connector's JavaScript runtime on the pinned corpus and transcription. The checked-in Node wrapper adds file reads and assertions; it has not separately run in CI. [Reproducer](../sims/lp2_dynamic_phrase_reference_bound_sft.cjs).

## Decision

Retire the direct printed-word / most-significant-first BASE29 reference / single literal / one-new-phrase-per-record grammar with a small seed. The historical coordinate evidence does not select another dynamic dictionary grammar, and a source-authorized decoder cannot be constructed from it. This does **not** exclude multiple references inside a word, a different number representation, an independently supplied dictionary, different address semantics, or genuine compression followed by a separate encryption layer. Those require the missing original framing and dictionary update instruction. No further unselected dictionary fits or encoding menus are justified; reopen when an independent artifact binds a typed reference/literal split and growth rule.
