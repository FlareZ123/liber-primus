# LP1 p05 embedded reversed-JPEG payload: the 5×5/1033 square

**Status:** verified, reproducible artifact-level extraction. This establishes a direct link between LP1 p05 and the 2014 Stage10 5×5 square with magic constant 1033. It does **not** decrypt any LP2 page or identify an LP2 receiver.

## Exact extraction

Source: `resources/liber-primus/05.jpg` (673,066 bytes).

1. The first JPEG ends at the first `FF D9` marker, offset **336,351** (zero-based); its complete byte length is **336,353**.
2. The remaining **336,713** bytes, when reversed byte-for-byte, begin with a valid JFIF JPEG.
3. That reversed JPEG's first 336,353 bytes are **byte-identical** to the original visible JPEG. Its own EOI is at offset 336,351.
4. Exactly **360 bytes** remain after that second EOI. They are ASCII hexadecimal: 358 hex digits plus two newline characters.
5. Decoding those hex digits yields 179 bytes of ASCII text: the full 5×5 matrix below.

```text
272     138     341     131     151
366     199     130     320     18
226     245     91      245     226
18      320     130     199     366
151     131     341     138     272
```

Every row sums to 1033; every column sums to 1033; both principal diagonals sum to 1033.

| Object | SHA-256 |
|---|---|
| First visible JPEG (336,353 bytes) | `c517d5d87544a761188cd50c46473898ab9d2c0da108cf13c61234dc1bda635a` |
| 360-byte ASCII-hex trailer | `23ab96b15aa07920d3ccc7ec7eaf793ec248b774ad84f26f2482df93eed3c4cb` |
| Decoded 179-byte matrix text | `3a7fdce4cb5fee1eef4a170cbf5c0ff426bbc494b62d766cc3a7d34d854c4422` |

The byte-level equality of the two JPEG prefixes, the exact 360-byte trailer boundary, the successful hex decode, and the six independent 1033 sums make the extraction reproducible and highly discriminating.

## Additional LP1 image-container observation

LP1 `10.jpg` (4,240,957 bytes) is a concatenation of four JPEG segments separated by their first EOI markers:

| Segment | Length | Decoded page |
|---|---:|---|
| 1 | 754,662 | p10 |
| 2 | 712,733 | p11 (byte-identical to standalone `11.jpg`) |
| 3 | 703,428 | p12 (pixel-identical to standalone `12.jpg`, byte-different) |
| 4 | 2,070,134 | p13 (pixel-identical to standalone `13.jpg`) |

The chain stops after p13. This is a file-layout observation; the embedded pages are already present separately in the 75-image corpus. Do not interpret the concatenation as additional plaintext.

## Cryptanalytic significance and limits

- The 5×5/1033 square is not merely an external Stage10 transcription or a square inferred from a later community copy: its full numeric matrix is recoverable from bytes embedded in original LP1 p05.
- This materially strengthens the source selection of the **matrix itself** and establishes that the unusual reverse-JPEG/hex representation occurs in the original artifact.
- It does **not** select how to consume the matrix against LP2. Existing direct matrix, Hill, page-power, and spatial consumers remain negative; this finding does not justify rerunning them with tuned orientations, offsets, or resets.
- The intended meaning of the reverse-JPEG construction and the 360-byte hex trailer remains unresolved. The most useful next step is to inspect the visible p05 red/rune annotations for an operation that explains why the matrix is embedded this way, then test only that frozen operation against independent LP2 material.

## Reproduction

From the repository root:

```bash
python sims/extract_lp1_p05_embedded_matrix.py
```

The script audits first-EOI trailing data across the 75 source JPEGs, reconstructs the reversed p05 JPEG, extracts and decodes the trailer, and verifies the 5×5 magic sums.
