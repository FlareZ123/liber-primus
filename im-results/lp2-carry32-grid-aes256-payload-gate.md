# Cross-page carry words as a 32-byte AES key for the 256-cell numerical table

**Status, 12 November 2026:** One source-defined, internally complete 32-byte key extraction and thirteen natural AES-256 table-payload decryptions, two authenticated AES-256-GCM container tests, and two historical OpenPGP-CFB framing tests were run on the original LP2 inputs. **No readable plaintext, recognized opening file signature, or independently authenticated key was recovered.** This is a bounded negative for a conditional numerical-table format, not a proof that the table cannot carry hidden data.

[Reproduce with a single CommonJS test](../sims/lp2_carry32_grid_aes256_payload_sft.cjs) · [Successful original-source GitHub Actions run](https://github.com/FlareZ123/liber-primus/actions/runs/43302411345)

## The proposed human solve path

Agent30 observed a source-visible correspondence that requires neither fitting plaintext nor inventing 32 words. The original unknown LP2 has **32 complete words that actually cross physical page boundaries**, parsed with line wraps and page breaks retained as continuations, and the printed numerical object on pp49–51 has exactly **32 rows of eight two-character cells**. Its output is conditional on interpreting the table as radix-60 byte values.

A direct way to combine those artifacts is to take the GP **prime sum** of each carried word, select one of its corresponding row's eight cells with column index \(\text{sum}\bmod8\), and concatenate those 32 cells as a **256-bit key**. This is the independent Agent30 32-byte key candidate, which had been tried as an AES-256-CTR stream on original p55 GP29 rune indices with no plaintext. The distinct question here is whether the **numerical table itself** holds a self-contained encrypted payload: one selected byte in each row is key material, leaving **seven bytes per row, 224 bytes total = fourteen AES blocks**. A row-major read preserves printed order; a column-major read is the single natural alternative. A third lower-assumption control treats all 256 original table bytes as ciphertext.

This interpretation is **not authenticated by Cicada**. In particular, the authors gave no instruction to use AES-256, to select columns modulo eight, to treat bytes as ciphertext, or to place an IV at zero. The cardinality coincidence is a hypothesis selector, not evidence that AES is correct.

## Exact source and operations

The original first 55 rune-bearing transcript sections contain **12,956 GP29 runes in 2,896 complete words**. Soft line and physical page wraps preserve words. Exactly **32** words cross from one physical page to the next. The corresponding source-order eight-column selectors are:

```
41733365273004427417340057065101
```

The selected key is the exact raw byte string:

```
61f9571927499cc41952c1d3de0e3656abf5d2f85294eb807315393300ea909e
```

The unchanged 256-byte original table's SHA-256 is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Removing the selected cell of every source row yields a 224-byte row-major payload with SHA-256 `ba31bfb8fb5ac631b34208e741552f2659f7e206a664b8c78d4dbf1e24974106`; column-major gives `7b77462eb0597b4c0c918a70b4453531805a1c973bfec66efd935ced53e74233`.

Run **AES-256-ECB without padding**, **AES-256-CBC with zero IV and without padding**, and **AES-256-CTR with a zero initial counter** on each payload. For the 224-byte variants, also treat the first 16 or last 16 bytes as the **CBC IV**, and decrypt the remaining exactly 208 bytes (13 full blocks) without padding. This is the conventional self-contained CBC container that uses a supplied unpredictable IV; both the prefix and suffix positions are explicit. These are conventional reversible uses of an independent 32-byte AES key, **not** arbitrary KDF, IV or offset searches. Each of the thirteen unauthenticated modes has a same-length native ASCII positive: encrypt that source-shaped plant, then decrypt and check every byte. The original input byte hashes and the thirteen exact output SHA-256 values are pinned in the test. The 224-byte source also permits one conventional AES-256-GCM container: first 12 bytes as nonce, last 16 as authentication tag, and the 196 intervening bytes as ciphertext. Both row- and column-major versions are tested with their corresponding exact original bytes. Independently encrypted and authenticated positives recover the genuine input bytes. The full source-key extraction and AES regression passed Node 22 manual CI with the source's existing canonical transcript and original-byte table.

## Original results

| Ciphertext serialization | AES mode | Printable ASCII / total | Longest contiguous printable run | First 16 decrypted bytes (hex) |
| --- | --- | ---: | ---: | --- |
| 224 unselected, row order | ECB | 84/224 | 4 | `cef81a4f5c585bdfce2595f6f44b8970` |
| 224 unselected, row order | CBC | 71/224 | 5 | `cef81a4f5c585bdfce2595f6f44b8970` |
| 224 unselected, row order | CTR | 81/224 | 8 | `01c31873cb02c309ce7e07bbf0256037` |
| 224 unselected, column order | ECB | 92/224 | 6 | `695c6f9ca3ea426444672664a3565637` |
| 224 unselected, column order | CBC | 82/224 | 6 | `695c6f9ca3ea426444672664a3565637` |
| 224 unselected, column order | CTR | 92/224 | 7 | `0178c6a4552c89ab28047e63d18b50d7` |
| Entire 256-byte table, original row order | ECB | 91/256 | 4 | `430cd407084c767f2a0c710ccf087c31` |
| Entire 256-byte table, original row order | CBC | 101/256 | 6 | `430cd407084c767f2a0c710ccf087c31` |
| Entire 256-byte table, original row order | CTR | 108/256 | 7 | `01c3187347910ae20e596c61b0f5ae29` |
| 224 unselected, row order, 16-byte leading IV removed | CBC | 64/208 | 5 | `7fe7a514c0b77be1881fce5e4ea87f2c` |
| 224 unselected, row order, 16-byte trailing IV removed | CBC | 71/208 | 5 | `4f5597658a4e63190e543910406f3420` |
| 224 unselected, column order, 16-byte leading IV removed | CBC | 70/208 | 3 | `eb208db17fb681df1a008e1e8c1d8c48` |
| 224 unselected, column order, 16-byte trailing IV removed | CBC | 72/208 | 3 | `21c4d2655bf813456b1872f30cfb9667` |

The **two conventional authenticated GCM envelopes** also fail exact authentication under the extracted source key. Their 12-byte source-derived nonces and 16-byte tags (shown in the SFT) are tested without a guessed initialization vector, optional AAD, or altered ciphertext. The row-major and column-major tag checks each reject the 196 encrypted bytes. A positive source-shaped AES-256-GCM encrypt/authenticate/decrypt plant succeeds for both. This is a cryptographically decisive negative for that exact self-contained GCM payload format, independent of any English-language score.

The outputs have no English sentences, recognizable opening payload headers, or clear Cicada instructions. **All four embedded-IV CBC candidates also fail exact PKCS#7 final-block padding**, independently of whether their internal bytes could be language; thus they are not complete ordinary PKCS#7-padded AES-CBC messages under the fixed key/IV/source order. The normal leading-IV format is particularly natural, and its exact failure is a direct negative for that consumer. None is an ASCII armor/PEM/PGP block. Their short printable runs and byte distributions resemble opaque binary. They could conceivably contain a binary register requiring a **source-selected second step**, but the manuscript supplies no such rule here.

## Historical OpenPGP CFB payload framing: independent exact key check

Cicada's source-authenticated 2012–16 signed communications used OpenPGP and the format's older [RFC 4880](https://www.rfc-editor.org/rfc/rfc4880.html#section-13.9) provides a small, highly discriminating **symmetric-payload framing** distinct from generic AES ECB, CBC, CTR and AEAD. OpenPGP symmetrically encrypted content begins with a 16-byte random prefix, followed by a **repeat of its final two bytes** (the "quick check"). Decrypt the first 18 source ciphertext bytes with **AES-256-CFB, initial IV all zero** and the exact source-derived 32-byte key. The two possible historical variants, a legacy resynchronized CFB payload (Symmetrically Encrypted Data Packet) and a continuous-feedback CFB payload with SHA-1 Modification Detection Code (SEIPD v1), share this exact initial 18-byte prefix. They differ only after it. No payload reordering, guessed IV, fitted key or guessed document language is involved.

| 224-byte ciphertext | Recovered first 18 plaintext bytes (hex) | Position 15 = 17? | Position 16 = 18? | MDC 0xD314 + SHA-1 |
| --- | --- | --- | --- | --- |
| Original unselected row-major | `01c31873cb02c309ce7e07bbf0256037b222` | **No** | No | Invalid |
| Original unselected column-major | `0178c6a4552c89ab28047e63d18b50d716e2` | **No** | No | Invalid |
| Artificial AES-256-CFB packet with genuine authenticated ASCII payload | `00112233445566778899aabbccddccddccdd` | **Yes** | Yes | Valid |

The two source payloads **fail the 16-bit key check**, and their decoded SEIPD-v1 trailing constant bytes and SHA-1 MDC also fail. The synthetic positive encrypts a literal prefix with its specified repeated bytes, authenticates the full source-shaped message with SHA-1 MDC, then decrypts and checks both required conditions. It passes.

This is an exact rejection of the *proposed carry32 key and both chosen payload orders as direct OpenPGP CFB ciphertext*, without an English-frequency or header heuristic. The printed table does **not** visibly contain a complete OpenPGP session-key wrapper, so historical CFB here is an explicitly conditional consumer. Failure cannot exclude a separately encrypted packet, a hidden KDF, or a different source instruction. The [original-source SFT](../sims/lp2_carry32_grid_aes256_payload_sft.cjs) and [passing CI run 43302411345](https://github.com/FlareZ123/liber-primus/actions/runs/43302411345) contain these exact full-message checks.

## Additional source-motivated row-local XOR consumer (Agent37, 13 November 2026)

A technically literate solver could notice the **32 cross-page words / 32 table rows / eight cells per row** and use the same candidate selector as the AES experiment: the sum of each carried word's GP primes modulo eight selects one byte in its corresponding row. Cicada's earlier bytewise-XOR use makes one simple additional consumer worth a single test: use that selected byte as the row key and XOR it with each of the other seven bytes in the same row, preserving their printed left-to-right order and the 32 rows' top-to-bottom order.

The operation is **not authenticated by LP2**. Neither prime-sum-mod-eight nor row-local XOR is explicitly instructed; the historical XOR precedent only motivates this one low-complexity hypothesis. No row-order, key, or offset search was performed.

Exact candidate input and output:

- Selector columns: 41733365273004427417340057065101.
- Selected 32-byte key: 61f9571927499cc41952c1d3de0e3656abf5d2f85294eb807315393300ea909e (same candidate key as the AES test).
- Remove the selected key cell from each row and XOR it with the other seven cells: exactly 224 output bytes.
- Output SHA-256: 2e4b3b0379c0f5bba4cb6397000b3cd6ea455a4859ed1f1e8b5b41c23254f8cc.
- Only **85/224** output bytes are printable ASCII; the longest contiguous printable run is **four**. The output begins aa86c6db8c1fd6a565270efd4e2d2e9d and has no tested PNG, ZIP, gzip, PDF, PGP-armour or ELF signature.
- The two simple byte→GP29 reductions already used in the repository give IoC **0.0331518257527** for byte modulo 29 and **0.0328715566944** for floor(29·byte/256). Neither produces a language-like signal.

The synthetic source-shaped positive control encrypts and recovers all 224 planted bytes exactly. The original output does not resemble direct plaintext or a recognizable common file header. This retires only this **direct row-local XOR consumer**. It does not exclude a separately source-selected binary second layer, but no such next stage is presently selected; do not chain an arbitrary AES/stream cipher or byte-to-rune mapping onto this output.

**Reproducer:** [standalone original-input Node 22 SFT](../sims/lp2_carry32_rowlocal_xor_sft.cjs). It imports the canonical 32-carry parser, asserts the exact selector/key/output digest and metrics, and includes the positive round-trip plant.

## Research decision

The source-motivated **32 cross-page words → one selected cell per row** selector has now been tested under two distinct direct-consumer hypotheses. The selected 32 bytes as an AES-256 key against the remaining 224 table bytes fail the natural row/column, zero-IV, embedded-IV AES modes, two conventional authenticated-GCM envelopes, and historical OpenPGP-CFB framing. The separate row-local XOR consumer also fails to yield direct plaintext or a recognizable common file header. These results do not refute the exact count of cross-page words, Agent30's key construction, other source-supported consumers, different byte packing, or a separately specified binary format. No new LP2 plaintext, secret, or destination follows.

Preserve the cross-page selector only as a *conditional input*. Resume this branch only if a genuinely independent source specifies a distinct authenticated use or later stage for those 32 values. Another non-source-selected mode, offset, byte-order or word-direction search would add fit freedom without recovering a clue.
