# LP2 p45/p48 GP29 GCD links to the 256-byte grid remainder 2016

**Status (Agent 36, 10 November 2026): exact original-artifact arithmetic and conditional shuffle evidence; intended operation unknown.** This is a candidate *source arithmetic bridge*, not recovered LP2 plaintext, an authenticated key, or a solved continuation. It is confined to `im-results/` because the page pair and contextual interpretation were discovered retrospectively.

## Observation and exact operation

Encode the complete ciphertext runes of **physical LP2 p45** (270 symbols) and **physical LP2 p48** (271 symbols) as separate big-endian radix-29 integers, using the canonical Gematria Primus rune indices 0–28, without truncating words or inserting separators. Call these integers A and B. A scan over **all 1,485** unordered pairs of the **55 rune-bearing unsolved physical pages** shows that the largest original GP29 integer GCD occurs **uniquely** at pages 45 and 48:

$$
D=\gcd(A,B)=16{,}056=2^3\cdot3^2\cdot223.
$$

Now take the original **32×8 printed base-60 table**, decoded to its 256 byte values, and interpret its bytes in **printed row-major order as one big-endian integer N**. Exact original source arithmetic gives

$$
N\bmod D=2{,}016,\qquad N\bmod72=0,\qquad (N/72)\bmod223=28.
$$

The same equality may be written \(\gcd(A,B,N-2016)=16056\). The eight source-plausible byte traversals (row-major, row-serpentine, column-major, column-serpentine, each forward/reversed) give residuals respectively **2016, 5955, 6897, 6051, 456, 9387, 11511, 8619**. Only the natural printed order gives 2016.

Several **source-present** numbers admit a coherent, though retrospective, description:

- **8** is the table's original column count.
- **9** is the count of unsolved LP2 section bodies.
- **28** is the greatest zero-based GP29 index.
- \(8\cdot9\cdot223=16{,}056\), \(8\cdot9\cdot28=2{,}016\).
- **223** is the 48th ordinary prime; this correspondence with the editor's LP2 page label “48” depends on numbering convention.
- **2016** is also the year of the later signed Cicada image, separately studied for its 563×569 dimensions and relation to the original table [here](2016-image-dimensions-lag6-source-derivation.md). This supplies context, not proof that its year was intended as a modulus remainder.

The printed scan numerals themselves show no instruction to take GCDs of full pages. The page pair is **selected by maximizing GCD** over a large original page-pair family, and the remainder 2016 was noticed only afterward. The factorization into 8, 9, 223 and the comparison with 2016 may have been recognized because they are meaningful to a researcher. Treat the result as an arithmetically exact lead and avoid an uncontrolled rarity claim.

## Controlled shuffle diagnostics

The standalone CommonJS test [`lp2_crosspage_gcd2016_sft.cjs`](../sims/lp2_crosspage_gcd2016_sft.cjs) asserts all source counts, the full 1,485-pair maximum, the modular identities, eight traversal controls, and two deterministic null panels. It also has a synthetic pair with exactly the observed GCD and residue as a positive mechanics control. Shuffles preserve every source page's rune histogram and its first/last rune.

First, **125** seeded (`0x3301223`) independent whole-corpus resamples reshuffle every page and *refit the largest GCD over all 1,485 page pairs*. **8/125** have a maximum at least 16,056. Thus the maximum GCD alone is not exceptional in this limited null. **0/125** contain *any* GCD greater than 2,016 with the original grid remainder exactly 2,016. This second criterion was noticed post-selection; its zero count is exploratory rather than a discovery-wide significance calculation.

Second, because p48 already has independent table-related arithmetic in the research record, a narrower **5,000-shuffle** test (`0x31415926`) fixes original p48 and reshuffles the interiors of the other 54 pages. **13/5,000** trials produce at least one other full-page GP29 numeral divisible by 16,056, and **7/5,000** reproduce an exact GCD of 16,056 with the fixed p48. **2/5,000** have a divisible page within three page numbers of p48, and p45 specifically is divisible in **2/5,000**. These rates describe a particular source-conditioned shuffling mechanism; the original divisor was discovered using the original pages and so cannot be called preregistered.

The original table N has residue 9 modulo 223, since N is 72-divisible and 72×28 is 2016 modulo 16056. The quotient condition is exactly the same congruence, *not* independent evidence.

## Solve-path decision

This bridge is worth retaining because it unites original 270/271-rune page streams with an independently printed byte table under a very short, exact arithmetic rule; the natural table direction is singled out, and 2016 has independent source relevance. **It has not supplied a selected key, intermediate GP29 plaintext, or a rule for traversing other pages.** In particular directly dividing the two page numerals by 223 yields GP29 strings with essentially uniform letter coincidence, rather than readable prose.

A genuine continuation would need a visible clue selecting the p45/p48 pair and the full-page GP29 numeral interpretation *before* fitting numbers, followed by a reversible emission rule that transforms previously unknown ciphertext into recognizable plaintext. Avoid multiplying numerically attractive coincidences without that missing mechanism.

Reproduce from repository root: `node sims/lp2_crosspage_gcd2016_sft.cjs`. Source inputs are `resources/liber-primus/lp2-corpus.json` and `resources/liber-primus/base60-grid.json`.
