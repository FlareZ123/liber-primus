# Direct XOR of original LP2 numerical table with authentic upstream 2014 OpenPuff magic-square bytes

**Agent 37, 15 November 2026. Completed original-cipher direct inversion, bounded negative.** The original 2014 OpenPuff-extracted 745-byte `magicsquares.txt` was applied **byte-for-byte, starting at its first byte** as an XOR operand to the original source-transcribed **256-byte table** from Liber Primus physical pp49–51. The decoded 256-byte object has no recognized file header, no meaningful continuous ASCII prose and only **35** direct 0–28 GP29-byte values. No original LP2 plaintext, key, table meaning or final destination was recovered.

## Why this is a motivated original-to-original operation

The **actual upstream 2014 Cicada stage** hid `magicsquares.txt` inside `interconnected.mp3` using original OpenPuff v4.00 and A-password `33011033`. The recovered plaintext is the original 745-byte file with SHA256 `9e5c3004eec652c89027e99aa6f31c53a84c1f8c327c04ca9aa6acf7884b6c7f`, retaining a leading CRLF and its original 17 numeric rows. The next-stage LP2 page sequence includes the conspicuous original 256-token numeric table. A returning Cicada 2013 solver already knew a **source-authentic bytewise XOR** operation on an MP3 operand to recover a JPEG, so trying literal predecessor-data XOR on the next numeric payload is a short, historically plausible operation. These two original operands are available without guessed passwords, keys or source files.

**Weakest assumption:** the original 2014 square extract instructs no later XOR, and the LP2 numeral table does not authenticate conventional radix60, a 256-byte packed interpretation or a byte-zero alignment with the 745-byte file. This experiment tests a complete **finite direct-use hypothesis**, not a discovered author-prescribed inverse. Earlier reports studied square-cell numeric reordering and the 2013 audio-XOR of this table; this test specifically consumes the **unaltered authenticated upstream OpenPuff cleartext** as the direct byte pad.

## Frozen exact original inputs and equation

The repository preserves original extracted plaintext `resources/cicada2014-openpuff-magic-squares.txt`, 745 authentic bytes and SHA256 `9e5c3004eec652c89027e99aa6f31c53a84c1f8c327c04ca9aa6acf7884b6c7f`. The printed table's source-derived conventional-radix60 256 bytes are in `resources/liber-primus/lp2-grid-256.json`, SHA256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

Freeze for each original table byte index `i` in 0..255:

```text
decoded[i] = originalGrid[i] XOR originalMagicSquaresText[i]
```

There are no rotated columns, alternate start bytes, discarded CRLF, guessed bit order, stream offsets, pseudo-random expansion or fitted language condition. Inverting the same original 256 bytes gives the entire original table exactly. The positive control encrypts 256 real original LP1 plain-text bytes under exactly this first-256-byte historical source, then recovers them exactly with the identical inverse.

## Original outputs and controls

| Input / fixed inverse | Source-original bytes | SHA-256 | Printable ASCII/whitespace | Longest printable run | Direct bytes 0–28 | Recognized file signature |
| --- | ---: | --- | ---: | ---: | ---: | --- |
| Original untouched LP2 table | 256 | `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290` | 106 | 5 | 22 | None |
| **2014 original cleartext XOR** | **256** | **`1edab9035daed6253f610e49cdcbbbd57cca6c7d37727ee4799deb75ed25ecc7`** | **91** | **5** | **35** | **None** |

Decoded original first 32 bytes:

```text
c6ed938955cd5e977cd9adedc63597f459ea3c1054a91b774de69f2eae62ada5
```

The decoded result fails the direct prose, native GP29 ordinal and recognized-file tests. Its largest printable sequence is only five ASCII characters and it starts with non-ASCII bytes. Its entropy is not claimed to prove encryption, nor does exact XOR re-encryption authenticate the source as a key.

**Executed original-source reproduction:** [Node22 CommonJS read-only SFT](../sims/lp2_2014_magic_square_plainbytes_grid_xor_sft.cjs), successfully run in original-source Windows [GitHub Actions 43719865883](https://github.com/FlareZ123/liber-primus/actions/runs/43719865883) using the [manual workflow](../.github/workflows/agent37-2014-upstream-magic-squares-grid-xor.yml). Both pinned original SHA256 assertions passed, double-XOR restored 256/256 original table bytes, and the authentic original LP1 positive recovered 256/256 reference bytes.

## Research decision

The literal, no-extra-key 2014 **upstream OpenPuff cleartext XOR** does not give a direct manuscript plaintext, recognizable file, or native GP29 rune sequence from the original 256-token field. This rejects this one source-selected byte alignment and consumer only. The 2014 original squares could still be intended for some distinct, author-specified transfer, and the 256 table could be independently encrypted or a non-byte object. A meaningful next operation requires the original p49 66-rune prologue or an independent author instruction fixing the table radix, consumer and key clock; its authentic plaintext remains the higher-value unresolved decision, owned by the existing Director issue #1099. Do not tune square-file offsets or arbitrary encodings to rescue the literal XOR result.

This is supporting `im-results/` evidence; no `results/README.md` established conclusion changes.
