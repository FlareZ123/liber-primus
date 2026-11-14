# LP2 pp49–51: a three-share route from the H/G grid quotient to an actual known key

**Decision (Agents 11/12, 14 November 2026): original-input negative for eight source-fixed three-share interpretations all stationary three-input key readouts for contiguous blocks, every stationary GF29 polynomial readout through degree five for adjacent triples, and every rational readout through degree four for adjacent triples.** No unknown LP2 plaintext, historical key, complete decoder or continuation URL was recovered. This is a new **three-to-one consumer** of the existing H/G quotient, distinct from the previously excluded one-of-three quotient-lane alphabet correspondences in [the direct 84-key test](lp2-q252-p56-authentic84-allsecret-key-gate.md). The complete read-only [Node.js 22 SFT](../sims/lp2_p50_three_share_p56_source_gate_sft.cjs) pins the original source SHA, authentic p56 decoder and exact original target runes.

## A concrete path a historical solver could have tried

The original 32×8 numerical grid gives 256 row-major base60 byte values. Under the independently published 2013 signed BASE29 example and the p39 original red triad, its polynomial of GP29 byte residues is exactly divisible by two quadratic factors:

- `H=3+26x+24x²`;
- `G=27+5x+15x²`;
- `H·G=23+21x+11x²+17x³+12x⁴` over GF29.

The full 256-coefficient polynomial has four vanishing remainder coordinates, leaving a **252-symbol quotient**. The historically solved p56 uses **84 consumed prime-totient shifts** for its 85 GP29 runes, because one plaintext F is passed through. Hence **252=3×84** supplies a possible full-size recipient for exactly *three* field streams. Historical Cicada 2014 stages genuinely XORed three OutGuess-derived byte strings, giving a period-authentic reason to consider a three-share consumer.

**Crucial distinction:** the genuine historical XOR is on bytes; a sum of three GF29 residues is only a plausible mathematical analogue. No surviving Cicada instruction says that this table quotient encodes p56's 84-key stream, chooses block or triplet interleaving, or places such a key on unknown pages. The length equation is source-derived but its meaning remains speculative. The conventional base60 and H/G parsing are themselves conditional on the retrospectively identified polynomial relationship.

## Frozen cipher/key tests

Divide the *original* 256 byte-residue polynomial by H·G in descending printed order and verify the quotient starts `[0,12,9,28,2,25,23,21,18,28]`. Group its 252 original GF29 elements as three consecutive 84-element blocks, or as 84 adjacent triples. Reduce each triple's sum mod29. The only original known-key target is **the entire historical p56 keystream**, derived anew as `(prime_i−1) mod29` for the first 84 ordinary primes. No free phase, rotation, seed, key fit or alphabet relabeling is selected by textual scores.

| Frozen three-share reading | Exact p56 key elements | Pairwise equal/unequal contradictions vs. authentic key | Different derived symbols |
| --- | ---: | ---: | ---: |
| Three 84-element blocks, summed mod29 | **3 / 84** | **200 / 3,486** | 29 |
| 84 consecutive three-element triples, summed mod29 | **10 / 84** | **207 / 3,486** | 26 |

The ten matching symbols in the second row are scattered (indices 2,15,21,29,31,38,42,43,57,80). They were noticed after choosing the operation and do not constitute an authenticated 10-rune fragment. **Both rows mathematically fail even with any additional secret, stationary GP29 alphabet bijection** because a bijection preserves equality between positions and these comparisons have hundreds of equality contradictions. The second row also has only 26 distinct symbols versus 29 in the genuine key. Thus a complete p56 key is impossible within the specified two models; a more complicated hidden state would be a different, unselected cipher.

### Three-of-three Shamir polynomial interpolation, a distinct historical operator

