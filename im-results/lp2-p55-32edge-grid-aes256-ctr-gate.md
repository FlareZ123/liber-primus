# P55 original word-end selectors into the 32×8 grid: bounded AES-256-CTR inverse

**Agent20, 12 November 2026. Evidence class:** new original-source-shaped cryptographic interpretation, executable exact negative and complete GP29-domain obstruction. **No unknown Liber Primus plaintext, source-authenticated key or intended decoder recovered.** It is an independent row-wise selector test, distinct from the previously examined eight whole-column AES-256 keys.

## Human-visible route and unproved operation

The genuinely solved physical p57 *PARABLE* says to shed circumferences and find divinity within. On original physical p55 the first of its 76 runes is a one-rune continuation of p54; the remaining **75 runes** form **16 complete printed words**. Their exact lengths are `[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`. Taking first and last rune of each complete word yields **32 outer rune endpoints**; removing them leaves **43 inner runes**. This is source-derived geometry, without a fitted word boundary.

The printed base-60 table across original physical pp49–51 has exactly **32 rows of eight bytes**. That gives one concrete candidate cryptographic consumer: use the 32 p55 word endpoints, in original order, to select one byte from each successive table row, with the column `rune index mod 8` or `GP prime value mod 8`. The two source-established numerical representations were chosen before reading output. These yield **32-byte keys**. Independently, the 16 original complete-word lengths fit a **16-byte IV**. Convert the 43 interior GP indices to their single big-endian BASE29 integer (the alphabet convention is supported by the 2013 signed TCP example), encode minimally padded to **27 bytes**, and attempt the ordinary AES-256-CTR inverse.

The geometries select sizes and exact inputs, yet **neither p57, the p50 grid, nor the signed 2013 example instructs AES, CTR mode, IV semantics, the numeric modulo-eight selector, or an inner-message codec**. This is a plausible, cheap conditional hypothesis; it must not be retroactively presented as a creator-attributed operation.

## Exact original data and decisive inverse

The fixed original 16-byte IV in hexadecimal is `0402020606020d060402070702060303`. The fixed 43-digit original interior BASE29 ciphertext integer occupies 27 bytes, `013d669f55a697d6b56275a7974c8245639c8c8e09d48f70e92368`.

| One selector per original row | Derived AES-256 key (hex) | First CTR keystream byte | Original 27-byte decrypted output (hex) |
|---|---|---|---|
| GP index modulo 8 | `e7d457c6854950767a4f41ec960ef72ab32ef60e6912a6219f7f9633afea8dac` | **5b** | `5a34a58d96e349fe5b1b4393a1dcf4408ffd56b7eb2e66a993496c` |
| GP prime value modulo 8 | `edde8942054cabc419b1c131e53fb8568d2ed2701275afc07344969734793850` | **67** | `6658abf5073bdafc1ce6cd2ca5d3ce96020cb766743937a8dd5850` |

Neither output is printable ASCII or a valid **43-digit GP29 integer**. The latter gives a stronger, entire-family answer with no language model: a 43-digit base29 integer is strictly below `29^43`, which is less than `2^209`. In a 27-byte big-endian word its **first byte can only be 00 or 01**. AES-CTR XORs the fixed first keystream byte with the first plaintext byte. With this source-derived key and IV, a valid plaintext first byte (00 or 01) would produce first ciphertext byte **5b/5a** or **67/66**, respectively, never 00/01. **These two specific ordinary AES-CTR models admit zero valid GP29-to-GP29 ciphertext/plaintext pairs at this 43-symbol width.** No alternate choice of unknown GP plaintext, English frequency or source key phase can fix that necessary-condition failure.

A diagnostic plant uses the **first 43 genuinely solved p57 runes** as a 27-byte GP29 integer, encrypts with each tested key/IV, and decrypts back to the exact same 43 symbols. Both planted bytewise round trips succeed, while their encrypted bytes also cannot fit in 43 GP digits. This distinction matters: AES-CTR is reversible on bytes, yet **the proposed fixed-width GP29 serialization is not closed under AES-CTR**. An authenticated byte-to-rune framing rule, cycle-walking or rejection policy would constitute an additional operation not supplied by the source. The direct outputs above also rule out straightforward printable ASCII plaintext under these two byte interpretations; they cannot exclude a separately structured or encrypted 27-byte message.

## GP29-domain-preserving AES keystream consumer

The fixed-width AES-CTR byte obstruction above applies to **directly decrypting one 27-byte base29 integer**. Another fully reversible and much simpler original-cipher reading avoids the overflow: use the *same two row-selected AES-256 keys* and the *same source-word-length IV* to generate **43 AES-CTR keystream bytes**, reduce each byte modulo 29, and subtract or add the resulting runic key at each of the **43 original interior rune indices**. This uses the existing in-period additive GP29 cipher arithmetic as a candidate consumer. The manuscript still does not select AES or a byte-to-29 reduction, so this remains a finite hypothesis. Both signs are frozen before examining the outputs.

| Original source selector | C−(AES byte mod29) | C+(AES byte mod29) |
|---|---|---|
| GP rune index modulo8 | GP IoC **0.02990033**, begins `SULBTHLHPJFOGEJ...` | **0.03875969**, begins `DMRASPBGDIADINNG...` |
| GP prime value modulo8 | **0.04318937**, begins `OAEITEAMHJOEEEGO...` | **0.02879291**, begins `GAXAEEXBHEONGND...` |

All four complete 43-rune streams are available in the SFT output. They contain no recognizable native-GP instruction or recovered word sequence. For comparison, the unchanged 43 p55 interior runes have IoC **0.03433001**, and the **43 genuinely solved p57 runes** used as an independent source-native plant have IoC **0.05647841**. The same exactly generated AES key and IV encrypt that solved-p57 plant modulo29, and the inverse recovers **43/43** symbols for both selectors without fitted key material. Thus the algorithm demonstrably would reveal native GP plaintext if that fixed additive keystream had been used.

This **bounded original-input failure** closes the direct 43-symbol additive AES-CTR keystream consumer, while leaving all forms of separately authenticated GP29 key generation or message framing outside scope.

## Cryptanalytic decision

Retire the **two frozen p55-endpoint-to-grid-row AES-256-CTR byte models and their four direct modulo29 additive keystream interpretations**, all with the exact 16-length IV and unaltered 43-rune interior payload. The 32×8 / 32-endpoint / 16-length geometry remains real, as does the p55 inner/outer segmentation, but their association with CTR and these selectors is conjectural. This finite result adds no unknown p55 plaintext or reusable LP2 key. Reconsider only if an original instruction chooses a precise table consumer and provides a genuinely length-preserving GP29 byte representation. Avoid generic cipher-mode, key-offset or column sweeps.

**Reproduce:** [original-input CommonJS SFT](../sims/lp2_p55_32edge_grid_aes256_ctr_sft.cjs) reads only tracked original-derived corpus/table assets, asserts every source segment, key and original plaintext-byte inversion, validates original-source p57 bytewise AES plants and proves the first-byte GP29-domain contradiction for both keys. All byte values were independently cross-calculated with the `cryptography` AES-CTR implementation before committing.
