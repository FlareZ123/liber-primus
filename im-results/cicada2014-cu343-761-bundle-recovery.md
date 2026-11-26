# #2945 — recovered cu343 761 payload contains exactly the first three LP1 pages

**Decision (Agent34, 26 November 2026): resolved duplicate bundle.** The exact 3,641,310-byte historical HTML object, including its 761 comment and trailing newline, is recovered and preserved locally. All three embedded images match the already indexed original LP1 JPEGs exactly. There is no fourth image, trailing payload, new unknown page or new key operand.

## Recovered source

- Contemporaneous participant archive: [micheloosterhof/cicada-2014, commit 6139eb7c99f49b1bcc66822878d721a411ce7100 (2014-06-02, move to subdir)](https://github.com/micheloosterhof/cicada-2014/blob/6139eb7c99f49b1bcc66822878d721a411ce7100/stage03/cu343l33nqaekrnw.onion/index.html.2).
- [scream314 mirror of the same exact Git blob](https://github.com/scream314/cicada3301/blob/master/assets/2014/stage03/cu343l33nqaekrnw.onion/index.html.2), Git object `dca24d10a0d6b1cc1b44451624454d64353f254e`. The ordinary connector file endpoint rejected this large object, but its Git blob endpoint returned all 3,641,310 ASCII bytes. Both source trees identify the same size and blob.
- Preserved exact bytes: [cicada2014-cu343-761.html](../resources/historical/cicada2014-cu343-761.html), same blob SHA.
- Raw SHA-256 `0b642c3e25a9d19626e1f218797b96012b1f3865bf644980e690d8b1df0b4a81`.
- The specific reported Internet Archive `cu343l33nqaekrnw.onion/761.hex` item and its metadata were inaccessible through the available web fetch. Consequently this result does **not** claim the IA reupload's exact filename, bytes or capture timestamp were independently verified. The contemporary Git copy is the recovered source; its commit date is preservation evidence, not the original HTTP capture time.

## Complete byte reconstruction

The raw ASCII frame is precisely the 761 HTML comment, newline, 3,641,298 lowercase hex characters and newline. Decode hex and invert every byte with XOR FF. The final segment is stored backwards. These are the documented historical boundaries, not a magic-header scan.

| Binary interval [start,end) | Length | Operation | Exact original corpus match | SHA-256 |
|---|---:|---|---|---|
| 0–168876 | 168876 | Bit inversion | LP1 00.jpg | 184e6f9de8695d99435c2bef4fd7e304a8a0f704dbe04439fa8bf13c4da395a7 |
| 168876–1645490 | 1476614 | Bit inversion | LP1 01.jpg | 71f4bd03c692ede630091272597d2b18702184ed32fdd1977ef0ba7306632b46 |
| 1645490–1820649 | 175159 | Bit inversion, reverse bytes | LP1 02.jpg | 0297572bbc2d234f84df634c6f0474011ff5df66c2ce987c3bb7aa0c635799b4 |

Each exact matching corpus JPEG was fully loaded through Pillow, 2400×3600, not merely tested for SOI/EOI. The independently reconstructed raw HTML from the three supplied original files yields **the identical Git blob SHA and SHA-256** as the directly fetched contemporary source. Every payload byte is covered and the framing is reproduced, so a perceptual-only comparison or further image extraction cannot discover an additional image in this object.

Packed binary SHA-256: `544eb83525d1d5a3a30f4b5b3df37769a1b876628dfc85a05aa05241409973cd`. Inverted binary before third-image reversal: `4840a5150642dde39bd45b835b1d0b66ecb716489b02d77077280d6bb90fe971`.

The [historical 2014 route](https://github.com/scream314/cicada3301/blob/master/2014.md) assigns the three images to the stage after the growing-string clue. Their previously documented OutGuess/XOR and transposition route leads to the next onion, fv7lyucmeozzd5j4. The container is **already consumed historical transport**, not an unexplained new encrypted LP2 object. The earlier 256-byte 761/1033/3301 blobs are different artifacts. No new stego/derivative key sweep performed.

## Reproduce

`python sims/cicada2014_cu343_761_bundle_sft.py` from the repo root (Pillow required). The direct remote bytes were decoded and SHA-256-hashed in connected V8; Python independently decoded the supplied identical originals and reconstructed the exact 3,641,310-byte source. The SFT provides complete byte equality, full image decode, all 75 corpus comparisons and exact forward reconstruction against the newly preserved file.
