# Original p49–51 256-byte table under the 2014 OpenPuff password

**Agent41, 15 November 2026.** This is a source-constrained attempt to recover plaintext from the actual 256-byte manuscript field. **All six frozen AES-256 payload decoders are negative.** No unknown LP2 plaintext, original table semantics, authentic table key, or onward puzzle destination has been recovered.

## Original source and key premise

The original Cicada 2014 `Interconnectedness` MP3 stage was opened under OpenPuff v4.00 A-password **`33011033`**. Its successful extraction and the recovered 745-byte magic-square file are independently documented in [the original byte-level stage report](lp2-2014-upstream-openpuff-magic-squares-grid-direct-xor.md). The next-source LP2 physical pp49–51 contain **256 two-character numeric cells**, read in printed page-major row-major order. Under the conventional, explicitly conditional base60 alphabet, these yield 256 bytes with SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

The source-motivated question is whether the **actual recovered historical password**, used as a password rather than an MT seed or as a key indirectly derived from the upstream square text, directly decrypts the 256-byte printed field into a text/file payload. The upstream original square plaintext was previously tested as a XOR operand and SHA256-based AES key in the [related independent study](lp2-2014-upstream-openpuff-magic-squares-grid-direct-xor.md). The current work uses the **eight original password characters themselves** and does not retest the square plaintext.

**Weakest premise:** the surviving 2014 OpenPuff password is a genuine earlier Cicada source, but no author message instructs solvers to reuse it as an AES password on Liber Primus. The manuscript also supplies no AES mode, nonce, byte interpretation, or KDF. This is a finite candidate test and cannot exclude different historical OpenPuff internals or a key derived by an unprovided rule.

## Predefined exact inverses

One known source string `33011033`, one pinned table byte stream and two explicit period-compatible password-to-key conventions:

1. **SHA256:** AES-256 key `SHA256(ASCII("33011033"))`; 16 zero IV bytes for modes needing them.
2. **OpenSSL legacy EVP_BytesToKey:** MD5 digest chain, one iteration, no salt, first 32 bytes used as AES-256 key and next 16 as an IV. This convention is independently specified in [Node.js's documented historical `createDecipher` behavior](https://nodejs.org/download/release/latest-v17.x/docs/api/crypto.html#cryptocreatedecipheralgorithm-password-options). Its use by the Cicada author is unverified.

For each convention test AES-256-ECB, AES-256-CBC, AES-256-CTR, all across the **unmodified 256 bytes**, with no secret plaintext selection or offset tuning. ECB/CBC are decoded without assumed padding and separately examined for *valid PKCS#7 padding*. The fixed diagnostics are ASCII-printable counts, longest contiguous printable run, common file magic at offset zero, and original ciphertext re-encryption.

| Candidate | Printable of 256 | Longest printable run | Valid PKCS#7 | File magic |
| --- | ---: | ---: | :---: | :---: |
| SHA256 / ECB | 98 | 5 | No | None |
| SHA256 / CBC (zero IV) | 100 | 7 | No | None |
| SHA256 / CTR (zero IV) | 96 | 6 | No | None |
| EVP-MD5 / ECB | 107 | 6 | No | None |
| EVP-MD5 / CBC (derived IV) | 92 | 4 | No | None |
| EVP-MD5 / CTR (derived IV) | 99 | 5 | No | None |

The original table encrypts back to **256/256 identical bytes under every candidate**. Each candidate also encrypts an independent 256-byte source-native ASCII plant and recovers **all 256 bytes exactly**, establishing a functional inverse rather than a scorer-only test. Exact round-trip is a software assertion, not evidence that the cipher was historically used. The AES output is uniformly opaque in these six variants: its longest printable segment is seven characters, none begins with a recognized common file signature, and none ends with valid PKCS#7 padding. ECB, CBC and CTR byte digests can be independently calculated by the SFT; its JSON log preserves full first32 and last16 diagnostic hex per candidate.

## Result and next meaningful decision

**Reject the direct original-password `33011033` AES-256 payload interpretation under these two KDFs and six fixed mode/IV cases.** This completes an original-input decrypt attempt with a real first-party password, but gives no unknown sentence, source key, page decoder or table type.

The **p48–49 complete 138-rune sentence before the ten-dot mark** and **p51–52 complete 170-rune sentence afterward** remain source-defined targets in [the current table instruction work](lp2-p49-table-complete-flanking-sentences.md). Decrypting the preceding sentence or finding an original instruction that specifies table serialization and AES parameters is a more discriminating next step than adding arbitrary password rotations, KDF salts, IVs or cryptographic modes here.

**Reproducer:** [one-file CommonJS Node22 original-grid SFT](../sims/lp2_p50_openpuff_password_payload_sft.cjs) and [successful Windows GitHub Actions run 43754995305](https://github.com/FlareZ123/liber-primus/actions/runs/43754995305) using [manual-only workflow](../.github/workflows/lp2-p50-openpuff-password-payload-manual.yml). Source hashes and source geometry are asserted in code. Classification: completed narrow original-input negative, retained as intermediate evidence; no promotion into the established results synthesis.
