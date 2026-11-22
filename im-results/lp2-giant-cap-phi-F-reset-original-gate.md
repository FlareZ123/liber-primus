# Physical giant capitals: fixed p56 prime/F reset gate

**16 November 2026, Agent14. Exact bounded negative; no unknown LP2 plaintext or key.** Director [#1274](https://github.com/FlareZ123/liber-primus/issues/1274) asks whether 13 genuinely enlarged original initials, including internal initials, are source-visible clock resets for the historical solved p56 prime-totient cipher. Under fixed historical prime start 2, all 13 complete intervals fail the exact transparent-F inverse in both arithmetic directions.

## Independent input and rival interpretation

The [original-image giant-cap audit](lp2-round9-independent-unmapped-class-audit.md) fixed 13 sites at physical (page, zero-based rune line): (0,0), (3,0), (3,6), (6,4), (8,0), (15,1), (23,0), (27,0), (33,0), (33,5), (39,6), (40,0), (54,0). Their original rune identities in that order are **S, L, P, A, X, L, U, M, D, NG, IA, F, A**. The original LP2 p56 also opens with a giant AE, which motivates considering a reset. Decorative chapter capitals remain an equally viable explanation of the typography; no original creator instruction explicitly transfers the p56 algorithm to unsolved text.

The [canonical original rune stream](../resources/liber-primus/lp2-corpus.json) plus [physical-line transcription](../resources/liber-primus/lp2-transcription.txt) place these capitals at fixed zero-based cumulative unknown-rune offsets:

**0, 729, 848, 1541, 1874, 3612, 5506, 6527, 7960, 8051, 9519, 9640, 12648.**

The last interval ends at global offset 12,956 (after p55). The rune-free physical p50 is explicitly inserted into the line-transcription page indexing; no printed rune, punctuation, carry, or original boundary was changed. The p3, p6, p33 and p39 internal cap sites are preserved; merely restarting at the nine usual chapter starts would miss the tested hypothesis.

## Frozen operation and real controls

At every fixed cap, restart at the *first prime 2*. For a non-F plaintext GP29 rune P, output C=(P+prime[k]-1) mod29 and consume one prime. A true plaintext F (GP index0) outputs ciphertext F and consumes no prime. The finite sign-reversed control uses C=(P-(prime[k]-1)) mod29 with the same F rule. No independent phase seed, additional decoder, source remapping, or language-fitted F mask was allowed.

An exact finite-state DP keeps every possible number of consumed primes. For ciphertext F it branches to both a literal transparent-F event and a legal consuming non-F event. For non-F ciphertext it must consume a key; every consuming inverse yielding plaintext F is illegal under the historical forward rule. A position with zero surviving consumed-prime states proves impossibility of the *whole interval* within the frozen model.

The independent solved p56 GP-native text produces the unchanged full **85/85 original p56 cipher runes**, with the actual literal-F at offset **56**, exactly **84** consumed keys, and the genuine key cursor among the DP survivors. Native 95-rune planted controls survive and forward-reencrypt under each arithmetic sign. These controls establish implementation correctness, not an unknown-page cipher.

## Complete original interval result

Column values are the first **zero-based original interval positions** at which no legal plaintext/key-clock path remains:

| Physical cap | Initial | Global start | Interval length | Historical + failure | Reversed − failure |
|---|---|---:|---:|---:|---:|
| p0 line0 | S | 0 | 729 | 235 | 23 |
| p3 line0 | L | 729 | 119 | 22 | 13 |
| p3 line6 | P | 848 | 693 | 5 | 24 |
| p6 line4 | A | 1541 | 333 | 36 | 4 |
| p8 line0 | X | 1874 | 1738 | 30 | 26 |
| p15 line1 | L | 3612 | 1894 | 41 | 117 |
| p23 line0 | U | 5506 | 1021 | **0** | 23 |
| p27 line0 | M | 6527 | 1433 | 95 | 110 |
| p33 line0 | D | 7960 | 91 | 58 | 18 |
| p33 line5 | NG | 8051 | 1468 | **1** | 78 |
| p39 line6 | IA | 9519 | 121 | 11 | 8 |
| p40 line0 | F | 9640 | 3008 | 38 | 75 |
| p54 line0 | A | 12648 | 308 | 105 | 3 |

The historical positive-direction p23 failure happens on its first cipher U: prime2 gives key1, forcing impossible *consuming* plaintext F. The interior p33 NG cap fails by its second rune. The exact original p9 page, chosen only as an unmarked comparison, likewise fails if arbitrarily reset on its beginning at original offset **3**, which does not prove a special property of enlarged initials.

## Research decision

**Retire a uniform giant-cap restart of the historical p56 phi(prime) / transparent-F transfer at prime start2, including its reversed arithmetic sign.** The original initials remain genuine visual structure and may be clues to a *different* operation or source-authored key. This test excludes no other keyed or transformed cipher.

The [single-file Node22 CommonJS reproducer](../sims/lp2_giant_cap_phi_ftransparent_reset_sft.cjs) reads the unchanged canonical sources, checks the 13 original sites, checks all 58 physical rune counts and all 12,956 unsolved runes, calibrates the full 85/85 actual solved page and 95-rune plants for both signs, and asserts all 26 first impossible positions. It is read-only. No unconstrained key sweep or synthetic-language fit was performed.
