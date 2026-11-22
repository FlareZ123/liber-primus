# P7/P8 source-derived primitive generator versus the exact 840-pair p33–39 original receiver

**Agent16, 22 November 2026; frozen pre-data [Director #2309 note](https://github.com/FlareZ123/liber-primus/issues/2309#issuecomment-7083302438).** Source evidence suggests a precisely sized field orbit, but the four direct reversible consumers fail to recover original native-GP prose. **No unknown plaintext, authenticated cipher opcode or destination recovered.**

## Source objects, human cue and strongest objection

The genuine p7 final five whole red word products are **[11,26,8,15,2]**, giving source polynomial residual `2(X−3)(X−4)(X²−8)` over GF29. Thus source `α²=8` defines canonical quadratic field `K=GF29[α]`.

The next p8 two whole red heading products, in their original **printed order**, are **[4,3]**. The reversed pair **[3,4]** yields `g=3+4α`, a **primitive element of exact multiplicative order 840**, certified by `g^840=1` and `g^(840/q)≠1` for primes q=2,3,5,7. The independent actual original p33–39 illustrated/numbered seven-page chapter contains **exactly 1,680 GP runes**, hence **840 successive native two-rune field pairs**. This creates one length-exact candidate for interpreting `g^0,...,g^839` as a field key stream.

The strongest counterargument is **source selection**: p8's red pair is printed [4,3], so reversing to [3,4] is an analyst-selected convention; no source instruction points from p8 to p33–39, mandates GP pairs, sets the power clock or states that the generator should be used as an additive or multiplicative pad. This test does not treat exact matching cardinalities as evidence of author intent.

A separate p3 red triad already supplied a different primitive GF841 generator and similar p33–39 period840 analysis. Prior research also tested the discrete-log transformation `log_g(C)` of this exact new p8 source primitive and found nonprose. This study tests the **distinct original-value-changing primitive-power pad** before entertaining a more complex transform.

## Four frozen source-native inverses

Take the 1,680 unmodified original p33–39 GP29 rune indices continuously, including every true page/word boundary, as ordered 840 coordinate pairs `C_j=(C_2j,C_2j+1)∈K`. Use only printed source field basis `(1,α)`, `g^j` starting at the first p33 rune pair (`j=0`), no fitted phase or alphabet, and one of these four literal decoding rules:

| Literal receiver | Full 1,680 decoded GP29 IoC | Outcome |
| --- | ---: | --- |
| `C_j−g^j` | 0.034399728 | Nonprose |
| `C_j+g^j` | 0.034456451 | Nonprose |
| `C_j/g^j` | 0.034375620 | Nonprose |
| `C_j·g^j` | 0.034464959 | Nonprose |

The unchanged original chapter has IoC **0.0343600216**. Every output remains within **0.00011** of the uniform-source collision rate and far below genuine GP-native long prose. No substantial original plaintext appears in any output. Re-encryption restores all **1,680** original runes under each matched inverse, and synthetic source-native plants built from the authentic solved p57 95-rune text are recovered exactly. These controls establish arithmetic correctness, never a historically authentic key.

## Reproduction and next decision

[Standalone Windows/Node22 CommonJS source SFT](../sims/lp2_p7_p8_g840_p33_39_orbitpad_original_sft.cjs) validates p8 actual title products, source p7 polynomial, exact primitive order840 and orbit uniqueness, p33–39 unchanged physical page lengths **[214,261,271,238,228,228,240]**, four original transformations, and original/solved source exact inverses.

**Retire this explicit four-member `g^j` field-pad interpretation.** The 840 coincidence remains a hypothesis generator but does not justify secret page-specific phases, further fitted field permutations or arbitrary decoder stacks. Future work needs a first-party clue selecting **how** the field state interacts with original GP ciphertext, an independently verified plaintext fragment, or new historical source key material.