Cicada's 2013 challenge genuinely used **Shamir secret sharing**, which makes a degree-two polynomial over the already source-selected GF(29) a more historically recognizable three-share consumer than a bare GF29 sum. Freeze ordinary share abscissas \`x=1,2,3\`. Three evaluations \`(y1,y2,y3)\` determine \`f(0)=3y1−3y2+y3 (mod29)\`. Apply this single fixed expression separately to the **three contiguous 84-element blocks** and the **84 adjacent quotient triples**, without selecting other abscissas or a secret by reference to the ciphertext. Compare each resulting 84-rune secret directly with the authentic p56 prime-totient key, then apply the same tape directly by GP29 subtraction to the entire original p55 and full pp54–55.

| Frozen Shamir quotient layout | Exact historical key matches | All-secret alphabet equality contradictions / 3,486 | p55 decoded IoC (76) | pp54–55 decoded IoC (308) |
| --- | ---: | ---: | ---: | ---: |
| Three 84-element blocks | **3 / 84** | **215** | **0.04245614** | **0.03403274** |
| 84 adjacent triples | **1 / 84** | **198** | **0.03192982** | **0.03462498** |

The longer untouched 308-rune original receiver stays close to random GP29 coincidence and neither output yields readable original plaintext. Hundreds of mismatched equality relations preclude the complete authentic 84-digit p56 key **even after an arbitrary stationary hidden symbol bijection**. A true quadratic polynomial with two independent source-internal coefficients, evaluated at 1,2,3, exactly recovers **84/84** authentic historical prime-totient keys by the same Lagrange inverse; a 76-rune genuine p57 GP plaintext plant and the 76 original p55 ciphertext symbols both round-trip under each tested key. This verifies the source-exact arithmetic and reversible consumer, without inventing any purported LP2 solution.

**Decision on this new operator:** the historical Shamir three-of-three interpolation, in either of the two source-natural 252→3×84 print orders with fixed abscissas 1,2,3, cannot supply the complete independently known key or a native-GP p55 decipherment. Other secret-share coordinates, nonlinear share encodings and unpublished author-selected operations remain untested, and none is licensed by this negative. The existing [single-file SFT](../sims/lp2_p50_three_share_p56_source_gate_sft.cjs) now includes these two interpolation cases alongside the earlier GF29 sums and actual byte-XOR comparisons.

For a distinct exact historical-operation comparator, treat the first **252 original byte values** as a systematic 252-byte data component and the final four as candidate GF29 parity slots, combine three 84-byte shares by actual XOR, and inspect all output bytes. The original printed-order data produce only **39/84** printable ASCII characters for contiguous blocks and **29/84** for interleaved triples, without any readable passage. The four-slot systematic framing is a hypothesis about the original polynomial, not author-authenticated file structure. No byte-stream payload was recovered.


The exact historical **byte-XOR** operation also permits a direct GP29 key test: XOR each source triple as ordinary bytes, reduce its value modulo29, and compare all 84 positions with the genuine p56 key before attempting the complete p55 inverse. Do this for both the 252 *original systematic byte cells* and the 252 *H/G GF29 quotient digits*. These are four additional, completely frozen source-layout mappings, with zero fitted phases or alphabet permutations:

| Historical XOR source / geometry | Matches to complete p56 key | Equality contradictions vs every fixed secret alphabet | Decoded original p55 GP29 IoC |
| --- | ---: | ---: | ---: |
| Original systematic 252 bytes, three blocks | **4/84** | 199 / 3,486 | **0.03228070** |
| Original systematic 252 bytes, adjacent triples | **6/84** | 195 / 3,486 | **0.03368421** |
| H/G quotient 252 GP29 digits, three blocks | **2/84** | 205 / 3,486 | **0.03859649** |
| H/G quotient 252 GP29 digits, adjacent triples | **2/84** | 206 / 3,486 | **0.02912281** |

All four outputs are nonlinguistic on untouched original p55 runes. Every output additionally contradicts the necessary equality pattern of the entire historical p56 key, even after allowing any unknown *fixed* alphabet bijection. This is a stricter source-operator test than inspecting byte-XOR output for ASCII alone: **an authentic historical XOR operation does not repair the missing p56 or p55 key handoff** within these direct encodings. The [same standalone SFT](../sims/lp2_p50_three_share_p56_source_gate_sft.cjs) now asserts all four exact key matches and all four equality-conflict counts.

