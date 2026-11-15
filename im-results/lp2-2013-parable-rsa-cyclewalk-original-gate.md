# Source-linked Parable integer as a six-rune format-preserving RSA cipher

**Agent22, 15 November 2026. Evidence classification:** a finite original-cipher inverse screen, with an exact 2013 numerical operand and synthetic solved-page controls. **It recovers no previously unknown Liber Primus plaintext, key, or intended cipher operation.**

## Source selected operand and missing instruction

The separately documented 2013 audio challenge contains the numeral **1,595,277,641**, which factors as **1259×1031×1229**, the three established GP-prime clause sums of the authentic clear LP2 p57 *PARABLE* page. The numeric 2013 association and previous PRNG-seed screens are recorded in [the original audio investigation](../sims/audio761_numeric_prng_seed_probe.cjs). The separately first-party signed 2013 TCP service teaches modular Diffie–Hellman and BASE29; this makes an RSA-style public integer an operationally intelligible exploratory hypothesis, yet **no source instructs the solver to treat 1,595,277,641 as an RSA modulus for LP2**.

Using only the source-derived three primes, define `n=1,595,277,641`, `φ(n)=1,591,168,720`. A GP29 word-preserving RSA implementation would need extra framing instructions that are absent. The bounded model here instead uses exactly **six GP29 runes per block** because `29⁶=594,823,321 < n <29⁷`. Read each complete six-rune block as a base29 integer, map it through RSA exponentiation modulo `n`, and *cycle-walk* until the result is again in `[0,29⁶)`. This is a bijection of the whole six-rune source domain: original rune length never changes, and the private-exponent inverse recovers the exact six original symbols. It supplies a rigorous test without guessing padding, image placements, or a plaintext value.

Four independent historical numerals supply a **small, predeclared exploratory exponent menu**: `e=3301` (Cicada number), `e=761` (audio file name), `e=167` (reported audio duration), and `e=23` (signed 2013 DH example modulus). None is authenticated as an RSA exponent. Each has a modular inverse modulo `φ(n)`. The within-block digit order is original MSB-first or reversed; reset either at the entire ordered 55-rune-bearing unknown-page stream or at every physical source page. There are **4×2×2=16 exact original inverse readings**. This is a bounded decision, and the original source does **not** select one of these RSA registers over rival ciphers.

## Original-cipher outcome

Input is the exact canonical original `resources/liber-primus/lp2-corpus.json`: 12,956 unknown physical pp0–55 GP29 runes (rune-free p50 excluded), with solved clear p57 as an independent positive. At global clock, 12,954 runes form 2,159 complete six-rune blocks; under individual physical-page resets, 12,804 runes are complete, leaving page-local tails deliberately unconsumed.

| Public exponent | Original six-rune order: global / page-reset IoC | Reversed six-rune order: global / page-reset IoC |
| --- | --- | --- |
| 3301 | 0.03447022 / 0.03445811 | 0.03448651 / 0.03449028 |
| 761 | 0.03445657 / 0.03446363 | 0.03450446 / 0.03445485 |
| 167 | 0.03455621 / 0.03448051 | 0.03447602 / 0.03447247 |
| 23 | 0.03446759 / 0.03453376 | 0.03451372 / 0.03450604 |

Unchanged original 12,956-rune ciphertext IoC is **0.03447840**; authentic clear p57 IoC is **0.06270997**. None of the sixteen readings lifts the original near-uniform aggregate distribution into native GP29 prose. The source-six-rune e3301 p0 opening is nonlinguistic; this study **does not exhaustively exclude short decipherable windows**, which can be hidden within a uniform-looking aggregate. It excludes only an ordinary full-stream native-GP recovery under these declared fixed RSA-FPE models.

**Positive controls:** for each of the eight exponent×orientation pairs, encrypt the exact first 90 source GP29 runes of solved p57 under the same cycle-walking map, then decode under its mathematically derived exponent. All **8/8** source-native controls return **90/90** runes exactly. The test asserts page counts, source rune inventories, exponents, domain bound, modular inverses, original IoCs and whole/page-reset outcomes.

[Read-only reproducible CommonJS SFT](../sims/lp2_parable3prime_rsa_cyclewalk_sft.cjs) uses built-in Node22 modules, `BigInt` modular arithmetic, and the untouched canonical indexed corpus. The same inverse computations and source statistics were executed directly against fetched, unchanged repository corpus in this invocation.

## Research consequence

A source-known RSA modulus alone does not specify cipher receiver, exponent, padding, block resets, or the authority of a signature. These sixteen natural initial models fail to recover unknown prose. An intended RSA continuation would require an independent period-authenticated rule selecting those missing inputs, or authentic ciphertext provenance linking a block to the modulus. Additional arbitrary exponents, offsets, short partial pages, and speculative padding schemes would be unconstrained searches, so they are not justified by this result.
