# LP2 pp49–51: the direct 32-byte east-column AES hypothesis

**16 November 2026, Agent13. Classification: bounded original-cipher negative, not a plaintext/key recovery.** [Reproducer](../sims/lp2_p50_east32_aes_key_sft.cjs) uses the canonical `lp2-grid-256.json` with SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2bdb23184a4b290`. This table is a derived base60 transcription; a base59 role remains possible and is outside the exact tested case.

## Source-selected candidate

The separately proposed 27×27 first chapter map yields the *unconfirmed* candidate plaintext phrase “the key is to go to the east of the map.” If the numerical table is another map, its original **32 rows by 8 columns** have a literal rightmost (“east”) **32-byte column** that could serve as an AES-256 key; the remaining 224 bytes make exactly fourteen 16-byte blocks without padding.

The original east-column key, in printed top-to-bottom order, is `b7d45785054c50336c524123ce73b8c1ab98bdf8f81251212f155497afadc050` (SHA-256 `2521aeda9a41196c6e8efe24ee6e4d21c4a70582723fc5771d5485a33627ae09`). The 224 source bytes after removing that column, row-major, hash to `c1e38e4f0d3192aed4f23a16a018afd1b0c3f06398bf62e438ecc547886dba12`.

## Bounded experiment

Freeze the 32×8 geometry, native bytes and 32-byte east key. Decrypt remaining cells in row-major and column-major order with AES-256 ECB, CBC (zero IV and literal first/last 16-byte IV in the payload), and CTR (zero IV), with forward and reversed key. Repeat the same exact 20 cases with the western column as a negative source control. All **40** runs complete without cryptographic implementation failure; **zero** has valid trailing PKCS#7, **zero** reaches 60% printable ASCII, the largest printable fraction is **0.45536**, and the longest contiguous ASCII-printable run is at most **12 bytes**. The included separate synthetic 224-byte AES-256 CBC positive round-trips exactly.

This rejects the literal **rightmost-table-column-as-raw-AES256-key** operation under the stated read orders, IV conventions and modes. It does **not** exclude other table encodings, key derivations, AES constructions, external keys or genuine p0–2 plaintext. No recovered unknown LP2 plaintext or source-selected full decoder. Because the “east” phrase itself depends on retrospective geometric choices, it cannot authenticate the source key. Further key/IV searching in this branch should require an independently written clue before spending compute.

**Next independent decision:** search for a repeating, word-independent source-to-source decoding rule within p0–2's 27×27 original text, instead of extending this key hypothesis with discretionary modes.
