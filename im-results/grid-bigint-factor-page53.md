# LP2 256-byte table: source-number factorization and page-53 square

**Classification: source arithmetic with a provisional cryptanalytic interpretation. No unknown LP2 plaintext, key, or destination recovered.** Agent 46, 10 November 2026.

## Exact original-grid relationship

Take the base-60 table on physical LP2 pages 49–51 in its printed row-major order, converting the 32 rows of eight two-character numbers to 256 bytes with the published digit alphabet 0–9, A–Z, a–x. Interpret these bytes as a single **2,048-bit unsigned big-endian base-256 integer N**. Both shared derived corpora, **resources/liber-primus/base60-grid.json** and **resources/liber-primus/lp2-grid-256.json**, agree byte-for-byte. The SHA-256 of the 256-byte source is

3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290

Exact independent JavaScript BigInt and Python/SymPy integer division gives

\[
N=(2^4\cdot3^3\cdot7\cdot13\cdot29\cdot179^2)\,Q
 =36,528,277,968\,Q
\]

where Q is a **2,013-bit composite integer**. These six factors, with their exponents, are the **entire prime-power part of N supported on primes at most 179**. Remultiplying reconstructs the original 2,048-bit number exactly.

Physical LP2 page **53** contains **179 GP runes**, split 128 black and 51 red. For **all 55 rune-bearing unsolved physical pages 0–55**, page 53 is the **unique one** whose full page-rune count L satisfies \(L^2\mid N\). This tests original rune counts directly, without any hypothesized plaintext.

**New original-digit-to-prime lead (Agent 33; conjectural use).** In the literal printed 256 base-60 token pairs, look only at the **second digit**. Of the 60 possible digit glyphs in `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`, **all 59 except lowercase `f` occur**. The missing `f` has **zero-based digit index 41** (the 42nd glyph), and the **41st prime is 179**, exactly the previously established repeated table factor and the complete rune count of physical p53. This gives an additional potential human-recognizable path from a conspicuous numeral-alphabet omission to an independently measurable prime:

`missing units digit f → zero-based digit value 41 → p₄₁ = 179 → 179² divides 256-byte table integer → p53 has 179 runes, its red number divisible by 179`.

The **zero-based index followed by one-based prime ordinal** is a convention choice, and the f-omission is also compatible with an alternative radix-59 digit alphabet. The numeric link was noticed **after** the 179 factorization; it has no discovery-adjusted significance, cannot be treated as an independently predictive key, and the radix-59 integer itself loses divisibility by 179. A concrete candidate uses the source-selected prime to traverse all 256 table cells via `index(i)=(start ±179i) mod256`, since 179 is coprime to 256. The [frozen original SFT](../sims/grid_missing_f_prime179_sft.cjs) tries both starts 0 and 41, both directions, direct mod29 and lossless transparent-EA GP28 emissions, both byte reductions and signs: **32 complete original 12,956-rune inversions**, all round-tripping and all unreadable. Best native-GP IoC **0.03530742**, against uniform **1/29 ≈ 0.03448276** and independent source-Latin GP IoC **0.07202862**. Native-Latin 2,400-symbol controls round-trip exactly under both tested emission families. This rejects the precise direct 179-step pad family, while leaving its source interpretation and other source-specified uses of 179 open.

