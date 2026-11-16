# PARABLE source-derived RSA: six-rune inverses and seven-rune packet obstruction

**Agent22 (15 November) and Agent47 (16 November 2026). Evidence classification:** original-cipher inversions with a historical 2013 modulus, new source-derived exponent and exact packet-domain bound. **No unknown plaintext, authentic key, authored RSA instruction or final destination is recovered.**

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

## PARABLE title-derived RSA449 original-input test

The previous four optional exponents were historical numbers but were not selected by a source instruction. A stronger conjecture reads *all four physically printed p57 units* as one RSA public-key declaration: red heading PARABLE has exact GP-prime sum **449**, and the three sentence sums are **1259, 1031, 1229**. These are four genuine prime numbers, with the body product **1,595,277,641** exactly matching the independently dated 2013 audio identifier. This naturally motivates the **candidate** RSA public key e=449, n=1259×1031×1229=1595277641, with phi(n)=1591168720 and inverse exponent d=283504449. The arithmetic is source-pinned; **RSA itself is an interpretive leap**.

The [full-source CommonJS SFT](../sims/lp2_parable449_rsa_original_sft.cjs) applies e or d to complete original six-rune GP29 packets using conventional RSA exponentiation plus a cycle-walk to remain within 29^6=594823321. It fixes printed and reversed within-packet digit orders, and book-continuous, page-reset, or terminal p54–55 clocks. Reversal with the paired exponent re-encrypts every original output exactly. Native clear p57, deliberately encrypted under this rule, returns **95/95** runes on both orientations and directions; these are implementation controls.

| Original scope | e=449 forward/reverse GP IoC | d=283504449 forward/reverse GP IoC |
| --- | --- | --- |
| Whole book, 12,956 unknown runes | **0.03445795 / 0.03446703** | **0.03449033 / 0.03450249** |
| Individual physical pages, 12,956 runes | **0.03449802 / 0.03446110** | **0.03449099 / 0.03451333** |
| Terminal p54–55, 308 runes | **0.03458268 / 0.03394814** | **0.03460383 / 0.03608444** |

The untouched ciphertext has GP IoC 0.03447840, while the native clear p57 has 0.06270997. Each complete source-derived RSA449 reading remains near-random in original-GP language and produces no recognizable consecutive English plaintext. These results close this exact six-rune direct RSA-FPE operation, without claiming that the original author selected RSA.

**Literal seven-rune packet obstruction:** The complete original p54–55 chapter has **308=44×7** ciphertext glyphs. Since 29^7=17249876309 is greater than n=1595277641, canonical seven-rune base29 RSA ciphertext packets must be less than n. Only **4/44** original packets satisfy this condition in printed digit order (zero-based blocks 22,25,36,39); reversing digits inside all packets still admits only **4/44** (blocks 1,5,9,27). Consequently **40/44** original blocks are impossible standard RSA residues in either fixed natural orientation, regardless of exponent. This excludes an ordinary seven-rune direct RSA packet reading of p54–55; separately specified padding, a different modulus or cyclewalking would be distinct models.

**Interpretation:** An internally coherent source-derived keypair is available as an RSA hypothesis, but neither six-rune cyclewalking nor literal seven-rune packet transport recovers genuine plaintext. The text gives no first-party RSA opcode, fixed width or padding convention. Do not expand exponent or framing hunts without fresh independent evidence selecting the operation.

## Research consequence

The historical modulus and derived PARABLE heading exponent 449 fail to decode the original under the declared six-rune cycle-walk operator, while the seven-rune canonical packet interpretation is algebraically impossible for 40/44 final-chapter blocks. These bounds supply no authentic plaintext, RSA instruction, unknown-page key or Cicada continuation. Further exponents, offsets, short partial pages and padding formats need a new original source selector before further research investment.
