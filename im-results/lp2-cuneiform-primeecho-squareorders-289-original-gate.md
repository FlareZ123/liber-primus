# A source-defined 289-prime interpause window linking the 2013 display and 2014 magic-square orders

**Agent20, 22 November 2026. Classification: new exact cross-round arithmetic and a rejected narrow original cipher consumer, with a conditional possible key source.** No plaintext from the unsolved Liber Primus pages, original first opcode, author-confirmed secret key or final destination has been recovered. The equalities below are verifiable properties of independently preserved first-party materials. Whether Cicada intended their joint use remains unresolved, particularly because the 2013 display predates the 2014 square protocol.

## Human-visible inputs, with no LP2 ciphertext fitting

The archived original 2013 CicadaOS prime_echo program prints every prime from 2 to 3301 and inserts its two exceptional two-second pauses *only* at **1033** and **3301**. The otherwise regular delay is 0.05 seconds. The LP2 cuneiform section physically repeats these two numbers in Babylonian sexagesimal notation. The printed 2014 Stage10 signed square-solving form requests three independently identifiable squares, in order: **5 by 5 with row sum 3301, 7 by 7 with sum 1033, 5 by 5 with sum 1033**. The exact original three matrices are preserved as resources/cicada2014-openpuff-magic-squares.txt. These are relevant source constraints and were fixed before examining any numerical behavior of original LP2 ciphertext.

The three genuine matrix orders are **5, 7, 5**. They produce two small integer values through two ordinary symmetric operations:

| Calculation on the authentic orders | Exact result | Original 2013 prime-display correspondence |
| --- | ---: | --- |
| Product 5×7×5 | **175** | The 175th prime is **1039**, the first printed prime *after* the 1033 pause |
| Sum 5+7+5 | **17** | Potential square side length |
| Square of sum 17² | **289** | The number of primes strictly between the two exceptional pauses |
| Product + square of sum 175+289 | **464** | The 464th prime is **3301**, the second exceptional pause |

The one-based ordinal boundaries are **prime(174)=1033; prime(175)=1039; prime(463)=3299; prime(464)=3301**. The exact interval is therefore all **289** successive primes at ordinals **175 through 463**, with endpoints **1039 and 3299**. It can be arranged as a **17×17** matrix with no chosen prime omissions, repeated values or adjusted output size. The historical 2014 LP1 plaintext line **THE TOTIENT FUNCTION IS SACRED**, written with its source GP ligature for IA, also has an independently computable original Gematria Primus prime-value sum **1039**, which singles out the same first post-pause prime. This LP1 line is a published authentic source, not a postulated LP2 phrase.

The previously documented original Stage11 HTML pair title **133** and division identifier **331** has the sum **464**, coinciding with the second prime ordinal. This is a further shared number, but the 133/331 pairing is already separately analyzed in im-results/2014-stage11-133-331-prime464-original-gate.md and supplies no additional cipher rule here.

**Interpretation and objection.** The authentic square orders and the authentic prime pauses supply an economical, exact source-derived *candidate key sequence*: 289 concrete public primes. The operation of taking a product, adding a squared sum, arranging the intervening primes into 17 columns, and choosing a consumer is *not printed* in the recovered Cicada instructions. Observing identities retrospectively is insufficient to classify the entire chain as intended. The 2013 pauses and 2014 row sums both prominently contain 1033/3301, so they are correlated source motifs, not independent samples for a significance claim.

## Original 139-rune test with a sealed 91-rune recipient

A direct test can be made without deciding whether the above arithmetic is intended. The only authenticated known full-book-class GP29 arithmetic inverse is the solved p56 prime-totient stream with literal plaintext-F bypass. Freeze that explicit historical operation as the prospective cipher consumer.

- **Key stream:** φ(p)=p−1 for all 289 source primes, reduced modulo 29. Try the original ascending printed-prime order or its unique conventional 17×17 *clockwise outer-perimeter to center* reading. The second order is motivated by the original 2013 message that the key is all around the player and by an original Fibonacci spiral elsewhere in LP2; it is still a speculative reading.
- **Original receiver:** all five intact printed p36–p38 numbered units, lengths **139,91,98,96,129**; p36 [99,238) is the first decisive target, and p37 [0,91) is the independently held-out second target. Key starts at the beginning of each separately red-numbered unit. Test both additive signs with exact F-transparent nonconsumption.
- **Exact arithmetic test:** if an original ciphertext rune is F, allow a literal plaintext F emitting unchanged F without advancing the key, alongside the legal ordinary consuming alternative; if an original ciphertext rune is non-F, require an ordinary consuming decryption to a non-F plaintext rune. Track *all* possible key cursor states to exclude a complete decode only when every path fails. Use no plaintext score or other secret parameter.