An [independent canonical byte transcription](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/pp49_51/canon_256.hex) reproduces this *same entire* byte string. Its [six-glyph source adjudication](https://github.com/Dukotah/cicada3301/blob/master/archive/branches-2026/claude_cicada3301-repo-review-wg0i9w/liber-primus/analysis/pp49_51/A04_glyph_adjudication/results.json) reports confirmation of all historically contested numeric glyphs from original scan crops. That supports stability of the numerical input, without proving Cicada intended the observed factors.

## Page-53 red numeral: a second source-fixed factor of 179

**New original-input result (Agent 7, 10 November 2026); cryptographic role unestablished.** The established \(179^2\mid N\) factor gives a precise page-specific test of another original ink channel. Physical p53 has **128 black runes followed by 51 contiguous red runes**. Read the **51 red symbols** in ordinary order as a nonnegative positional integer \(R\), using their canonical zero-based Gematria Primus indices \(0,\ldots,28\) in **base 29**. This is an independently specified 51-symbol source interval and a conventional, reversible numeral encoding.

Exact BigInt arithmetic on the source inputs gives:

- **\(\gcd(N,R)=358=2\cdot179\)**, where \(N\) is the canonical printed-grid 2,048-bit row-major base-60 integer.
- **\(179^2\mid N\)** but **\(179^3\nmid N\)**; **\(179\mid R\)** but **\(179^2\nmid R\)**. The shared factor **179** equals the complete physical page's rune count, which was already associated with the grid before this red-number test.
- Across the **18 complete colour-marked rune spans** in the original annotation, **p53's 51-rune span is the only one whose zero-based base-29 integer is divisible by the full rune count of its own physical page**. Its gcd with the grid is also the largest of those 18, the next largest being 56.
- The exact **five alternative grid-cell readings** documented in [the source-audited key study](grid-section-column-keys.md), and the independently historically published **f-omitting radix-59** token interpretation, both yield grid integers **not divisible even by 179**. Thus the joint numerical relationship occurs under the canonical base-60/zero-based GP29 reading, rather than being invariant under plausible competing numeral codecs.

Trial division of the 247-bit red integer \(R\) up to one million yields the exact small-prime decomposition

\[
R=(2\cdot113\cdot179\cdot27241\cdot39901\cdot68909\cdot265541)\,C,
\]

with **168-bit residual \(C=269573819958837950787541728931395654992696677965349\)**. The factorization is an exact product identity; the reproducer does not need to assert that the residual is prime. This supplies concrete potential number-theoretic material for a source-constrained decoder, but it does not itself identify one.

**Exact GP29 double-root constraint on the numerical grid.** Read the unchanged 256 original bytes as coefficients of \(P(X)=b_0X^{255}+\cdots+b_{255}\) over \(\mathbb F_{29}\). The byte-place radix is \(256\equiv24\pmod{29}\). Exhaustive evaluation at **every one of the 29 field elements** gives **one and only one polynomial root**: \(P(24)=0\), with **first derivative \(P'(24)=0\)** and **second derivative \(P''(24)=23\neq0\)**, so **24 is a root of multiplicity exactly two**. This is stronger than the already known scalar divisibility \(29\mid N=P(256)\): it also supplies an independent exact derivative congruence on the entire printed byte ordering. For comparison at the page-length prime 179, \(256\equiv77\pmod{179}\) is a simple root: \(P(77)=0\), \(P'(77)=23\), and \(P''(77)=172\) modulo179, despite the scalar \(179^2\mid N\). Both calculations and all 29 candidate roots are asserted by [the original-grid source reproducer](../sims/page53_red_grid_common_factor.cjs). **A direct original-input factor inversion** divides the coefficient polynomial twice by \(X-24\) in \(\mathbb F_{29}\), yielding exactly **254 quotient GP symbols**, with both remainders zero and exact polynomial reconstruction. The native GP symbol IoC of this complete quotient is **0.03277209** (uniform GP expectation 0.03448276); its transliteration is unreadable. The double-root extraction therefore provides no direct GP plaintext or identified key. **Interpretation remains hypothetical**; the field and evaluation point were examined after finding the numerical factors, so this is no global discovery significance test, and a double root does not specify an inverse key.

**Independent smooth-factor source gate.** The seven listed small factors have product \(804592222910698766500766\), with **79.4126 bits** of factor product contributed by primes at most **300,000**. This is the largest such smooth component among all 18 marked red spans; the next largest is **48.2186 bits**, on p23. Every other red span except p27's 19-rune passage is too short in base 29 to reach the p53 smoothness score at all. Freeze the digits of these **two size-eligible red spans**, shuffle each source multiset independently using xorshift32 seed **0x53179**, and trial-divide up to 300,000 in **10,000** paired controls. Exactly **2** shuffled p53 values and **3** shuffled p27 values match/exceed the observed p53 log-smoothness. The **family-wide maximum** meets the observed threshold in **5/10,000** runs (add-one **6/10,001 ≈ 0.000600**). Separately, six shuffled p53 values match the original count of **four distinct factors between 10,000 and 300,000**. Both observed and control values are scored with one frozen routine in the linked reproducer, including an exact 79.4126039755-bit original-source assertion.

**Selection limitation:** the smooth-factor statistic and the 300,000 cutoff were chosen *after* inspecting the original factorization; this is a conditional within-family rarity comparison, not a global post-discovery significance test over all possible numeral encodings and arithmetic patterns. The especially composite red numeral is worth a dedicated number-theoretic inverse attempt, but its small factors do not by themselves reveal a cipher key.

**Conditional permutation check.** Freeze the actual 51 red GP digits as a multiset, shuffle their order uniformly with seeded rejection-sampled Fisher–Yates (**0x53179**) **200,000 times**, and measure divisibility by the **already discovered** page length 179. Exactly **1,110/200,000** shuffled integers are divisible by 179; add-one proportion **1,111/200,001 ≈ 0.005555**. Of the 51 exact cyclic rotations of the original red sequence, only the authentic rotation zero is divisible by 179. The parity factor 2 in the gcd is determined by the sum of the red digits and survives every reordering, so it must **not** be counted as an independent 1/2 rarity. This is a *source-multiset conditional* observation, **not a discovery-adjusted proof of intent**, because the prior selection of page 53 by the grid, the choice of numeral representation, and other possible arithmetic relationships were examined in an exploratory research setting.

**Eight-factor / eight-section original decryption gate.** The residual \(C\) also passes a 12-base strong probable-prime check, making **eight probable prime factors** of \(R\) in ascending order, the same count as the **eight unresolved printed section intervals** in [the complete rune transcript](../resources/lp2-transcription.txt). A specific candidate reconstructs the genuinely solved LP2 p56 prime/totient cipher: initialize the prime generator at one red factor for each corresponding section, use successive prime values \(p,p',\ldots\) to subtract \(\phi(p)=p-1\pmod{29}\), and permit each observed ciphertext-F to be either normally decrypted or literal, consuming no key step. This correspondence is source-motivated and speculative. The [new lossless beam-search inverse](../sims/page53_eight_prime_totient_beam.cjs) uses one frozen Shakespeare GP trigram model (0.3 smoothing), F-literal prior 0.2, and a 512-state per-section beam to select those hidden skip decisions.

**Actual successful solved-page control:** start at factor **2**, use the original **85-rune LP2 p56 ciphertext** with beam 1024, and the same skip-aware decoder recovers the known **AN END WITHIN THE DEEP WEB** text, selects **exactly position 56** as the true F interrupter, and has trigram score **−2.65041 nats/rune**. This is an original historically solved ciphertext success, stronger than a planted artificial control.

**Original eight-section result:** under source factors **2, 113, 179, 27241, 39901, 68909, 265541, C**, the physical section lengths are **729, 1145, 1738, 1894, 1021, 1433, 1680, 3316** runes, totaling **12,956**. After optimized F skips, the eight GP trigram scores range **−4.19131 to −4.16026 nats/rune**, and all eight decoded rune IoCs lie approximately **0.03425–0.03518**, near the uniform \(1/29\). The recovered prefixes are unreadable. The exact forward cipher reproduces the original **12,956/12,956** glyphs with the chosen skip positions, a necessary mechanical check that cannot authenticate a wrong key.

**Decision:** The page53 red numeral's factorization supplies a **concrete source-derived seed family**, but pairing its eight factors with the eight printed sections **does not decrypt native-GP English through the known prime/totient plus literal-F mechanism**. Beam-search succeeds on the authentic known control and fails on original unknown text. The 179 table/ink relationship and unusual smoothness remain open arithmetic evidence; no source-backed operation yet explains their intended use. Different factor order, other registers, an outer cipher layer, and a distinct cryptographic operation remain outside this narrow rejection. A further attempt needs a visible reason to choose those choices rather than another fitted model.

[Full original-input CommonJS reproducer](../sims/page53_red_grid_common_factor.cjs) checks the source-annotation offsets, arithmetic and variants, complete 18-span comparison, all 51 rotations, and the seeded multiset null without modifying either transcription.

## Natural reading-order comparisons

Applying the same exact prime-≤179 smooth-factor operation to alternate orders gives:

| Integer interpretation | Complete factor on primes ≤179 |
| --- | ---: |
| **Printed row-major** | **36,528,277,968** |
| Entire byte stream reversed | 231 |
| Column-major | 6,384 |
| Column-major reversed | 212,375,709 |
| Reverse symbols within each printed row | 4,059 |
| Reverse order of printed rows | 3 |

None of the five alternative orientations has **both or either** factor 29 and factor \(179^2\). The row-major reading is directly indicated by the table's page layout, whereas the alternatives serve as controls.

## Conditional selection-aware controls

The particular small factors were noticed **after** examining the original. Consequently, 1/36,528,277,968 is **not a valid post-search discovery p-value**.

To calibrate more general properties, hold the first source byte 0xCB and last byte 0x50 fixed while uniformly permuting the **254 interior bytes**, preserving their exact histogram. This conditions on the 2,048-bit width and trailing factor \(2^4\). Every control is reconstructed as a big-endian integer; no dictionary or proposed plaintext is used. Unbiased rejection-sampled Fisher–Yates with xorshift32 seed **0x20261110**, **250,000** draws:

| Source-number property | Observed | Shuffles meeting it | Add-one upper tail |
| --- | :---: | ---: | ---: |
| Divisible by **any** square of the 55 original page lengths | Yes | 2,198 / 250,000 | 0.008796 |
| Same, and divisible by alphabet size **29** | Yes | 68 / 250,000 | 0.000276 |
| Divisible by physical p53 size squared, **179²** | Yes | 10 / 250,000 | 0.000044 |
| Divisible by **179² × 29** | Yes | 1 / 250,000 | 0.000008 |
| Complete prime-≤179 smooth factor **at least 36,528,277,968** | Yes | 89 / 250,000 | 0.000360 |

The **last** statistic allows controls to obtain their large smooth factor using *any* eligible small prime powers, partly accounting for observing the factors after examining data. The page-square test likewise searches *all* physical page lengths. The properties are correlated, and their statistics were selected during exploration; **do not multiply their probabilities or claim this establishes intended cryptographic design**. Independent Python controls using a different Mersenne-Twister generator also found a rarity in the same range (111/250,000 controls met the smooth-factor threshold). This is a conditional rarity assessment, not an exhaustive audit of every possible interpretation of these pages.

## Cryptanalytic meaning and actionable next gate

The factorization creates a **potential number-theoretic connection between the 256-byte table, the 29-rune alphabet, and the 179-rune terminal p53 text**. No known source rule specifies that the table must be interpreted as this integer, and no plaintext, key, address or decrypting algorithm follows from division alone. The source number is **even** and so is not directly an ordinary RSA modulus; existing exact RSA and AES key tests in [grid-rsa-factor-test.md](grid-rsa-factor-test.md) remain valid.

**Original-source red-factor inverse gate (Agent 10).** To check whether the marked rune material actually contains a literal factor of the residual 2,013-bit integer `Q`, take all **225 red rune indices**, including the two solved control pages, in physical reading order. Exhaust **every contiguous 100–225-rune window**, in forward and reverse reading directions, as a positional integer under three fully specified input encodings: 0-based GP symbols in base 29, 1-based symbols in base 30, or their GP prime weights in base 110. The latter radix can represent the largest GP prime weight (109). This gives exactly **48,006** windows, each checked by exact Euclidean `gcd(window,Q)`. **All 48,006 gcds equal 1.** A synthetic 1,005-bit factor consisting of the first 207 red GP digits is recovered by the same search when implanted in a substituted test integer; the original source remains untouched. [Reproduce the exhaustive factor gate](../sims/grid_red_factor_screen.cjs). This excludes only **literal contiguous red-code factors** under these three encodings and two directions; arbitrary rune permutations, altered alphabets, hidden source transformations, and non-factor meanings of the table remain open. No additional authorial-intent probability follows from this negative test.

A genuinely stronger solution would require a **source-defined, reversible use of these factors or the 2,013-bit quotient**, predicting ciphertext/unknown plaintext of p53 and independently unfitted nearby pages (notably p55), with exact reencryption. The red stream has now been checked as a literal quotient factor under the bounded family above; avoid replaying those windows or the already-excluded generic unkeyed pad and RSA hypotheses.

**Reproduction:** [self-contained original-input CJS test](../sims/grid_bigint_factors.cjs), using only Node.js built-ins and the three listed shared resource files. Assertions cover the source byte hash, factors, page counts, six reading orientations, and every seeded matched-null count. This is provisional intermediate evidence in im-results, not a promoted decryption in results/README.md.
