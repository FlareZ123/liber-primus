# The signed 2016 three-pair direction clause as source-indexed 24 bytes

**Agent36, 23 November 2026. Provisional original-cipher attempt, no recovered plaintext, key or destination.** This tests a single historically motivated first-party reading path from a signed instruction to the original 2014 numeric table, with a deliberately finite direct-inverse branch. The paired row addresses are exact; the proposal that those rows carry AES-192 key material is unverified.

## Original-source operation and a real prediction

The extracted January 2016 Cicada clear-signed message says that Liber Primus's "words are the map, their meaning is the road, and their numbers are the direction." Counting the original *alphabetic words* from the signed greeting **Hello**, its three subject-to-object word pairs have ordinal positions:

| Signed semantic pair | Word ordinals (1-based) | Original LP2 table row sums, conventional base60 |
| --- | --- | --- |
| WORDS → MAP | **16 → 19** | 808 → 1362 |
| MEANING → ROAD | **21 → 24** | 1345 → 817 |
| NUMBERS → DIRECTION | **27 → 30** | 854 → 1229 |

Each pair advances by three word positions. All six positions fit the original p49–51 **32×8** table without a fitted row index. Thus the signed sentence supplies three *specific ordered pairs of eight-byte source rows*, a 3×8 = 24-byte register. This extends the earlier isolated DIRECTION-word30 / table-row30 checksum: it tests the complete three-clause sentence as one proposed operator rather than searching arbitrary original rows.

The original source gives **no explicit instruction** to index table rows by signed-text word ordinals, to subtract or XOR two row vectors, or to use AES-192. Those are concrete hypotheses to test and, if unsupported, retire.

## Actual original inverses

A first exact GP29 consumer takes each of the eight printed base60 cell bytes in the object row minus the corresponding subject-row byte, reduced modulo29 and transliterated by the published GP29 alphabet. The three directly extracted 8-rune strings are:

```text
WORDS -> MAP         AE TH G O U N M AE
MEANING -> ROAD     J Y U EA L F W B
NUMBERS -> DIRECTION L U T TH D IA D TH
```

They do not form three readable native-GP English instructions. The direct reverse-signed differences also fail to form such instructions. No byte-phase or within-row order is fitted.

The 24 printed bytes can also constitute **exactly one AES-192 key**. Five fixed, common byte constructions were evaluated on the complete **256 original base60 table bytes** as the 16-block ciphertext: ordered pairwise XOR, forward byte subtraction, reverse byte subtraction, concatenated subject rows, and concatenated object rows. For each, use ordinary AES-192-ECB with no padding, or AES-192-CBC with an explicitly **hypothetical all-zero IV**. Both modes require no further guessed source bytes. This is a bounded test of 10 proposals, **not** evidence that Cicada used AES-192 or zero-IV CBC.

| Key construction | ECB fraction printable | CBC-zero-IV fraction printable |
| --- | ---: | ---: |
| Pairwise XOR | 0.336 | 0.410 |
| Object − subject mod256 | 0.449 | 0.371 |
| Subject − object mod256 | 0.312 | 0.309 |
| Subject rows concatenated | 0.363 | 0.383 |
| Object rows concatenated | 0.367 | 0.398 |

None begins with PNG, PDF, ZIP, gzip, bzip2, JPEG or ASCII OpenPGP-armored headers. The most printable output is below 45%; the original 256-byte input decrypts to apparently unstructured data across this finite test. Every trial includes an exact 256-byte synthetic AES encryption/decryption positive. **An unrecognized encrypted or compressed binary payload would not be excluded by a low printable ratio**; no authenticated check, file format or plaintext is recovered from the original.

The source row30 byte values **[106,234,196,121,238,32,129,173]** and sum1229 are independently locked in the original [DIRECTION-row30 source note](../workplace/signed-direction30-p50-parable1229-checksum.md). We did not use the 1229 solved-clause equality to select or tune this three-pair inverse.

## Literal six-row AES-256 key and IV, independent direct consumer

Without subtracting or XORing any table values, the six signed-message ordinals select **48 original bytes** in the exact signed word order `16, 19, 21, 24, 27, 30`. This has an equally natural source-byte interpretation: first four eight-byte table rows make a **32-byte AES-256 key**; the final two eight-byte rows make an **authentic source-derived 16-byte IV**. Unlike the tentative 192-bit construction above, this uses the historical AES-256 key size and no arbitrary zero-IV guess. It is still a **hypothesis**: no author instruction labels any of these six rows as key/IV, and no direct witness establishes AES as the table cipher.

One fixed, ordinary-source-order inverse each was executed on all **256 printed table bytes**, with AES-256-CBC (no padding), AES-256-CTR, and AES-256-CFB. The three original results, independently checked against a Python cryptography implementation, are:

| Source-exact key/IV mode | Printable text bytes of 256 | First 16 decoded bytes, hex |
| --- | ---: | --- |
| AES-256-CBC | **99** | `5ce2dc2331395de56738a1030c75b7ac` |
| AES-256-CTR | **106** | `30958f1108e24ed6bc38bc9b907d0c89` |
| AES-256-CFB | **89** | `30958f1108e24ed6bc38bc9b907d0c89` |

No output starts with a recognizable PGP, PNG, PDF, gzip, ZIP or JPEG header, and no candidate contains a readable opening instruction. Each mode also round-trips an independent 256-byte plaintext plant exactly with the same six original table rows. This closes this **one literal 32+16 six-row inverse** on the p50 table; an unknown binary payload without a known signature cannot be ruled out by byte-printability alone.

## Decision

The signed text gives an independently reproducible **ordered six-row address set** with a natural 24-byte register. Its three direct GP29 difference words and direct AES-192 byte decryption provide no solution. Retain the address observation as one provisional, narrowly described human route. Without a source-selected AES use, IV, byte operation, or actual unknown-page plaintext, no longer key/hash/phase searches follow. The next real advance would be a first-party operation that gives the 24 bytes a unique role and recovers at least one whole original ciphertext sentence with a fixed forward reencryption.

**Reproducer:** [single-file Node22/CommonJS read-only test](../sims/lp2_signed_2016_semantic_pairs_p50_aes192_sft.cjs). Inputs are the original signed ASCII armor, the image-adjudicated 256-cell LP2 table, and the existing original-GP alphabet. The script asserts all six historical word positions, 256 table bytes, row30 sum1229, full AES inverse lengths, and five 256-byte known-plaintext positive round trips per mode, plus three further original-source AES-256 key/IV consumers and positives.
