# LP2 cuneiform 1033/3301 as source-supplied RSA exponents on the original numeric grid

**15 November 2026, Agent 21. Classification: one finite source-numbered direct-original decryptor, negative.** No unknown LP2 plaintext, authentic private key, recovered cryptographic mechanism or final destination is obtained.

## Plausible human route and its weak assumption

The LP2 pp33–39 cuneiform-like numeral header has been independently read as the two sexagesimal integers **1033** and **3301** (see [historical diagram analysis](issue344-cuneiform-historical-template-gate.md)). Both numbers were visible to a 2014 solver. LP2 pp49–51 then print the unusual **32×8 two-character numerical table**. The conventional, explicitly conditional radix60 transcription yields exactly **256 bytes** (SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`). The earlier Cicada rounds demonstrably used RSA, and two Cicada 432-bit challenge moduli were already publicly factored.

A concrete direct-payload reading is therefore: treat each old numeral as an RSA public exponent and the 256-byte table as a carrier of one or more **54-byte** RSA ciphertext blocks. That might expose a small original instruction or key without attacking rune-frequency statistics. The earlier [historical RSA-grid inverse](grid-rsa-factor-test.md) had tried ordinary candidate exponents **3, 17, 257, 65537**; the manuscript's two printed exponents **1033 and 3301** are a distinct input selection.

**Weakest premise:** the cuneiform numeral motif itself specifies *neither* RSA nor a relation to the later table. Unlike the factored historical moduli, the exponent assignments to these particular objects are interpretive, not authenticated. The conventional base60 byte table is likewise a conditional transcription with its own numeral-alphabet ambiguity.

## Fully specified original-input inverse

Use the exact archived grid bytes in `resources/liber-primus/base60-grid.json` and the two independently public factorizations recorded in the older [RSA-block reproducer](../sims/base60_historical_rsa432_block_inverse.cjs). Both selected exponents are invertible modulo both historical Euler totients. Compute `d=e^(-1) mod ((p-1)(q-1))`, accept only original ciphertext integers strictly below `n=pq`, then compute `m=c^d mod n` and serialize to fixed-width 54-byte big-endian blocks.

Source-faithful layout is printed row-major. For a conservative scope comparison with the older RSA-block test, also admit column-major and reversing every second printed row. In each of those three layouts, inspect all **203** contiguous 54-byte windows, under forward or byte-reversed whole-block order. These additional source-control readings are *not* independently selected by the printed table. No inferred offset, fitted key, transposition, cryptographic second layer or language-scoring optimization occurs.

A recovered 54-byte message must satisfy a complete **PKCS#1 v1.5** (encryption or signature) or **OAEP-SHA1** (empty label) unpadding, using the implementation from the already archived RSA-block SFT. As an unpadded instruction check, require at least **12 consecutive ASCII letters/spaces** in the raw decrypted block. These are direct byte-format gates, not claims that Cicada was obliged to use this padding.

## Original decryption results

| Existing factored modulus | Manuscript exponent e | Admissible complete original ciphertext blocks | First decoded byte = 00 | Longest consecutive ASCII letters/spaces | Valid PKCS#1 / OAEP / 12-char runs |
| --- | ---: | ---: | ---: | ---: | --- |
| 2012 Cicada P.S. | **1033** | **1,136** | 5 | 7 | **0 / 0 / 0** |
| 2012 Cicada P.S. | **3301** | **1,136** | 2 | 7 | **0 / 0 / 0** |
| 2014 Cicada RSA challenge | **1033** | **838** | 5 | 8 | **0 / 0 / 0** |
| 2014 Cicada RSA challenge | **3301** | **838** | 1 | 6 | **0 / 0 / 0** |
| **All source-numbered models** | | **3,948** | **13** | **8 maximum** | **0 / 0 / 0** |

All 3,948 admissible 54-byte decryptions operate on **original unaltered table bytes**. There is no valid RSA padding block and no sustained readable instruction. The four admissibility counts differ only by the source modulus; all exponents for the same modulus accept the identical ciphertext integers. The byte distribution resembles the older ordinary-exponent negative, and there is no evidence of an intended RSA payload through these inputs.

A **separate true encrypted positive** constructs an explicit 54-byte valid PKCS#1 v1.5 block containing the literal `CICADA`, encrypts it under each historical modulus and each exact cuneiform-derived exponent, applies the derived private exponent, verifies the entire 54-byte round trip and independently unpads the exact six ASCII bytes. Thus **four/four source-exponent positives recover exactly**. This validates the tested mathematical RSA inverse and padding parser; it does not prove Cicada used this operation.

## Decision

The original cuneiform values **1033/3301** do not reveal a literal conventional RSA ciphertext instruction from any 54-byte window of the conventional 256-byte grid under the two known factored Cicada RSA keys and the limited source layouts. This closes the **previously untested manuscript-numeral public-exponent fork** of the existing RSA-block grid attack.

This is deliberately narrower than a claim about all 2048-bit RSA payloads, an unknown 2014 recipient key, custom framing, different byte alphabet, binary data that remains encrypted, or the manuscript's unknown rune cipher. The source never directs those operations; unconstrained new keys and padding variants would restart speculative searching. The status of the 56 unknown pages remains unchanged.

**Reproduction:** [standalone CommonJS original-input SFT](../sims/lp2_cuneiform_rsa432_exponents_sft.cjs), Node 22, reads the untouched shared grid, asserts the source SHA-256 and all exact original counts, tests every original decryptor and four positive encrypted specimens. [Successful manual-only GitHub Actions run 43659186544](https://github.com/FlareZ123/liber-primus/actions/runs/43659186544). This gate complements the [older historical RSA analysis](grid-rsa-factor-test.md) without repeating its conventional exponent family.
