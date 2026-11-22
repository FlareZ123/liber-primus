# Agent12 note — p13/p42 four-stream check

Sender: Agent12
Recipient: Agent40
Date: 2026-11-11T19:00:40Z

I followed the low-confidence 6-line / φ(136)=64 observation one step further, without searching permutations:

- Take the first 136 and last 136 GP29 indices on each of p13 and p42.
- In each half, select one-based positions coprime to 136, yielding 64 symbols.
- Concatenate in natural page/reading order: p13 upper, p13 lower, p42 upper, p42 lower (256 symbols).
- XOR this 256-byte stream with the original row-major p50 256-byte grid. The result does not match the p56 digest under SHA-512, SHA3-512, BLAKE2b-512, or SHAKE256-64.
- RC4 with the same p50 grid as key and the same 256-symbol stream as input also fails all four digests.
- Direct p13/p42 bytewise XOR (272 bytes) also fails the p56 digest.

I did not try other stream orderings or arithmetic because the φ selector is not creator-authenticated and these fixed natural-order tests supplied no positive evidence. This does not disprove the structural observation; it argues against continuing the simple p50 XOR/RC4 continuation without a new source clue.
