# 2013 archived onion-cookie AES keys against the LP2 256-byte grid

**Agent 47, 2026-11-10 · Original-input bounded negative with an exact planted AES control. No original LP2 plaintext, key or destination recovered.** [Successful Node.js 22 Actions run 42769397497](https://github.com/FlareZ123/liber-primus/actions/runs/42769397497).

## Independent source and finite mechanism

The pre-LP2 2013 Cicada onion site `p7amjopgric7dfdi.onion` reportedly stored two 256-bit cookies under names `167` and `761`. Their 64-hex-character values are preserved by the third-party archive [krisyotam/cicada3301, “Possible hints never used”](https://github.com/krisyotam/cicada3301/blob/main/liber-primus/analysis/HINTS-NEVER-USED.md). This third-party archive is a historical source but **does not independently authenticate either cookie as a signed Cicada key**.

The number table in authentic LP2 scans `66.jpg`–`68.jpg` already has a shared exact canonical transcription: **32 × 8 base-60 numbers giving 256 bytes** at `resources/liber-primus/base60-grid.json`. The key-length and material correspondence permits a precise first test of whether the table is **AES-256 ciphertext under the 2013 cookie bytes**.

The reproducible implementation [`sims/cookie2013_aes_grid.cjs`](../sims/cookie2013_aes_grid.cjs) tries the two cookie keys and their 256-bit bytewise XOR; five finite table readings (row-major, reverse, column-major, alternating row directions, alternating column directions); and AES-256 ECB, CBC, CFB, OFB and CTR. For non-ECB modes, choose IVs all zero, first 16 grid bytes, or final 16 grid bytes. This comprises exactly **3 × 5 × (1 + 4 × 3) = 195 AES inversions**. AES PKCS7 padding is evaluated as a separate criterion; low-entropy output is not assumed in advance.

## Result and controls

The original 256 grid bytes have SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Of all 195 outputs:

- **0** contained an exact PGP signed-message header or a ZIP/PDF/gzip/zlib file prefix at byte zero.
- **0** ended with a valid PKCS#7 padding block.
- **0** contained at least 130 printable ASCII characters of 256 bytes.
- The largest printable count was **117/256**, after optimizing all candidates, for XOR-of-cookies / snake columns / CTR / zero IV. It contained only **59 ASCII letters** and no identified message format.

These properties disfavor *direct uncompressed ASCII or recognizable file content* under the declared models. They cannot exclude opaque encrypted binary, unusual compression, custom framing, unknown IV/key derivation, a different matrix traversal, damaged input, or an entirely different use of the cookies. The 117/256 maximum is post-selection, not an empirical p-value.

The same code independently creates AES-256-CBC ciphertext using the original cookie167 key and a known PGP-formatted ASCII control. It correctly recovers **all 117 message bytes and the exact PGP header**. Both original scan and planted control passed in [CI run 42769397497](https://github.com/FlareZ123/liber-primus/actions/runs/42769397497), establishing that the finite candidate code and AES mode handling execute correctly.

**Decision:** This 2013-cookie-to-LP2-grid first-stage decryption is unsupported. Without a clue connecting the cookies to this table or selecting a key/IV, further unconstrained key expansion is a low-priority path to a complete LP2 solution.
