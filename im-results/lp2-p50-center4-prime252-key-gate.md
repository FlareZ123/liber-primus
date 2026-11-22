# The 32×8 p50 table's central four GP primes sum to its remaining 252 cells

**14 November 2026, Agent44. Classification: newly measured original-grid arithmetic, conditional candidate key, and bounded original/solved-input negative. No previously unknown LP2 plaintext, historical key or puzzle destination recovered.**

## Independent source operands and conditional discovery

The 2014 physical LP2 pp49–51 print a single **32×8** table of 256 two-character sexagesimal-looking tokens. Physical p50 is its middle 13 rows. The already deciphered closing p57 says **“WE MUST SHED OUR OWN CIRCUMFERENCES. FIND THE DIVINITY WITHIN AND EMERGE.”** Earlier original-image work establishes both that p55 has exactly **76 runes**, matching the outside ring, and that p57's final **52** runes start with **SHED** at precisely the deepest ring boundary of the 76/68/60/52 four-ring traversal. These alignments motivate asking whether the table has a distinct *center*, without authenticating any particular arithmetic.

For this even-by-even rectangle, the center is a unique **2×2 block**, zero-based rows 15–16 and columns 3–4. Its actual tokens are:

| Original cell (one-based) | Printed base60 token | Conditional decoded byte | Byte mod29, GP rune | Published GP prime |
| --- | --- | ---: | --- | ---: |
| (16,4) | 0s | 54 | AE (index25) | **101** |
| (16,5) | 0D | 13 | P (index13) | **43** |
| (17,4) | 20 | 120 | R (index4) | **11** |
| (17,5) | 2n | 169 | A (index24) | **97** |
| **Total** | | | | **252** |

The *prime-weight sum of the four center cells is exactly **252**, the number of cells remaining after deleting precisely those four center positions from 256*. The operation byte→GP index through residue mod29 is a hypothesis. The manuscript supplies no direct instruction to reduce these table bytes modulo29, use the GP primes, sum a center, or treat a 252-cell complement as a key. The byte representation itself assumes the conditional conventional base60 alphabet. This result is a *discovery about published source numbers*, not plaintext.

Among **all 31×7=217 neighboring 2×2 blocks** in this same printed table, the center is the only block whose four residue-mapped GP prime weights sum to 252. This in-source uniqueness does not establish statistical significance: under the simple independent-uniform-byte reference the expected number of such blocks is about **1.91**, and many arithmetic relationships, source interpretations and target constants have already been explored retrospectively. A raw 1/217 claim would be misleading.

The same **252** also equals **3×84**, and **84** is the independently verified number of consumed prime-totient key positions on genuine solved physical p56 (85 printed runes, one plaintext-F bypass at local rune56). The old source-linked 2013 signed H quadratic times original p39 G quadratic also divides the 256-grid GP29 polynomial to leave a **252-symbol quotient**. These are potentially useful shape associations, yet they do not prove that geometric center removal is polynomial division: with both 252-registers in their unshifted printed order, **only 5 of 252 GP values coincide**, at offsets **0, 38, 156, 169, and 219**. Their equality is a cardinality observation, not the same operation.

## Direct candidate four-symbol GP key against original p55

The center provides the natural GP-index sequence [25,13,4,24] in printed row-major order or [25,13,24,4] clockwise. A different source-derived four-value pad takes the same cells' GP **primes reduced mod29**, giving [14,14,11,10] and its clockwise counterpart. Each sequence is applied repeatedly without a fitted phase to all **76 original physical p55 runes** under both direct additive signs. The original p55 coincidence index is **0.037894737**.

| Four-symbol key source and order | C−K GP29 IoC | C+K GP29 IoC | Full legal solved-p56-style F-bypass state |
| --- | ---: | ---: | --- |
| GP indices, row major | 0.035088 | 0.029825 | 2 valid end clocks, unreadable |
| GP primes mod29, row major | 0.035439 | 0.037895 | **Impossible at original p55 rune 3** |
| GP indices, clockwise | 0.034035 | 0.034035 | 3 valid end clocks, unreadable |
| GP primes mod29, clockwise | 0.035439 | 0.038246 | **Impossible at original p55 rune 69** |

For the exact F-bypass test, ciphertext F can be a literal plaintext F that does not consume the key, or a keyed non-F plaintext that happens to encrypt to F. **All legal clocks** are propagated, including both alternatives, so the reported impossibilities cannot be repaired by choosing a different F mask. The F rule is historically authentic on p56 but not confirmed on p55. The ordinary additive decodes are independently nonlinguistic and remain near the 29-symbol random IoC; no portion is promoted to recovered plaintext. All eight original-key arithmetic outputs reencrypt their 76 source runes, and native p57 planted positives pass the same inverse for each pad.

## Untouched known-p56 84-symbol discriminator

As a second direct consumer, remove the four center positions from the table in its original **row-major** order to get the actual **252** bytes, reduce to GP29 residues, and form **84 triple groups** in either of two natural fixed geometries:

1. consecutive triples (Q[3i],Q[3i+1],Q[3i+2]);
2. three consecutive 84-length lanes (Q[i],Q[i+84],Q[i+168]).

For each triple, interpret its output either as the byte-residue sum mod29 or as the sum of its three published GP prime weights mod29. Compare the resulting unmodified **84 GP shifts** with *every position* of the actual authentic solved-p56 prime-totient pad (prime_i−1) mod29. The authentic source p56 cipher itself is first recovered **85/85**, with the single F skip and **84 key symbols consumed**, before performing this independent test.

| Original complement geometry / fixed reduction | Exact solved-p56 key shifts recovered |
| --- | ---: |
| Adjacent triples / byte-residue sum | **0/84** |
| Adjacent triples / GP-prime sum | **0/84** |
| Three 84-lanes / byte-residue sum | **3/84** |
| Three 84-lanes / GP-prime sum | **3/84** |

Thus no *direct* center-excised 3→1 sum law recovers the independent p56 key. This test is narrower than every conceivable keyed operation or a possible application to p55; it does not license a new search over arbitrary 84-phase offsets or mixed prime reductions. Importantly, the geometric 252-byte complement is **different** from the previously examined 252-symbol polynomial quotient: the quotient triplet sum's previously reported **10/84** retrospective matches do not transfer to this geometric source stream.

## Reproduction and research choice

The standalone **Node.js 22 CommonJS source-original regression** [sims/lp2_p50_center4_prime252_knownpad_sft.cjs](../sims/lp2_p50_center4_prime252_knownpad_sft.cjs) takes only the committed 256-byte table and original GP29 corpus. It asserts the 256-byte SHA256, center row/column/token and prime values, all 217 source windows, exact 252 positions, H×G polynomial quotient and five co-located matches, actual 85/85 p56 solved cipher, all eight p55 pad inverses, complete F-state branches, solved-p57 planted positives and four 84-key known-plaintext gates. The arithmetic, 85/85 p56 source-positive, all F clock results and all four pad comparisons were independently executed on the original live fetched repository data in this invocation. The complete [Windows Node.js 22 original-checkout execution passed (run 43646410421)](https://github.com/FlareZ123/liber-primus/actions/runs/43646410421).

The visible center/“within” geometry is a **conditional candidate lead** that might help if another originally printed instruction identifies how to read its four GP primes or 252 remaining table entries. The direct key and known-p56 consumers above fail, and the motif's historical relevance is not independently established. **Do not treat this numeral coincidence as a plaintext breakthrough, expand arbitrary arithmetic sweeps to rescue it, or replace the unverified hypothesis with an established mechanism.** A useful successor requires an independent operation or key and a held-out original plaintext prediction.
