# Native-width mixed-radix shared integer gate (#3196)

## Decision

The literal GP29 Latin-expansion width can define a reversible variable-length integer packing, but two natural raw positional implementations are incompatible with any shared unit-affine BASE29 page key, in either page orientation. The original exclusions are exact prefix constraints, not language-model failures. No plaintext or historical key was recovered.

## Source and scope

The canonical GP chart has 22 single-width and seven double-width literal expansions (TH, EO, NG, OE, AE, IA, EA). This freezes literal widths, not contextual NG/ING variants. Earlier #2380 and #2429 established ambiguities of flattened Latin, #3066 excluded a ciphertext-width Vigenère clock, and #3129 excluded one static arithmetic-code receiver. The present construction instead packs an ordinal into a varying positional base. A pre-release worked example of mixed-radix positional notation is Seth J. Chandler, [Mixed Radix Number Representations](https://demonstrations.wolfram.com/MixedRadixNumberRepresentations/) (2011-03-07): 4095 has digits 15,7,3,7 in successive low-to-high bases 16,8,4,8, since 15+16*7+128*3+512*7=4095. This supports period availability of the mathematical convention, **not** Cicada's selection of the present adaptive bases, physical-page resets, or affine key. Cicada's authenticated BASE29 protocol supplies fixed radix, not this additional law.

## Exact coding and capacity

Raw ordinal digits have values 0..28. Choose radix 29 for width one and 841 for width two. A two-digit radix slot contains the ordinal followed (low-to-high) by a mandatory zero. In the prior-width variant the initial radix is 29 and subsequent radix is determined by the previous decoded rune. In the current-width comparison, the decoder first reads the low digit (both bases share factor 29), then knows whether a mandatory zero follows. Neither uses an unknown segmentation or circular radix inference. The frame ends at its known digit count; a pending padding digit makes a complete frame invalid.

A raw adaptive positional encoding cannot bijectively pack all n-rune messages into exactly n base-29 digits by truncating: with first ordinal 2 (TH), inputs [2,0,0] and [2,0,1] both truncate to [2,0,0] for both variants. More generally, a prefix-selected ordinal radix must be at least 29 wherever all 29 symbols are permitted. If all n-rune inputs must map injectively into 29^n integers, the map is also surjective. The first reachable nonlast radix greater than 29 creates an unused digit (29) at that prefix, and that missing integer fits in the n-digit frame because all earlier relevant radices are 29. Thus unrestricted equal-length direct ordinal packing cannot introduce a nontrivial effective radix above 29 at a nonlast position. The final radix itself does not affect the integer once its final ordinal is written.

Variable plaintext length is different. Let L(N) count legal complete packed strings of N digits. For current-width, L(0)=1, L(1)=22, and L(N)=22L(N-1)+7L(N-2). For prior-width, L(0)=1, L(1)=29, L(2)=638, and the same recurrence holds for N>=3. Exhaustive enumeration of every digit vector of lengths 0..3 agrees with DP and roundtrips every legal vector.

| N | prior log2 density | current log2 density |
|---:|---:|---:|
| 12 | -4.179490 | -4.557613 |
| 76 | -28.379336 | -28.757459 |
| 262 | -98.710138 | -99.088261 |

At N=12 there are exactly 19,526,485,376,777,940 prior-width and 15,024,424,231,279,709 current-width legal strings, out of 353,814,783,205,469,041. For m plaintext runes with k wide runes, current-width capacity at digit length m+k is binom(m,k)*7^k*22^(m-k); prior-width uses k wide among the first m-1 and count 29*binom(m-1,k)*7^k*22^(m-1-k). An enumerative rank within a known width-count class is another valid reversible scheme, but requires source-selected class/framing/branch order. Without restricting classes, the total is 29^m and ordinary GP lexicographic rank reduces to fixed BASE29. No general claim is made against other enumerative or adaptive grammars.

## Exact arbitrary-size key recovery

Treat each of the 55 rune-bearing original p0..55 pages as a separate frame, with common orientation and shared decoding key P=A*C+B mod 29^N, A a unit; A=1 is the shift comparison. The first 12 digits at the chosen end are the low digits. Fit pages are indices other than every fourth (42 fit, 13 held). A prefix may end with an unfinished pad: the original test does not impose a complete 12-digit frame boundary. If the original full-page model held, every prefix would have a legal path under the same low key digits.

At depth j, the ordinary integer carry and known lower A digits give base_i. The next packed digit is (base_i+a_j*c_i0+b_j) mod29. A forced zero gives a linear equation over F29 on a_j,b_j. Intersect all equations, enumerate every remaining choice, update carries and parser states. No beam or language pruning is used on the original. Search cap 30 million attempts per configuration; none reached it. Every surviving prefix may be extended by any higher key digits, so empty prefix sets exclude arbitrary-size keys.

## Native control and original result

Eight native trials from solved GP29 material (KOAN1 forward, LOSS OF DIVINITY reversed, both excluded from language-model training) use 55 disjoint-in-each-trial 12-digit packed frames and deterministic nonzero hidden keys; some starts skipped to obtain exact complete frames. Forward/reverse source records differ; branches within each orientation reuse donor material and are not eight independent historical texts. All eight recovered their exact A,B and all 440 frames (5,026 plaintext runes), including all 104 held frames (1,188 runes). Seven cases had one structurally legal fit key; prior-width affine forward had 29, and fit-only trigram scoring selected the correct one. Every held frame was valid and replayed. Original fitting used no language score.

| Raw codec | Key family | Orientation | surviving prefixes by depth until empty |
|---|---|---|---|
| prior width | shift | forward | 1,29,841,0 |
| prior width | shift | reverse | 1,29,841,0 |
| prior width | affine | forward | 1,812,682892,2,0 |
| prior width | affine | reverse | 1,812,682892,0 |
| current width | shift | forward | 1,29,0 |
| current width | shift | reverse | 1,29,0 |
| current width | affine | forward | 1,812,0 |
| current width | affine | reverse | 1,812,0 |

No withheld page had to be consulted to reject any original model. This excludes both width-based raw packings under the specified shared integer-affine key and physical-page orientation assumptions, including arbitrarily many high key digits. It does not exclude page-private keys, other radix/escape digits, other framing, contextual expansion, or an independently selected enumerative mapping. The mixed-radix positional convention is historically plausible, but the source does not authenticate either raw codec or key. Retire these particular packings rather than tune a new variant around the original failure.

## Reproduction

- [SFT](../sims/lp2_width_mixedradix_shared_affine_sft.cjs), commit 2d03f4cf5781297f7e235081a5f31492ab446e1e.
- [Raw results](lp2-width-mixedradix-shared-affine-output.json), commit bf5cad65ff859a8bfe3f4bb8c317ac174c18e9a7.
- Inputs: canonical LP2 corpus and native GP29 solved corpus under resources.
- Core actually executed in connected V8; Node wrapper not independently executed, no CI run. No unknown plaintext or authenticated key; no established-results promotion.
