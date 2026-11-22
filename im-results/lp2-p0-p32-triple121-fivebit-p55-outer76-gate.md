# P0/P32 original three-share XOR packed into the p55/p50 76-byte register

**Agent 37, 17 November 2026. Original-source terminal inverse: negative.** No previously unknown Liber Primus plaintext, authentic key, encryption method or destination is recovered. The exact five-bit packing and p55 receiver below were implemented on the original 12,956-rune corpus and 256 printed table cells, then executed in [Windows Node.js 22 Actions run 44157637286](https://github.com/FlareZ123/liber-primus/actions/runs/44157637286) with **success**.

## Why this finite original operation was worth testing

Physical LP2 p0 has exactly **262 GP29 ciphertext runes**. Its first printed line has a **13-rune red heading followed by seven black runes**, leaving exactly **242 = 2 × 121** runes. Physical p32 independently carries **121** runes with an 11×11 row-major layout and independently verified 563/569 prime-sum axes. The p0/p1/p2 artwork shows two half-turned crosses. A historically real 2014 Cicada stage used three-part bytewise XOR.

The three **121-rune** streams can be mapped, without a guessed alphabet, to three streams of five-bit GP ordinals 0–28 and XORed to five-bit values 0–31. The **121 × 5 = 605 bits** pack, MSB-first with exactly three trailing zero pad bits, into **76 bytes**. Two other original objects both have exactly this size: physical p55 has **76 ciphertext runes**; the 32×8 printed p49–51 table has a **76-cell external perimeter**. The p55 tree motif is shared with p32's blurred tree. These are source count/geometry observations, but no author-signed instruction connects these three separate objects or selects the following key operation.

This experiment therefore froze one reversible family rather than expanding offsets, secret mappings or wordlists. It differs from the [earlier 121-rune three-share direct GP29 test](lp2-p0-two121-p32-triple-share-original-gate.md), which rejected direct modular addition and literal GP-symbol XOR: here codes 29–31 are allowed as an **intermediate binary stream**, packed into 76 *bytes*, with a separate 76-symbol original ciphertext receiver.

## Exact entire-source experiment

Let `A` be original p0 indices20–140, `B` p0 indices141–261, and `K` all 121 p32 indices. For each i=0..120 form `T_i = A_i XOR B_j XOR K_k`; j and k are independently the original index i or its 180° reversal 120−i. Concatenate every five-bit `T_i`, either most- or least-significant bit first within a five-bit digit, and pad exactly three zero bits at the end. This yields an explicit 76-byte stream `D` with no fitted offset. In every output, `D[75] mod8 = 0`, a necessary padding invariant.

Read the original p49–51 base60-to-byte table in its 32×8 printed layout. The source-natural **clockwise external perimeter** `R` starts at the top left, traverses all top cells, right edge, bottom reversed, then left upward, covering 76 distinct positions. Use either `D` or `D XOR R` as a 76-byte key. At the same rune index i of the original p55 ciphertext, decode `P_i = (C_i ± (key_i mod29)) mod29` without dropping runes, moving words, changing IVs or tuning a permutation. The eight source-side 5-bit arrangements, two byte consumers and two additive signs give **32 complete original 76-rune candidates**.

The literal source byte identity question is even stronger: if the two candidate 76-byte streams were printed copies of one another, `D_i == R_i` throughout. Across the eight five-bit arrangements, exact same-position bytes are **[0,0,0,0,2,1,1,0] out of76**; their bitwise Hamming distances from the original perimeter range **288–312 out of608 bits**. No 76-byte copy relationship exists in the tested source orders.

### Entire original-cipher outcome

| Complete tested condition | Measurement |
| --- | ---: |
| Largest p55 GP29 IoC after all 32 model variants | **0.04280701754** |
| Winning model | Both B and K reversed, MSB-first, unmasked D, ciphertext minus key |
| Literal winning plaintext opening | `HHIEODTHNGDCFCDSMSOEAEATNHRBNOECGTIAHTHI...` |
| Position-shuffle null, preserving all 76 original p55 rune identities, 20,000 draws | **9,368** null maxima ≥ observed best |
| Family-max plus-one upper tail | **0.46842658** |
| Null median / 5th / 95th percentile of **best-of-32** IoC | 0.04245614 / 0.03929825 / 0.04736842 |
| Every reversible synthetic native p57-GP language plant | **76/76** recovered in all **32/32** branches |

The preserved-source null uses Fisher–Yates shuffles of all 76 original p55 rune identities, xorshift32 state `0x37af3301`, and reselects the best of the same 32 hypotheses on **every** draw. Thus a value of 0.04281 does not become evidence merely because it is the maximum. All literal original outputs remain nonlinguistic under the standard GP29 transliteration. The positive plants use 76 actual source-clear p57 runes and verify the complete exact reversible GP mapping under every original key branch. Successful roundtrip is an implementation control, not evidence of historical use.

## Decision and remaining route

**Retire the direct, source-aligned 121-rune three-share GP5 XOR → 76-byte packing → optional p50 ring XOR → 76-rune p55 modulo29 consumer.** The 76-byte capacity match is exact and externally visible, but the source gives no authentic instruction selecting these pages or receiver; the full bounded decode fails a proper family-max native-ciphertext null and yields no contiguous English. It does not refute other binary encodings of the original three streams, independently authenticated keys, or a missing source instruction selecting a different consumer. Do not enlarge this unsuccessful branch through secret rotations or ciphertext-fitted bit orders.

**Reproduction:** [standalone, read-only Windows Node.js 22 SFT](../sims/lp2_p0_p32_three_share_p55_76byte_sft.cjs) asserts original lengths and SHA-256 of the 256-byte table `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`, every original byte-identity/Hamming result, complete original candidate outputs, source-normalized null, and 32 native GP positive recoveries. [Completed passing source-original Actions run](https://github.com/FlareZ123/liber-primus/actions/runs/44157637286). The main [results/README.md](../results/README.md) remains the authoritative synthesis; this is a bounded rejected construction, not an established decryption.
