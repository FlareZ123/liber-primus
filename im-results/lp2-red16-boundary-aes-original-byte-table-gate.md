# Original red-span boundary operands against the 256-byte table

**Agent 50, 18 November 2026. Classification: finite, source-derived original-cipher negative. No new LP2 plaintext, genuine key, file or destination.**

## Why these two registers are well defined

The source-original LP2 scans on physical pp0–55 have exactly **16 continuous red-rune spans**. Their first and last glyphs, in ordinary reading order and translated into the canonical GP29 order, each create a 16-element byte vector. The independent original physical pp49–51 table carries 256 printed two-symbol cells, whose conventional **base60 byte interpretation remains provisional**. These input sizes motivate a small test of two historical 16-byte AES packet roles; they do not establish that Cicada instructed AES, the endpoints, or byte interpretation.

The two exact GP-index candidate operands are:

- First rune per span, 16 bytes: `0f140d18170e0014011317151b001018`
- Final rune per span, 16 bytes: `0516020c131118151a0d060c0f080913`

For a separate GP-prime-weight register, replacing each rune's index with the independently defined first-29-prime weight gives source hex `35492b61592f02490347594f6b023b61` (starts) and `0d530529473d614f672b112935171d47` (ends). All four arrays are byte-valued without truncation, and the script asserts their glyph identity against every complete source red span. The conditional table's 256-byte SHA-256 is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

## Frozen direct decoders and measured result

For *each* GP-index and GP-prime register, test three simple roles: (1) starts as 128-bit AES key, ends as 128-bit IV; (2) starts concatenated with ends as 256-bit key and a zero IV; (3) source-order interleaving of starts and ends as 256-bit key and a zero IV. Test **ECB, CBC and CTR** under all six operands. ECB ignores IV; CBC/ECB decrypt without automatic padding because the 256-byte input is an integral block count. This is exactly **18** total tests; no passwords, fitted shifts, alternate word readings, phase scans, corpus selection or arbitrary string concatenations. AES256 zero IV is an investigator assumption.

All 18 original 256-byte outputs have **no matching ZIP, PNG, PDF, JPEG, GZIP, BZIP2, or 7ZIP magic at offset zero, no valid PKCS#7 tail**, and longest ASCII-printable run no more than **7** bytes. The highest printable count, including line-feed/carriage-return/tab, is **110/256**. The leading hexadecimal bytes and all 18 quantitative outcomes are emitted in the executable report.

The program exactly reencrypts all 256 source bytes for each tested inverse. It also encrypts and recovers an independently specified 256-byte known-plaintext plant under every tested AES configuration and rejects a reversed-key control. Reversibility and positives confirm decoder execution, but **do not authenticate AES as the historical method**. No coherent text or recognisable typed packet is recovered.

## Decision and reproduction

The source provides a concrete **16+16 dimensional coincidence**, but no first-party instruction selecting boundary glyphs, AES, the IV, its reset, or the p49–51 grid as ciphertext. These 18 direct tests give no credible plaintext. Stop this branch at the missing operation selector. An external instruction that specifies a different key derivation or a typed encrypted object could reopen that *new* mechanism, rather than extend this finite screen with invented AES parameters.

[Exact CommonJS, Node22 source SFT](../sims/lp2_red16_boundary_aes_original_sft.cjs). Inputs are [canonical original rune corpus](../resources/liber-primus/lp2-corpus.json), [source red ink annotation](../resources/liber-primus/lp2-ink-annotations.json), and [original table transcription](../resources/liber-primus/lp2-grid-256.json). Independent local Node22 fixture ran the same 18 original-derived operands against the complete byte-exact table and reproduced the output bounds. The historical original JPEGs are [17.jpg–74.jpg](../resources/liber-primus/README.md). The interpreted table bytes, rather than a cryptographic file-format claim, are the sole numeric input.
