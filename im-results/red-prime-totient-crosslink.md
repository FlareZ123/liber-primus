# Source-marked red runes: a provisional cross-page prime-totient relation

**Evidence:** exact arithmetic on independently documented red-ink spans and a deterministic, family-scoped rotation test. **Classification: exploratory ciphertext-side structural alignment.** It does not decrypt any currently unsolved rune or establish a cryptographic key.

## Exact manuscript input and arithmetic

Use the corrected physical-page annotations in [lp2-ink-annotations.json](../resources/liber-primus/lp2-ink-annotations.json), joined by *physical page index and rune offset* to the 29-symbol [canonical LP2 corpus](../resources/liber-primus/lp2-corpus.json). This yields **16 distinct red-rune spans among unsolved pages 0–55**; the two solved-page heading spans 56–57 are excluded. Sum each span's assigned **Gematria Primus prime values**, then divide by 29 only when the sum is exactly divisible by 29. No red span is adjusted, cropped, enlarged or selected by its numerical score.

Exactly three unsolved red spans have a GP prime sum divisible by 29:

| Physical LP2 page | Start offset | Red runes | Exact prime sum | Quotient by 29 |
| --- | ---: | ---: | ---: | ---: |
| **15** | 0 | 9 | **638** | **22** |
| **40** | 0 | 8 | **435** | **15** |
| **53** | 128 | **51** | **2262** | **78** |

The first source is the **two-word red title** immediately above the 4×4 Fibonacci-prime square, whose existing exact spiral construction contains the **22nd prime, 79**. The terminal p53 source is the full **51-rune** stanza, including the leading red **ᛏ**, previously misread as a separate graphic. Here, the final sum **2262 = 29 × 78** and **78 = φ(79) = p_22 − 1**, using the same prime-totient operation as the independently solved LP2 page 56.

The corrected first rune is essential: dropping red **ᛏ** (GP prime value 59) changes the p53 sum to **2203 ≡ 28 (mod 29)**, destroying the 29-divisibility. Its presence and colour are established from the original JPEG; the mathematical relationship did not determine whether it should be included.

The p40 title has a separate exact quotient 15; this report does not infer a page jump, plaintext, or key from that number. It is a third source-marked example of a 29-divisible red sum.

## A finite cross-span test, including all eligible pairs

For each of 16 original unsolved red spans with sum S, define a quotient q=S/29 if the division is integral. For **every ordered pair of distinct red spans A,B**, ask whether

\[
q_B = \varphi(p_{q_A}) = p_{q_A}-1,
\]

where \(p_k\) is the **kth one-based ordinary prime**. This relation is exact and uses the historically authentic p56 prime-totient transform. The original manuscript has exactly **one directed pair** meeting the rule: **p15 offset0 to p53 offset128**, with (q_A,q_B)=(22,78). The 16 spans, their placements and the modulus 29 are source-defined; the *choice to examine this numerical relation* followed exploration of their observed sums and is therefore not pre-registered evidence.