## Universal same-input/different-key obstruction for contiguous 84-blocks (Agent12, 14 November 2026)

A more decisive original-data witness applies to **every deterministic, position-independent mapping**, without specifying a functional form or any hidden coefficients. In the natural **three contiguous 84-symbol blocks** of the original source H/G quotient Q252, the 84 indexed input triples contain **one exact duplicate**:

- At zero-based quotient triple position **7**, the input is **(21, 10, 15)**. The actual p56 prime-totient key requires \(K_7=(19-1)\bmod29=\mathbf{18}\).
- At position **30**, the original three input values are **again (21, 10, 15)**. The known key requires \(K_{30}=(127-1)\bmod29=\mathbf{10}\).

The opposite original source order moves this duplicate to zero-based indices **53** and **76** (since 83−30=53 and 83−7=76), where the historical p56 key again conflicts (**18** versus **11**, primes **251** and **389**). Reversing the target key order as well preserves the original conflict. Thus the direct aligned forward and reversed-block orientations both fail without an unprovided phase adjustment.

The original primes are the **8th and 31st ordinary primes** (zero-based indices7 and30). Therefore **no deterministic function F: GF29³→GF29**, including an unrestricted lookup table, arbitrarily high-degree polynomial, highly nonlinear formula, or *stationary secret mapping*, can yield all 84 authentic p56 keys from the contiguous-three-block interpretation: identical inputs would have to produce both 18 and 10. This conclusion is algebraically absolute for the specified original source sequence, source grouping, and historical target key. It requires no English scoring or conjecture about cipher construction.

The alternative **84 adjacent triplets** have **84 distinct triples**, so no input-collision contradiction arises there; an arbitrary hidden 84-entry lookup can always fit the 84 known keys, but predicts no independent outputs. The constrained low-degree polynomial/rational exclusions below still apply to both geometries. The same source-exact SFT asserts the **unique** full input collision and both known historical prime/key values.

**Decision:** retire *all stationary, memoryless three-input key decoders* for the contiguous-block layout in one step. Even granting an **unselected arbitrary cyclic 84-key alignment**, this single duplicated triple already rules out **79 of 84** possible phase offsets; only offsets **7, 15, 73, 74, 77** escape the one-collision necessary condition. Those five phases are neither author-specified nor demonstrated to decode anything. The SFT asserts the complete finite phase count to prevent claiming an all-phase exclusion.

Reordering or adding a position/state input changes the hypothesis and requires independent source selection; it cannot be justified by the failed key reconstruction itself.

### Every stationary adjacent-triple decoder requires all three coordinates

The alternative 84 adjacent triplets have 84 distinct *full* inputs, but omitting **any one of the three input lanes** immediately creates a same-input/different-known-key contradiction:

| Retained original input lanes | First repeated input and zero-based positions | Required authentic p56 keys |
| --- | --- | --- |
| First and second | (0,21) at positions **25, 40** | **13 versus 4** |
| First and third | (15,18) at positions **7, 17** | **18 versus 2** |
| Second and third | (2,20) at positions **8, 16** | **22 versus 0** |

Consequently **no deterministic, position-independent function of one or two input lanes** can supply this historical key, regardless of its hidden complexity. Any stationary adjacent-triplet readout must depend on all three lane values in principle. Dependence on all three is merely a necessary condition; the full three-input polynomial and rational-function classes below remain independently ruled out through their indicated degrees. The exact witnesses are asserted against the unmodified original quotient in the same SFT. Do not inflate a three-lane necessary condition into evidence of an authored three-share cipher.

## Complete stationary three-input polynomial key-readout gate (Agent12, 14 November 2026)

The earlier sum, Shamir and byte-XOR consumers fix a particular three-share operation. One potentially productive extension is to **learn an unknown shared readout from the genuine solved p56 key**, then ask whether the full 84-position key is actually encoded by the untouched original Q252. Unlike inventing a key to decrypt the unsolved pages, the answer is independently known: the authentic p56 plaintext-F-skipping operation consumes precisely the first 84 consecutive-prime-minus-one GP29 shifts. This permits an exact algebraic test of an entire family with no language scoring or search across invented plaintext.

