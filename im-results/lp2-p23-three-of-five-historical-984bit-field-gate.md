# Original LP2 pp23–26: three-of-five quadratic-share obstruction

**Decision (12 November 2026, Agent 8):** The five 201-rune strands after the original p23 red heading cannot be evaluations of a single three-of-five (degree-at-most-two) Shamir polynomial under **any four historical IDs chosen from 01–10**, for either natural printed layout and either complete-strand reading direction. The same exact obstruction now holds for both historical binary GF(2^984) whole-share elements and independently symbolwise GF(29) rune-share candidates. This is a key-independent contradiction on the unchanged original ciphertext, even before proposing an output page or decoding a secret. A genuine 201-rune native-GP secret planted in five quadratic shares is reconstructed exactly. **No unknown LP2 plaintext, cipher key or destination is recovered.**

## Human-observable reason to test this specific alternative

The original p23 black five-dot motif appears before its red16 heading. Original p33 contains a row of three black dots separating its two red-heading blocks. An earlier Cicada round demonstrably used threshold secret sharing, specifically ssss v0.5 five-of-ten in the 2013 phone/poster continuation. An investigator could hypothesize that the later three and five motifs together suggest *three of five*. That joint interpretation is **unconfirmed**: the three-dot mark is on a different page and has no accompanying threshold instruction. It does not follow from the historically authenticated five-of-ten parameters.

The first sixteen GP runes on original p23 are red. After them, pp23–26 contain exactly **1,005 black-body GP29 runes**, divisible into **five strands of 201**. The separately printed physical p2 is exactly 201 runes, supplying a possible secret-length control if a threshold decoder had survived. All page/rune counts and GP indices are fixed by [the canonical corpus](../resources/liber-primus/lp2-corpus.json) and [source ink annotations](../resources/liber-primus/lp2-ink-annotations.json). The original JPEGs are scans 40.jpg–43.jpg (pp23–26), 50.jpg (p33), and 19.jpg (p2).

This test is independent of the earlier [historical five-of-ten *monic quintic* reconstruction against p2](lp2-p23-26-ssss201-original-format-gate.md). Five unconstrained y-values can interpolate a quintic and hence cannot be rejected solely from their internal consistency. A three-of-five scheme adds two exact algebraic checks, even if the secret is entirely unknown.

## Frozen algebra and complete source-input test

Use the independently documented ssss 0.5 polynomial field

\[
K=\mathrm{GF}(2^{984})=\mathbf F_2[T]/(T^{984}+T^{24}+T^9+T^3+1).
\]

Interpret a complete 201-rune GP29 strand as an unsigned most-significant-first base29 integer. Each original strand is below \(29^{201}<2^{984}\), so this is a lossless, unambiguous injection into \(K\). Consider the four source-plain readings: five consecutive 201-rune blocks or five interleaved quintet columns, with every lane in printed or reversed order. Keep the five strands intact. No fitted cipher, secret alphabet, offset, XOR mask, hash, side channel or guessed plaintext is permitted.

Test whether distinct share labels \(x_i\in\{1,\ldots,10\}\) allow

\[
y_i=a_0+a_1x_i+a_2x_i^2\quad\text{in }K.
\]

For *any four* shares at distinct positions \(x_i\), the coefficient of \(X^3\) in their cubic Lagrange interpolant must vanish:

\[
\sum_{i=0}^{3}\frac{y_i}{\prod_{j\ne i}(x_i+x_j)}=0.
\]

In characteristic two, the \(+\) is field XOR. Clearing the nonzero denominators yields an exact necessary-and-sufficient four-point test with no secret coefficients to fit. The reproducer multiplies by the full denominator product and computes the resulting GF(2^984) parity, using the historical field modulus. For each layout, exhaust the five choices of which original lane to omit, **all \(\binom{10}{4}=210\)** sets of historical identifiers, and all **4! = 24** bijections from four observed shares to those IDs. An extension to all five shares must pass every four-point test; thus zero passing four-point tests excludes every complete three-of-five assignment.

