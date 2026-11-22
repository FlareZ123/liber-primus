# LP2 p2 and pp23–26: six-point consistency gates for two historical binary SSSS formats

**Classification: exact bounded original-input negative, 12 November 2026.** Two fully specified byte-accurate original GP29→SSSS reconstructions have been rejected by a source-native six-share consistency equation. Neither was authenticated as the author's intended LP2 encryption. **No unknown plaintext, authentic LP2 key, complete mechanism or destination has been recovered.**

## Why an independent sixth share matters

Physical LP2 **p2 has exactly 201 runes**. Physical **pp23–26** contain a 16-rune red heading followed by **1,005 body runes**, which can form five consecutive 201-rune strands. The original within-strand adjacent repeated-rune counts are **[1,4,3,2,1]**; p2 has **one**. The matching lengths raise a testable hypothesis: p2 could be an additional share in the source-attested 2013 Cicada five-of-ten Poettering SSSS v0.5 operation. Its insect and five-dot art do not authenticate that premise. The five-dot ornament also occurs on other pages.

Exactly **five arbitrary field values** can always interpolate a monic degree-five SSSS polynomial, reconstruct an arbitrary secret and re-encrypt perfectly. A **sixth original object** must agree with that polynomial at another source identifier. The latter is a meaningful key-independent falsification test.

## Two genuinely reversible, independently frozen source-register interpretations

Both use six original 201-GP29-rune strings, the original 2013 SSSS monic degree-five construction, share labels selected without replacement from decimal **1 through 10**, and actual historical field polynomials. Neither chooses rune values, fitted keys, word-dependent exceptions or plaintext scoring.

| Interpretation | Rune serialization | Exact historical field |
| --- | --- | --- |
| **A. Ordinary positional base29** | Interpret all 201 digits in printed order as one base29 integer, zero-extended to **123 big-endian bytes**. This works for *all* GP29 201-digit strings. | **GF(2^984)**, irreducible polynomial x^984+x^24+x^9+x^3+1 |
| **B. Conditional enumerative rank** | Injectively rank all 201-rune streams with at most **seven adjacent equal** runes as a **122-byte** integer. All six originals meet this restriction. | **GF(2^976)**, irreducible polynomial x^976+x^17+x^10+x^6+1 |

The 123-byte field is supported by the historical SSSS software; the older original 2013 onion shares were only 22 bytes. The fixed 123-byte source serializer is explicitly described in [the literal-format investigation](lp2-p23-26-ssss-original-format-gate.md). The alternative 122-byte rank is defined and proved reversible in [the enumerative codec study](lp2-p23-anti-repeat-122byte-ssss-codec.md). **Neither serialization is selected by the LP2 pages themselves.**

The source-visible five p23 strands are consecutive; the alternate interleaved strands have repeated-rune counts [7,11,3,9,8], so three do not fit interpretation B's independent seven-repeat code limit. The tested directions allow the five p23 strands to be read uniformly forward or uniformly reversed and allow p2 to reverse independently; all original values are losslessly packed.

## Exact monic degree-five original-input discriminator

For six distinct historical share identifiers x_i and their field values y_i, a valid monic degree-five polynomial over characteristic two requires

\[
\bigoplus_{i=0}^{5}\frac{y_i}{\prod_{j\ne i}(x_i\oplus x_j)}=1.
\]

Let \(D=\prod_{i<j}(x_i\oplus x_j)\), and let \(B_i=\prod_{j<k,\;j,k\ne i}(x_j\oplus x_k)\). Exact zero residual

\[
R=D\oplus\bigoplus_{i=0}^{5}B_i y_i=0
\]

is a necessary and sufficient consistency condition. Every multiplication is performed in the specified historical GF(2^m), including polynomial reduction. The implementation builds six-point coefficients from the IDs before comparing any original rune values. A synthetic source-native planted polynomial f(x)=x^5+constant gives **R=0** under *both* historical field choices.

For each encoding: all **C(10,6)=210** sets of distinct IDs; all **6!=720** assignments of the six actual original objects to them; **four** common orientation choices. That is exactly **604,800** original-source assignments per format.

## Verified original-cipher results

| Observable | A: direct base29 / 984 bits | B: enumerative rank / 976 bits |
| --- | ---: | ---: |
| 201-rune source objects that pack losslessly | 6 | 6 |
| Valid planted six-share polynomial | Yes, R=0 | Yes, R=0 |
| Complete original assignments | **604,800** | **604,800** |
| Original exact six-share matches | **0** | **0** |
| Original residuals with 16 low zero bits | 4 | 6 |
| Original residuals with 24 low zero bits | 0 | 0 |
| Longest prefix of leading zero residual bits | 17 | 18 |

Thus the exact 2013 monic five-of-ten polynomial **cannot simultaneously contain the six original 201-rune strings** under either specified historical field, all documented 1..10 identifiers and their tested orders/directions. This is an exact finite-family exclusion, not a statistical assessment of how English-like a synthetic output looks.

### Five-share 122-byte binary inverse, as a separate diagnostic

Under B, the **252** sorted five-ID selections and two p23 directions produce **504** mathematically valid 122-byte SSSS secrets after real historical reverse-XTEA diffusion. The maximum number of printable ASCII/HT/LF/CR bytes is **63 of 122**; the longest contiguous printable run is **11**. The maximum-printable candidate is IDs [3,4,5,6,7] with reversed strands and begins with hexadecimal **3da041540f3af44d2ef19b783efb1353**. Historical reference IDs [2,3,5,7,8] reproduce the prior first-16-byte outputs, forward **839dc666c476dd982cb521b25fe3c944**, reverse **f34c85f94532b8b77de2ccbbd37d920f**. These outputs do not establish a readable secret, nor can their apparent randomness exclude an encrypted binary object. The six-share consistency test is the stronger result.

## Reproduction and research decision

The [single-file Node.js 22 SFT](../sims/lp2_p2_p23_ssss201_sixshare_sft.cjs) imports the existing [historical codec and field inverse](../sims/lp2_p23_201_122byte_ssss_codec_sft.cjs), reads the canonical original [LP2 corpus](../resources/liber-primus/lp2-corpus.json), asserts source lengths and the five-share regression, tests planted monic degree-five controls, and evaluates both complete 604,800-assignment original-input gates. Its job is included in the existing [manual 122-byte SSSS workflow](../.github/workflows/lp2-p23-ssss-enumerative.yml). There are no automatic commit/PR triggers.

**Decision:** Retire these two exactly specified *p2 plus five p23 strands* historical SSSS interpretations. This does not exclude independent reversal of individual original strands, byte-endianness changes, source-authenticated alternate IDs, an earlier cipher layer, share data from elsewhere or a different cryptographic use of the 201-rune lengths. The original 2013 SSSS clue supplies a plausible hypothesis and a precise discriminator, but no authenticated original cipher solution. An isolated five-share reconstruction must not be treated as progress toward plaintext without an independent sixth-point or genuine-message/key test.
