# P15-selected historical DATA/560.13 direct XOR against the original 256-cell numerical table

**11 November 2026, Agent14. Classification: one source-constrained, original-input negative with exact historical positive control.** This test directly targets the physical p49–51 numerical table as a 256-byte binary ciphertext. No new LP2 plaintext, decryption key, cryptographic mechanism or destination was recovered.

## Causal source route

The nine red GP29 runes at the beginning of physical p15 encode the BASE29 integer **29,553,734,724**. The existing authentic 2013 BASE29 3301/GP arithmetic gives the exact Euclidean division

`29,553,734,724 = 3301 × 8,952,964 + 560`.

The `560` remainder selects the historical CicadaOS `DATA/560.13` file (the already studied p15 prime-square's sole member of the original 2013 ISO file suffix range is 13). Use quotient **8,952,964** as a zero-based consecutive-byte offset into that historical file. The 2013 original puzzle demonstrated precisely **bytewise XOR of source bytes with a consecutive same-size pad slice**. Instead of the previously tested p15–22 rune body or Agent4's p55 central-23 runes, apply this same exact historical byte operation once to the obvious binary original artifact: the **256 bytes** of the printed 32×8 numerical table on physical p49–51. The table is read as the canonical original-image adjudicated row-major base60 code. This is a proposed target; the historical source does not explicitly direct the p15 offset to the p50 table.

No phase, offset fitting, key derivation, word reading, arbitrary file-length choice or alternative cipher family is introduced.

## Exact source and output

- The original printed table is 256 bytes, SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.
- The fetched historical DATA file is **118,818,811 bytes**, SHA-256 `db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f`.
- The SHA-256 of its selected 256-byte pad slice at offset 8,952,964 is `0fc28751cc5aecd60a6d5c4cabfa454179d2c742e500b44f2e5d912b5690956c`.
- Exact original decoded buffer `D_i = table_i XOR DATA[8,952,964+i]`, SHA-256 `9d9eba7a73f62a2718830416a3971e9eaa893a0babc997ec20bbd2ceb5f73e66`.
- Of the 256 decoded bytes, **104** are printable ASCII and **61** are ASCII letters. The largest continuous plaintext preview contains no recognizable English sentence. The beginning is `b5 81 98 d1 8e 7c 33 af 12 af 56 cd 28 a4 aa b2` and the remaining bytes are preserved in the exact CI log. The output matches none of the predeclared PDF, PNG, ZIP, gzip, 7z, GIF, Ogg, bzip2, Zstd and OpenPGP-ASCII signatures. Its SHA-512 does not match the 64-byte p56 AN END target.

## Necessary controls and conclusion

The exact same authenticated historical file independently recovers the original 2013 known plaintext `gbyh7znm6c7ezsmr.onion\n` from the documented source ciphertext and byte offset **12,821**. On the proposed 256-cell original table, applying the same XOR again exactly reconstructs all **256/256** original input bytes; an independent 256-byte ASCII planted source also round-trips 256/256. Thus the result is not caused by an incorrect historical byte-XOR implementation.

**Decision:** retire the *direct contiguous-byte XOR of canonical p50-table bytes with the original DATA/560.13 slice at p15-derived offset 8,952,964* as a source-fixed direct ASCII/file or SHA-512 preimage recovery. The output may be arbitrary binary and the source-to-target link remains a hypothesis; no general exclusion of the historical file, other source-selected targets, or encrypted higher-layer content follows. Do not rescue the same weak hypothesis with guessed offsets, byte strides or extra transforms without new independent instructions.

**Reproduction:** [single-file source-pinned Node 22 SFT](../sims/p15_iso56013_grid256_historical_xor_sft.cjs), executed after the established p15 and p55 regressions by the existing [manual-only CI workflow](../.github/workflows/lp2-p15-56013-quotient-offset.yml), [successful full-data run 43113147209](https://github.com/FlareZ123/liber-primus/actions/runs/43113147209), job `130834171633`.
