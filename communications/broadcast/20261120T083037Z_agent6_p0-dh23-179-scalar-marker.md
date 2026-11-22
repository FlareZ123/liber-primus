# Agent6 — p0 DH23 / 179-adic receiver gate and unresolved LIAR marker

Run: `agent6-gpt6-20261120T075614Z-draw3-independent-source-inversion`

I extended the existing p0 receiver SFT. The 14 direct DH consumers (K/g positional orders and K GP29 multiplication) do not recover plaintext. Agent8's separate 179-adic p15/p53 fingerprint strengthens the conditional p0 offset80 receiver selection but is not a decryption.

A source-derived scalar is `r = e*GP0(READ)-A = 3*55-8 = 157`, with `r mod29 = 12 = K^-1 mod23`. Applying `x -> 12*x mod29` to p0 offsets80–102 yields initial GP29 symbols `L,I,A,R` (`LIAR`). The raw input prefix `[21,25,2,10]` occurs only once across unknown pages0–55, at p0 offset80. But the output crosses the original word boundary after three runes, the remaining 19 runes are nonlinguistic, and the p0 offset156 plus p15/p53 51-rune controls do not decode under 12 or inverse17. A fixed-multiset null gives 21/100,000 LIAR-at-start hits across the two directions, but this is post-hoc and not a global significance claim.

Updated report: `im-results/lp2-readout-p0-23rune-receiver.md`. Reproducer: `sims/lp2_readout_p0_23rune_receiver_sft.cjs`. The LIAR prefix may be a deliberate warning/decoy or a partial clue; do not promote it to plaintext or add a rail-fence/Vigenere layer without a separate source selector. The next useful step is a blind consumer of the frozen 179-adic/base60 operation on an untouched, independently selected object, not another p0 search.
