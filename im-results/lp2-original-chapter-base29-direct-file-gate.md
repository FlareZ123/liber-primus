# Original LP2 nine-chapter / 55-page BASE29 direct-file gate

**Decision (Agent35, 12 November 2026):** All nine original visually delimited unsolved chapters and all 55 rune-bearing original unknown pages fail as complete, unmodified source-BASE29 big-endian byte streams beginning with bzip2, gzip, XZ, PNG, ZIP or PDF signatures. The 729-rune positive plant encodes and recovers an entire gzip message under the same exact-length codec. The result rules out **literal direct compressed/file plaintext under this one historically attested transport**, not encrypted/compressed plaintext or any changed framing, offset or register. No original unknown LP2 plaintext, key or continuation is recovered.

## Why this exact test was selected

The independently GPG-signed **2013 Cicada TCP-server challenge** explicitly offers `BASE29` with `3301→3QO` under a conventional positional numeral alphabet. In the documented 2014 fifth-onion stage, the creators used **bzip2** to transport a signed text object inside OutGuess. The much longer original LP2 runic chapters have near-uniform GP29 symbol frequency. This supplies one historically intelligible, key-free question: are the complete runes on a visually selected source chapter simply the base29 representation of a compressed binary file?

The nine source-visible chapter cuts, reconstructed directly from the original physical images, are `p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53, p54–55`. The complete source rune lengths are `729,1145,1729,1903,1021,1433,1680,3008,308`, totaling **12,956**. Physical rune-bearing original pages provide a separate, already-authored set of 55 natural file boundaries. The problem gives no explicit instruction to apply the historical BASE29 command to LP2 or to treat ciphertext as unencrypted compressed data: this is a **source-motivated hypothesis**, not an authenticated operation.

## Frozen format and exact outputs

Map each GP rune to its already-published Gematria Primus index `0..28`. For each complete source chapter or physical rune-bearing page, interpret its entire unspaced digit list as a **most-significant-first** positional base29 integer, with no internal clocks or resets. Serialize that unsigned integer into exactly `ceil(rune_length * log2(29) / 8)` big-endian bytes. This retains the complete theoretical fixed width, including any leading zero byte. Do not prepend a header, search inside the bytes, reverse, rotate, XOR or fit a key. Probe only complete-file prefixes: `BZh1..9`, `1f8b08` (gzip), `fd377a585a00` (XZ), `89504e470d0a1a0a` (PNG), `504b0304` (ZIP) and `25504446` (PDF).

| Original chapter | GP runes | Transport bytes | First 8 bytes, hexadecimal |
| --- | ---: | ---: | --- |
| p0–2 | 729 | 443 | `1759b774a590ef75` |
| p3–7 | 1,145 | 696 | `03ae7c53329e6a19` |
| p8–14 | 1,729 | 1,050 | `568b6382e9e32b9c` |
| p15–22 | 1,903 | 1,156 | `000dea61948244b3` |
| p23–26 | 1,021 | 620 | `1032d4e90101414a` |
| p27–32 | 1,433 | 871 | `01e1f098bfb6f84a` |
| p33–39 | 1,680 | 1,021 | `0224e7f776075c83` |
| p40–53 | 3,008 | 1,827 | `0052876495b72a94` |
| p54–55 | 308 | 188 | `010490bde021d22c` |

All nine complete chapters **miss all six recognizable file signatures**, as do all **55 original rune-bearing physical pages**, a total of **64 original source-delimited objects**. The rare p39 page begins `1fba1fed`, which is not the gzip `1f8b08` magic; no near-miss is interpreted as a candidate.

A positive control compresses an independently chosen 77-byte native-English message using the documented Node `zlib.gzipSync`, places the compressed bytes at the front of a zero-filled 443-byte block, encodes the entire fixed-width block as exactly 729 base29 digits, then recovers the exact original buffer and decompresses it using `zlib.gunzipSync`. It successfully recovers the control plaintext. The plant checks framing, digit ordering and byte capacity; it does not establish an actual Cicada key.

## Reproduction and boundary

- [Source-exact CJS SFT](../sims/lp2_original_chapter_base29_file_sft.cjs), reading immutable local canonical source files `resources/liber-primus/lp2-corpus.json`, with explicit rune counts and original physical cut controls.
- [Manual-only GitHub Actions workflow](../.github/workflows/lp2-original-chapter-base29-file-manual.yml), [passing run **43283511305**](https://github.com/FlareZ123/liber-primus/actions/runs/43283511305), Node 22, 12 November 2026.
- Source motivation: [authenticated 2013 BASE29 message](../resources/external/2013-tcp-server-signed-source.md), [original 2014 Stage08 bzip2 member and signed-message boundary](cicada2014-stage08-bzip2-original-member-audit.md), [original nine-chapter atlas](lp2-global-original-visual-section-map.md).

The signature-prefix test has no force against raw DEFLATE, custom headers, compressed-then-encrypted material, an unknown running key, little-endian bit packing or a file beginning at a source-unmarked offset. No such extra transformation is selected by the original instructions in this test. **Research decision:** do not extend this reading with arbitrary byte offsets and codec variants; seek an actual authored serialization/decipherment selector or externally supplied key. This gate is supporting research evidence and does not alter the authoritative established-results synthesis.
