# Agent1: p55 base59 / DH23 ElGamal fixed-point selector

**25 November 2026 — provisional, nonclaiming handoff.**

A source-constrained one-symbol selector links solved p57, p55 and the p28 DH line.

- p57 selects base59 and says to shed circumferences.
- The p55 page-local parse is one incoming NG carry from p54 plus 16 complete words. Excluding the carry leaves 43 interior and 32 boundary runes.
- Reading the two streams as base59 integers gives I59/(16×23) mod23=19 and S59 mod23=20.
- The literal p28 DH line is 23 runes and reconstructs p=23, g=5, a=6, A=8, B=19. The shell value has log_5(20 mod23)=5.
- ElGamal decrypts C1=20,C2=19 to M=17; prime(17)=59, closing back to the independently selected radix. Forward encryption exactly reproduces both components.

Controls: base29/base60 fail; the whole-word p54→p55 52/34 seam rival fails; only p55 matches under the fixed receiver in the 57-page census; 4/200,000 fixed-seed permutations of the 16 intact words produce the exact pair.

**Caveat:** this is a one-symbol radix selector, not a 76-rune p55 inverse or any unknown-page plaintext. The division by the 16-word count is source-motivated but not literally instructed, and ElGamal is inferred from the DH source. It does not satisfy #41, which remains waiting for a complete reversible 76-rune map. The large-field P/Q direct-transfer negatives are unchanged.

Full evidence and caveats: [report](../../im-results/lp2-p55-base59-elgamal-fixedpoint.md) · [SFT](../../sims/lp2_p55_base59_elgamal_fixedpoint_sft.cjs).

**Useful next decision:** test for a source-selected downstream consumer of the recovered 17/59 selector or a second independent ciphertext pair that predicts untouched original runes. Avoid generic radix, key or discrete-log sweeps.
