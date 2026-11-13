# Physical p55 sixteen-word circumferences as a conditional 32-byte numerical-grid key

**Decision (Agent21, 13 November 2026).** The original p55 body contains sixteen complete printed words, giving exactly 32 first/last rune endpoints. A distinct source-visible 32-row by eight-column numerical grid spans pp49–51. Four frozen, direct AES-256 interpretations of this candidate word-to-row bridge recover **no authenticated packet and no recognizable original plaintext**. In particular, all four fail the conventional OpenPGP-CFB 16-bit repeated-random-prefix check and the exact AES-256-GCM authentication test. These finite negatives do not rule out other uses of the perimeter, table, or cryptography. No actual source instruction selects AES or the endpoint-to-row rule.

[Standalone CommonJS SFT](../sims/p55_exterior32_grid_aes_sft.cjs) · [Original-input GitHub Actions run 43378085559, source-gate step passed](https://github.com/FlareZ123/liber-primus/actions/runs/43378085559) (the overall workflow failed later in an unrelated legacy signed-2016 SHA1-score assertion).

## Human-visible premise and alternative explanation

The authentically solved terminal p57 says: “SHED OUR OWN CIRCUMFERENCES. FIND THE DIVINITY WITHIN AND EMERGE.” Removing the first and last rune of each complete word is a literal, lossless interpretation if the endpoint symbols are retained separately. On original physical p55, a one-rune **NG** carried from p54 precedes sixteen complete words of lengths `[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`. These sixteen words contain exactly 75 runes; with the carry, p55 has 76. Their 32 ordered endpoints are source-defined, without picking a subset to fit a result. The independently printed pp49–51 table is exactly 32 rows by eight cells, which creates a one-endpoint-per-row possibility. A 32-byte array is also a conventional AES-256 key length.

This is a proposed operation. **Nothing in the original pages authenticates an AES cipher, a binary field, an IV, an endpoint-to-table correspondence, or a message framing**. The 32-versus-32 equality may be an accidental consequence of word counts.

The source-frozen input is the canonical GP29 transcript, physical p55 indices, and conventional radix60 256-byte table. The p50-only numerical image must not be mistaken for the whole 256-cell grid. Its complete byte SHA-256 is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

## Exactly four frozen interpretations

Two definitions are used for each boundary rune: its zero-based GP29 index, or the corresponding **GP prime** (2 through 109). The first two cases concatenate 32 such byte values directly to form the AES-256 key, then decrypt the unchanged 256 grid bytes. The other two cases assign the 32 rune values to printed rows 1–32, select column `value % 8` within each row, use the 32 selected table cells as the AES-256 key and concatenate the other seven cells per row in print order as a 224-byte payload. There is no fitted key, IV, transposition, salt, alphabet permutation, output encoding, or hidden ciphertext read.

| Interpretation | 32-byte AES key (hex) | Payload | ECB decrypted ASCII-printable bytes | ECB plaintext first 16 bytes (hex) |
|---|---|---:|---:|---|
| GP index endpoint key, full table | `19070f110e130f1900010704110c130011050c121c0f120f0216050e1701110a` | 256 | 85 | `aed7c3083074a770936d233c89eff0af` |
| GP prime endpoint key, full table | `6513353d2f4735650203130b3d2947023d0d29436d35433505530d2f59033d1f` | 256 | 105 | `e8d6d5aa30db3a807fe541c59621df3e` |
| GP index modulo-eight row selector | `e7d457c6854950767a4f41ec960ef72ab32ef60e6912a6219f7f9633afea8dac` | 224 | 85 | `827e41b337bea9d3bbd35cd76f935940` |
| GP prime modulo-eight row selector | `edde8942054cabc419b1c131e53fb8568d2ed2701275afc07344969734793850` | 224 | 72 | `3e9dac46d71ce293b82eb676d5cf293c` |

The two row-select column-index strings are, respectively, `17716371017414301542472726567112` and `53557755233351725513553553571357`; their 224-byte payload SHA-256 hashes are `5e62da84d7cca8109e86a27a18d47392a744518643c29c2344b0066cde47ad2e` and `13d0b0092f8308bc8b36eb9332a2dc190afc0928e2689281cf15ee2400052ed8`.

For each original payload and key, the SFT tests exact AES-256-ECB with disabled padding, and re-encrypts the entire output back to the original source ciphertext. Correct inversion is an implementation check: every AES key has an inverse and exact re-encryption is not evidence of historical correctness.

The stronger packet-format tests use only directly specified containers:
- **OpenPGP AES-256-CFB:** zero 16-byte IV, initial 18 decoded bytes and the historically required equality of decoded bytes 14–15 and 16–17 (zero-based). All four fail the 16-bit check. The first 18 bytes are pinned in the SFT, making this a reproducible exact check.
- **AES-256-GCM:** nonce = first 12 source payload bytes, tag = final 16 bytes, and ciphertext = intervening 228 or 196 bytes. None authenticates. All four keys pass separately encrypted native-GCM positive-control round trips of the same payload length.

The direct AES-ECB outputs have neither legible prose nor clear common binary headers. These are negative observations only for direct plaintext containers; an unknown further layer would require an independent source instruction.

## Separate direct row-local XOR consumer

The two exact 32-column selectors already committed above each provide one byte per row. A distinct historically used bytewise operation is to XOR that selected byte with the **seven other printed bytes in its own row**, preserving original row-major order. This is a direct one-stage 224-byte output with no AES, unknown salt, or arbitrary IV. Both candidates are now in the **same SFT**, with an exact inverse that XORs the 32 source key bytes back to reconstruct all 224 original unselected table bytes.

| Fixed source selector | XOR output printable ASCII / 224 | Longest printable run | Exact decoded initial 48 bytes (hex) |
|---|---:|---:|---|
| GP endpoint indices modulo 8 | 86 | 5 | `2c405d860a9950882d480a23d0632e9d587631de6cab6bdf50844b43f6f740a2b3d580191d55af228e05ad407f6b06fb` |
| GP endpoint primes modulo 8 | 84 | 4 | `260a4a578c935a82274229da690af04386a8efb2de2f84ef5bd4cfc77677c0223355801c185005aa278b56bb8490fd37` |

Neither output is readable prose or a recognized direct text header. The SFT verifies exact byte outputs, full source reconstruction and the previously defined four AES-format gates. The source gate passed in [native Actions run 43378085559](https://github.com/FlareZ123/liber-primus/actions/runs/43378085559), despite the already-existing downstream regression failing. This additional negative only rejects the two specified literal row-local XOR readings. No original LP2 plaintext, authenticated key or selected alternate payload serialization was recovered.

## Scope and next decision

This route is independent of the existing **32 cross-page carried-word** grid key [gate](lp2-carry32-grid-aes256-payload-gate.md), which extracts its indices from 32 different, physically spanning words. It is also distinct from the sixteen p55 **whole-word prime-sum** AES gate [SFT](../sims/p55_wisdom_wordprime_aes_grid_sft.cjs) and the p55 33-outer/43-inner GP29 autokey test [SFT](../sims/p55_exterior_interior_direct_key_sft.cjs).

A successor is justified only if an independently authenticated original source selects (i) one of the exterior-to-row key conventions and (ii) a lossless decipherment mode/message framing or a diagnostic held-out plaintext. Without that causal instruction, adding offsets, new KDFs, arbitrary table walks, or expanding to a general AES search would repeat model shopping rather than reveal LP2 text. The script uses unmodified original bytes, asserts exact source word boundaries and table hashes, checks positive plants, and prints complete machine-readable results.
