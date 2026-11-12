# LP2 p2 and pp23–26: six-point consistency of historical binary SSSS shares

**Classification: exact bounded original-input negative, 12 November 2026.** This experiment tests a source-motivated and fully specified six-share interpretation of the authentic GP29 manuscript. It does **not** identify the intended historical cipher, recover unknown plaintext, or establish an LP2 key.

## Source objects and hypothesis

Physical LP2 p2 has exactly **201 runes**. Physical pp23–26 contain a 16-rune red heading plus **1,005 body runes**, forming five consecutive 201-rune strands. In these six original strings, adjacent repeat counts are **p2 = 1**, and **p23 strands = [1,4,3,2,1]**. The exact matching lengths permit the hypothesis that p2 supplies a sixth share in the same 2013-era Cicada five-of-ten secret-sharing scheme used by the original pklmx stage. The artistic link and length match are hypotheses rather than an authenticated cipher instruction.

The earlier [122-byte enumerative GP29 codec](lp2-p23-anti-repeat-122byte-ssss-codec.md) injectively ranks each 201-rune string that has at most seven adjacent repeats into the 976-bit field of the historical Poettering SSSS 0.5. **All six actual original strings fit.** The rank codec itself is not source-authenticated, but fixes an exact and falsifiable original-input interpretation.

## Frozen experiment

- Original data: [canonical corpus](../resources/liber-primus/lp2-corpus.json), p2 and pp23–26 after removing precisely 16 original red heading runes.
- Rune-to-share serialization: [existing reversible enumerative rank codec](../sims/lp2_p23_201_122byte_ssss_codec_sft.cjs), with at most seven zero predecessor differences and no adjustable padding.
- Field: **GF(2^976)** using modulus **x^976 + x^17 + x^10 + x^6 + 1**, the real historical field polynomial. The SSSS polynomial evaluated at the share identifiers is **monic degree five**.
- Share labels: all six-element subsets of documented decimal identifiers **1 through 10**, with all **6! permutations** of original object-to-label assignments. Test the five pp23–26 strands either all forward or all reverse, and p2 independently forward or reverse.
- This is **210 × 720 × 4 = 604,800** source-original tests, and includes every distinct original-object assignment under the specified directions. Interleaved pp23 strands are excluded by the same source-independent codec, since three exceed the seven-repeat limit.
- A real planted six-share monic degree-five polynomial is checked as a positive control, before testing the original ciphertext.

### Key-independent overdetermination equation

A monic degree-five polynomial through six points in characteristic two must satisfy

\[
\bigoplus_{i=0}^{5}\frac{y_i}{\prod_{j\ne i}(x_i\oplus x_j)}=1.
\]

Writing \(D=\prod_{i<j}(x_i\oplus x_j)\) and \(B_i=\prod_{j<k,\;j,k\ne i}(x_j\oplus x_k)\), the exact necessary and sufficient consistency test is

\[
D\oplus\bigoplus_i B_i y_i=0.
\]

Every multiplication is performed in the historical binary field. The six-point condition is significantly stronger than decoding exactly five shares: any arbitrary five values interpolate a monic degree-five polynomial and yield some arbitrary binary secret.

## Exact original-source results

| Test | Result |
| --- | ---: |
| 201-rune original strings with valid reversible rank | 6 |
| Planted genuine monic degree-five consistency | Pass, exact zero |
| Original six-point assignments checked | **604,800** |
| Original exact six-share matches | **0** |
| Original residuals with 16 low zero bits | 6 |
| Original residuals with 24 low zero bits | 0 |
| Maximum zero leading bits in residual | 18 |

This **rejects a shared six-point SSSS polynomial for these six original strings** under the frozen source-native format and tested identifier/direction family. It does not depend on a language-model score.

### Complete natural-order five-share control

For each of the **252** sorted five-ID selections from 1–10 and both common strand directions, the test also reconstructs an arbitrary five-share secret and performs the real historical inverse XTEA diffusion: **504** original binary outputs. The maximum directly printable bytes in any 122-byte output are **63**, and the maximum consecutive printable run is **11**. The maximum-printable candidate uses reverse strands and IDs **[3,4,5,6,7]**, with first 16 bytes **3da041540f3af44d2ef19b783efb1353**. Prior published reference outputs for IDs [2,3,5,7,8] are reproduced exactly, forward **839dc666c476dd982cb521b25fe3c944** and reverse **f34c85f94532b8b77de2ccbbd37d920**. Binary-looking output alone cannot exclude a separately encrypted secret.

## Reproduction and decision

[Single runnable Node.js 22 test](../sims/lp2_p2_p23_ssss201_sixshare_sft.cjs) reads the canonical GP29 arrays, calls the previously established historical share-codec functions, verifies the original lengths, confirms the planted positive, exhausts all assignments, asserts the negative, and prints the complete objective findings. No source strings, language model, arbitrary share keys, or external services are required.

**Retire this conditional p2+pp23 six-share route.** The experiment does not exclude ordinary 123-byte base29 share encoding, independent reversal choices for individual strands, different share labels, nonsharing uses, or an unknown cipher layer. Without a source-authenticated instruction selecting the 122-byte enumerative rank and historical share assignments, the five-share binary objects are not established LP2 messages, even when a synthetically reversible decoder exists. Do not promote this finite negative to the authoritative plaintext synthesis.
