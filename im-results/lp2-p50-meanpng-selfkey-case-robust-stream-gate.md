# Original p50 missing-L Bitcoin column as a self-decryption key: ambiguity-proof byte bound

**Agent11, 23 November 2026. Status:** original-input, historically available stream-cipher gate; no recovered LP2 plaintext, author-selected cipher/key role, hidden file, or destination. The [single-file CommonJS reproduction](../sims/lp2_p50_meanpng_selfkey_stream_casebound_sft.cjs) passed on [Windows Node22, run 45254090061](https://github.com/FlareZ123/liber-primus/actions/runs/45254090061).

## Source-selected operands, conditional operation

The unchanged p49–51 table consists of **32 printed rows × 8 two-character base60 tokens**, **256 bytes** in conventional 60-character reading. Original-byte SHA256 is \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`. The independently proposed missing-\`4C\` (“L”) operation selects the table's fifth vertical column as an exact 32-byte secp256k1 secret. Its standard compressed Bitcoin P2PKH address is:

\`1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK\`

That fixed typed key is the only proposed new source operand. A player could reasonably ask whether the table is a **self-encrypting message**, with its selected 32-byte key for the rest of the cells. This receiver was absent from the earlier exhaustive [column-key-to-*rune-section* tests](lp2-p50-eight-column-aes-chacha-zeroiv-native-gate.md); the present target is the printed **numeric table itself**, not its neighboring manuscript ciphertext. No first-party document names AES, ChaCha20, CTR, a zero nonce, or a self-key interpretation, so this is a conditional test of two distinct standard pre-2014 ciphers, **not** an author-authenticated decoding command.

Exactly three visible read orders are frozen without key tuning: (i) remove column five, read the remaining seven columns in printed row-major order (224 bytes); (ii) remove column five, read the seven remaining columns vertically in printed left-to-right order (224); (iii) retain the full original printed row-major 256 bytes (comparison). For each, use the 32-byte original column as raw AES-256-CTR or ChaCha20 key with 16 zero IV bytes, byte0 initial counter, one continuous stream. No password stretching, rotated ciphertext, fitted phase, random nonce, skipped frames, invented plaintext, source mutations, or trial decryptions of rune text.

## Exact original results and all-typography bound

The source image's capital-I and lowercase-l second digits are visually confusable. The **ten** printed positions affected, in zero-based row-major 256-cell coordinates, are \`[2,25,45,50,90,165,175,182,199,246]\`. Those two conventional base60 values differ by **29**, so \`2^10=1,024\` visually plausible interpretations are possible. **None of the ten cells lies in the fifth column**, making the proposed Bitcoin key and its 32-byte keystream invariant under *every* case assignment. Because both cipher candidates here are XOR keystream operations, changing one printed input byte changes exactly the corresponding output byte. Consequently **each of the 1,024 alternate readings can increase the number of printable ASCII characters by at most ten over the source-printed output**. This is an *exact*, inexpensive all-case upper bound; no enumeration or English fit is required.

| Frozen table consumer | AES-256-CTR printable / length | AES **maximum** across all 1,024 cases | ChaCha20 printable / length | ChaCha **maximum** |
| --- | ---: | ---: | ---: | ---: |
| Seven columns, printed row-major | **89/224** | **≤99/224** | **84/224** | **≤94/224** |
| Seven columns, column-major | **87/224** | **≤97/224** | **86/224** | **≤96/224** |
| Full 32×8 panel, row-major | **81/256** | **≤91/256** | **83/256** | **≤93/256** |

**All six first bytes are case-independent**, because both output layouts start at a source cell outside the ambiguity list. The exact first 24 bytes of each original output:

| Frozen output | First 24 decrypted bytes (hex) |
| --- | --- |
| Seven columns / row-major / AES | \`7bb59f80f346d55c0115ce5492e253c501466339b2fd60d1\` |
| Seven columns / column-major / AES | \`7b0e41576d689ffe822d9e83fb4c6325c76d97e50c604dfc\` |
| Full panel / row-major / AES | \`7bb59f807fd51cb7a4708c8ed2329ddb77ade52383199d2b\` |
| Seven columns / row-major / ChaCha20 | \`680ba8f37492108d5134fa2da003d0772072392c12e5407c\` |
| Seven columns / column-major / ChaCha20 | \`68b07624eabc5a2fd20caafac9ade097e659cdf0ac786d51\` |
| Full panel / row-major / ChaCha20 | \`680ba8f3f801d966f451b8f7e0d31e695699bf362301bd86\` |

No output begins with the usual unambiguous ZIP, gzip, or bzip2 signatures. The original source output and every allowed I/l repair are overwhelmingly non-ASCII: direct English plaintext, a line-oriented instruction, or ASCII-armored OpenPGP material is therefore excluded for the six exact hypotheses. A headerless binary payload or different independently specified key/IV/opcode is outside this gate.

## Verification and research decision

The SFT regenerates the original 256 source bytes and typed Bitcoin address, asserts every case-sensitive cell and the ten case-ambiguous indices, checks that the Bitcoin key is unchanged, tests the six source decryptions with exact expected first24 and printable counts, and verifies the ten-byte all-case upper bound independently of English scoring. It also uses a genuine solved-LP2 sentence as a **planted encrypted plaintext**, recovering the complete original ASCII sentence under each cipher. Original source input remains unchanged.

The Windows Node22 run passed all assertions on a GitHub checkout. The all-case bound is a **mathematical exclusion of ASCII self-decryption** for these two zero-IV source-operands; it does not authenticate Bitcoin or eliminate all encrypted interpretations. **Retire this specific p50-selected raw BTC key → seven other columns / full table → AES-256-CTR or ChaCha20 zero-IV direct ASCII** branch. No independent source supplies a nonzero nonce or a different serializer, so do not expand to arbitrary IV/KDF/algorithm searches. The missing key-recipient instruction remains the blocking dependency; the repository's [authoritative research state](../results/README.md) remains unchanged.
