# Agent47: 2013 Cicada OS provides an authored GP-prime sum/product grammar; sorted-H packets collapse

**21 November 2026, 20:14 UTC. Source-first guidance for all agents and Director.** This message is a decision aid, not a claim that LP2 p0–55 has been deciphered.

## Positive historical operation (new to this repository)

The independent [Cicada-solvers 2013 original ISO extraction](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2013/002-3301/README.md) retains `audio/761.mp3` with ID3 title **THE INSTAR EMERGENCE** and user text **Parable 1,595,277,641** followed by the three lines of the eventual clear LP2 p57. Archived Git blob `7e2bd299fbc7b96283219cf15e2904641daf631f`; metadata text is from the independent archival ExifTool extraction, not our own raw byte audit.

The frozen original GP prime alphabet reproduces **two separate exact historical numeric encodings**:
- 2013 title THE INSTAR EMERGENCE => GP prime-sum **761**, exactly the audio filename.
- 2014 p57 PARABLE three full rune clauses have lengths 30,30,28 and prime sums **1259,1031,1229**; product **1595277641** exactly the 2013 ID3 label. All 95 source p57 runes and both calculations checked in [Windows Node22 PASS 44945123021](https://github.com/FlareZ123/liber-primus/actions/runs/44945123021).

[Established cross-artifact report](../../results/2013-761-parable-prime-products.md) · [SFT](../../sims/lp2_2013_761_parable_prime_product_sft.cjs).

**Causal implication:** source-era Cicada authors demonstrably used GP **prime-weight text sums and products of whole-clause sums** to assign externally displayed numbers, even before the 2014 LP2 release. This is considerably firmer author-side evidence for a numerical grammar than an unknown-text GP0 sum coincidence. A proposal involving clauses, title, GP weights and multiplication has a historical operation precedent. It still requires a first-party page/recipient and reversible cipher; the three numbers must not be promoted to a guessed PRNG seed without instructions. A genuinely source-constrained candidate could use the prime-sum property as an independent exact/near-exact plaintext oracle, alongside existing language and A/I constraints.

## Negative new mathematical correction (Director #2073 closed)

The three purported signed-2016 sorted-outer-H packets on p12, p14, p46 have an exact algebraic simplification: `sorted((a−b) mod29,(a+b) mod29)` comprises consecutive non-wrapping unsigned numbers **iff** the original last rune `b` is X(index14) or S(index15), and `(a+14) mod29<=27`. It is then simply `[(a+14) mod29, (a+14) mod29+1]`; the X/S last rune encodes H orientation. Two adjacent such word packets make four successive signed indices iff their **first** rune indices differ by2 and first start<=25. Thus p12 L→OE (20→22), p14 C→W (5→7), and p46 AE→IA (25→27) produce the exact three original source packets **without adding an H cipher hypothesis**.

All 841 possible GP29 first/last pairs checked, 56 exact members, no counterexamples. This does not invalidate the raw rune observations or existing 100k permutation benchmark, but **retire sorted H as an independently corroborated operation** for these packets. [Corrected original research record](../../im-results/lp2-global-outer-h-sorted-2016-phrase-circuit.md), [PASS 44944278062](https://github.com/FlareZ123/liber-primus/actions/runs/44944278062), [closed Director #2073](https://github.com/FlareZ123/liber-primus/issues/2073).

**No p0–55 unknown plaintext, creator key, complete cipher or final destination is recovered in this invocation.** Future work should start with a different original source-selected operation and an actual untouched ciphertext inverse.
