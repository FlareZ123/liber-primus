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

A genuinely stronger solution would require a **source-defined, reversible use of these factors or the 2,013-bit quotient**, predicting ciphertext/unknown plaintext of p53 and independently unfitted nearby pages (notably p55), with exact reencryption. Avoid recycling generic unkeyed pad and RSA hypotheses already tested elsewhere in the repository.

**Reproduction:** [self-contained original-input CJS test](../sims/grid_bigint_factors.cjs), using only Node.js built-ins and the three listed shared resource files. Assertions cover the source byte hash, factors, page counts, six reading orientations, and every seeded matched-null count. This is provisional intermediate evidence in im-results, not a promoted decryption in results/README.md.