For each of the two source-natural 252-to-3×84 geometries above, write the three original quotient values as \(x_i,y_i,z_i\in\mathbb F_{29}\), and let the required authentic key be \(k_i=(p_i-1)\bmod29\), \(i=0,\ldots,83\). Ask whether **one stationary three-input polynomial** \(f(x,y,z)\) produces all 84 independently known symbols, granting completely arbitrary unknown GF29 coefficients. Total degree \(d\) has \(\binom{d+3}{3}\) coefficients. Exact Gaussian elimination over GF29 tests the augmented linear system for all 84 original positions; arbitrary coefficients are granted, so an inconsistency excludes every key in that class.

| Maximum total degree | Monomials | Three 84-blocks: coefficient rank / augmented rank | Interleaved triples: coefficient rank / augmented rank |
| ---: | ---: | ---: | ---: |
| 0 | 1 | 1 / **2** | 1 / **2** |
| 1, arbitrary affine | 4 | 4 / **5** | 4 / **5** |
| 2, arbitrary quadratic | 10 | 10 / **11** | 10 / **11** |
| 3 | 20 | 20 / **21** | 20 / **21** |
| 4 | 35 | 35 / **36** | 35 / **36** |
| 5 | 56 | 56 / **57** | 56 / **57** |
| 6 (complexity comparator) | 84 | 83 / **84** | 84 / 84 |

**New exact constraint:** every stationary polynomial readout of degree at most five fails on the *original* H/G quotient, regardless of its hidden coefficients, for both frozen layouts. Even degree six is inconsistent for the contiguous three-block layout. Adjacent triples at degree six have full 84×84 rank and can interpolate **any** target 84-symbol key, making the exact fit there uninformative: it spends 84 free parameters to reproduce 84 known key symbols and predicts no withheld key. There is no compressed or independently selected p56 key in the tested low-complexity family.

**Independent nonlinear class, exact full-key exclusion:** A source-driven extension can grant a completely secret **rational** readout \(f(x,y,z)=N(x,y,z)/D(x,y,z)\) over GF29, with arbitrary and independently chosen numerator/denominator coefficients up to a shared total degree \(d\), provided \(D(x_i,y_i,z_i)\ne0\) at every original input. This includes an unrestricted three-input Möbius/fractional-linear function at \(d=1\), a mathematically recognizable alternative to Shamir's polynomial interpolation. There is no authenticated source instruction to choose this operation.

The complete 84-key necessary conditions are *homogeneous linear equations* in the unknown coefficients: \(N(x_i,y_i,z_i)-k_i D(x_i,y_i,z_i)=0\). With \(m=\binom{d+3}{3}\) monomials per side, exact GF29 elimination gives the following independently source-checked ranks:

| Rational maximum degree | Unknown numerator + denominator coefficients | Three 84-blocks: exact rank | Adjacent triples: exact rank |
| ---: | ---: | ---: | ---: |
| 0 | 2 | **2** | **2** |
| 1 (fully general affine ratio) | 8 | **8** | **8** |
| 2 | 20 | **20** | **20** |
| 3 | 40 | **40** | **40** |
| 4 | 70 | **70** | **70** |

Every matrix has full column rank, so its **only** compatible numerator/denominator coefficient choice is the simultaneous zero polynomial pair, which has undefined \(0/0\) output. In other words, **no valid rational function of total degree ≤4 in each numerator and denominator can map all 84 source triples to the independently known authentic p56 key**, irrespective of hidden coefficients. The rational class is strictly different from polynomial readouts; its degree-one subclass already contains every stationary three-input fractional-linear map.

The same exact test recognizes a planted genuine degree-two rational map \((7+5x+11y+13z+3xy+4yz+2x^2)/(x^2+2)\) on *all 84 original source positions* in both geometries, giving a nontrivial kernel. The denominator never vanishes anywhere in GF29 because \(-2\) is a nonsquare. The preserved [standalone SFT](../sims/lp2_p50_hg_q252_polynomial_p56_84key_sft.cjs) checks this positive and all full-rank originals. Beyond degree four, enough free parameters can make retrospective fitting easy, so raising the degree without another source-selected instruction would be a poor route to an authentic predictive key.

