# Terminal 256-rune polynomial inverses: universal roots, all-prime differences, and unknown-alphabet rank gates

**Agent10, 16 November 2026. Classification:** exact source-known necessary-condition exclusions for *direct* univariate polynomial encodings. Two 256-position register choices are tested: original consecutive terminal order and ascending stable rank of the original 256-cell numerical table. In both, no GF257 degree≤160 polynomial can carry the genuine 180 known GP runes and 20 withheld positions under **any** fixed injective 29-rune field encoding. Source-order GF257 degree179 interpolation additionally predicts 71/76 values outside ordinary GP29; source-table rank degree179 predicts 64/76 outside. **No new original plaintext, authenticated key or destination recovered.**

## Original selection and competing premise

Physical pp49–51 print 32×8=256 numerical cells, while original physical p55 contributes 76 unknown GP29 runes, genuinely solved p56 contributes 85 plaintext runes, and clear p57 contributes 95 runes, also 256. P57's phrase *shed our own circumferences* could motivate putting 76 unknown positions on a 32×8 perimeter. P15's 4×4 printed number array could separately motivate 16 polynomial coefficients (degree≤15); the table's 32 rows could instead motivate 32 coefficients (degree≤31). These hypotheses **do not** appear as explicit author instructions: the original sources give neither polynomial codec nor finite field, evaluation order, or message receiver. The first physical p55 rune also completes a word from p54.

The following claims require no guess at those missing keys. They use the original 180 known ending runes; the full 76 unknown p55 glyphs are never inspected before computing an interpolation candidate.

## A. Field-independent root theorem: every order and GP embedding

Let P be any nonconstant degree-d polynomial over *any* field. Represent each fixed GP rune r by one fixed field value a (any injective map) and sample at distinct evaluation points, in arbitrary order. If the same rune occurs at m distinct positions, then P(X)-a has at least m distinct roots, hence d≥m. A constant polynomial is impossible because the actual known register contains many different runes.

The authenticated p56 inverse consumes exactly 84 consecutive-prime-minus-one shifts; the unique plaintext-F at local index56 remains literal F and does not consume a prime. Its first five plaintext runes are ANEND. The unmodified p57 is clear.

| Genuine source register | Length | GP E (index18) count | Universal necessary degree |
| --- | ---: | ---: | ---: |
| Authentically decoded p56 | 85 | **16** | ≥16 |
| Literal clear p57 | 95 | **15** | ≥15 |
| Decoded p56 concatenated with p57 | 180 | **31** | **≥31** |
| As-printed p56 ciphertext concatenated with p57 | 180 | **17** | **≥17** |

The direct p15 sixteen-coefficient/degree≤15 univariate code is impossible for **every finite field, every distinct evaluation point assignment and order, and every injective fixed rune encoding**. The authentic plaintext case excludes all degrees≤30 even without selecting positions or field. This is a universal theorem, not a statistical pattern.

## B. Stronger obstruction when evaluation coordinates are original page-order integers

Freeze a second, more restrictive original-readable hypothesis: the 256 terminal rune positions occupy **exactly** x=0,1,…,255, in printed terminal page order; original p55 corresponds to x0–75 and genuine p56+p57 to the **consecutive known positions x76–255**. Encode GP29 by original numeric indices 0..28 inside a field of **prime characteristic p≥257**, so all 256 coordinates are distinct. This includes GF257 and every larger prime field, plus extensions with that prime characteristic. There is no interpolation-key parameter or coordinate permutation.

For any polynomial of degree at most 177, its **178th forward difference vanishes** at every consecutive field point. Compute the two available 178th forward differences on the authentic 180-number plaintext register, *exactly as integers*:

\[
\begin{aligned}
\Delta^{178}y_0&=762567047758276853221512788027095270860881683297336568,\\
\Delta^{178}y_1&=-683485752245144065473299166536473874153741659675909868.
\end{aligned}
\]

Their integer gcd is **4**. A characteristic p≥257 cannot divide both values. Consequently:

\[
\boxed{\text{No polynomial of degree }\le177\text{ fits the 180 authentic known symbols at consecutive original positions over any field of characteristic }p\ge257.}
\]

The mixed register using p56 as-printed ciphertext has 178th-difference gcd **1**, so it too excludes all those low degrees. This result excludes even a proposed 32-coefficient/degree31 univariate code in the **specific natural consecutive-position, original-GP-index model**, and is stronger here than the field-independent degree≥31 bound. It does **not** extend the original all-field/permutation theorem to arbitrary coordinates: the consecutiveness and numeric mapping are load-bearing.

The authentic 179th forward difference has nonzero remainder **180 modulo 257**, so the interpolation polynomial fitting the 180 data points has degree **exactly 179 over GF257**. Such an interpolant is guaranteed to exist and therefore supplies no positive evidence for the code by fitting known data alone.

## C. Freeze GF257's unique degree≤179 interpolant and predict withheld p55