| Source reading | Four-share equations evaluated | Exact quadratic fits |
| --- | ---: | ---: |
| Interleaved quintets, forward | 25,200 | **0** |
| Interleaved quintets, reversed | 25,200 | **0** |
| Five consecutive 201-rune blocks, forward | 25,200 | **0** |
| Five consecutive 201-rune blocks, reversed | 25,200 | **0** |
| **Total** | **100,800** | **0** |

The assertion does **not** depend on p2 being the secret; no unknown data is post-selected as a receiver. It is stronger than merely failing to read a particular plaintext.

## Independent native-GP29 field reconstruction

The 2013 ssss protocol encodes each share as one 984-bit binary-field element. A distinct, equally source-visible possibility is that the **five 201-rune LP2 strands are five native GP29 share lanes**, and that each of the 201 column positions independently evaluates a degree-two Shamir polynomial in GF(29). This avoids interpreting 201 runes as one binary integer. The clue is still hypothetical: there is no author-attributable instruction that the p23 and p33 motifs name threshold 3/5.

For four share labels xi in 01..10, any four alleged rune-shares at the same position t must satisfy the cubic Lagrange coefficient equation

    sum_i y[i,t] / product_(j != i) (xi - xj) = 0  (mod 29).

This is a necessary and sufficient four-point condition for an unknown quadratic, independent of its secret constant and other coefficients. With the same four original-source strand readings (interleaved or contiguous 201-rune lanes, each forward or fully reversed), exhaust all five four-lane subsets, all 210 historical four-ID combinations and all 24 ID-to-lane assignments. **100,800 exact four-share assignments**, each requiring all **201 independently observed GP29 columns** to pass. Stop each candidate after its first failure; no candidate survives more than **two consecutive columns**, and **zero survive all 201**. Counts of candidates passing just the first column in the four readings are 912, 784, 870 and 912, within the expected trivial accidental level.

A constructive control uses the **actual printed 201-rune p2 plaintext** as 201 independent GF29 secret symbols. It plants five shares of a degree-two polynomial with fixed independently determined coefficient sequences, recovers every original p2 rune from three shares by exact field interpolation, passes every 4-of-5 parity equation for every rune position, and fails when a single planted share symbol is perturbed by one. The **native-GP field alternative is therefore also excluded** on the original p23–26 whole-strand layouts with historical labels, without knowing the target secret.

[Original-input native GF29 SFT](../sims/lp2_p23_3of5_gp29_symbolwise_shamir_sft.cjs) executes all these assertions in Node.js 22 and reads only the canonical source corpus. It was executed successfully against the exact remotely fetched original data on 12 November 2026. The binary-field historical protocol and this native-field candidate are **separate cryptographic hypotheses**; failure of both does not rule out an independently supplied external share file, different share indexing, or a non-Shamir message structure.

## Positive inverse and boundaries

The self-contained CommonJS test constructs a genuine degree-two Shamir polynomial over the **same** historical field, with encoded constant equal to the *actual source GP29 integer from p2* and fixed small synthetic higher coefficients. All five synthetic y-values stay representable in 201 base29 digits. Every set of four authentic synthetic shares passes the parity test, the polynomial's constant is recovered exactly from its first three shares by field Lagrange interpolation, and changing one share by one bit breaks its relevant parity equation. This checks the lossless field/numeral framing and the ability to recover a complete 201-rune secret when the scheme genuinely applies.

[Original-input, dependency-free SFT](../sims/lp2_p23_3of5_984bit_shamir_source_sft.cjs) on Node.js 22 loads the canonical source, asserts the original heading/page counts, performs all 100,800 exact field equations, checks the synthetic 201-rune inverse and rejects a deliberately corrupted share.

These tests **retire two exact three-of-five Shamir readings** of the five unmodified post-heading streams with historical IDs 01–10: whole-share elements in the 2013 binary field GF(2^984), and per-rune native-GP29 symbolwise share evaluations. They cannot rule out a non-Shamir cipher, a different share serialization/identifier range or independently selected transforms, nor does it establish that p23's five dots and p33's three dots were intended as a single clue. The historical actual 2013 scheme was *five of ten* using a monic quintic and XTEA diffusion; its separate original p2 consumer has already failed. Absent a new genuine selector or an independently recovered secret, extending the interpretation through more arbitrary transforms would reintroduce unconstrained key fitting.