An immediate, short witness exists already for arbitrary affine readouts \(k_i=a x_i+b y_i+c z_i+d\). The first four original rows have full coefficient rank four. The fifth row contradicts their unique fitted relation: for blocks, \(x,y,z,k=(2,27,27,10)\) produces a nonzero GF29 elimination residual **26**; for interleaved triples, \((17,8,15,10)\) gives residual **3**. A change of language score, source glyph, or affine coefficients cannot repair these exact original-key contradictions.

**Positive gate and scope:** the SFT plants a genuinely low-degree polynomial \(7+5x+11y+13z+3xy+4yz+2x^2\) into each unchanged source geometry and correctly recognizes all 84 planted outputs as degree-three-consistent. It pins the printed table's original byte SHA256, reconstructs H·G and Q252 exactly, and independently decrypts historical p56 to the known full message before using the 84 shifts as the target. [Standalone Node22 CJS original-input SFT](../sims/lp2_p50_hg_q252_polynomial_p56_84key_sft.cjs).

This is a **known-key constraint**, not an original unknown-page decryption. It does not reject nonlinear stateful functions with memory, changes of source geometry, a separate first-party key source, hidden byte channels, or an entirely different target for Q252. With no independent hint prescribing a high-degree 84-parameter interpolation, do not rescue the three-share hypothesis by increasing polynomial degree or fitting coefficients to unknown plaintext.

## Historical BASE29 triple-to-totient consumer: original p56 and p55/p0 gate (Agent12, 14 November 2026)

One distinct original-source operator could specify a key: the signed **2013 BASE29** example fixes positional radix29 notation, and authentic solved LP2 p56 takes GP29 keystream elements from the **Euler totient of consecutive primes**. The 252 quotient digits form exactly 84 three-digit base29 numbers under either the three-block or adjacent-triple layout. The proposed chain is *three digits → a number n → φ(n) modulo29 → a repeating 84-key GP29 additive shift*. The manuscript does not explicitly instruct three-digit grouping, totient application, or p55/p0 receiver; these are hypotheses. This nonlinear **integer number-theory** readout is distinct from the preceding GF29 polynomial and rational-function constraints.

Use every original printed quotient digit, fix both natural layouts, and consider both ordinary digit directions (big- and little-endian). All 84 integers fall in [1,29³−1], so φ(n) is defined without sentinels. Compare the complete derived key to p56's **84 independently known historical** prime-totient shifts. Then, regardless of mismatch, try each tape on **all 76 untouched original p55 runes** and **all 262 untouched original p0 runes** with the historical P=C−K mod29 rule and straightforward periodic clock.

| 84 three-digit BASE29 grouping | Exact historical p56 key symbols | p55 original decoded GP29 IoC | p0 original decoded GP29 IoC |
| --- | ---: | ---: | ---: |
| Three 84-blocks, big-endian | **0/84** | 0.04140351 | 0.03360533 |
| Three 84-blocks, little-endian | **3/84** | 0.03859649 | 0.03340060 |
| 84 adjacent triples, big-endian | **5/84** | 0.02947368 | 0.03465824 |
| 84 adjacent triples, little-endian | **4/84** | 0.03368421 | 0.03322512 |

No original decoded output contains coherent GP prose. The longer p0 readouts remain close to uniform; the short 76-rune IoC fluctuations are not plaintext evidence. The three-block big-endian first eight source integers are **803, 10470, 7946, 23668, 2492, 21699, 19558, 17966**, with totients **720, 2784, 3808, 11520, 1056, 14460, 7560, 8280**, fixing the calculation. All four complete tapes re-encrypt their respective original ciphertext exactly, and an independently GP-native 76-rune passage from solved p57 is encrypted and recovered **76/76** under every tape.

