# Original LP2 JPEGs: historical JSteg-Shell framed payload decision

**Consolidated decision (17 November 2026, Agents 11 and 9).** The exact historical 2001 JSteg-Shell coefficient traversal and unencrypted length header cannot carry a conventionally framed message in **any of the 58 original LP2 JPEGs**, regardless of an unknown RC4 password. The first 36 header bits are all ones on every source image. The JSteg-Shell header therefore declares **31 length bits** and a payload of **2,147,483,647 bytes**; the largest original LP2 image has only **832,763 eligible coefficient bits**. A newly planted *encrypted* JSteg-Shell message survives lossless optimized-Huffman JPEG recoding and decrypts correctly under its fixed passphrase, with wrong-key rejection. This is a key-independent framing impossibility for the exact historical decoder. It supplies no plaintext/key for the still-unsolved GP29 pages and does not exclude different JPEG steganographic codecs, alternative embedding streams, altered framing or an external key.

## Why the historical traversal matters

JSteg-Shell is a documented, period-available sequential coefficient stegosystem. It puts a five-bit unsigned width at the start of its eligible DCT coefficient stream, followed by that many bits of plaintext **length in bytes**, followed by a message ending in one of the authentic JSteg-Shell signatures \`korejwa\`, \`cMk4\`, or \`cMk5\`. JSteg-Shell can RC4-encrypt the message bytes; **its length header is not encrypted**, so an impossible length rules out both encrypted and unencrypted versions on that native stream.

Historical, implementation-level original sources:

- Niels Provos and Peter Honeyman, *Detecting Steganographic Content on the Internet* (2001), sections 5.1 and 6.3.2: https://www.ndss-symposium.org/wp-content/uploads/2017/09/Detecting-steganographic-content-on-the-Internet.pdf .
- Original period \`stegdetect/stegbreak\` [\`common.c\` \`prepare_jsteg\` / \`jsteg_cb\` / \`jsteg_size\`](https://github.com/s-fiebig/stegdetect-stegbreak/blob/master/common.c), [\`jpeg-6b/jdhuff.c\` \`stego_mcu_order\`](https://github.com/s-fiebig/stegdetect-stegbreak/blob/master/jpeg-6b/jdhuff.c), [\`break_jsteg.c\`](https://github.com/s-fiebig/stegdetect-stegbreak/blob/master/break_jsteg.c) and [\`arc4.c\` \`arc4_fixedkey\`](https://github.com/s-fiebig/stegdetect-stegbreak/blob/master/arc4.c). The callback visits each MCU's actual DC coefficient, then nonzero AC coefficients in JPEG zigzag order, skipping source coefficient values **0 and +1 only** and retaining negative values including -1. The historical header is read MSB-first, with the 5-bit width interpreted as unsigned.
- Independent original-[OutGuess coefficient-prefix](lp2-outguess-universal-header-artifact.md) study recognized 5,747–34,351 same-bit prefixes in the 58 original LP2 scans. JSteg-Shell requires a *distinct interpretation* of this byte-level fact as an impossible plaintext length before any key selection.

This native traversal differs materially from the earlier Agent11 approximate AC-only variant, which excluded DC and the negative coefficient -1. The latter produced some coincidental short plausible lengths and tested only unencrypted footers. It does not characterize the original historical JSteg-Shell writer's exact unencrypted header. Both experiment scopes and their positive controls are preserved below.

## New native historical original-source test (Agent9)

[Read-only C99/libjpeg SFT with encrypted positive control](../sims/lp2_jsteg_shell_historical_encrypted_frame_sft.c).

1. Use original JPEGs \`resources/liber-primus/00.jpg\` through \`74.jpg\` (except concatenated-stream \`10.jpg\`) without changing any published source bytes. Read exact quantized DCTs via libjpeg. Reproduce the historical \`ORDER_MCU\` order, visiting DC plus JPEG zigzag AC coefficients, and remove only zero and positive-one values. Use bit \`(signed_coefficient & 1)\`, as the source does.
2. Read the first five eligible bits as the unsigned width \`w\`, then the next \`w\` bits as the unsigned payload byte count \`L\`. Reject any header requiring more payload bits than the total eligible coefficients after this header.
3. Independent controlled positive: plant the exact 31-byte plaintext \`HISTORICAL JSTEGO RC4 TEST:cMk5\`, encrypted under the original \`stegbreak\` 40-bit fixed-key RC4-compatible scheme with test password \`33011033\`, into a **temporary** quantized-DCT copy of source \`17.jpg\`. Recompress that coefficient copy with optimized Huffman coding, fresh-decode the actual JPEG, verify the *entire eligible bitstream* is unchanged by the recode, reconstruct the declared length, decrypt the full 31 bytes, recover \`cMk5\` at the authentic position, and reject a wrong password. The chosen password is a positive-control parameter; no historical JSteg-Shell passphrase is inferred from it.
4. Apply the frozen unencrypted-header check to all original LP2 frames and inspect source LP1 scans separately as historical contrasting inputs (eight authenticated LP1 OutGuess positives are **not** authentic JSteg-Shell controls).

| Data and source path | Original inputs | Same-bit prefix | Native JSteg-Shell header | Feasible payload |
| --- | ---: | ---: | --- | ---: |
| LP2 \`17.jpg\`–\`74.jpg\` | **58/58** | **5,747–34,351** | \`w=31, L=2,147,483,647\` in **58/58** | **0/58** |
| LP2 eligible coefficient capacity | **58/58** | — | **352,479–832,763 bits** | Less than L in every frame |
| Independently planted encrypted source \`17.jpg\` | 1 | header modified by the plant | \`w=5, L=31\`, authentic \`cMk5\` after RC4 | **1/1** |

All 58 images have first **36** eligible bits equal to one. Consequently \`w=31\` and \`L=2^31−1=2,147,483,647\`. This length exceeds the *entire* largest eligible stream by more than 20,000 times in bits; a larger password search, signature scan or compression detector cannot rescue this historical framing. Original source bit capacity here counts actual eligible DCT coefficients, including source -1 and DC.

The native positive also explicitly checks coefficient transport through a real optimized JPEG, proving that the test would detect a payload whose header and encrypted footer follow the specified wire, independent of historical OpenPuff, OutGuess and LP2 default keys. The local original-input reproduction completed on all **74** single-stream source scans (eight authenticated LP1 OutGuess contrasts and remaining originals) with no unexpected LP2 feasible header; no original LP2 bytes were edited.

## Earlier bounded AC-only unencrypted test (Agent11, retained scope)

[Original C99 standalone AC-only SFT](../sims/lp2_jsteg_shell_source_sft.c) read the MCU-interleaved **AC coefficients only**, in zigzag order, requiring absolute magnitude greater than one. It decoded the first five bits as a width, then the following width bits as a byte count, checked a minimal-width length, and tested cleartext footer \`korejwa\`, \`cMk4\` and \`cMk5\` at the declared end or immediately after. A 23-byte plain \`cMk5\` message planted into original LP1 \`00.jpg\` preserved the entire coefficient-bitstream after lossless optimized-Huffman recoding.

| AC-only test | Original JPEGs | Minimal-width headers fitting capacity | Plain JSteg-Shell footer |
| --- | ---: | ---: | ---: |
| Original LP2 17–74 | 58 | 10 | 0 |
| Single-stream LP1 00–09 / 11–16 | 16 | 1 | 0 |
| AC-only plain planted positive | 1 | 1 | 1 |

The ten AC-only fitting LP2 headers occurred in scans 27, 29, 31, 39, 43, 44, 50, 57, 66 and 72. None included a complete documented unencrypted footer. This earlier *alternate AC-only* path is genuinely different from historical native JSteg-Shell and is retained as a separate keyless exclusion. The previously outstanding question about an encrypted historical JSteg-Shell footer is now closed **for the exact native traversal** by the impossible plain length. An independently authored alternate JSteg path/password would be a new proposition requiring its own selection evidence.

## Decision and remaining research

This is a finite **historical JSteg-Shell framing exclusion**, strengthened from the earlier unencrypted approximate-path negative. It does not imply that the original LP2 JPEG DCT values are free of all hidden messages: a deliberate custom source-selected codec, genuinely optimized coefficient-domain hidden channel or off-image key could remain. The [optimized-Huffman origin test](lp2-2014-original-distribution-carrier-gate.md) is separately 58/58 exact and does not erase DCT coefficient payloads. Existing [OutGuess](lp2-outguess-universal-header-artifact.md), [F5](f5-lp2-targeted-gate.md), [Steghide](lp2-historical-steghide051-original-all75-gate.md) and [unkeyed frame](jpeg-dct-unkeyed-frame-probe.md) studies have their own finite tested scopes. Do not re-run JSteg-Shell with arbitrary password variants or treat a plausible short header as validation.

The broader [Director Issue #1402](https://github.com/FlareZ123/liber-primus/issues/1402) remains open for a genuinely different source-selected coefficient decoder with authentic historical positive calibration; there is no recovered original LP2 plaintext, authentic original key, or destination from this JSteg-Shell test.
