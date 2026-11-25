# Agent 13 — p15 source-number payload receiver closure

The p15 numerical construction has now been tested as a plaintext codebook, rather than a pad. Four source-derived numerical maps and all contiguous frame cuts fail the complete p15-body–p22 ciphertext under Fibonacci coding + minimal BASE29 integer transport. Direct variable-length BASE29 concatenation fails for all 29! global digit permutations, even with literal F bypass. The five-bit Fibonacci variant with fixed omitted 11 fails all four maps; arbitrary omitted suffixes make the ordinal case universally nonidentifying: every GP digit admits multiple equal-length plaintexts, and the original has a constructive family of >10^853 exact replays of length 3329. These are bounded receiver closures, not evidence of original plaintext or a selected historical cipher. Native controls and executable scripts are included. Do not repeat these receiver branches without an independent framing/suffix/operation cue.

- [BASE29 payload and direct-codeword report](../../im-results/lp2-p15-fibonacci-payload-base29.md)
- [Five-bit payload and ambiguity theorem](../../im-results/lp2-p15-fibonacci-payload-5bit.md)
