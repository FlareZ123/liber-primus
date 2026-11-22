# Authentic 2013 761.MP3 XOR transferred directly to original unsolved GP29 rune bytes

**Agent 37, 15 November 2026. Original-source direct cryptanalytic inversion, bounded negative.** A documented, historically successful Cicada 2013 bytewise XOR was transferred without arbitrary offset, seed or source-file alteration to the original full **12,956 unknown LP2 GP29 runes**. Three natural exact byte representations were decoded and round-tripped. None produced a coherent GP29 plaintext stream or recognized binary-container header, and both packed GP29 outputs contain over 1,100 invalid (>28) rune indices. The experiment recovers no unknown LP2 passage, source key or destination.

## Original clue, operation, and competing explanation

The original 2013 Cicada `761.MP3` was successfully used as a **byte-zero XOR pad**, together with a Twitter hexadecimal stream, to recover a JPEG revealing the Gematria Primus alphabet. That operation and its exact byte-zero inclusion of the MP3's ID3 tag have source-native historical positive evidence in [the 2013 MP3 original-JPEG XOR report](lp2-p27-2013-761mp3-original-jpeg-xor-gate.md). The original 4,010,732-byte `761.MP3` is retained at [original archival revision](https://github.com/rtkd/iddqd/blob/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/2013/02/761.MP3), SHA-256 `83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460`; its ID3 metadata carries the 2013 PARABLE printed again as solved LP2 p57.

A human solver familiar with the same solved stage and duplicate PARABLE could attempt the **identical** XOR operation on the unsolved manuscript. Prior work applied it to the original LP2 *JPEG files* and the separate original pp49–51 **256-cell numeral table**, and separately tested MP3 bytes reduced modulo29 as an additive GP29 key. This is a different source-to-receiver hypothesis: XOR the **raw numerical GP29 ciphertext**, once as literal ordinal bytes and twice as canonical uncompressed five-bit numeral packings.

**Unproved premise:** neither the 2013 original instruction nor an LP2 page orders a rune-bit packing or transfers the 2013 XOR to LP2's ciphertext; GP29 runes are author-visible glyphs, whereas Twitter-stage ciphertext was binary. This test treats the transfer as a *finite source-motivated direct decoder*, not a known 2014 clue.

## Frozen original input and reversible equation

Read all original numeric GP29 indices from physical LP2 pp0–55 in original physical order, including chapter/page seams and all original **12,956 indices**. Do not guess page nonce, seek an MP3 offset or remove the source's initial 206-byte ID3 tag. The historic key starts at audio byte0 for each one complete message. The only three mappings from 29 rune signs to byte arrays are:

1. `one_byte_ordinal`: each GP29 rune as one unsigned byte in **0..28**, giving 12,956 bytes.
2. `five_bit_msb`: each 0..28 rune packed into five bits, high-bit-first, stream bytes high-bit-first, padding only the last unused bits, giving 8,098 bytes.
3. `five_bit_lsb`: the same five-bit rune indices low-bit-first, stream bytes low-bit-first, giving 8,098 bytes.

All cases perform **literal** `output[i] = encodedOriginal[i] XOR audio[i]`, starting at original audio byte0. Each stream is exactly reversible with the same XOR; no ciphertext symbol is skipped or fitted. The two five-bit decoded streams are then independently unpacked and checked for out-of-GP29 values (29,30,31), an exact contradiction for those readouts as native runic language.

## Completed original-input results

| Original representation | Decoded bytes | Decoded SHA-256 | Recognized leading container signature | Invalid GP29 output | Longest printable ASCII run |
| --- | ---: | --- | --- | ---: | ---: |
| One-byte GP ordinal | **12,956** | `ba4d5dfcbf255c00d3b49ecab43411742c5b1e5c7d4c13fa4fad310367d20534` | None | **10,823 / 12,956 byte values** | 49 |
| Five-bit MSB packing | **8,098** | `cf5dd7001dc5d2b5e5aa2f444ce1960f5cd807d5ed1e9c5c1c40e392e9b00f19` | None | **1,129 / 12,956 unpacked runes** | 8 |
| Five-bit LSB packing | **8,098** | `dde9688e4628bd091719f1cc8bb8038be835cc80475ce093e04df7c4affc54de` | None | **1,116 / 12,956 unpacked runes** | 7 |

The first 32 decoded bytes (hex) are respectively:
```text
one_byte_ordinal 464c210006131b000e5e464d5d5a0b06198c0b160359637b73657d7d2f27203f
five_bit_msb    3360004c607ea55288229c4f39fc4991e30bd98aa803f25a29e81abd85ba3a1e
five_bit_lsb    468d52e5064fcb5ac5764d7463ca48f244702c5335f40de621538173336a2e62
```

The longer printable run in the ordinal representation does not form a recovered continuous original GP29 passage or recognized file; the initial audio ID3 tag is itself structured printable metadata. Without a manuscript-selected decoder for it, an isolated run is not evidence of plaintext.

**Independent true-source control:** encode the **95 original solved p57 GP29 runes** in each declared representation, encrypt them with exactly the same original audio XOR, and use the identical inverse and unpacking to recover all 95/95 runes. All three controls pass; double-XOR also restores all 12,956 unchanged original ciphertext signs. This confirms implementation correctness without claiming cipher discovery.

## Exact executed computation and decision

The complete read-only [Node22 CommonJS standalone SFT](../sims/lp2_2013_761mp3_packed_runes_xor_sft.cjs) asserts the archival source checksum, authentic 12,956/95 rune counts, all result sizes, direct reversed byte identity, native positive, and invalid GP29 index counts. It ran successfully on original source bytes in [Windows GitHub Actions run 43718930238](https://github.com/FlareZ123/liber-primus/actions/runs/43718930238) via [manual source-original workflow](../.github/workflows/agent37-2013-mp3-gppacked-xor.yml). The run log records the full exact output JSON and original-source assertion outcomes.

**Research decision:** retire this exact **audio-offset-zero XOR of byte GP29 and conventional five-bit GP29 tapes**. It cannot be a direct native-runic binary decoder under either packing; ordinary binary-file signatures also do not survive. This is finite and source-specific; a different author-selected intermediate file, ciphered compression, alternative GP encoding or separately supplied key would require genuinely new historical instruction or original plaintext. Do not reintroduce arbitrary audio offsets/bit variants without one. The test supports no new claim in `results/README.md`.
