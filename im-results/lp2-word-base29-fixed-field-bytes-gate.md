# Per-printed-word GP29 integer → fixed-width bytes: original-chapter gate

**Decision (14 November 2026; Agent18, Issue #885): reject this exact lossless per-word field codec.** Two complete, independently selected original visual chapters produce neither a recognized file format nor coherent text. The codec and format recognizer pass both the native-rune and synthetic-format positive controls; the corrected SplitMix64 null gives zero recognitions in 100,000 trials for each chapter.

## Source premise and scope

The signed 2013 TCP-server challenge authenticates a BASE29 integer command, including the public vectors **3301 → 3QO** and **1033 → 16I**. The GP29 rune order supplies 29 candidate digits 0–28. This makes ordinary base29 positional conversion a plausible experiment, but the signed source does **not** prescribe converting each printed word to a byte field, the word boundaries as field boundaries, or a byte serialization. Those are the exact hypothesis tested here, not established Cicada instructions.

This is distinct from:
- whole-page or whole-chapter integer-to-file packing;
- the earlier lossy per-word value-modulo-256 readout;
- arithmetic/Huffman compression models;
- mapping word integers to p32 addresses.

## Frozen lossless codec

For a printed word of (n) GP29 digits (d_0,ldots,d_{n-1}), compute its ordinary big-endian positional integer

[
N=\sum_{i=0}^{n-1}d_i29^{n-1-i}.
]

Choose exactly one field width,

[
b(n)=\min\{b\ge1:256^b\ge29^n\},
]

and serialize (N) as exactly (b(n)) big-endian bytes. Concatenate the fields in original printed order. The source word length is the field framing; it is retained externally and is sufficient to expand each byte field back to exactly (n) base29 digits, including leading zero digits. This is an injective, uniquely decodable encoding onto the valid field subset (N<29^n), not onto every possible (b(n))-byte string. There is no overflow, leading-zero loss, prefix, separator insertion, alternative endian, radix, phase, offset or fitted key.

The source parser preserves words across line/page wraps and assigns each cross-page word to its original start page. The two selected chapters have no word crossing their chapter boundary.

## Frozen targets and format test

The original-image atlas identifies p0–2 as the first complete visual chapter and p3–7 as the independently untouched second chapter. The byte stream is inspected only from **offset 0**.

The predeclared recognizer accepts only:
- byte-0 signatures for GZIP, ZIP, PDF, PNG, JPEG, BZIP2, XZ, 7z, RAR, ELF, SQLite, RIFF/WAVE, ID3, OggS, PGP armor, HTML or XML;
- a complete valid JSON parse; or
- fatal UTF-8 decoding with at least **95% ASCII printable/standard whitespace bytes**, no NUL, and at least 64 bytes.

No arbitrary offsets or post-hoc magic list are used.

## Original results

| Original visual chapter | Printed words | Runes | Output bytes | Format/text result |
|---|---:|---:|---:|---|
| p0–2 | 158 | 729 | **525** | No signature, JSON or qualifying text |
| p3–7 (holdout) | 255 | 1,145 | **821** | No signature, JSON or qualifying text |

Both streams are invalid UTF-8 and contain NUL bytes. Their ASCII-printable/standard-whitespace fractions are **34.48%** (p0–2) and **37.88%** (p3–7), far below the fixed 95% threshold.

First 32 bytes, for independent inspection:

- p0–2: `3d 70 5e 0c 78 00 ab cc c9 00 e3 74 01 55 0a e2 0e 64 a3 8e 08 e7 70 00 6a 83 f0 03 33 21 2c ab`
- p3–7: `02 4f 12 62 c2 76 36 7f 42 34 c3 05 c0 3a 03 a5 d5 8f ab 00 f9 4a 29 f6 01 d9 0a 32 0b 0a 6b 5c`

## Positive controls

1. The 2013 BASE29 integer vectors reproduce exactly: **3301 → 3QO** and **1033 → 16I**.
2. All **20** original clear p57 printed words encode and decode to their exact GP29 rune sequences, including leading zero digits.
3. A synthetic six-rune GP29 field representing integer `0x1f8b0800` serializes to the exact four bytes **1f 8b 08 00**, and the frozen recognizer identifies GZIP. This validates the format detector independently of LP2.

## False-positive estimate

For each chapter, 100,000 distinct deterministic SplitMix64 trials generate independent uniform GP29 digits while preserving the exact original word-length sequence. An unbiased 10-bit-chunk rejection mapping accepts values 0–840 and maps each accepted value to a uniform pair of base29 digits. Every trial passes through the identical fixed-width codec and unchanged recognizer.

| Chapter | Trials | Recognized null hits | Empirical rate | One-sided 95% upper bound (zero hits) |
|---|---:|---:|---:|---:|
| p0–2 | 100,000 | **0** | 0 | **2.996 × 10⁻⁵** |
| p3–7 | 100,000 | **0** | 0 | **2.996 × 10⁻⁵** |

Seeds: `0x3301c1ca` for p0–2 and `0x2016c1ca` for p3–7. The null is reproducible and uses the exact source word-length sequence, not a generic random-byte approximation.

## Interpretation

- **Rejected:** the fixed-width, minimum-size, big-endian byte serialization of each original printed word's GP29 positional integer, concatenated in source order, as a direct file/text transport for these original chapters.
- **Not rejected:** another field width or transport selected by an original source, a different word segmentation, a non-file cipher, a key/keystream, a different plaintext language, or a separate word-address/navigation mechanism. Do not enumerate alternative endiannesses, widths, offsets or magic lists without a new first-party selector.
- The 2013 signed source authenticates BASE29 integer conversion, **not** this byte-field extension.
- No unknown LP2 plaintext, key, file payload or destination is recovered.

## Reproduction

From the repository root with Node.js 22:

```sh
node sims/lp2_word_base29_fixed_field_bytes_gate.cjs
```

The script uses the shared original-word parser and canonical GP29 corpus, asserts source counts and chapter boundaries, runs both positive controls, applies the fixed format recognizer, and performs the two 100,000-trial SplitMix64 nulls without dependencies or file writes.

Sources: [signed 2013 BASE29 protocol](../resources/external/2013-tcp-server-signed-source.md), [original visual chapter atlas](lp2-global-original-visual-section-map.md), [prior word-integer/address gate](lp2-base29-original-word-address-gate.md), and [prior whole-chapter file gate](lp2-original-chapter-base29-direct-file-gate.md).
