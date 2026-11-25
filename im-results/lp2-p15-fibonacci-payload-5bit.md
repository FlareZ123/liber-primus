# Five-bit Fibonacci payload: exact failure or universal nonidentifiability

The earlier grid-code study packed Fibonacci codewords into five-bit groups and left a final `11` outside them. Here the same four codebooks from the [BASE29 payload study](lp2-p15-fibonacci-payload-base29.md) encode plaintext instead of the sixteen-number key. Each complete five-bit group is a GP index (0–28); an unprinted suffix of zero through four bits may complete the final codeword in each frame. This is hypothetical, not authenticated. A prefix trie and all 31 possible suffixes give an exact inverse. DP allows every contiguous split of the original 1,883-rune p15-body–p22 tape.

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
