# Exact full GF(29) factorization of LP2's 256-byte numerical grid

**Classification: newly extracted complete original-source factorization and positional correlations. The factor arithmetic is exact. An intended cipher, key or plaintext remains unproved. Agent 32, 10 November 2026.**

## Canonical original inputs

The original LP2 page-49–51 printed table is a 32×8 layout of 256 two-digit base-60 entries. The repository source normalizes those entries to 256 unsigned bytes in row-major order. SHA-256 of the byte stream is:

3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290

Over GF(29), define the polynomial with exactly those 256 bytes as descending-power coefficient slots,

\[
P(X)=\sum_{i=0}^{255}(b_i\bmod29)X^{255-i}.
\]

The first byte \(b_0=203=7×29\) vanishes mod29, so this is canonically a polynomial of degree **254**. The choice of GF29 is suggested by the 29-symbol GP alphabet and the independently established p39 double-root factor.

## Complete factorization, not just the previously known roots

[Portable complete-factorization SFT](../sims/lp2_grid_gf29_factorization_sft.py) uses documented [SymPy finite-field factorization](https://docs.sympy.org/latest/modules/polys/reference.html) and reconstructs the full polynomial from all factors, preserving the mod29 unit \(28=-1\). The [successful manual CI run 42913117385](https://github.com/FlareZ123/liber-primus/actions/runs/42913117385) confirms the original source input and every exact coefficient invariant.

\[
\begin{aligned}
P(X)={}&28(X+5)^2(X^2+18X+11)\\
&\times(X^3+14X^2+16X+24)\\
&\times(X^9+12X^8+20X^7+10X^6+5X^5\\
&\qquad+X^4+9X^3+15X+11)\\
&\times Q_{238}(X)\pmod{29}.
\end{aligned}
\]

The complete monic irreducible factor degrees and multiplicities are exactly **(1,2), (2,1), (3,1), (9,1), (238,1)**. \(Q_{238}\) is monic and irreducible of degree 238. SHA-256 of its 239 byte-valued coefficients, high to low, each normalized 0–28, is:

9cb443bed228623bbd522efcd73888d3a4870c3db0ddcc147011765f3c8a9eb3

The repeated linear factor \(X+5=X-24\) and the quadratic \(X^2+18X+11\) are **already documented** as source-derived roots by Agents 39/24. The **additional irreducible cubic, nonic and degree-238 residual** complete that decomposition. The result cannot be obtained by merely dividing out the two earlier known factors.

## Q238 red119-seeded stream under every fixed secret outer alphabet (Agent11, 13 November 2026)

The original table's irreducible degree-238 quotient provides a source-derived recurrence. The two independently special first-119-rune prefixes of p3 and p39 supply precisely 238 seed symbols, giving two historical-page seed orders and the direct or reciprocal recurrence. Earlier direct GP29 additive masks failed, but an arbitrary secret output alphabet is a genuinely different class: `C_i=σ((P_i+K_i) mod29)`, where `σ` can be **any** of 29! fixed bijections.

**Key-independent discriminator:** empirical mutual information `I(C_i;K_i)` is **invariant under every fixed bijection σ**. If the proposed source-derived key behaves as an independent running pad masking native GP English, the output-key dependence is approximately `log₂29 − H(P)`; an unrelated source stream gives only finite-sample bias. For all **12,956 untouched source ciphertext runes**, the four original-source `I(C;K)` scores are **0.045410, 0.042691, 0.048792, 0.040076 bits/rune**. Genuine independent Shakespeare-to-GP plaintext planted under **each identical original Q238 stream** with a fixed invertible hidden output map `σ(x)=7x+3 mod29` scores **0.651784, 0.648344, 0.654877, 0.649428 bits/rune**. Independently unencrypted native-GP reference against these keys scores **0.038455–0.045326**. All four original outputs look like an unrelated key under this exact information statistic.

This gives a stronger, **all-29!-alphabet-register** rejection of the four Q238 prefix-seeded additive masks as independent English-like streams; optimizing an unknown outer substitution cannot rescue their missing key dependence. It does not exclude correlated plaintext/key, evolving/nonbijective outer alphabets, different key phase, word-dependent skip states, non-GP payloads, or author-selected unused transport. **No unknown plaintext or key recovered.** [Original-input CJS reproducer](../sims/lp2_q238_red119_outeralphabet_mutualinfo_sft.cjs); [successful source-original CI run 43379587926](https://github.com/FlareZ123/liber-primus/actions/runs/43379587926).

## Original terminal256 versus the entire table: exact coprimality gate (Agent 1, 12 November 2026)

**Independent source-shape premise.** The pp49–51 table has 256 physical numeric cells; the final physical LP2 pages have exactly **76 p55 original ciphertext + 85 p56 original ciphertext + 95 p57 clear runes = 256 GP29 symbols**. Separately, the source table polynomial has the exact nonconstant factorisation proved above. This suggests a simple *cyclic codeword or common-generator* interpretation: both complete 256-slot source sequences might be polynomials divisible by an author-selected factor of the table. No original Cicada text explicitly prescribes this identification, and the three terminal pages do not share one established cipher mode.

A decisive original-input check requires **no selection of the putative secret factor**. Define `T(X)` from the 256 literal terminal GP29 rune indices as descending coefficients, exactly as the table's byte polynomial `P(X)` is defined above. Euclid's algorithm over GF29 calculates their *complete* polynomial GCD. Include only the two natural page-56 status interpretations (printed original ciphertext and independently authenticated solved plaintext, including exactly the one literal F interruption at local56), and either the whole-terminal printed order or its complete reversal. The original p55 and p57 are never edited. All four combinations are 256 GP29 symbols:

| Terminal 256-symbol sequence | Monic GF29 GCD with complete original table P |
| --- | --- |
| p55 + printed p56 ciphertext + p57, printed order | **1** |
| Same, full reversal | **1** |
| p55 + authentic solved p56 plaintext + p57, printed order | **1** |
| Same, full reversal | **1** |

Thus **not one nonconstant polynomial factor of the table, including any of its degree1,2,3,9 or238 source factors or their products, divides any tested complete terminal polynomial**. This is an exact all-factor necessary-condition exclusion of a *literal common-factor codeword* in the frozen field and order, with no language-scoring or candidate parameter tuning. For a transparent partial checksum, dividing the completely original terminal `T` by the known monic degree16 product gives the nonzero ascending remainder
`[22,5,12,12,15,1,28,4,17,27,3,12,22,5,13,22]`.
The same degree16 factor divides the original table polynomial with remainder zero. A source-native **256-symbol plant** deliberately constructed as a multiple of that factor returns a GCD of degree at least16, proving the implementation has power to recognize a true shared divisor.

This says nothing about table ciphertext used as a secret *keystream*, an additive/multiplicative mask, a different code over GF(29²), a nontrivial permutation of the original symbols, or a terminal-dependent stateful cipher. Its value is that the entire table-factor family can be retired as a **direct common polynomial divisor of the terminal printed/solved sequence**, without testing hypothetical individual factors or fitting a key after seeing the final pages. No unknown LP2 plaintext, authentic author-selected cyclic code or destination is recovered. [Exact CommonJS original-input SFT](../sims/lp2_terminal256_table_gf29_coprime_sft.cjs).

## H/G source quotient as a literal binary payload (Agent12, 14 November 2026)

The 2013 PGP-authenticated Cicada base29 example `3301=3QO(base29)` supplies the exact quadratic (H=[3,26,24]) over GF29. The original p39 red three-rune inscription independently supplies (G=[27,5,15]). As established above, their exact product (H G=[23,21,11,17,12]) divides the **original 256 decoded table bytes**, read as descending GF29 polynomial coefficients, with no remainder. This makes the **252 formal quotient coefficients** a singular, genuine source-derived intermediate, independent of all 12,956 rune ciphertext symbols.

A bounded, historically intelligible next operation was left open by the additive-pad and RC4 quotient studies: interpret those 252 high-to-low GP29 coefficients as one **complete base29 integer**, convert to minimal big-endian bytes, then check the resulting original byte sequence for a literal PGP packet, gzip, zlib, or a complete RFC1951 raw-DEFLATE stream producing at least 50 bytes of readable text. The 2013 signed challenges did use BASE29 and compressed PGP packets, so this test has actual historical operational motivation, although **no original instruction assigns the table quotient to this binary register**.

The exact original quotient begins `[0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21,7,21,18,7]`. Its positional integer is **153 bytes**, whose first sixteen are `04598e588f3e70d4100f40d7489f9855`; just **60/153** bytes are ordinary printable ASCII or standard text whitespace. The leading `04` fails the mandatory high bit of any RFC4880 OpenPGP packet header and also disagrees with GZIP and ZLIB framing; a strict source-complete raw-DEFLATE trial yields no readable message. **No 153-byte binary plaintext, original key, compression body or historical next-step payload is recovered.**

The source-linked positive control encodes an actual solved-p57 English passage into a **complete 153-byte, old-format OpenPGP tag11 literal packet**, expresses it as exactly 252 GP29 quotient digits, multiplies by the unchanged H×G polynomial to form 256 synthetic coefficient slots, and recovers the **identical 153-byte PGP packet and all 145 literal content bytes** by the *same inverse and packet parser*. It establishes that the route could have detected a source-structured binary message if present. The original source never changes.

The [single-file original-source Node22 SFT](../sims/lp2_grid_q252_direct_binary_packet_sft.cjs) passed on Windows in [CI run 43543056554](https://github.com/FlareZ123/liber-primus/actions/runs/43543056554). **Decision:** retire this one exact *H/G polynomial quotient → complete base29 integer → unencrypted PGP/gzip/zlib/raw-DEFLATE file* reading. The H/G factor coincidence and Q252 sequence remain real; a differently selected key or genuine opcode might still act on them. Do not fit alternative byte offsets, arbitrary roots or unknown packet prefixes to rescue this negative.

## New numerical alignments and intended-path hypothesis

The degree of the product of *all factors except \(Q_{238}\)* is **16 = 2+2+3+9**, which matches the number of cells in the separate **4×4 Fibonacci-prime square on LP2 p15**.

The residual degree is **238 = 2×119**. The *only two source red three-rune inscriptions*, on LP2 pp3 and 39, each begin after exactly **119** preceding runes within their respective pages. The factor degrees **3** and **9** likewise match the marked-triple span length and the independent p15 first red title's **nine** runes. All of these source-position facts are verified from the original transcriptions in the SFT.

The readings above offer a concise testable hypothesis: the red triads might instruct how to remove recognizable polynomial factors and the residual 238 coefficients might represent **119 two-coordinate symbols over GF(29²)**, indexed by the repeated offset119. The displayed numeric agreements are exact but **retrospectively selected**. They do not establish this as a human puzzle route without an authenticated decoding that follows.

## Source-nine titles and nonic-factor original-chapter inverses (Agent32 and Agent44, 12 November 2026)

**Source observation and prerequisite:** In addition to the original p15 red title with nine runes already recorded above, the final unsolved chapter starts with **nine red runes at p54 local offsets 0–8**, GP29 indices **[24,19,21,23,27,2,14,10,19]**, and the next physical p55 has **76 runes**. The concatenated source object is therefore **85 runes**, matching the independently solved 85-rune p56. The p50 complete factorization has an exact irreducible **degree-nine** factor

\[
N(X)=X^9+12X^8+20X^7+10X^6+5X^5+X^4+9X^3+15X+11.
\]

The red nine-rune vector and the degree-nine factor are individually source-grounded. The *choice* to identify the red title with a linear-register state or to impose a nonic codeword on the adjacent page is a hypothesis, not a verified original instruction. The other red nine-rune title on p15 is an immediate alternative, so there is no unique red-nine-to-factor selector.

**First decisive test: is p54 red9 plus p55 76 one encoded polynomial codeword?** Treat all 85 original GP29 runes as polynomial coefficients. Divide by the exact p50 nonic in both source-reading orders (first glyph as low or high power), and also put the red nine-rune parity block at the end (p55 then red9) in both orientations. **None** has zero GF29 remainder. The four remainders (constant coefficient first) are respectively

- red9 then p55, first glyph highest: **[3,3,5,15,20,23,20,22,20]**;
- red9 then p55, first glyph lowest: **[1,1,23,4,13,10,26,24,14]**;
- p55 then red9, first glyph highest: **[22,20,11,4,23,15,12,0,20]**;
- p55 then red9, first glyph lowest: **[24,12,21,9,5,6,8,1,5]**.

This is an exact original-input obstruction to the four natural direct *nine-parity-symbol codeword* interpretations of the combined 85-rune object, regardless of an English language model.

**Second test: does the title seed the factor's nine-state cipher?** Seed a GF29 recurrence with the **actual nine p54 red rune indexes**, using either \(N\) or the correctly monic reciprocal factor \(X^9N(1/X)/11\). Two reversible additive keystream clocks are fixed (the first seed rune or the first state *after* consuming all nine red runes), each with both arithmetic signs; this gives **eight** unedited 76-rune p55 inverses. A separate natural ciphertext-feedback inverse predicts each p55 rune from the previous nine observed rune values using the same factor and p54 seed, in both directions/signs: **four** other full-p55 inverses. All **12** outputs are nonlinguistic, with GP29 IoCs **0.02842–0.03930**, against the original p55 IoC **0.03922** and independent genuinely solved p57's first-76-rune IoC **0.05965**. The full 76-rune candidate strings are emitted by the SFT without hand-picking shorter word hits.

**Third test: can the same nonic state cipher decrypt the two whole chapters whose *opening* nine runes are visibly red?** The independent original p15 red9 **[0,1,20,19,24,28,26,22,24]** is followed by another red11 span and then the rest of the physical pp15–22 chapter. The independent original p54 red9 **[24,19,21,23,27,2,14,10,19]** precedes the remainder of pp54–55. Freeze each nine-rune title as its own initial linear state. Use the *identical* forward monic recurrence defined by \(N(X)\), with each next state the negated weighted sum of the preceding nine states; use the first generated state for the immediately following rune. Subtract that state from every next original rune without skipping any symbols, resetting the state only at the second source-red9 chapter start. As a sign check, also add the same state. Neither chapter gives native-GP text:

| Original visual chapter | Original runes | Post-seed runes | Raw GP29 IoC | Subtract stream IoC | Add stream IoC |
| --- | ---: | ---: | ---: | ---: | ---: |
| pp15–22 | 1,903 | 1,894 | 0.0344948962 | **0.0345674137** | 0.03442460998 |
| pp54–55 | 308 | 299 | 0.0334897084 | **0.0353527418** | 0.0338039550 |

A genuinely solved GP-native p57 passage of 95 runes has IoC **0.0627099664** under the same GP29 indexing. Both full-chapter source-frozen inverses reencrypt all **2,193** tested post-title rune positions; both independently encrypt and exactly recover the full 95-rune solved p57 positive control with the respective actual red nine-rune seeds. As all bijective keys round-trip, these implementation successes do not establish historical correctness. The source provides the two red-nine locations and exact original text, but does **not** independently select the GF29 polynomial as the title's cipher, its state clock or additive output rule. This test is the first *joint complete-chapter* check of the same key family on p15–22 and p54–55, rather than the preceding p55-only screen. [Separate CommonJS SFT](../sims/lp2_nonic_two_red9_chapters_sft.cjs).

**Reproduction and limit:** The original 256-byte SHA-256 digest is asserted, and the nonic exactly divides the *unaltered* original p50 table polynomial. A full 76-rune native GP plaintext plant from the original solved p57 is encoded and recovered exactly by each of the 12 cipher variants. Both reversible transformations round-trip the original p55 ciphertext; a deliberately wrong nonic coefficient fails the planted feedback control. [Original-input CommonJS SFT](../sims/lp2_nonic_red9_p55_source_gate_sft.cjs) passed the first complete [manually dispatched GitHub Actions run 43273924180](https://github.com/FlareZ123/liber-primus/actions/runs/43273924180), Node.js 22. (An earlier action on a miscopied coefficient failed its explicit source-factor assertion and was corrected before the successful result; only the asserted source-exact polynomial is used here.)

**Decision:** the nine-red-title → degree-nine source factor remains a size-matched clue hypothesis. Direct p55 codeword parity, twelve p55-only cipher variants, and a **single shared monic recurrence tested on the entire pp15–22 and pp54–55 post-title chapters** fail to recover readable original plaintext. Retire these exact constructions instead of fitting new title phases to rescue them. Other output functions, states or non-GP intermediates require an independent source instruction. No new unknown-page plaintext, authentic key or endpoint was recovered.

## Original p36 as complete degree-238 LFSR state: following-page inversion (Agent3, 12 November 2026)

**Source-selected candidate and decision:** The numerical table's factor `Q238` has degree **238**, and physical LP2 p36 contains exactly **238 unchanged GP29 runes**. Treating those 238 runes, in printed order, as the complete initial output state of a 238-register linear-feedback generator is a cheap and distinct candidate consumer of the existing factorization. The source does **not** instruct the player to use p36 as a key or connect it to the following pages; this is a bounded hypothesis, not a recovered intended mechanism. Its nearby Arabic paragraph numeral `1` is deliberately **not** silently added to the source state.

There is a separate **exact all-permutation symbol-register obstruction** to reading this degree-238 factor directly as the entire printed p36 line. Its **239** polynomial coefficients include the privileged leading coefficient **1**; the physical p36 source has **238** GP runes and an independent printed Arabic **1** inserted after **99** runes, also **239** displayed symbols. If the two objects were direct symbolwise equivalents under any secret 29-symbol *bijective* alphabet and arbitrary positional rearrangement, their sorted symbol occurrence multiplicities would be identical. They are not: the first six counts are **[15,12,11,11,11,10]** for Q238's 239 coefficients, but **[14,14,14,13,13,12]** for p36 with numeral. Even aligning the monic source 1 to the p36 numeral by the unique cyclic shift yields only **2/239 literal source-symbol matches**. This excludes every direct stationary symbol permutation at any position order, without selecting a secret key. It does not exclude using the polynomial as a *keystream generator*, a non-injective recoding with an independently recoverable escape channel, or a nonlinear stateful relation. The extended SFT asserts the two incompatible spectra on the untouched sources.

The [source-original SFT](../sims/lp2_p36_238seed_p50_q238_following_chapter_sft.cjs) reconstructs monic `Q238` by dividing the untouched 256 printed base60 grid bytes over GF29 by the independently established degree-16 factor, asserting both source SHA-256 identities. It seeds the recurrence `k[n+238] = -Σ Q[j]k[n+j] (mod29)` with the complete 238 original p36 runes and consumes the *first newly generated* symbol at the next page's first original rune. Exactly **696** following GP29 runes, physical pp37–39, are decoded. To avoid fitting a secret clock, the only variants are `Q238`/monic reciprocal, printed/reversed seed, and `C−K`/`C+K`: **eight** deterministic inverses with no key tuning, skipping, shifting, or arbitrary page breaks.

The original target's pooled GP29 IoC is **0.03446622**; across all eight inverses the best is only **0.03518978** (Q238, reversed p36 seed, addition), with an ungrammatical opening `LIANSCANEAJPEOEAHBGCMCCAENLAEEAANGWFNGAEIAEOOEPYAIR`. Each of its three individual page IoCs is **0.03292372 / 0.03844965 / 0.03507671**. All other complete outputs have pooled IoC **0.03411478–0.03481766**. A native-GP positive control constructed from solved p57 runes encrypts and exactly recovers **696/696** positions under the same recurrence. The test also round-trips the original ciphertext through every inverse. [Successful manual CI run 43314422708](https://github.com/FlareZ123/liber-primus/actions/runs/43314422708), selected probe `p36-q238-next-lfsr`.

**Conclusion:** This complete-page Q238 LFSR key use does **not** decrypt the following three pages. It is independent of the earlier p3/p39 paired-119 seed and the p36 GF(29^238) power map; neither supplied a plaintext. The true source-to-key relationship and whether the retrospective degree match was designed remain open. Do not tune more phases or seed replacements without a new original instruction.

## Independent original-page double-root gate

A new original-cipher linkage tests whether the **source-fixed root 24** that appears twice in the printed p50 polynomial also divides other unedited LP2 pages. The p39 red triad at offsets119–121 is **[27,5,15]**, exactly **15(X−24)²** over GF29, and p54's enlarged first rune has GP index24. Interpret every one of the **55** rune-bearing unsolved physical pages as a high-to-low coefficient polynomial over GF29, using its first printed rune as the highest coefficient. **Exactly one page has the same repeated root:** physical **p29** (277 original runes) satisfies **C29(24)=C29′(24)=0**. Pages **p10, p11 and p36** have simple roots at 24, with nonzero derivatives **6, 9 and 27**. Among all 29 possible repeated roots on all 55 pages, the only (page,root) pairs are **(0,10), (6,3), (29,24), (32,27)**.

This identifies a mathematically exact second original text artifact divisible by the previously extracted source factor. However, even with the root specified independently, one or more matching *double roots* across 55 independent uniform-GP29 pages would occur with probability **1−(1−1/841)^55 ≈ 0.06334**. The polynomial representation was itself proposed after inspecting the source table, and several other source factors, page boundaries and orientations were investigated in the broader project. **The match is a clue hypothesis, not statistically established evidence of authorial coding.** An independent 2016-signed-word/base58 mapping provisionally selects p29 through the word *meaning*, but that address convention remains unverified and supplies no instruction for polynomial division.

The most economical candidate inverse is nonetheless unambiguous: divide the entire original p29 polynomial by the monic **(X−24)² = X²+10X+25**. The remainder is **exactly zero**, and the quotient has **275 GP29 symbols**. Their index of coincidence is **0.03405441**, versus the p29 original **0.03369434**; transliteration is nonlinguistic. The inverse source-native plant passes exact polynomial multiplication and division. Thus the quotient is a genuine reversible arithmetic reduction of the 277 original runes to 275 symbols, while no authentic plaintext or source-selected reason for applying it has been recovered. A further operation would require another independent clue. [Standalone SFT and exhaustive source-root census](../sims/p29_source24_double_root_sft.cjs).

## Direct reuse of the table's four low-degree factors in original text (Agent 37, 11 November 2026)

The [source-frozen CommonJS regression](../sims/lp2_grid_exact_factor_reuse_original_sft.cjs) asks a narrower new question than the complete factorization: do **any other complete original LP2 physical runic pages or source-marked red spans** literally satisfy one of the table's fixed low-degree factors? It uses all **55** unsolved rune-bearing pages (12,956 GP29 indices), each read as high-to-low polynomial coefficients, and the **16** independently marked red spans. For red spans only, both high-to-low and low-to-high orientations are shown because the source p39 red triad originally supplied G as ascending coefficients. No contiguous-window, key, phase, language or polynomial search is performed. The original byte table and independently generated polynomial multiples are positive controls for all four divisors.

| Frozen p50 monic factor | Whole-page high-to-low matches | Red spans low-to-high | Red spans high-to-low |
| --- | --- | --- | --- |
| H = X²+18X+11 | none | none | none |
| G = X²+10X+25 | **p29 only** | **p39:119–122 only** | none |
| Cubic = X³+14X²+16X+24 | none | none | none |
| Nonic = X⁹+12X⁸+20X⁷+10X⁶+5X⁵+X⁴+9X³+15X+11 | none | none | none |

The p39 match is an **input tautology**, because that very red triad **defines G** in ascending-power order; p29 is the independently documented complete-page repeated-root match above. A complete-page match to the cubic would be rare under uniform independent residues (rough probability 55/29³), and a ninth-degree match much rarer; neither occurred. The scan closes this literal original-page/red-span factor-copying route. It does **not** exclude non-contiguous registers, a separately marked coefficient ordering, unencrypted interleaving, or different operations that consume these factors as keys. It identifies no new plaintext or historical cipher.

### p3/p39's two source-marked 119-rune prefixes versus Q238: all-secret stationary obstruction (Agent 43, 12 November 2026)

The original physical p3 and p39 each place their only isolated red three-rune inscription after exactly **119 preceding runes**. Separately, the full pp49–51 base60 table polynomial factors over GF29 into a degree16 factor and monic **Q238**. A motivated, finite proposal is to read the two 119-rune prefixes as paired GF29 coordinates and Q238's 238 nonleading coefficients as the corresponding second coordinate register. The 119-to-238 geometry is source-visible; the proposed map is **not** an authenticated instruction.

A frozen direct test allows independent reversal of each 119-rune prefix, reversal of Q238 coefficient order, and adjacent versus 119+119-half grouping of the quotient: **16 source-preserving layouts**. It grants **any stationary deterministic function from a GP29 source pair to a GP29 target pair**, including an arbitrary secret table that is not necessarily invertible. All 16 layouts fail: they have **7–10 repeated-input contradictions** each. The forward, ascending-coefficient/adjacent-pair example has source pair **(9,24)** at positions **21 and 48**, but targets **(3,5)** and **(1,6)**. Identical inputs cannot yield two different outputs under any single static function. Reverse-direction contradictions also rule out a bijection in every case.

A full-rank secret affine plant \\(x,y)\\mapsto(2x+3y+5,7x+11y+13)\\pmod{29}\\) on the exact original source pairs passes both lookup-consistency tests without a single contradiction. The new [source-native CJS SFT](../sims/lp2_p3_p39_q238_stationary_pair_gate_sft.cjs) recomputes Q238 by exact polynomial division from the repository's original 256 table bytes and emits the complete sixteen-layout table.

**Decision:** the direct p3/p39 dual-prefix ↔ Q238 **stationary lookup** hypothesis is excluded for these natural source-fixed orderings, regardless of the hidden lookup alphabet. This result does not exclude position-dependent state, nonlocal transformations, other encodings or Q238 as a separately used key. It recovers no plaintext or historical cipher; do not add arbitrary exceptions to rescue the direct model.

## P3/Q238 discrete-log byte codec: every byte-capable GF841 base and shared mask excluded (Agent44, 12 November 2026)

**Source-constrained hypothesis.** The original p3 red triad defines `GF(29²)=GF29[u]/(u²−3u−8)`, with the field element `u` of exact multiplicative order **840**. The printed pp49–51 256-cell table's established GF29 factorization gives monic **Q238** with 238 nonleading rune-valued coefficients, or exactly **119 pairs**. Independently, the original p3 and p39 isolated red triads each follow exactly **119** page-local runes. Because the historically authenticated 2013 challenge included BASE29 and finite-field arithmetic, a finite decoder candidate is the injective 8-bit byte representation `byte n → u^n=A+B·u`, where `0≤n≤255`. The byte generator and modulus are fixed by those source facts; the instruction to use a discrete logarithm on this particular quotient remains a **hypothesis**, not a Cicada-authenticated opcode.

**Exact original-input division and four fixed pairings.** Remove the independently established degree16 small-factor product from the unmodified table polynomial. The remainder is identically zero in GF29, and the 239 coefficients of monic Q238 have SHA-256 `9cb443bed228623bbd522efcd73888d3a4870c3db0ddcc147011765f3c8a9eb3`. Pair its 238 nonleading coefficients either adjacently or as two consecutive 119-coordinate halves, in both coordinate orientations. For each of the four fixed layouts, generate the complete 840-element discrete-log table from the original p3 field element. All 119 elements admit a logarithm. An unknown **shared multiplicative scalar** `u^k`, with `k` any of **0…839**, would add the same `k` modulo840 to every exponent.

**All-secret generator-and-scalar obstruction.** First suppose the group base is the source-defined `u`. Every exponent of a purported 119-byte string must lie inside one **cyclic interval of 256 consecutive residues** of Z840 after a common rotation. Sort the distinct observed exponents around Z840; the minimum possible inclusive circular covering interval has length `841 − (largest successive circular gap)`. This establishes the source-`u` baseline. Stronger still, allow the generator itself to be **any unknown element `u^a` that could injectively encode all 256 byte values**. Its multiplicative order must be at least256, so `gcd(a,840)` is 1, 2, or 3. For **all 192 primitive choices `gcd=1`**, change every observed log from `e` to `a⁻¹e mod840`, compute the shortest cyclic interval, and retain the best hypothetical secret `a` and scalar mask. For the other possible byte-capable bases of orders420 and280 (`gcd=2` or3), all observed exponents must share the same parity or mod3 residue, respectively. The original observations contain both parities and all three mod3 residues in each pairing, so these bases are impossible under any common scalar key. The exact outcomes are:

| Q238 pairing | Coordinates | Valid logs | Logs in 0–255 | Minimum span, source `u` | Minimum span, **any of 192 primitive bases** |
| --- | --- | ---: | ---: | ---: | ---: |
| Adjacent | `A,B` | 119/119 | 30/119 | 785 | **777** (at `a=319`) |
| Adjacent | `B,A` | 119/119 | 30/119 | 807 | **780** (at `a=389`) |
| Two 119-coefficient halves | `A,B` | 119/119 | 37/119 | 808 | **784** (at `a=187`) |
| Two 119-coefficient halves | `B,A` | 119/119 | 33/119 | 801 | **775** (at `a=19`) |

Each layout has 109 distinct exponents. Even with the **best of all 192 unknown primitive bases and any scalar multiplier**, the observed exponent register requires **at least 775 consecutive residues**, more than triple a byte's allowed 256. The two classes of nonprimitive but byte-injective bases (orders420 and280) are independently excluded by their impossible common-residue requirements. This is an exhaustive, key-independent failure of every codec `Y_i = K·G^{byte_i}` for **every fixed nonzero key `K` and every nonzero GF841 base `G` whose order permits all 256 different byte values**. There is no need to fit any of the 161,280 primitive-base/secret-key combinations individually.

Every possible 8-bit value `0..255` was independently encoded as `u^byte` and decoded exactly. The [source-pinned CommonJS SFT](../sims/lp2_q238_gf841_byte_discrete_log_sft.cjs) asserts the table hash, original GF29 quotient, source generator order, all byte positive controls, the 192 exact multiplicative inverses modulo840, and all four all-generator minimum spans. No language model, source wordlist or fitted phase is involved.

**Decision and boundary:** retire the **entire direct 119-byte GF841 exponent codec with any fixed field base and common multiplicative secret key**, across the four printed coefficient layouts. This includes all 192 primitive and all 192 order420/280 alternative bases, each with every possible scalar multiplier. A position-varying unknown pad, a source-specified nonbyte exponent alphabet, an 840-ary register or a different consumer of Q238 remains possible; none is selected by currently known original instructions. No previously unknown LP2 plaintext, authentic key or destination has been recovered.

## Cross-artifact 119×2 affine register inverse

The 238 nonleading coefficients of \(Q_{238}\) form 119 pairs. Two independent printed source dimensions offer a specific geometrical test: p53's **128 black** runes become **119** after dropping the p15 red title's **9** runes at either edge; the terminal **127** (51 p53-red + 76 p55) become **119** after dropping the grid's **8** columns at either edge. Test both edge choices, adjacent/half-block source pairing, source reversal/swap, and target reversal/swap: **128 exact original geometric alignments**.

For each geometry, allow a completely *unknown* affine two-coordinate map \(Y_i=AX_i+b\) over GF29. Derive all six secret matrix/offset coordinates from the first **three affinely independent** aligned pairs, then test the remaining 116 original pairs without refitting. The maximum is only **4/119 fully matched original pairs**, including the **three** forced fit pairs; the sole additional hit is insufficient to identify a map or plaintext. In a native positive control, an independently planted nonsingular 2×2 affine map and source-fixed margins recover **119/119** pairs. This is an all-secret-key exclusion for **this affine 119-pair interpretation**, and it is distinct from the previously tested 127-target stationary pair lookup.

The source-to-target relationship could still be nonlinear, position dependent or differently indexed. The negative preserves the meaningful 2×119 clue while blocking a simple direct field-map claim. The [complete factorization SFT](../sims/lp2_grid_gf29_factorization_sft.py) includes both exact inversions and their plant.

## Exact obstruction to a GF(29²) polynomial norm

The complete factorization also decides a much broader candidate suggested by the two red source quadratics: **can the printed grid polynomial be the field norm of a hidden polynomial over GF(29²)?** This includes the tempting terminal-page arrangement of p53's **128 black** runes as one coefficient lane and a second, specially selected 128-rune lane formed from p53's **51 red** runes, p54's first **oversized red Ac**, and all **76 p55** runes. The second-lane selection is retrospective and omits p54's eight other red runes; it establishes no intended authorial layout.

Let \(K=\mathrm{GF}(29^2)\), whose explicit source presentation is furnished by the p3 red quadratic \(13+23u+2u^2\). For any **arbitrary** hidden \(H(X)\in K[X]\), its coefficient-field norm is \(N(H)=H(X)\sigma(H)(X)\in\mathrm{GF}(29)[X]\), where \(\sigma(a)=a^{29}\). Every irreducible \(\mathrm{GF}(29)\)-polynomial of **odd degree** remains irreducible over \(K\). Its exponent in a norm must therefore be even, since coefficient Frobenius preserves that factor while doubling its multiplicity.

The original grid's verified monic cubic factor

\[
h_3(X)=X^3+14X^2+16X+24
\]

has **no root among all 29 field elements**, hence is irreducible. Exact polynomial division proves \(h_3\mid P\), but \(h_3^2\nmid P\): after dividing \(P\) once, the remainder on another division by \(h_3\) is **\(3X+9\)**. Consequently **there is no GF(29²) polynomial of any degree and no hidden 128-lane key whose norm equals \(P\)**, even up to a nonzero constant. Dividing out the known \((X-24)^2\) root does not change this cubic obstruction. This is an all-secret **algebraic rejection of the norm mechanism**, independent of English models or fitted text. It does not forbid other field ciphers or non-norm operations.

[Single-file exact modular source proof](../sims/red_triad_grid_affine_factors_sft.cjs) checks the original grid byte SHA-256, the p3/p39 triads, the already established quadratic and repeated-root factors, the rootless cubic, its exact one-copy multiplicity and complete product reconstruction using the published degree-nine cofactor. The familiar quadratic \(X^2+18X+11\) may also be written \(2F((X-17)/2)\), \(F=13+23X+2X^2\), using the manuscript's original JPEG numbering offset 17; that is a reformulation of the **previously published** p3 conjugate-root result (see [the red-triad extension section](grid-bigint-factor-page53.md#the-two-marked-three-rune-polynomials-and-an-exact-source-factor-agent-39-10-november-2026)), not an independently discovered factor or new cryptographic key.

## Immediate original-payload checks and outcome

Using the monic \(Q_{238}\) factor, discard its formal leading one and read the remaining **238 coefficients as GP29 indices**. Their index of coincidence is only **0.034633100102**, close to the uniform-symbol baseline \(1/29\). Interpret those same base29 coefficients as one big-endian integer and serialize as bytes: it produces **145 bytes**, of which **49** are printable 7-bit ASCII; no plain-language payload or recognized header is present. Pairing 238 coefficients as 119 GF29² elements and projecting their trace or norm in the natural adjacent/half-block layouts also produces near-uniform GP29 data, not text (exploratory direct controls).

The direct 119-column shared-pad interpretation \(A_i-B_i\bmod29\) has IoC **0.032474006552**, with no plaintext; \(A_i+B_i\bmod29\) has IoC **0.034895314058**. Thus neither direct pairwise sum/difference nor its straightforward field projections identifies the intended language.

### Direct original-source 16+238 factor-coefficient alignment: exact all-secret obstruction (Agent 43, 12 November 2026)

The product of the four small factors of the printed table polynomial has degree **16**, leaving the source-defined irreducible degree-**238** large factor. The original manuscript independently offers a **16-rune** red heading at physical p3 and a **238-rune** complete physical p36. These lengths are an attractive candidate for a two-part human-readable factor key, although the pairing was identified after the factorization.

A fully fixed first operation is to read the original p3 red16 runes against the **16 nonleading coefficients** of the exact degree16 factor, and physical p36's 238 runes against the **238 nonleading coefficients** of the monic Q238 factor. The complete small-factor product has ascending coefficients:

`[16,9,3,17,23,27,16,3,23,3,18,22,14,18,12,4,28]`.

The SFT divides the original 256 byte values over GF29 by that product, checks **all zero remainders**, recovers monic Q238 and reconstructs every source coefficient exactly. It then uses a stronger necessary condition than a word score: if either page's rune content were that factor vector under *any hidden global rune-alphabet permutation*, the sorted 29-symbol count multisets would agree. Even allowing **arbitrary reordering of all positions** cannot evade this multiplicity obstruction.

| Original source compared to factor coefficients | Max symbols matched under an arbitrary alphabet bijection and free positional reorder | Minimum unavoidable mismatches |
| --- | ---: | ---: |
| p3 first red16 vs small factor nonleading 16 | **15 / 16** | **1** |
| p36 entire 238 vs Q238 nonleading 238 | **222 / 238** | **16** |

The p3 comparison has **0 exact positional matches** in either original or reversed coefficient direction. The p36 comparison has **11 direct or 14 reversed positional matches**; the strongest all-secret bound still leaves 16 unavoidable mismatches. Hence the original red title and p36 are **not simply the source key coefficients disguised by one secret monoalphabetic relabeling and arbitrary shuffle**.

**Independent complete-corpus calibration (Agent 3, 12 November 2026).** The seemingly favorable **222/238** upper bound is actually **the worst of all 36** physical-page prefixes of at least 238 original runes under this same *maximally favorable, entirely secret* 29-symbol relabeling and free position reorder. The other 35 page-prefix bounds are **224–233**. Among **all 12,719 contiguous 238-rune original-source windows**, **12,615** score at least as highly as p36, only **104** score lower and **144** tie; the median is **229** (range **218–235**). These are overlapping original-book windows and a source-matched comparator, rather than independent probability samples. They show why treating the 16 remaining disagreements as a near-match would be misleading. The exact rolling 238-rune census and 36-page comparison are now part of the [existing source-bound CommonJS test](../sims/lp2_grid_16plus238_source_alignment_sft.cjs). More complicated encryption, a transformed register, or a factor unrelated to these pages remain open; do not assign an unsourced reconciliation cipher to rescue this direct hypothesis.

**Repeated-root-motivated derivative direct inverse (Agent 43, 12 November 2026; bounded negative).** The independently visible p39 red quadratic is a double root of the original grid polynomial, making formal differentiation a clue-compatible *candidate* operation. Derive the original monic \(Q_{238}\) polynomial as above and its 238 formal derivative coefficients \(D_i=(i+1)Q_{i+1}\bmod29\) for \(i=0\ldots237\). This yields a fully source-derived, no-secret 238-symbol candidate pad for the entire 238-rune physical p36. Its source-order and reverse orders, added to or subtracted from original p36 ciphertext (exactly **four** fixed models), give GP29 IoCs **0.03471262 / 0.03517356** (ascending plus/minus) and **0.03474808 / 0.03276247** (descending plus/minus), against original p36 **0.03598908**. All remain near uniform and have no coherent plaintext. The formal derivative is an exploratory algebraic interpretation; the double-root source cue does **not** instruct using this derivative as a GP mask. This rejects only these four literal p36 inverses. [Updated source-driven CJS SFT](../sims/lp2_grid_16plus238_source_alignment_sft.cjs).

**All-hidden-seed original GP feedback test with the degree-238 factor (Agent 42).** Physical p36 contains exactly **238 original ciphertext runes**, matching the monic large factor's degree; this correspondence was noticed retrospectively and supplies no authenticated seed instruction. The conventional source-specific **238-tap GF29 feedback model** instead grants an arbitrary 238-rune initial ciphertext state and inverts the entire remaining original stream without guessing it:

\[
P_i=C_{i+238}+\sum_{j=0}^{237}h_jC_{i+j}\pmod{29},
\]
where \(\sum_{j=0}^{238}h_jX^j=Q_{238}(X)\). The reciprocal monic factor gives the other natural coefficient orientation. Both variants deterministically recover **12,718** GP29 candidate symbols and exactly re-encrypt **12,956/12,956** original source runes; neither shows coherent language. Their decoded IoCs are **0.0344875054 / 0.0345022456**, respectively, versus raw source **0.0344783979** and a native Shakespeare-based GP control **0.0664262954**. Each source-native control recovers **12,718/12,718** planted runes exactly; changing to the other tap orientation lowers the decoded control IoC to **0.03451183 / 0.03449194**. The exact original-input [CommonJS reproducer](../sims/grid238_allseed_feedback_original_inverse.cjs) passed [manual CI 42916326373](https://github.com/FlareZ123/liber-primus/actions/runs/42916326373).

The source factor alone therefore **does not** furnish a direct native-GP 238-tap ciphertext-feedback decryption, even when the starting state is arbitrary. It leaves variable-rate or binary encodings, nonlinear feedback, and historically signaled operations open.

### Source-paired 119+119 prefixes as a degree-238 LFSR seed (Agent 19, 11 November 2026)

**Scope: source-motivated eight-model original-cipher negative, without a secret-key search.** The two uniquely red three-rune inscriptions are at **p3:119** and **p39:119**; both have exactly 119 preceding original runes. The irreducible grid residual Q238 has degree **238=119+119**. One elementary, fully specified human-computable key construction is to concatenate those preceding 119-rune prefixes, interpret them as the initial 238-symbol state of the standard linear feedback generator with the *independently fixed* monic Q238 polynomial, and subtract the generated GP29 stream from the original book. The same construction with the two prefix orders, polynomial and reciprocal orientation, and either sign gives exactly eight frozen cases. The seed-selection rationale is an alignment hypothesis, not a recovered historical instruction.

The [standalone source-factor SFT](../sims/q238_red119_lfsr_source_sft.cjs) divides the authentic 256-byte table by the exact four known smaller factors in GF29, asserts that all 256 polynomial-coefficient remainder slots are zero, recovers monic degree238 Q, constructs the two marked-prefix seeds directly from the canonical original runes, and inverts/re-encrypts **12,956/12,956** source runes in each of eight cases. Every direct output remains nearly uniform: whole-book GP29 IoC **0.03445836–0.03452236** versus original **0.03447840** and native prose commonly above **0.058**. A source-native solved-p57 plant encrypts and recovers exactly with each mask. None of the eight direct outputs supplies recognizable plaintext or a reusable decoding operation. This closes only the simple stationary LFSR-generated *additive* mask from the two 119-rune prefixes, leaving nonlinear and multi-register constructions open.

### GF(29²) degree-119 recurrence from the two source-marked prefixes to p36 (Agent 41, 12 November 2026)

The p3 red triad **[13,23,2]** defines the quadratic extension (u^2=3u+8) over GF(29). The monic irreducible table residual (Q_{238}) therefore splits over GF(29²) into two conjugate irreducible degree-119 factors. The two original prefixes before the p3 and p39 red triads each contain 119 runes; pairing them in printed order as (s_i=p3_i+u,p39_i) gives a source-sized 119-element state. This is a more specific test of the earlier 119+119 observation than treating the prefixes as a 238-rune GF(29) seed.

A source-native finite test factors (Q_{238}) over GF(29²), verifies that the two conjugate factors multiply back to the exact original (Q_{238}), and uses each factor and each reciprocal as a 119-tap recurrence. It tests the **next** 119 state elements (after loading the 119-element seed) as an additive key for p36's 238 runes, under adjacent-pair and 119+119 half-block layouts and both GP29 additive signs: **16 fixed recurrence cases**. It also tests the unadvanced 119-element seed directly as a one-time-pad baseline: four cases. The p36 printed marginal numeral **1** after rune 99 is not inserted into this pair stream; no independent source rule selects such an insertion here.

All 16 recurrence outputs re-encrypt exactly but remain ciphertext-like: IoC **0.033471616–0.036910967**, against raw p36 **0.03598908**. The four direct-seed outputs are likewise near-uniform (IoC **0.032939758–0.035209020**). All **20** source-native solved-p57 positive controls recover exactly. No coherent p36 plaintext, second-page prediction or reusable key emerges. The test is reproducible in [the GF(29²) degree-119 SFT](../sims/lp2_q238_gf841_119_lfsr_gate_sft.cjs).

**Decision:** retire only the direct GF(29²) seed-pad and degree-119 additive-LFSR consumers of the p3/p39 prefixes against p36. The extension-field factorization and 119×2 geometry remain exact algebraic structure, not an authenticated cipher instruction. Do not expand into alternate projections, warm-up clocks or arbitrary field readouts without a new source clue.

**Research decision:** the source factorization produces a more constrained 119-pair artifact worth testing against *independently signaled transformations*. A direct GF(29²) polynomial-norm interpretation of the entire table is mathematically excluded by the odd-multiplicity irreducible cubic, and both source-natural 238-tap direct-GP feedback orientations fail on the full original manuscript despite source-native controls. It has not decrypted the source. A successful next step must specify which factor(s), 119-pair reading and operation are pointed to by the original artwork or inscriptions, and must recover reproducible native plaintext. More unsourced affine key sweeps over these 119 pairs would repeat earlier failures.
