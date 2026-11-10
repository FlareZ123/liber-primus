# The 464-prime source table and two sixteen-page LP2 windows

**Classification:** source-anchored exploratory cryptanalytic hypothesis, tested as an exact reversible family on original LP2 runes. The direct GP-language interpretation fails a disjoint-page challenge. **No previously unsolved plaintext, authentic key, intended encryption method, or continuation has been recovered.**

## Potential human-visible construction

The recovered historical 2013 ISO `prime_echo` program prints the complete ordinary-prime sequence through **3301**. Exactly **464** primes lie at or below 3301, so `p_464 = 3301`. The number `464 = 16 × 29` accommodates one axis for the **sixteen** cells of the exact Fibonacci-indexed-prime square printed on LP2 physical page 15 and a second for the **29** Gematria Primus rune states. The page-15 square is documented in [the established spiral result](../results/fibonacci-prime-spiral.md); the separate remote-service omission caveat for the 2013 prime list is documented in [the historical prime source study](telnet2013-missing-primes-holdout.md).

The immediately following sixteen physical pages **16–31** carry **4,077** runes. The final manuscript section spans precisely sixteen physical pages **40–55**, carrying **3,316** runes because physical page50 is a 256-byte numerical grid with no runes. These are source-exact counts. Recognizing the `464=16×29` relationship and selecting these page groups was exploratory, so the numerical fit and page grouping are **not** established Cicada instructions. In particular, the earlier prime-printing program was a different historical artifact, and the authors may never have intended its prime inventory for LP2.

## A complete source-specific inverse

Generate the first 464 ordinary primes in increasing order as a proposed `16×29` key table. For page `j` in either sixteen-page block, select row `j mod16`, with an optional cyclic shift, in either the square's outward-spiral ordinal order or its printed row order. The 29-way column is the previous ciphertext rune or previously decoded GP rune, starting at index zero at each page head. Compare row-major and column-major addressing; each key cell is its original source prime or its Euler totient (`p−1`), modulo the decoder's active alphabet.

Four fully reversible outputs were predeclared:

1. Direct GP29: `P=(C±K) mod29`.
2. **Primitive-root field step:** a repeated ciphertext rune represents GP-EA (index28); otherwise `log_15((C_i−C_(i−1)) mod29)` is shifted by the table value modulo28. The source-red p40 prime quotient **15** has multiplicative order28 modulo29, hence defines the field logarithm uniquely.
3. **Sorted exclusion rank:** an observed nonzero ciphertext step is ranked among the 28 glyphs other than the previous ciphertext rune.
4. **Cyclic exclusion rank:** an observed nonzero step is ranked by its positive cyclic difference modulo29.

In the latter three models, the first glyph of each physical page is the unencrypted initialization rune; subsequent equality outputs map to index28. The entire family has **4×2×2×2×2×2×16 = 2,048** configurations (output layer, square order, table axis, source prime/totient, sign, previous state, and 16 cyclic phases), with no secret prime, invented per-cell key, original plaintext crib, or variable source corpus.

Rank each candidate by a 29-rune unigram log likelihood learned solely from the **first 240,000 characters** of the checked-in Shakespeare control, which yields **174,998** GP runes under the existing repository spelling convention. Choose the best within each output layer on the original pp16–31 and report its score unchanged on disjoint original pp40–55. The independent Shakespeare-reference baseline mean is about **−2.95484 natural-log units/rune**.

| Original candidate layer | Best pp16–31 train | Frozen pp40–55 continuation | Retrospective best pp40–55 |
| --- | ---: | ---: | ---: |
| Direct GP29 | **−4.18855348** | **−4.23080671** | −4.18352237 |
| Primitive-root field28 | **−4.13351899** | **−4.27852614** | −4.15468391 |
| Sorted rank28 | **−4.15276579** | **−4.26999068** | −4.16516466 |
| Cyclic rank28 | **−4.17162232** | **−4.21711091** | −4.16584655 |

No candidate approaches the native-GP English reference register; decoded samples are nonlinguistic. The retrospective heldout maxima are reported only as descriptive upper bounds after fitting all configurations to that same continuation. The result excludes only these four **direct native-GP interpretations** under the stated original-source table and clocks. It cannot distinguish whether the 464-count coincidence is meaningful for another layer, different intermediate register, unrelated history, or hidden key derivation.

## Lossless planted-language check

The [single-file CommonJS reproducer](../sims/prime464_fibonacci_table_inverse.cjs) implements both the source-original decoder and its exact forward emitter. A source-disjoint Shakespeare GP passage is encrypted through the genuine prime-464 table using the hidden **field28, printed square, row-major, prime, sign−, previous ciphertext, phase0** setting. The identical full **2,048-setting original-analysis fitter selects the true planted configuration at rank 1** on training; the decoder exactly recovers and re-encrypts all **7,393 / 7,393** synthetic GP plaintext runes, and its untouched continuation is **−2.97787010** nats/rune. This demonstrates that the same test would recognize a correctly sourced GP-language instance of its declared cipher family.

**Reproduction:** run `node sims/prime464_fibonacci_table_inverse.cjs` from the repository root under Node 22. Inputs are [canonical original rune indices](../resources/liber-primus/lp2-corpus.json) and the committed [Shakespeare spelling control](../resources/control/shakespeare_first300k.txt). The program recomputes all 464 primes and the primitive-root table, asserts the precise original page counts, rescans all configurations and tests the concealed-key positive. No continuous automated workflow or source-file changes were required.

**Research decision:** This is a closed negative for a historically motivated, fully keyed direct-GP tableau. A future extension requires an original-source instruction supplying a genuinely different output alphabet, operation, or nontrivial key schedule, plus recovered original plaintext and exact forward reconstruction. Avoid blind reordering of the same `16×29` table.