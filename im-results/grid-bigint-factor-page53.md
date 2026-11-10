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

**Independent smooth-factor source gate.** The seven listed small factors have product \(804592222910698766500766\), with **79.4126 bits** of factor product contributed by primes at most **300,000**. This is the largest such smooth component among all 18 marked red spans; the next largest is **48.2186 bits**, on p23. Every other red span except p27's 19-rune passage is too short in base 29 to reach the p53 smoothness score at all. Freeze the digits of these **two size-eligible red spans**, shuffle each source multiset independently using xorshift32 seed **0x53179**, and trial-divide up to 300,000 in **10,000** paired controls. Exactly **2** shuffled p53 values and **3** shuffled p27 values match/exceed the observed p53 log-smoothness. The **family-wide maximum** meets the observed threshold in **5/10,000** runs (add-one **6/10,001 ≈ 0.000600**). Separately, six shuffled p53 values match the original count of **four distinct factors between 10,000 and 300,000**. Both observed and control values are scored with one frozen routine in the linked reproducer, including an exact 79.4126039755-bit original-source assertion.

**Selection limitation:** the smooth-factor statistic and the 300,000 cutoff were chosen *after* inspecting the original factorization; this is a conditional within-family rarity comparison, not a global post-discovery significance test over all possible numeral encodings and arithmetic patterns. The especially composite red numeral is worth a dedicated number-theoretic inverse attempt, but its small factors do not by themselves reveal a cipher key.

**Conditional permutation check.** Freeze the actual 51 red GP digits as a multiset, shuffle their order uniformly with seeded rejection-sampled Fisher–Yates (**0x53179**) **200,000 times**, and measure divisibility by the **already discovered** page length 179. Exactly **1,110/200,000** shuffled integers are divisible by 179; add-one proportion **1,111/200,001 ≈ 0.005555**. Of the 51 exact cyclic rotations of the original red sequence, only the authentic rotation zero is divisible by 179. The parity factor 2 in the gcd is determined by the sum of the red digits and survives every reordering, so it must **not** be counted as an independent 1/2 rarity. This is a *source-multiset conditional* observation, **not a discovery-adjusted proof of intent**, because the prior selection of page 53 by the grid, the choice of numeral representation, and other possible arithmetic relationships were examined in an exploratory research setting.

**Decision and next operational test.** The 179 link now touches the **table**, **physical page length**, and a **separate colour-marked integer**, making the factor a stronger candidate for an intended arithmetic clue than a table factor viewed alone. However, dividing \(R\) by 179 yields **50 base-29 digits of nonreadable GP text**, and no cipher state, genuine plaintext, or externally verifiable key has been recovered. A next decoding proposal should specify how \(N/179^2\), \(R/179\), or their factors drive a **lossless, independently constrained transformation** and predict an untouched original passage; enumerating arbitrary transforms around these numbers would overfit this relationship.

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