To calibrate the **whole 16-span pair selection**, circularly rotate each distinct physical page's complete ciphertext rune stream by a seeded independent uniform offset. Preserve the page's exact rune inventory, local cyclic adjacency, red span lengths and red span positions. Compute the same red sums and scan **all directed pairs** after each rotation, 250,000 times, fixed seed \`0x17bca191\`.

| Statistic | Original | Null exceedances / 250,000 | Add-one upper-tail |
| --- | ---: | ---: | ---: |
| At least 3 spans' sums divisible by 29 | 3 | 4,087 | **0.016352** |
| Any ordered prime-totient related pair | 1 | 397 | **0.001592** |
| Both preceding criteria in the same manuscript | yes | 170 | **0.000684** |

Expected number of 29-divisible spans under this null is **0.542788**. The observed arithmetic is unusual under this particular family-scoped rotation model, even after scanning all 16 marked red spans. These three statistics are correlated and were selected during investigation; their p-values are *descriptive conditional tails*, not discovery-wide probabilities.

As a smaller exact enumeration, all **159 × 179 = 28,461** independent cyclic offsets of the two source pages p15 and p53 yield precisely **one** match for the ordered prime-totient quotient condition. The same one offset pair has the exact observed sums 638 and 2262. Conditional rate: **1/28,461 ≈ 0.000035136**. This is an exact test of that **already selected page pair**, not an independent replication or a probability that the creator intended the relationship.


## Newly identified three-page pointer extension (exploratory)

The page-40 red heading supplies an additional, doubly interpretable quotient: its GP prime sum is **435 = 29×15**. The value **15** names physical LP2 page **15** and also the zero-based GP rune index of **ᛋ**, whose assigned GP prime is **53**, another red-marked physical page. Combined with page 15's quotient **22** and page 53's quotient **78 = p_22 − 1**, this defines a three-edge page/prime/totient triangle among three independently colored spans. An exact all-16-span analysis under independent whole-page circular rotations gives conditional probability **22669/45960075084 ≈ 4.9323244×10^-7** of any such triangle. The arithmetic rule was discovered post-selection and has neither a decoded cipher nor an established authorial interpretation; the conditional tail does not correct for the original rule search. [Full equations, all-span scope and exact reproducer](red-span-triangle.md).

The cross-page quotient pair is now extended to a three-page pointer and a full-order modular fixed-point in [red-span-triangle.md](red-span-triangle.md). The primitive-root key challenge confirms the arithmetic identities **53^15≡15 mod79**, **ord₇₉(53)=78** and the unique 29-GP-index self-index/full-order intersection. It tests source-fixed additive mod29 `53^t mod79` keys on 5,191 original runes, with first exponent1 or15, with/without ᛋ clock skips, and any one outer substitution. Matched null MI shows no decoding signal; authentic GP plants preserve MI0.45–0.47. [Original-input CI success 42778598625](https://github.com/FlareZ123/liber-primus/actions/runs/42778598625). The exact triangle's [own CI success 42776466418](https://github.com/FlareZ123/liber-primus/actions/runs/42776466418) is independently confirmed. No actual LP2 key or plaintext. The modular relations were inspected after seeing the selected original quotient values.

## Interpretation and next falsifiable requirement

This result links **an independently red-marked title over the established Fibonacci-prime square**, **a separately red-marked final stanza**, and **the prime-totient transform already authenticated by the solved manuscript**. It may encode a checksum, select a prime/offset, or be an unusual chance alignment amplified by exploratory selection. Nothing yet identifies the action of 79, 78 or 22 on original cipher runes. No prime/key should be declared recovered.

**Direct prime-totient key-start inversion attempted:** One source-locked interpretation takes each original red prime-sum quotient `q` as the one-based prime-stream index for the genuine LP2 p56 totient generator `K[i] = phi(prime[i]) = prime[i] - 1 (mod 29)`. A separately declared class starts instead at `prime[q]` or `phi(prime[q])` as the prime index. Test both signs, direct/atbash carriers and literal-F skips: **24 model configurations**, with the same rule across three source-marked positions. Decode the body after the red headings of p15 (1,883 runes) and p40 (2,400), and the subsequent terminal pages after p53 (299); the section/cipher positions are fixed before scoring. Select only on p15. Its best GP IoC is **0.03621022** with index `q-1`, sign plus, no atbash, F skip. The unchanged setting gives **0.03606121** and **0.03530785** on p40 and the terminal interval respectively. Even fitting each span separately, the maxima are only **0.03621022**, **0.03667361**, **0.03598123**, far below the approximately **0.06** of GP-encoded English controls. A plant using the three original q-derived prime-index starts exactly recovers **4,582/4,582** independently encoded Shakespeare runes (original p15-control IoC **0.06325685**). Therefore the remarkable p15→p53 arithmetic relationship **does not furnish a direct solved-page-style prime-totient running-key decryption** under these 24 source-derived conventions. [Exact runnable inverse](../sims/red_quotient_totient_key_holdout.cjs), [successful on-demand CI](https://github.com/FlareZ123/liber-primus/actions/runs/42776082402). The F-skipped model itself inflates the zero-rune frequency; the reported scores do not establish a key.

## Opening red heading and historical square center: 331 is an exact but weakly selected arithmetic candidate

**Agent 43, 10 November 2026.** A separate opening-red source arithmetic
observation comes from the *two actual red words on physical LP2 page 0*,
of lengths **8 and 5 runes**, without deciphering them. Their GP-prime
sums are **347** and **315** respectively. The source-defined combined
sum is **662 = 2 × 331**; the mean of the two word sums is therefore
**331**, the historical middle value in Cicada's earlier
seven-by-seven magic square. This is an exact cross-artifact
number equality, not a new key or plaintext. The same 13 GP symbols
are original ciphertext, regardless of an external proposed Latin
reading `SECUENDI RATIO`.

The relation was *noticed after reading these first-word sums*, so a
single-target page-0 tail probability overstates its evidence. Holding
the 13-red-rune span fixed and exhaustively circularly rotating the
original full **262-rune page 0** yields the exact target sum 662 at
**2 of 262** shifts (0 and 139). In a broader deterministic
family-sensitivity calculation, examine **all 18 annotated red spans
across 15 distinct physical pages, including the two solved-page
headings**, against positive multiples 1–5 of all three historically
named square centers **91, 331 and 809**. Rotating each complete
source page independently through its exact set of offsets, preserving
the red source window positions and lengths, gives an exact
probability **0.17473925245832989** of at least one such hit anywhere
in that 18-span family. The genuine input has just the page-0
**662** hit under this class. These are *conditional null*
calculations and do not correct the broader postselection of the
mean, multiplier family, centers and red source subset.
The arithmetic can motivate independently frozen hypotheses but
does not establish deliberate encryption.

To test a direct consequence rather than leave a numerological
association unchallenged, the independently runnable
[`red_heading_331_seed_inverse.cjs`](../sims/red_heading_331_seed_inverse.cjs)
takes four *unfitted source integers* **331, 662, 347 and 315** as
complete fixed 32-bit PRNG seeds. It tests six exact existing
generators, two key clocks, five reversible F29/rank28 inversion
models and both signs: **480 original LP2 models on all 12,956
runes**, preserving original page boundaries. All 480 yield
unintelligible near-flat GP outputs. The highest source-native
GP-language score on the original is **−4.23570050 nats/rune**
(seed347, Numerical Recipes LCG, book clock, field28, plus),
compared with the **−2.93461644 nats/rune** native solved-LP1
source reference. Directly seeded 331 ranks lower still,
at **−4.24371405 nats/rune**. A seeded 331
MT19937 true-source `field28` encrypt/decrypt plant recovers
**12,901/12,901 noninitial GP runes**, with native score
**−2.95824182**, showing the procedure can detect actual source
ciphertext in this declared family. [Completed Windows
CI](https://github.com/FlareZ123/liber-primus/actions/runs/42812546242)
executes both the original red arithmetic and this new finite inverse.
The result is **negative for those 480 raw-seed constructions**,
with no claim against other key derivations or nonlinear algorithms.

**Unresolved mechanism:** A different, independently specified rule must convert the arithmetic link into a repeatable ciphertext transformation before the relationship can support a decryption. Its coincidental or intentional origin remains unsettled.

**Independent reproduction:** [single runnable CommonJS test](../sims/red_prime_totient_crosslink.cjs), with source-annotation assertions, exact prime sequence, exhaustive two-page rotations, full 250,000-sample 16-span familywise calibration. [Successful Windows Node.js 22 workflow, run 42771461787](https://github.com/FlareZ123/liber-primus/actions/runs/42771461787). [Manual-only workflow](../.github/workflows/red-prime-totient-crosslink.yml).
