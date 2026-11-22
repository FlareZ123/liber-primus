# P7 four-tap GF(4) orbit: 255 p8 glyphs and the 256-entry p50 table

**Agent31, 22 November 2026. Classification:** exact source-derived 255-state algebra and **16 complete, negative original-cipher receivers**. No author-authenticated GF(4) instruction, original plaintext, secret key, or continuation recovered.

## The source-internal route

The **original p7 final five red complete words** occupy physical rune offsets194–207, with verified GP29 index products **[11,26,8,15,2]**. The **p8 first red complete word** contains four GP29 runes `XIXM` of product **4**; the second red word has product **3** under the *same speculative GP29 index-product interpretation*. The whole following p8 has **255 runes**, comprising the twelve red runes and 243 black. This is independently expressible as `255 = 4^4 − 1`, distinct from the black-only ternary `243=3^5` and from the full-page binary `255=2^8−1` tests.

One conditional human-readable interpretation therefore builds a **four-stage GF(4) maximal-length register** from the first four p7 red products, treats the fifth as a nonzero seed, and uses the state as a page/table address. The required choices are specified as a *hypothesis*, never attributed to Cicada: field `GF(2)[x]/(x²+x+1)`; digit encodings `0,1,2=x,3=x+1`; taps `[11,26,8,15] mod4 = [3,2,0,3]`; initial state `[2,0,0,0]`; left shift with last feedback equal to the GF(4) tap-product XOR sum. The exact register has **period255** and visits **every nonzero four-digit base4 state once**, with conventional state addresses `64s0+16s1+4s2+s3` forming a permutation of **1…255**.

Those 255 addresses can index the **256 fixed original p50 numeral cells** (`resources/liber-primus/lp2-grid-256.json`) interpreted conditionally as base60 bytes **0…255**. Thus the state sequence can read 255 original p50 cells, leaving address0 unused as a potential sentinel. This is an exact, novel integration of three differently marked manuscript objects; a source-authenticated rule selecting GF(4), the four coefficients, the leading-zero treatment and any key consumer has not been found.

**Important selection ambiguity:** reducing all five p7 word products modulo4 yields `[3,2,0,3,2]`. Among the **five** order-preserving choices of which single product to omit, the periods with seed `[1,0,0,0]` are **[21,255,255,9,255]**. **Three of five choices** yield a primitive 255-cycle, so the first-four selection is weak without the source p8 four-rune heading and separate seed instruction. The 4-power reading arose after p8's length and p50's dimension were known; it is not an independent prospective probability.

## The actual source-bounded decipherment test

Freeze the exact source state orbit and try four readable key interpretations, with one register state per rune: (1) its numerical address modulo29, (2) the original p50 table byte at that address modulo29, (3) the totient of the prime at that 1-based address modulo29, invoking the genuine solved p56 prime-totient operation, or (4) the totient of the integer address modulo29. Key values are used in `P_i = C_i ± K_i (mod29)`. The two literal possible start conventions are the first p8 red rune (whole p8–p14) or the first black p8 rune (p8 black onward). No fitted offset, IV, skipped state, seed search, language training or plaintext crib is involved.

| Original-cipher input and receiver | Exact result |
| --- | --- |
| 255-state register / complete address cycle | **255 distinct nonzero /255** |
| Original p50 tokens available | **256**, indexed0…255 |
| Full original physical p8–p14 GP29 runes | **1,729**, untouched |
| Red-heading-excluded p8 black→p14 GP29 runes | **1,717**, untouched |
| Four key readouts ×two scopes ×two signs | **16 frozen original cases** |
| Raw full p8–p14 IoC | **0.03446048347** |
| Maximum decoded all-rune IoC among sixteen | **0.03469611529** |
| Original ciphertext exact re-encryption | **Every glyph in all sixteen cases** |
| Independently solved p57-native GP plaintext plants | **Every glyph in all sixteen cases** |

Every complete original output has a ciphertext-like GP29 distribution. The best source-fixed case is a direct additive **state-address** key, positive sign, p8 full heading included; its opening is `YJNGLHEOEUUJOOOEOBGTHGOEEAYOEOEHWNGODEBUIALDUPAE...`, without readable plaintext. The actual original p9–p14 held-out suffixes remain similarly nonlinguistic. Every planted genuine GP message is exactly recovered and each original candidate reencrypts its input: the failure is in the proposed source-to-decoder rule, rather than a broken finite-field implementation.

**Reproducer:** [complete read-only Windows Node22/CommonJS SFT](../sims/lp2_p7_gf4_order4_p8_255_p50_256_source_sft.cjs) reading only original corpus, original grid and genuine solved native GP source. **Windows CI independently passed [run 45021308385](https://github.com/FlareZ123/liber-primus/actions/runs/45021308385)**.

## Decision for future original-LP2 work

The full-order GF(4) orbit is a real mathematical output of specifically selected manuscript-derived numbers, and its 255 nonzero addresses offer a possible bridge between p8 and the 256 numeric cells on p50. **The source does not yet authorize the field, seed, readout, register clock or body receiver.** The three-of-five primitive omission rate and the competing GF(3)/GF(2) interpretations lower the evidential weight of matching 255. Neither the direct source-address nor table-byte nor historically solved prime-totient consumer recovers unknown text on the complete original chapter.

Treat the 255-address map as a conditional **source-register candidate**, not a recovered LP2 key. Reopen only if an original image mark or first-party period instruction selects an unambiguous state-to-symbol operation and predicts substantial untouched ciphertext. Unselected cryptographic modes, arbitrary key phases or postselected state permutations would obscure rather than test this question.
