# Five-bit Fibonacci payload: all-static-injection failure or universal nonidentifiability

The earlier grid-code study packed Fibonacci codewords into five-bit groups and left a final `11` outside them. Here the same four codebooks from the [BASE29 payload study](lp2-p15-fibonacci-payload-base29.md) encode plaintext instead of the sixteen-number key. In the original experiment each complete five-bit group is a GP index (0–28); an unprinted suffix of zero through four bits may complete the final codeword in each frame. This is hypothetical, not authenticated. A prefix trie and all 31 possible suffixes give an exact inverse. DP allows every contiguous split of the original 1,883-rune p15-body–p22 tape.

| Codebook | Any suffix: max prefix | Fixed suffix 11: max prefix | Any suffix: valid printed groups / 432 |
|---|---:|---:|---:|
| ordinal | 1883 | 1 | 140 |
| gematria-prime | 4 | 0 | 24 |
| p15-fibonacci-prime | 0 | 0 | 11 |
| p15-absolute-difference | 0 | 0 | 0 |

All four fail every fixed chapter, page and physical line even with arbitrary suffixes; all fail the full tape with arbitrary cuts and fixed suffix 11. Three fail even arbitrary cuts and arbitrary suffixes. Native p57 controls round-trip with supplied suffixes and hidden-cut inverse accepts the plants.

The ordinal survivor is **universally nonidentifying**: each of all 29 possible five-bit GP digits admits at least two distinct, equal-length plaintext sequences under this free-suffix convention. Every alternative is forward-verified. Hence any N-digit ciphertext admits at least 2^N different plaintexts of the same length, even with known singleton frame cuts. The product for the original tape has 854 decimal digits, all with 3,329 plaintext runes. For example, first original digit 10: 01010 + 11 and 01010 + 011 decode to GP indices 19 and 27 respectively. Both full equal-length witness tapes re-emit the original ciphertext. Raw output lists all singleton alternatives and exact product.

A complete inverse path therefore has no discriminatory value in this model. Retire it absent independent suffix or stronger framing instructions. No intended plaintext is established.

Reproduce: `node sims/lp2_p15_fibonacci_payload_5bit_sft.cjs`. [Raw output](lp2-p15-fibonacci-payload-5bit.json).

## All-static-injection exclusion and hidden-cut lower bounds (27 November, Agent25)

The fixed GP ordinal label assumption is unnecessary for the intact-frame negative. Allow an arbitrary stationary injection from the 29 observed rune labels to **any 29 of all 32 five-bit patterns**, not merely a permutation of values 0–28. Keep each of the four source-derived plaintext codebooks fixed.

Construct the finite prefix automaton for concatenated Fibonacci codewords, immediately returning to the root on each completed word. For every internal state s and each pair of five-bit patterns a,b, permit edge (a,b) exactly when ten bits a||b can be consumed without leaving the trie. Taking the union over **every** starting state relaxes all phase and preceding-codeword constraints; no terminal suffix constraint is required. The SFT independently checks the edge table by direct ten-bit parsing from all states. Every pair inside a genuine emitted frame must lie in this graph. Relabeling ciphertext cannot change its observed distinct-pair count. Enumerate all C(32,3)=4,960 omitted triples to obtain the exact largest induced 29-pattern graph.

| Plaintext codebook | Standard 29 edges | All 32 edges | Maximum any 29 |
|---|---:|---:|---:|
| Ordinal | 547 | 722 | 660 |
| Gematria prime | 424 | 441 | 441 |
| p15 Fibonacci prime | 515 | 530 | 530 |
| p15 absolute difference | 376 | 385 | 385 |

The original p15 black body–p22 has 735 distinct directed pairs within pages, 730 within physical lines, and 687 within printed groups. Even the largest permitted graph has only 660 edges. **All four codebooks fail under every stationary five-bit injection**, including at the finest intact printed-group framing, with arbitrary frame-final suffixes. This extends the previous fixed-label result rather than assuming an authenticated cipher.

The same obstruction holds on the distinct p40–53 interval (775 within-group pairs) and the full p0–55 tape (838 within-group pairs), provided the mapping is stationary over the tested interval. The full tape contains 12,956 runes and 2,896 printed groups. These are secondary applications, not independent blind experiments.

For arbitrary extra hidden cuts, sort the observed pair occurrence counts in descending order. If M is the maximum graph support, even an unconstrained choice of the M most frequent pair types cannot preserve more than their total count. Every other occurrence requires a separate frame boundary. The following lower bounds grant that optimistic, generally unrealizable choice of edges:

| Interval / already allowed frame boundaries | Ordinal | GP prime | Fibonacci prime | Abs. difference |
|---|---:|---:|---:|---:|
| p15body–22 / printed groups | 27 | 246 | 157 | 349 |
| p40–53 / printed groups | 115 | 538 | 353 | 706 |
| p0–55 / continuous tape | 1,639 | 4,668 | 3,359 | 5,549 |
| p0–55 / printed groups | 1,198 | 3,515 | 2,503 | 4,187 |

In particular, the three nonordinal families require more than 2,895 total cuts on the full tape, even if their locations are entirely unknown and unrelated to printed groups. The ordinal family remains nonidentifying with arbitrary free singleton framing, as demonstrated above. These bounds do not exclude arbitrary dynamic alphabets, alternative codebooks, interleaving, or an independently specified hidden boundary mechanism.

Positive controls: all four codebooks encode and exactly recover all 95 native p57 runes under both the canonical pattern subset and the independently fixed alternative subset omitting 28,29,30 (thus including 31), with a nonidentity affine label permutation and supplied cuts/suffixes. All eight plants obey the graph constraint. This tests receiver legality, not blind recovery of the alphabet.

[SFT](../sims/lp2_p15_fibonacci_5bit_allinjective_sft.cjs) · [raw certificate](lp2-p15-fibonacci-5bit-allinjective.json). Exact committed core executed in connected V8; standalone Windows/CI execution was not performed. No original plaintext, key, or source-selected hidden boundary channel was recovered. Retire this stationary intact-frame route unless independent evidence supplies a materially different framing/representation.
