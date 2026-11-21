# LP2 p50 factor quotient 243: directly typed 9×27 receivers remain nonlinguistic

**Status:** conditional, reproducible original-cipher exclusion. No recovered LP2 plaintext, key, cipher architecture or destination. This study extends the established p23 red16 midpoint/p39 red3 to p50 degree-four factor relation with a *previously documented* irreducible degree-nine p50 factor. It does not independently authenticate that additional factor as a creator-intended operation.

## Source-bound algebra

Read the original p50 32×8 printed base60 bytes in source order, reduce each integer modulo29, and treat the 256 coefficients as descending-degree GF29 polynomial coefficients.

- p23 red-center triplet R, ascending coefficients: **[23,6,10]**.
- p39 red-center triplet G, ascending coefficients: **[27,5,15]**.
- Known irreducible degree-nine table factor N: **[11,15,0,9,1,5,10,20,12,1]**.
- Exact degree13 product R×G×N: **[16,8,27,13,20,11,17,11,21,0,21,18,26,5]**.

The division has **13 zero remainder coefficients** and gives **243 quotient coefficients**, arranged in exactly nine rows of27 if grouped according to the nine visible original LP2 sections. Quotient IoC is 0.0348943985. The row distinct-value counts are **17,18,16,15,19,17,16,19,18**. Thus the quotient rows cannot be literal 27-symbol substitution permutations. The nine×27 grouping is a candidate reading, not proof of intentional section keys.

## Bounded original-cipher consumers

| Model | Exact preselected scope | Original output |
|---|---|---|
| Period-27 additive GP29 pad | Each chapter uses its matching 27-coefficient quotient row; signs ±, either natural or reversed source order; start phase0; 36 chapter tests | IoC **0.03363086–0.03481452**; no linguistic original-chapter prefix |
| 2016 value243 and p0–2 chapter729=3×243 as shares | Original first chapter, both consecutive and interleaved three-share layouts, Shamir GF29 x=1,2,3 interpolation, five other natural linear share combinations, adding quotient with signs −/0/+; 36 fixed tests | Best IoC **0.03632282**, all below 0.045; no GP29 prose |
| Three 3×3 Hill matrices from each 27-row | All 27 matrices happen to be invertible, determinants recorded by SFT; chapter-wise three-matrix cycling, forward and reversed composition; phase0, all complete 3-rune blocks, 27 tests | IoC **0.03407265–0.03498624**, no GP29 prose; 837 source-native planted 3-rune blocks re-encrypt and decrypt exactly |
| Entire quotient as 2013-style BASE29 integer | Exactly one 243-digit base29 integer in natural and reverse coefficient order, minimal big-endian byte serialization | **147 bytes** beginning `a317cde6ad3e4487…` forward, **148 bytes** beginning `04784d98400af3a0…` reversed; 65/147 and 54/148 printable bytes, neither file-type magic nor valid old-style compressed OpenPGP packet (forward `0xA3` followed by unsupported algorithm `0x17`); no ASCII text |
| Literal 27-digit base29 to AES128 key | Convert each 27-coefficient quotient row to one big-endian base29 integer, no truncation/KDF | Bit lengths **127,130,131,131,128,130,130,131,131**; only 2 of9 fit 128 bits |

**Controls:** The SFT reverses additive decoding for every original rune, confirms GF29 long-division reconstruction of all256 source residues, and independently applies all 27 invertible matrix pairs to 837 authentic solved-p57 source-native three-rune blocks. It aborts if any fixed fixture or assertion fails.

**Reproducer:** [Node.js 22 CommonJS single-file test](../sims/lp2_p50_redHG_nonic_q243_original_receivers_sft.cjs); [Windows 11 GitHub Actions PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44952903228). Source artifacts: [p50 original grid](../resources/liber-primus/lp2-grid-256.json) and [original LP2 rune corpus](../resources/liber-primus/lp2-corpus.json). Background factor/authorial-caveat report: [p23/p39 source bridge](lp2-p23-red-midpoint-p50-factor-bridge.md).

## Decision

The arithmetic 256−13=243, its nine×27 arrangement, the independently signed 2016 GP-value 243 and the original first-chapter size729 motivate these inexpensive consumers. Their explicit decryptions fail on original ciphertext while the reversible implementations pass native-language plants. This **does not** reject an independently specified nonlinear operation, external key, deliberately different framing or additional layer. The next useful evidence is a creator-authenticated instruction choosing how the factor quotient is used to decode untouched original runes, rather than an unrestricted phase/KDF/round search.
