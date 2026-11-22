# LP1 p05 trailer: reproduction of the known Onion 3 OOB payload

**Status: prior-art reproduction, not a new cipher or key discovery.**

## What the repository image contains

`resources/liber-primus/05.jpg` is 673,066 bytes. Its first JPEG ends at offset 336,353 (exclusive). The remaining 336,713 bytes are exactly a 360-byte header followed by the byte-reversal of the first JPEG.

The header is two LF bytes followed by 358 ASCII hexadecimal characters, decoding to 179 bytes. Those bytes parse into five rows of five 3-byte cells, with `0xA0` row markers and `0x02` separators. The row marker offsets are `[0, 36, 72, 108, 143]`; one separator is four bytes rather than five.

The resulting triplets are:

```
237323  833313  134333  133313  135313
636333  939313  033313  032333  028313
632323  534323  021393  534323  632323
831302  032333  033313  939313  636333
135313  133313  134333  833313  237323
```

Fingerprints:

- File SHA-256: `2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7`
- Trailer SHA-256: `3814d8b9ca2e369477b47cbbead0bbe36779383f6f987d2ef247b3e5da2ed349`
- Decoded 179-byte header SHA-256: `82c135148b6cf85e9b550afdbc6204be075ff67717356a8ae18b76f9cc3af5fa`

## Prior-art correction

The 2014 OpenPuff walkthrough already documents this exact Onion 3 OOB payload. It prints the same hex sequence, converts it to binary, reverses it, and recovers the 5×5 magic square with magic sum 1033. It separately confirms that the lower half of the image encodes the same matrix. Source: [OpenPuff for experts — Cicada 3301 recruitment puzzle 2014](https://embeddedsw.net/doc/Openpuff_for_experts_Cicada_3301_recruitment_puzzle_2014.pdf), especially the Onion 3 OOB section.

The visible word `MOBIUS` is part of that magic square. The two 18 cells yield `028313` and `831302`, a one-position channel rotation; the sole short `0x02` separator follows the latter. These are properties of the already documented OOB encoding. They do **not** establish a new Möbius cipher, a new key, or a relationship to LP2 page 55.

The earlier hypothesis that this matrix might be a p55 key is withdrawn. The 75-rune p55 length alignment motivated direct tests, but raw/φ-per-byte stream operations, base-(29^3) block arithmetic, and several Hill mappings did not produce plaintext. Given the established Onion 3 role of this payload, those p55 transfers should be retired rather than expanded into more generic variants.

## Reproduction

From the repository root:

```sh
node sims/lp1_p05_trailer_matrix_sft.cjs
```

The script verifies the JPEG boundary, exact reversed-copy equality, hex header, unique 5×5 parse, square-value correspondence, and the bounded direct p55 stream-key tests. This is useful as an artifact parser, not as a decipherment.
