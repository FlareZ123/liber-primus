# Complete all-secret p50 cofactor16 singleton inverse

**Agent 3, 22 November 2026. Original-input exact all-state negative.** The source table's distinct degree-16 GF29 factor, with every possible 16-element secret state and arbitrary secret fixed plaintext alphabet, has **zero** keys consistent with all 83 original one-rune words under either natural recurrence orientation and either full-book rune or word clock. No unknown Liber Primus plaintext, creator-selected key, or destination was recovered. [Passing Windows Node22 CI](https://github.com/FlareZ123/liber-primus/actions/runs/44987221183) · [complete original-input SFT](../sims/lp2_p50_r16_allsecret_singleton_source_sft.cjs).

## Independently printed source and full-key hypothesis

Original physical pp49–51 display exactly 256 numerical cells. The canonical base60 byte stream has SHA256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Over GF29, its established factorization includes an irreducible degree238 factor and this complementary monic degree16 factor with all 17 coefficients **in ascending order**:

`R16 = [13,20,26,12,6,2,13,26,6,26,11,7,15,11,17,25,1]`.

The new SFT asserts complete exact divisibility of the untouched 256-byte polynomial by R16. The source p15 numerical square independently contains sixteen values; this may prompt a human to consider sixteen-state operations. However, the original text never instructs use of a linear-feedback register, chooses a register output clock, or provides the exact value-addition operation. This is therefore a bounded, plausible candidate rather than a claim about the author's actual cipher.

The model being inverted is `C[i] = sigma(P[i]) + K[clock(i)] (mod29)`, with **any** fixed secret 29-way substitution sigma applied before addition and K satisfying either source R16 or its reciprocal recurrence. The key advances once per printed rune or once per complete printed word; both clocks are continuous across all original pages and preserve all 32 cross-page word continuations. Every initial state and phase is granted, since the factors have invertible constant terms.

## Exact 83-site inverse without any key guess

The genuine original transcript contains **12,956 GP29 runes, 2,896 printed words, and 83 one-rune words**. Under the explicit conditional hypothesis of ordinary native-GP English with unchanged word separators, these singletons must be A or I. Let uA and uI be the two **completely unknown GP29 values sigma(A) and sigma(I)**. For singleton j with known position t and actual original printed rune c, the model requires:

`r(t) · x + uA = c (mod29), OR r(t) · x + uI = c (mod29)`.

The coefficient vector r(t) is determined exactly by the 16th-order source polynomial. The 16 unknown seed values x and two unknown label values form an 18-dimensional GF29 linear system. There are **29^16 = 250,246,473,680,347,348,787,521** possible initial keys. Rank-aware incremental Gaussian elimination explores **all** feasible assignments of the singleton A/I labels without enumerating them individually. It labels the first singleton A without loss because the two secret labels can be exchanged. It permits coincident uA/uI, making the search slightly broader than a true bijective sigma. Every rank-deficient partial solution retains all its free field parameters.

| Original source factor | Continuous clock | Longest satisfiable prefix of 83 one-rune words | Full original solutions | DFS nodes |
| --- | --- | ---: | ---: | ---: |
| R16 printed orientation | Rune | **22** | **0** | **267,017** |
| R16 printed orientation | Word | **22** | **0** | **267,051** |
| R16 reciprocal | Rune | **23** | **0** | **266,947** |
| R16 reciprocal | Word | **22** | **0** | **267,041** |

The exhaustive contradiction occurs around the 22nd to 24th original singleton, with no guessed plaintext elsewhere. No stationary secret alphabet can repair the inconsistent singleton equations in the stated model.

## Positive source-native plaintext and exact reconstruction

For **each** orientation/clock, the SFT constructs a full 12,956-rune source-native GP plaintext by cycling the *authentic clear p57* 95-rune text and placing alternating GP A/I at exactly the original 83 singleton coordinates. Plant the sixteen unknown state values `x[j]=(7j+3) mod29` and a true nonidentity alphabet `sigma(p)=2−p mod29`, so sigma(A)=7 and sigma(I)=21. Encrypt every symbol, invert the full ciphertext with the planted secret, and solve all 83 singleton constraints **without disclosing the planted secret to the solver**.

All four positive controls each recover **exactly one** full constraint solution, namely all sixteen true seed symbols and the two true hidden singleton alphabet values. All **12,956 / 12,956** GP symbols are recovered and forward-re-encrypt exactly. The 95-rune control text is repeated and singletons imposed; it is an algorithmic exactness control, not a substitute for natural-English source calibration. The original full-book ciphertext yields no state in any corresponding model.

## Research decision

Retire **only** the whole-book R16 direct-additive source LFSR with fixed GP29 plaintext relabeling, in these two printed-source directions and two continuous clocks, for ordinary A/I singleton-word English. This is stronger than a seed sweep and distinct from the earlier all-state degree-nine test: the entire **29^16** key space and arbitrary stationary input alphabets are excluded algebraically. The R16 source factorization remains an exact mathematical observation.

A separately rekeyed chapter, archaic O singleton, nonlinear/emission-feedback rule, changing alphabets, altered word boundaries, transparent-F clock, non-GP plaintext register, and external key instructions are outside this model. None is selected by this test. More all-secret seeds for this same direct R16 family cannot decrypt the original under its explicit linguistic premise. The next useful operation must be selected by independent evidence, rather than altering a seed until gibberish looks familiar.

**Reproduce:** `node sims/lp2_p50_r16_allsecret_singleton_source_sft.cjs`. The script asserts original source SHA, 256-cell factor divisibility, 2,896 authentic words, 83 singleton positions, all four exact negative counts, and four complete exact native-GP plants. [Windows successful run 44987221183](https://github.com/FlareZ123/liber-primus/actions/runs/44987221183).
