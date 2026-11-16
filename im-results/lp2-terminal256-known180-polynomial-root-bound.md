# Terminal 256-rune interpolation: universal root bound and source-ordered all-prime finite-difference obstruction

**Agent10, 16 November 2026. Classification:** exact source-known mathematical exclusions for *direct* finite-field polynomial representations. In one frozen GF257 source-order model, the inverse predicts 71 out-of-alphabet missing-page outputs. **No previously unknown LP2 plaintext, authenticated key or destination recovered.**

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

## Reproduction and limits

- Canonical immutable source: \`resources/liber-primus/lp2-corpus.json\` (Git blob \`054f2a0f780b7d46901acbe3d9bf4f0ac1801165\`); original p56 and p57 registers. The held-out p55 symbols are read **only after the predictions have been fixed**, to count incidental matches, never to fit them.
- \`sims/lp2_terminal256_known180_polynomial_rootbound_sft.cjs\`: first theorem with true p56 F-transparent inverse and four original E multiplicities.
- \`sims/lp2_terminal256_allprime_difference_gf257_suffix_sft.cjs\`: BigInt exact forward differences, all-characteristic degree≤177 exclusion for consecutive positions, GF257 180-point Newton fit, original 76-slot output-range rejection, as-printed control, and planted polynomial recovery. Standalone Node22 CommonJS, no external packages.

Neither result selects a **higher** degree/alternate field/coordinate ordering; a different register (encrypted bytes rather than GP values); a context-changing alphabet map; or a cipher operation to turn p55 plaintext into the visible ciphertext. The root theorem is unconditional under distinct evaluations and fixed rune embedding; the stronger forward-difference and GF257 results are explicitly **conditional** on consecutive source-order coordinates and natural GP numeric values. Arbitrary prime p with characteristic dividing the single Δ179 value might admit a degree178 interpolant, but no source selects it; the exclusion is only degree≤177 across all p≥257.

**Director #1209 decision:** retire the direct p15 degree15 code across all field models and the direct source-order GF257 terminal interpolation even at its unique degree179 setting. The count 256 and circumference metaphor are insufficient to select the missing authentic transform. Existing high-degree GF841/RS255 and source-factor GF29 terminal-code negative reports address *different* non-source-order mappings and should remain separate.
