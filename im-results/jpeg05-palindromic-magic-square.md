# LP1 scan 05: hidden binary-reversed 5×5 magic square

**Classification: reproducible original-artifact structure; solved LP1 clue, no LP2 decryption.** The community-original JPEG file `resources/liber-primus/05.jpg`, SHA-256 `2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7`, has an unusual exact byte layout whose center includes a 5×5 numerical square *absent in numerical form from the visible image* (most visible cells are rune words).

Its exact file layout is:

| Byte offsets (0-based inclusive) | Length | Content |
|---|---:|---|
| 0–336352 | 336,353 | Complete decodable 2400×3600 JPEG; first JPEG EOI `FF D9` starts at 336351 |
| 336353–336712 | 360 | `0A 0A` followed by **358 ASCII hex characters** |
| 336713–673065 | 336,353 | **Byte-for-byte reversal** of the first 336,353 bytes |

The center payload is decoded by taking its 358 ASCII hex characters in *reverse character order*, converting each pair of hex characters into a byte, then reading the result as ASCII. The result is 179 characters representing the complete 25 numerical cells of the LP1 magic square:

```text
272     138     341     131     151
366     199     130     320     18
226     245     91      245     226
18      320     130     199     366
151     131     341     138     272
```

Every row, every column, and both diagonals sum to **1033**. The JPEG's original visible page displays the same square, partly in rune words whose Gematria Prime sums fill these 25 numerical cells. This internal reversible representation independently records those values and provides a concrete example of byte reversal plus hex encoding embedded in a manuscript artifact. That combination might be an intentional method cue, but no link from it to an LP2 key is currently demonstrated.

**Caution on JPEG end markers:** using the *last* occurrence of `FF D9` in the raw file produces a misleading 600,366-byte supposed JPEG with 72,700 trailing mirrored bytes. That later marker is inside the appended reversed JPEG's bytes. The first actual complete JPEG ends at **336353**, and the **360-byte middle** disappears from view if the last-marker heuristic is used. The previously reported final 72,700 bytes do indeed reverse the first 72,700 bytes, but the longer full binary envelope gives the correct accounting.

**Reproducer:** [`sims/jpeg05_palindromic_magic.cjs`](../sims/jpeg05_palindromic_magic.cjs), a dependency-free CommonJS checker. It asserts the original source SHA-256, JPEG boundary, reversed-image symmetry, center decoding, exact numerical square and all 12 magic sums. The same file was verified locally against the original owner-provided 75-JPEG ZIP. The source image has been verified byte-for-byte against the GitHub copy in `resources/liber-primus/README.md`.

**Implication for further cryptanalysis:** LP1's overt magic square includes a mirrored hexadecimal encoding in the JPEG file itself. If checking related LP1/LP2 image-derived keys or reversal conventions, this file is a grounded construction to generalize. Do not assume its 25-cell text is unknown plaintext or that repeating its operations on LP2 ciphertext will work without independent constraints.