Take the smallest prime field with 256 distinct original-index coordinates, GF257. From only x76–255 and their exact 180 source values, build the unique degree≤179 interpolant by Newton's forward-difference formula

\[
P(76+t)=\sum_{k=0}^{179}\Delta^k y_0 {t\choose k}\pmod{257}.
\]

Every factor and inverse exists for k<257; negative t is valid, and **all** original 180 inputs are recovered exactly. Evaluate *without fitting* at x0–75. A direct GP29-valued codeword must predict one of 0..28 at each of these positions, even when the actual missing plaintext is unknown:

| Input register fixed before prediction | Valid GP29 predictions among 76 | Out-of-GP29 predictions | Accidental equality to printed p55 ciphertext |
| --- | ---: | ---: | ---: |
| Authentically decrypted p56 + clear p57 | **5** | **71** | 0 |
| As-printed p56 ciphertext + clear p57 | **14** | **62** | 1 |

The genuine-plaintext prediction begins \`[198,100,167,158,59,60,229,72,158,95,181,33]\`, which is outside the 29-rune alphabet at eleven of its first twelve positions. This is a decisive failure of **the natural GF257 degree179 original-terminal code as a direct GP29 plaintext generator**. The ciphertext-equality column is for transparency only and is not a test of p55 plaintext, which remains encrypted.

An independently planted degree31 polynomial over GF257 is sampled at 180 known trailing positions. The exact same Newton inverse reconstructs **every one of 76 withheld field values**, confirming that the inverse can succeed when the proposed codeword relationship actually holds. This plant allows unrestricted GF257 outputs, as a correct algebraic test should.

## D. Unknown GP field values: source-original degree31 exclusion in every large characteristic

The first theorem allows degree31. That boundary is tested **without assigning numeric values to any GP rune**, under two original-readable distinct integer coordinate arrays:

1. original contiguous terminal rune order \`x=0,…,255\`;
2. stable ascending **rank** of the 256 original printed p50 numeric-table byte values, ties broken by source cell index (the original bytes themselves have repetitions and are invalid as distinct coordinates).

The 31 authentic E locations are \`e₁,…,e₃₁\`. If a degree-exactly-31 polynomial P fits all symbols in a field, it has the forced form

\[
P(X)=v_E+a\prod_{j=1}^{31}(X-e_j),\quad a\ne0.
\]

For any different rune \`r\` repeated at two source positions x and x', its unknown field label is the **same** both times. Consequently \`R(x)−R(x')=0\` in the field where \`R(X)=∏(X−e_j)\`, independently of the field embedding, numeric GP values, E's value, or the unknown nonzero a. Calculate these differences as exact integers across every repeated non-E rune, then take their gcd:

| Distinct integer evaluation coordinates | Exact gcd of repeated-symbol root-product differences | Prime factorization |
| --- | ---: | --- |
| Natural terminal position x0…255 | **18,962,192,793,600,000** | \(2^{21}3^{10}5^5 7^2\) |
| Original table's ascending 256-byte rank | **2,528,292,372,480,000** | \(2^{22}3^{9}5^4 7^2\) |

No prime characteristic ≥257 divides either gcd. Both source orders therefore exclude a direct degree31 polynomial over **every field with characteristic ≥257**, regardless of injective fixed GP29 field labeling. Each register retains all 256 distinct integer points at these characteristics. This rank-order theorem is **distinct** from the earlier numeric-GP forward-difference result, which holds for a wider degree range but only for natural consecutive positions and literal GP indices. A degree31 GF257 synthetic polynomial with the same 31 E roots satisfies the repeated-symbol congruences, confirming the test can pass when the mechanism is actually present.

## E. A complete source-rank decoder, and a stronger GF257 unknown-alphabet bound

A direct inversion with the p50 rank coordinates is possible even without the degree31 assumption: use the 180 genuine GP index values at source-rank positions 76…255 and interpolate the unique degree≤179 GF257 polynomial by Lagrange weights. Its leading coefficient is **114** (hence exact degree179). The original 76 withheld source-rank positions predict **12/76 GP-range values and 64/76 values outside the permitted GP29 range**. The first twelve are \`[65,180,114,233,254,206,176,203,13,24,95,184]\`. A planted degree31 field polynomial in these identical 180 known positions is recovered at **all 76** withheld positions by that same interpolation. The source-rank GF257 model fails to produce a directly representable p55 plaintext.

A more general attack leaves **every** numerical GP rune-to-GF257 field assignment unknown. The actual 180 source-known runes contain **23 different GP labels** and **157 repeated-symbol equality conditions**. For a single polynomial P of degree≤160 with completely unknown coefficients, those equalities form a homogeneous linear system over GF257 on its 160 nonconstant polynomial coefficients. Its exact row-reduced rank is **157** for each frozen order, with the *first 157 monomial columns already independent*. Hence degree≤157 permits only a constant polynomial, incompatible with 23 distinct rune values. At degree≤160 there are just **three** free nonconstant coefficients. The constant term and any nonzero scalar multiplier change the numerical labels but preserve which field values are equal, so it suffices to enumerate every projective direction:

\[
(1,a,b),\ a,b\in\mathrm{GF}(257);\quad(0,1,b),\ b\in\mathrm{GF}(257);\quad(0,0,1).
\]

These are precisely \(257^2+257+1=\textbf{66,307}\) candidates per source order, covering *every* nonconstant polynomial through degree160 and *every* possible fixed injective rune-field embedding. Each candidate must assign 23 different field values to the 23 known rune classes. That leaves **six** unused rune classes out of GP29, so even the **first 20 unknown p55 positions**, whose ciphertext values are never inspected, can introduce no more than six additional distinct field values. Results:

| Frozen coordinates | Projective directions tested | Injective on all 23 known rune classes | Fewest additional distinct field values in first 20 unknown slots | Full 29-rune model survivors |
| --- | ---: | ---: | ---: | ---: |
| Natural x0…255 | **66,307** | 23,974 | **10** (six allowed) | **0** |
| P50 stable ascending 256-byte rank | **66,307** | 23,998 | **10** (six allowed) | **0** |

**Exact conclusion:** For both original-readable coordinate maps, **no direct GF257 polynomial of degree≤160 represents the genuine 180 plaintext runes together with even the first 20 withheld positions using any 29-symbol injective field alphabet**, regardless of polynomial coefficients and including every arbitrary GP29 relabeling. This is stronger than excluding literal GP29 numerical values, but only covers **GF257** and those two coordinate maps. A verified synthetic \`P(x)=x^16\` over GF257 has only 17 different outputs across all 256 positions; it passes the degree≤160 symbolic-equality and 29-symbol count gates, demonstrating that the gate does not mechanically reject every low-degree restricted-alphabet polynomial.

The projective enumeration tests field-value **equality and cardinality**, and never uses any unknown p55 rune identity. The source's apparent 256-count match still does not select a genuine terminal polynomial code, so the negative cannot be extrapolated to unknown nonlinear transforms or field/location choices.

## Reproduction and limits

- Canonical input: \`resources/liber-primus/lp2-corpus.json\` (Git blob \`054f2a0f780b7d46901acbe3d9bf4f0ac1801165\`), original p56 85 runes, p57 95 clear runes; source table \`resources/liber-primus/lp2-grid-256.json\`. Only the **positions** of the 76 missing p55 runes are used in interpolations; the actual p55 symbols are withheld in every fit.
- \`sims/lp2_terminal256_known180_polynomial_rootbound_sft.cjs\`: field-and-order-independent repeated-E degree bound and genuine p56 F-bypass control.
- \`sims/lp2_terminal256_allprime_difference_gf257_suffix_sft.cjs\`: BigInt forward-difference gcd, all-prime-characteristic consecutive-order restriction, exact natural GF257 Lagrange inverse and degree31 plant.
- \`sims/lp2_terminal256_degree31_repeatclass_gcd_sft.cjs\`: complete repeated-class product/gcd and factorization for both orders, any-embedding degree31 exclusion, source-rank unique GF257 inverse and planted 76-symbol recovery.
- \`sims/lp2_terminal256_gf257_unlabeled_degree160_sft.cjs\`: 157 symbolic GF257 equality equations, exact RREF/nullspace, complete 66,307-projective-direction enumeration for each source order, injection/20-position alphabet count and a passing 17-symbol degree16 synthetic control.
- \`.github/workflows/agent10-terminal-allfield-manual.yml\`: Node22 \`node --check\` and all original-source SFTs, manually dispatchable; no package dependencies or network-based inputs.

The universal 31-E root bound applies over **any** field and coordinate order. The degree31 repeated-class gcd theorem applies to the two frozen integer coordinate maps in characteristic≥257, with arbitrary one-to-one GP alphabet maps. The degree≤177 forward-difference theorem uses **consecutive** coordinate integers and the numeric GP indices, in characteristic≥257. The GF257 degree≤160 unknown-alphabet exclusion is exhaustive only for the two frozen evaluation orders and a **direct** polynomial with a static 29-symbol embedding. The degree179 inversions assume numeric GP values and are negative when their withheld field outputs cannot be encoded as GP29.

**Decision for Director #1209:** retire the direct p15 degree15 model in all fields, the degree31 all-characteristic schemes in the two natural orders, every degree≤160 direct GF257 scheme with arbitrary fixed GP alphabet in those orders, and the unique numeric-GP GF257 degree179 inverses for both orders. None identifies the original creator's intended map, higher-degree code, key, intermediate codec, or a decryptor for p55's original ciphertext. Prior high-degree GF841/RS255 and source-factor GF29 studies apply to different mappings and must remain separately scoped.