| Source key traversal | C = P + φ(prime) | C = P − φ(prime) |
| --- | ---: | ---: |
| Ascending 289 original source primes | First impossible at item1 offset **68**, item2 offset **57** | First impossible at item1 **110**, item2 **12** |
| Clockwise 17×17 outside-to-center spiral | First impossible at item1 **36**, item2 **33** | First impossible at item1 **21**, item2 **12** |

Offsets are **zero-based runes within the exact numbered items**. Every item1/item2 result is an *exact finite-state contradiction* to a literal p56-style inverse, well before language scoring. The program also encrypts known genuine p57 GP-native plaintext (cycling it only to build complete-length synthetic controls) with every tested key and every relevant item length, then recovers a legal original plaintext history. All four cipher consumers pass those positive controls. The tests do **not** disprove a 289-prime source with a different source-selected operation, a third cipher layer, or a missing historical instruction.

**Exact runnable source test:** sims/lp2_1033_3301_squareorders_interpause289_sft.cjs. Inputs are the original source shell transcript, original 2014 recovered square matrices, the canonical GP29 LP2 ciphertext and source p57 cleartext. No mutable data or guessed key values enter this test. [Windows Node.js 22: **PASS**, successful exact source and original-cipher test](https://github.com/FlareZ123/liber-primus/actions/runs/45059396451).

## Sexagesimal 578-to-553 digit packet: a conditional full-unit test

Each of the **289** source-bounded primes **1039..3299** has exactly two **base60 digits**, directly motivated by the original cuneiform numeric writing. Thus the complete authentic interpause prime source encodes **578 digits**. The five original red-numbered passages contain **553 runes**; the exact excess **25 = 5×5** equals the 2014 source's square order. This permits a hypothesis of 25 header digits followed by one digit per ciphertext rune. There is **no first-party instruction** to omit these 25 digits, assign the remaining digits as GP29 keys, or select this packet division.

A fixed first-opcode experiment uses original base60 digit pairs high-first in ascending prime order, mapping each digit modulo29 into the solved p56 GP29 additive-key inverse with its true plaintext-F transparency. The source stream begins at original digit offset **0** or the conditional after-header offset **25**. Both arithmetic signs are tested once. Key consumption is continuous across the five numbered units; at every visible ciphertext F, the inverse retains *every* legal nonconsuming plaintext F or consuming non-F path.

| Digit source start | C = P + K item1 / item2 first impossible offsets | C = P − K item1 / item2 first impossible offsets |
| ---: | --- | --- |
| 0 | **27 / 13** | **2 / 0** |
| 25 | **7 / 37** | **survives full139 / 19** |

All first-impossible positions are zero-based within the untouched 139-rune original item1 and the independently printed 91-rune item2. The item1 survivor for offset25/minus is a **necessary cipher compatibility only**, not recovered plaintext: its direct no-F whole-553 GP29 IoC is **0.03387321** with no sustained language, and the independent item2 is algebraically impossible by its 20th original rune. The exact SFT includes a genuine native-GP 139-rune positive ciphertext accepted by the same F-transparent inverse, preventing an implementation-induced false exclusion. Full 553-source readouts remain ciphertext-like. The expanded [Windows Node.js 22 source-original and native-plant run 45060033734](https://github.com/FlareZ123/liber-primus/actions/runs/45060033734) **passed**.

**Research decision:** retain 578 = 25 + 553 solely as a conditional source-framing lead; reject these exact direct sexagesimal digit-to-rune consumers. An author-selected opcode and role for the 25 excess digits are needed before pursuing separate offsets, read orientations or a keyed block receiver.

## Cryptanalytic consequence and next discriminating action

The new connection narrows a historically plausible *public* key-material candidate to **289 named original prime values** and a natural 17×17 geometry. It supplies no decoded text. The original document tells us to find the next **typed opcode**, not to iterate arbitrary transformations of the 289 values. Further work becomes justified if a genuinely first-party instruction supplies the row/column/ring readout or a cipher emitter; then the frozen 139-rune first passage can be tested immediately and must reencrypt exactly, with the independent 91-rune second passage as an untouched confirmation. Without such a selector, do not generalize this narrow negative into a full prime-source impossibility claim or begin a blind phase/geometry sweep.

The prior 290-prime inclusive sequence after1033 through3301 was directly tested under various p33–39 transforms in im-results/lp2-cuneiform-prime-echo-290-key-gate.md. The present source observation is distinct: it specifies the **strict 289-prime interior**, one exact **17×17** register and an independent historical **three-square arithmetic relationship**. It also demonstrates that the simplest original authenticated totient consumer is not its first decoder for the printed five-unit block.
