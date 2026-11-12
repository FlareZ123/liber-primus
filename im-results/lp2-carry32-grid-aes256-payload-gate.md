# Cross-page carry words as a 32-byte AES key for the 256-cell numerical table

**Status, 12 November 2026:** One source-defined, internally complete 32-byte key extraction and nine natural AES-256 table-payload decryptions were run on the original LP2 inputs. **No readable plaintext, recognized opening file signature, or independently authenticated key was recovered.** This is a bounded negative for a conditional numerical-table format, not a proof that the table cannot carry hidden data.

[Reproduce with a single CommonJS test](../sims/lp2_carry32_grid_aes256_payload_sft.cjs) · [Successful original-source GitHub Actions run](https://github.com/FlareZ123/liber-primus/actions/runs/43298169480)

## The proposed human solve path

Agent30 observed a source-visible correspondence that requires neither fitting plaintext nor inventing 32 words. The original unknown LP2 has **32 complete words that actually cross physical page boundaries**, parsed with line wraps and page breaks retained as continuations, and the printed numerical object on pp49–51 has exactly **32 rows of eight two-character cells**. Its output is conditional on interpreting the table as radix-60 byte values.

A direct way to combine those artifacts is to take the GP **prime sum** of each carried word, select one of its corresponding row's eight cells with column index \(\text{sum}\bmod8\), and concatenate those 32 cells as a **256-bit key**. This is the independent Agent30 32-byte key candidate, which had been tried as an AES-256-CTR stream on original p55 GP29 rune indices with no plaintext. The distinct question here is whether the **numerical table itself** holds a self-contained encrypted payload: one selected byte in each row is key material, leaving **seven bytes per row, 224 bytes total = fourteen AES blocks**. A row-major read preserves printed order; a column-major read is the single natural alternative. A third lower-assumption control treats all 256 original table bytes as ciphertext.

This interpretation is **not authenticated by Cicada**. In particular, the authors gave no instruction to use AES-256, to select columns modulo eight, to treat bytes as ciphertext, or to place an IV at zero. The cardinality coincidence is a hypothesis selector, not evidence that AES is correct.

## Exact source and operations

The original first 55 rune-bearing transcript sections contain **12,956 GP29 runes in 2,896 complete words**. Soft line and physical page wraps preserve words. Exactly **32** words cross from one physical page to the next. The corresponding source-order eight-column selectors are:

\`\`\`
41733365273004427417340057065101
\`\`\`

The selected key is the exact raw byte string:

\`\`\`
61f9571927499cc41952c1d3de0e3656abf5d2f85294eb807315393300ea909e
\`\`\`

The unchanged 256-byte original table's SHA-256 is \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`. Removing the selected cell of every source row yields a 224-byte row-major payload with SHA-256 \`ba31bfb8fb5ac631b34208e741552f2659f7e206a664b8c78d4dbf1e24974106\`; column-major gives \`7b77462eb0597b4c0c918a70b4453531805a1c973bfec66efd935ced53e74233\`.

Run **AES-256-ECB without padding**, **AES-256-CBC with zero IV and without padding**, and **AES-256-CTR with a zero initial counter** on each payload. These are three conventional reversible uses of an independent 32-byte AES key, **not** arbitrary KDF, IV or offset searches. Each of the nine modes has a same-length native ASCII positive: encrypt that source-shaped plant, then decrypt and check every byte. The original input byte hashes and the nine exact output SHA-256 values are pinned in the test. The full source-key extraction and AES regression passed Node 22 manual CI with the source's existing canonical transcript and original-byte table.

## Original results

| Ciphertext serialization | AES mode | Printable ASCII / total | Longest contiguous printable run | First 16 decrypted bytes (hex) |
| --- | --- | ---: | ---: | --- |
| 224 unselected, row order | ECB | 84/224 | 4 | \`cef81a4f5c585bdfce2595f6f44b8970\` |
| 224 unselected, row order | CBC | 71/224 | 5 | \`cef81a4f5c585bdfce2595f6f44b8970\` |
| 224 unselected, row order | CTR | 81/224 | 8 | \`01c31873cb02c309ce7e07bbf0256037\` |
| 224 unselected, column order | ECB | 92/224 | 6 | \`695c6f9ca3ea426444672664a3565637\` |
| 224 unselected, column order | CBC | 82/224 | 6 | \`695c6f9ca3ea426444672664a3565637\` |
| 224 unselected, column order | CTR | 92/224 | 7 | \`0178c6a4552c89ab28047e63d18b50d7\` |
| Entire 256-byte table, original row order | ECB | 91/256 | 4 | \`430cd407084c767f2a0c710ccf087c31\` |
| Entire 256-byte table, original row order | CBC | 101/256 | 6 | \`430cd407084c767f2a0c710ccf087c31\` |
| Entire 256-byte table, original row order | CTR | 108/256 | 7 | \`01c3187347910ae20e596c61b0f5ae29\` |

The outputs have no English sentences, recognizable opening payload headers, or clear Cicada instructions. None is an ASCII armor/PEM/PGP block. Their short printable runs and byte distributions resemble opaque binary. They could conceivably contain a binary register requiring a **source-selected second step**, but the manuscript supplies no such rule here.

## Research decision

The source-constrained **32 carry words → one byte per row → 32-byte AES key → remaining 224-byte table plaintext** route is directly tested and fails to yield a usable payload in its obvious row/column and zero-IV AES formats. It does not refute the exact count of cross-page words, Agent30's key construction, other supported consumers, different byte packing, or the possibility of an independently specified binary format. No new LP2 plaintext, secret, or destination follows.

Preserve the cross-page selector only as a *conditional input*. Resume this branch only if a genuinely independent source specifies AES mode/IV or a distinct authenticated use for those 32 values. Another IV search or arbitrary word-direction tweak would add fit freedom without recovering a clue.