**Authentic plaintext-F bypass, exact original-path consequence.** The solved p56 rule passes plaintext F literally and does not consume its key; ciphertext F can also be ordinary encrypted non-F. To avoid treating the more convenient every-rune additive clock as historical fact, the SFT enumerates **every legal key clock** under that actual mechanism, allowing all ambiguous ciphertext F events with no language constraints. The real p56 85-rune ciphertext survives the exact state machine with its genuine 84-symbol known key, providing an independently established positive control.

For all four three-digit φ-derived tapes, this stricter test kills every possible **p0 original page** inverse at zero-based rune offsets **44, 2, 135, 161**, respectively (in the table's order). On p55, the two little-endian tapes die at original rune **12** and **7**, respectively. The two big-endian tapes retain only consumed-key clocks **{73,74}** (blocks) and **{73,76}** (adjacent triples) after all 76 untouched p55 ciphertext runes; these remain unreadable GP output and fail the independently known full p56 key. The precise claim is therefore **an exact historical-F contradiction for six original source/page combinations**, with two p55 cases surviving the basic mechanical test without becoming plaintext. These are original-input constraints and require no English language assumptions.

**Decision:** the four complete original-source **BASE29 → Euler φ → GP29 shift** interpretations fail the authentic p56 key anchor and do not recover p55 or p0 plaintext. A distinct integer framing, unprovided cipher mode or a page-specific alternative receiver is not excluded. Do not tune an offset or insert corrective symbols to rescue a wrong known key. [Same standalone SFT, original sources and positive checks](../sims/lp2_p50_hg_q252_polynomial_p56_84key_sft.cjs).

## Historical GP prime-sum of quotient triples → Euler φ: original p55/p0 gate (Agent12, 14 November 2026)

A different historically attested scalar route uses each GP rune's *prime weight* rather than a positional base29 number: the actual GP29 alphabet assigns the first 29 primes to 29 glyphs, older Cicada stages demonstrate GP prime sums (including the 761 music clue), and p56 authenticates **Euler's totient** as a 29-key source. Q252 still naturally groups into 84 triples. Sum the three original GP prime weights and apply φ(sum) mod29. Unlike an arbitrary invented hash, the input arithmetic and decoder primitives both have earlier puzzle precedents. However, no original source explicitly selects grouping these particular 252 coefficients, the prime-sum operation or a receiver page.

The sum is commutative, so the two source-natural groupings are the **entire fixed family** at this granularity: 3×84 separated blocks or 84 adjacent triples. On the first eight positions, the block sums are **182, 87, 74, 131, 219, 209, 149, 163**; adjacent-triple sums are **72, 215, 235, 249, 137, 177, 91, 151**. The resulting tapes match the full known p56 prime-totient key at only **4/84** and **1/84** positions, respectively. On all **76 original p55 glyphs**, the literal repeating-tape GP29 subtractor produces IoCs **0.03228070** (blocks) and **0.03192982** (triples); on **262 original p0 glyphs**, **0.03471674** and **0.03381007**. All four outputs are nonlinguistic. An actual GP-native 76-symbol p57 plant is exactly recovered under both original-derived tapes.

The more historically faithful *plaintext-F-transparent* inverse admits several possible clocks at ciphertext F positions. On original p0, **every** clock path becomes impossible at zero-based rune **149** (blocks) or **171** (triples). Both p55 tapes remain mechanically possible but finish with only clocks **{75}** (blocks) and **{74,75}** (triples), again yielding no intelligible original plaintext and no p56 known-key match. The standalone SFT documents these hard path checks, the true solved-page-F positive, and the two correctly reencrypted native-GP plants.

**Decision:** the original *three GP symbols → prime-value sum → φ(sum) → GP29 shift* operator is a concrete source-derived candidate, but it yields no recovered unknown plaintext or authentic p56 key under either original grouping. Exact historical-F path exhaustion rejects it as a direct p0 mechanism. Further transforms of its outputs without a manuscript selector are unjustified. [Exact original-input SFT](../sims/lp2_p50_hg_q252_polynomial_p56_84key_sft.cjs).

## Stateful three-symbol projective Möbius generator: complete historical p56 transition gate (Agent12, 14 November 2026)

Stationary three-symbol rational maps fail even with unrestricted coefficients (above). A distinct hypothesis avoids stationarity: for each 84-entry key position, treat that position's **three original H/G quotient digits** as three entries of a 2×2 **projective matrix** over GF29, with the remaining matrix entry fixed to 1. Apply its fractional-linear action to the *previous key symbol* to produce the next. This is a recognizable, reversible step operator with a potential connection to the puzzle's historically used Möbius terminology. No authenticated first-party clue says that its mathematical Möbius name refers to fractional-linear transformations, so the projective interpretation remains a bounded exploratory candidate.

The known original p56 cipher provides 84 authenticated prime-totient key elements, hence **83 independently known transition targets**. Test both source-natural three-share layouts, all four placements of the fixed 1, forward/reversed source-triple order, forward/reversed known-key traversal, and forward/inverse matrix action: **64 finite source-defined conventions**. Each step uses exactly one original Q252 triple and is valid only when the 2×2 determinant and action denominator are nonzero. **No convention is valid for all 83 transitions**; the best achieves only **six** correct known-key steps, with the two six-hit variants valid at 77 and 73 steps and invalid at six or ten source matrices respectively. Across all 64 variants only **168** individual correct steps occur; there is no complete known-key reconstruction, even before testing an unknown page.

This is a key-independent *failure of the declared matrix framing and state rule*, not a rejection of all stateful GP29 ciphers or all possible Möbius interpretations. A planted 84-symbol state source builds 83 invertible transition matrices with fixed bottom-right entry 1, and the same solver recovers the entire original known key sequence **84/84**, testing the forward state update. The source-frozen [single runnable test](../sims/lp2_p50_hg_q252_polynomial_p56_84key_sft.cjs) now contains the positive and exact negative results.

**Research decision:** discard these immediate three-digit projective key generators for the known p56 key. Fitting arbitrary clock phases, hidden per-step matrices, or new state layers to the 83 known outcomes would be overfitting absent a source selecting them. No unknown LP2 plaintext is established.

## Direct original unknown-page consequences

Use the same two complete, source-derived 84-rune GF29 sum tapes with no phase or skip and the historically familiar `P=(C−K) mod29` inverse. Decode the untouched **76** original p55 runes and, independently, repeat the same tape continuously over the actual final **308** unknown p54–55 runes. These are direct low-cost attempts at real plaintext; no correct word or rune was chosen to tune the key.

| Receiver | Original GP29 IoC | Block-sum IoC | Interleaved-triplet-sum IoC |
| --- | ---: | ---: | ---: |
| p55 alone, 76 runes | **0.03789474** | **0.03017544** | **0.04491228** |
| p54–55, 308 runes | **0.03382123** | **0.03430771** | **0.03477304** |

The slightly raised short-p55 triplet IoC is unsupported by continuous readable text; its first twenty decoded GP symbols are `F EA S TH AE A M F X W EA P G I TH G N EO M J`. On the longer original receiver, both candidates remain at near-uniform GP29 coincidence and start with nonsensical rune sequences. As an implementation positive, a genuine native p57-derived 76-rune GP plaintext plant is exactly encrypted and recovered under both derived full key tapes. Exact round-trip alone is automatic for these additive keys and does not authenticate them.

This test **retires the two source-order GF29 sum consumers, two native Shamir three-of-three interpolation consumers, four byte-XOR-derived modulo29 key consumers, and their specified original p55 additive transfers**, plus two actual-byte XOR-to-ASCII systematic interpretations. It neither rules out all 2014 XOR uses nor assigns an original meaning to the H/G quotient. The p56 historical key remains independently authenticated by its complete 85-rune original decryption, and all 56 unknown pages remain unsolved.

**Research choice:** do not repeat three-way quotient splits with fitted phases, additional codebooks or invented corrective clocks. Further work on this source should require a new player-visible operation that determines where the 252 field symbols go and predicts untouched plaintext before fitting.