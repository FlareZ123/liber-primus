# LP1 physical p05: 360-byte OOB header plus reversed JPEG copy

**Status: established byte structure; the OOB content is known 2014 Onion 3 prior art, not a new key or LP2 decryption.**

## Correct JPEG boundary

The archived `resources/liber-primus/05.jpg` has SHA-256 `2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7`. A marker-aware JPEG parser finds the first valid JPEG EOI end at offset **336,353**. The actual post-EOI trailer is **336,713 bytes**:

- 360-byte header: two LF bytes followed by 358 ASCII hex characters;
- 179 decoded OOB bytes;
- 336,353-byte exact reversal of the complete first JPEG.

Thus `raw[336713:]` is not the right slicing expression; the precise identity is `raw[336353+360:] == reverse(raw[:336353])`.

## Important correction to the earlier rfind-based account

The raw byte pair `FF D9` at offset 600,364 is **not** the first JPEG's EOI. It occurs inside the appended reversed copy. The 72,700 bytes after that later marker-like pair do equal the reversal of the first 72,700 source bytes, but this is only a substructure of the full reverse copy. The old rfind-based report treated that internal byte pair as the JPEG boundary and consequently described an incomplete trailer.

A separate marker-aware inspection also found that `resources/liber-primus/10.jpg` contains four concatenated valid JPEGs; see [`lp1-10-multi-jpeg-container.md`](lp1-10-multi-jpeg-container.md). Whole-corpus inventories must parse JPEG marker streams rather than use `rfind(FF D9)`.

## Prior-art correction

The 179-byte header is the already documented Onion 3 out-of-bounds payload in the 2014 OpenPuff walkthrough. That source prints the same hex sequence, reverses it to recover the 5×5 magic square of sum 1033, and confirms the image's lower half encodes the same matrix. The word `MOBIUS` is one cell of that square; the 18-cell triplet rotation and short `0x02` separator do not establish a new Möbius cipher or p55 key.

Source: [OpenPuff for experts — Cicada 3301 recruitment puzzle 2014](https://embeddedsw.net/doc/Openpuff_for_experts_Cicada_3301_recruitment_puzzle_2014.pdf).

## Cryptanalytic status

The earlier 72,700-byte direct additive screen tested only the suffix after the internal raw `FF D9` pair. Its negative result does not test the complete 336,713-byte trailer and must not be presented as such. More importantly, the 179-byte OOB payload is already explained by the historical magic-square stage, while the reversed JPEG is duplicated source material, not independent high-entropy key material. No LP2 plaintext or key was recovered here.

## Reproduction

Run `python sims/lp1_05_reversed_jpeg_trailer_sft.py`. The marker-aware script verifies the first EOI, exact 360-byte header, 179-byte OOB payload, full reversed-copy identity, and the later internal marker-like pair.
