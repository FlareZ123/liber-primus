# The paired original red16 titles as one AES-256 key: original 256-byte table gate

**Agent14, 21 November 2026. Bounded negative, no decrypted LP2 ciphertext.** Two physically distinct original red chapter headings, p3 (scan 20.jpg) and p23 (scan 40.jpg), each contain exactly 16 marked GP29 runes and are immediately followed by red 13-dot punctuation at rune offset16. Concatenating the two marked sequences provides a literal **32-byte key**, the width of AES-256, without searching key lengths or choosing an arbitrary 32-rune window. The table on original p49–51 supplies a separate **256-byte** binary receiver under the conventional base60 reading. This is a motivated source construction, although no first-party Cicada instruction names AES, combines the two headings or identifies the table as the AES ciphertext.

## Fixed source and candidate

Original heading indices in unchanged printed order:

- p3, 2|11|3 words: `[20,11,12,8,21,5,2,16,25,11,16,14,8,16,1,22]`
- p23, 2|6|3|5 words: `[1,24,7,21,6,14,23,6,10,17,10,12,16,17,10,26]`

The original 256-byte table checksum is SHA256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290` in row-major order. Four narrowly typed keys follow from either **p3+p23 or p23+p3**, treating each GP symbol as its index byte 0..28 or its published GP prime byte (both source-native, with no password derivation). For each, only **ECB**, **CBC with zero IV** (complete256 bytes), and **CBC with the first16 table bytes used as transmitted IV** (remaining240 bytes) are considered, each with padding disabled. There are **12 exact original-cipher decryptions**.

## Observed output and positive test

All 12 original output byte strings have random-looking content:

| Output diagnostic | Observed range over 12 cases |
| --- | ---: |
| Plaintext bytes | 240 or 256 |
| ASCII printable 0x20–0x7E | **80–109** |
| Literal GP-index bytes 0..28 | **25–41** |
| Longest uninterrupted printable ASCII run | **4–7** |

None produces raw ASCII instructions or a full string of native GP29 index bytes. The first blocks are not readable. All 12 exact original forward AES re-encryptions reproduce their original transmitted table payload byte-for-byte. Independently constructed 256-byte ASCII plants are encrypted under the exact same four source keys and both complete-payload ECB/CBC-zero modes, then recovered in all eight cases, confirming the reversible implementation. A positive AES decryption of arbitrary binary is uninformative without a recognizable plaintext format; no such format appears here.

## Decision

The simplest **two authentic red headings → literal AES-256 key → original 256-byte table** reading fails its direct cleartext/file-payload gate. It does not exclude externally specified AES-CTR, a separately signaled IV, a compressed/encrypted binary second layer, or key material in another source. Those extensions need additional first-party selector evidence before testing, to avoid escalating to a tunable cipher-family search. This experiment supplies no authenticated new unknown-page runes, recoverable decryption key or destination.

**Reproducer:** [one-file Node 22 CommonJS original-source test](../sims/lp2_p3_p23_red32_aes256_grid_original_sft.cjs), [passing manual Windows CI #44948631749](https://github.com/FlareZ123/liber-primus/actions/runs/44948631749). All original indices, both red16+red13 wrappers, the complete table SHA256, twelve original byte counts, re-encryption identities and planted positive text are checked in the same run.
