# LP2 eight author-delimited text spans vs eight 32-byte table columns: SHA-256 decision

## Proposed decipherment / key interface

The **original** numerical table occupies 80+104+72 cells on p49–p51, making a 32-row by 8-column, 256-byte object when decoded with the traditional base-60 alphabet. The separate original text transcription `resources/lp2-transcription.txt` contains eight `$`-delimited encrypted runic spans, totalling exactly **12,956** GP29 runes before the two known solved p56–p57 pages. Their sizes are **729, 1,145, 1,738, 1,894, 1,021, 1,433, 1,680, 3,316**. The eight visually distinct numeric columns could be one 32-byte SHA-256 digest per ciphertext span. This proposal depends on the author intending column layout as a cryptographic interface; **there is no authenticated instruction explicitly selecting SHA-256**, and the eight source delimiters are not identical to the nine illustration groups.

## Exact original-ciphertext test

We tested **all eight original source ciphertexts** against each of the eight original 32-byte table columns (and, as the direct row-major alternative, eight contiguous 32-byte blocks), using six finite, literal source encodings: the original GP runic UTF-8 glyphs with punctuation stripped; GP rune indices as raw bytes 0..28; comma-separated indices; concatenated decimal indices; plain GP transliteration; and the complete original source transcript, including line and punctuation delimiters. In total **8×8×2×6=768 exact SHA-256 comparisons**, with no search over guessed plaintext, no random keys, and no configurable salt/nonce.

All 768 source comparisons returned **zero exact SHA-256 matches**. Both source-derived section lengths and their combined rune-by-rune identity with the repository's original ciphertext corpus were asserted. The standard SHA-256 `abc` digest and a seeded positive of SHA-256 on original section 0's raw index bytes passed. No ciphertext bytes or table tokens were altered to force a match.

The [single-file Windows Node22 CommonJS reproducer](../sims/lp2_grid8_sha256_original_sections_sft.cjs) ran successfully against the original repository corpus in [GitHub Actions run 45055329514](https://github.com/FlareZ123/liber-primus/actions/runs/45055329514); the full job log includes `SFT: sims/lp2_grid8_sha256_original_sections_sft.cjs`, `digestComparisons:768`, `originalMatches:[]`, and successful source-tests.

## Decision and remaining decryptable questions

**Reject the exact source-native hypothesis that the eight table columns or eight consecutive row-major byte blocks directly equal SHA-256 digests of the eight original ciphertext spans in these six human-visible encodings.** This is a narrow negative. It neither shows the table is a key, nor rules out encryption keys or hashes of unknown plaintext, a different serialization, an external signed file, an actual source-selected KDF, or information encoded in table typography. No original unknown page was decrypted. Do not expand this result into a generic hash catalog without an original instruction selecting another authenticated input or operation.
