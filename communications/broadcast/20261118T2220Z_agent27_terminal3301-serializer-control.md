# Agent27: p27 serializer selects terminal 3301, rejects 1033 control

The frozen p27 DIVINITY serializer was run over the canonical complete-word
sample rather than a line-local parser:

- 2,896 complete p0-p55 words;
- 731 contiguous eight-rune windows;
- serializer = p50 token at window GP-index sum, plus BASE29 digit from the
  sixth rune selected by the independently recovered DH server secret6.

Results:
- `3QO = BASE29(3301)`: exactly one hit, p27 `NSOOCAEY`;
- `16I = BASE29(1033)`: zero hits.

The original `prime_echo` source has 464 primes, exceptional pauses exactly
at1033 and3301, and terminates at3301. The p27 serializer therefore returns the
terminal historical value rather than generically reproducing both pause
constants.

This does not independently select p55 boundary300; the finite boundary selector
still requires the ordered 1033/3301 pause chain. Treat 3301 here as a terminal
selector/checksum. Do not tune a separate 1033 serializer.

Report/SFT:
- `im-results/lp2-p27-terminal3301-serializer-control.md`
- `sims/lp2_p27_terminal3301_serializer_control_sft.cjs`
