# Universal OutGuess header artifact across all original LP2 JPEGs

**Agent 27's original-byte universal-header result and Agent 47's six-original-image XOR-depth test, 13 November 2026.** Every original LP2 image (scan `17.jpg` through `74.jpg`, all 58 physical pages) yields exactly the same **encrypted four-byte OutGuess 0.4 header `ff ff ff ff`, under every possible password**, when using the established quantized-DCT JPEG reader and standard OutGuess iterator. Consequently, a successful seed/length decode on any of these original LP2 images is *not independent evidence* of embedded data. This explains the previously observed family of 58,152-byte, seed-41408 pseudo-payloads and extends the explanation to **all passwords and all 58 images**. It does not establish that any original image is free of hidden material, and it recovers **no unsolved plaintext, cipher or Cicada continuation**.

## Source input and authentic extraction control

The repository's `resources/liber-primus/17.jpg` through `74.jpg` contain the 58 original LP2 images, including the rune-free numeric page and two solved terminal pages. The existing calibrated reader uses `sims/outguess_bitmap_dump.c` with libjpeg to extract eligible quantized-DCT coefficient LSBs in the historically appropriate MCU and coefficient order, and `sims/outguess_extract.py` to perform the exact OutGuess 0.4 ARC4 iterator and decryption. The read-only [all-58 original-source reproducer](../sims/lp2_outguess_universal_header_sft.py) executes the established libjpeg coefficient reader and OutGuess ARC4 implementation on every LP2 image. This discovery is now integrated in the shared [OutGuess extractor](../sims/outguess_extract.py) as the source-forced-header classifier `header_is_source_forced(bitmap, bit_count)` and its `encrypted_header_hex`/`header_is_source_forced` output metadata. The [second successful manual CI run 43492473076](https://github.com/FlareZ123/liber-primus/actions/runs/43492473076) checks the new helper against all 58 original images and the 2014 authentic positive control, with Python 3.11/libjpeg.

The control **original LP1 `03.jpg`** was historically known to contain a real default-key OutGuess message. The same bitmap and extractor recover **exactly the archived 31,809-byte ASCII-armored PGP clear-signed text**, byte for byte. Its bitmap starts with only **nine consecutive one bits**, demonstrating that real embedded headers need not be trapped in the common LP2 pattern. This independently calibrates the relevant scanning and cryptographic extraction code against an authentic historical positive. The preserved PGP signature is verified elsewhere in the repository; the new test checks exact recovered bytes, not a new signature.

## Mechanism: why the header does not depend on the image

For an OutGuess password `k`, its initial `Seeding` ARC4 iterator picks an eligible coefficient bit offset in `[0,31]`. It then reads **exactly 32 bits**, advancing **1 through 32 bits** after each read. The final *sampled* bit therefore has zero-based index at most **31 + 31×32 = 1023**, independent of `k` and the image. This upper bound uses the actual original iterator rules, rather than a statistical assumption.

An exhaustive inspection of the original 58 images gives the following exact leading run of eligible-bit ones:

| All original LP2 source images | Initial consecutive one bits |
| --- | ---: |
| Minimum (across all 58) | **5,747** |
| Median | **25,275** |
| Maximum | **34,351** |
| Physical p32 tree scan `49.jpg` | **25,349** |
| Physical p55 tree scan `72.jpg` | **25,350** |
| LP1 historical real-message control `03.jpg` | **9** |

Every original LP2 image therefore has more than enough consecutive one bits to force **each selected header bit to 1**, regardless of password. All 58 bitmaps produce encrypted header **`ffffffff`** for every key; it is **mathematically impossible for a different ordinary OutGuess 0.4 header to be extracted from these image bytes**, unless the extraction method or eligible-bit sequence changes.

OutGuess decrypts this 4-byte header by XOR with its separate `Encryption` ARC4 stream for password `k`. Hence the apparent header for *any* image is exactly

`H(k) = ffffffff XOR first_four_arc4_encryption_bytes(k)`.

The decoded first two bytes are the little-endian pseudo-`seed`; the next two are pseudo-`length`. Both values depend **only on the password**, never on which LP2 source scan was selected. Repeating the literal algorithm on the original images yields:

| OutGuess password | Decoded header | Apparent seed | Apparent length |
| --- | --- | ---: | ---: |
| `Default key` | `c0a128e3` | **41,408** | **58,152** |
| `HOME` | `201b2d2d` | **6,944** | **11,565** |
| `X` | `9989557b` | **35,225** | **31,573** |

The standalone SFT tests all three passwords' exact 32 bit-selection paths on **every one of the 58 images**, while the 1,024-bit upper bound proves the result simultaneously for every other key without enumerating passwords.

## Relation to existing searches

The [Stage04 all-image default-key census](cicada2014-stage04-256-p50-direct-identity-gate.md) previously documented **16/58** completed 58,152-byte extractions among LP2 images, all with identical decoded headers, a shared payload prefix and suffix, and no coherent content. The other 42 images failed later length or adaptive skip checks. **The prior uniform-header observation is now explained causally:** the source pixels force the common encrypted header. The observed 16/58 completion rate cannot be interpreted as 16 embedded-message detections. The same reasoning applies to previously reported `9133` key probes with identical per-image header metadata.

The separately preserved historical LP1 `04.jpg` 7,524-byte OutGuess output remains unclassified. The present proof targets *LP2 scans 17–74*, and does not assert that the LP1 `04.jpg` payload is intentional or spurious. It also does not exclude payloads deliberately embedded with exactly the `ffffffff` header on LP2 images, a different steganographic codec, or other channels in original JPEGs. A positive LP2 steganographic claim must provide **independently recognizable recovered payload bytes** or an independently authenticated output, rather than treating a successfully decoded 16-bit seed/length as validation.

## Six-carrier original-body XOR test: source cover versus putative reused pad (Agent 47, 13 November 2026)

A [separate public research backlog](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/TODO.md#aa-the-three-outguess-payloads-are-aligned-byte-for-byte) proposes XORing three apparently related OutGuess payloads, 58,152 bytes each, from original scans **17, 21, 43** (LP2 physical p0, p4, p26), as a possible *three-message reused-keystream depth*. The three original binary objects are archived at [page_17.bin](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/data/outguess/page_17.bin), [page_21.bin](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/data/outguess/page_21.bin), and [page_43.bin](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/data/outguess/page_43.bin).

**Byte-identity result:** Independently run the repository's original libjpeg/OutGuess-0.4 extractor on the three original JPEGs under the historical literal password `Default key`. The resulting Git blob SHA-1 values are respectively `dcd47827eb02f3d5c7cbfc6259868621bc1ee7b6`, `58ba0c966954f2a02964995613a6ba93fca57425` and `e4c94e1d285aff041276bf5c7bb1c265e987d93d`. **All three exactly match the independently published 58,152-byte objects**. No ad hoc byte transformation or manual transcription is involved.

For two extracted byte strings `A,B`, compute literal `A XOR B`. Strip *only* the largest byte-identical prefix and suffix for reporting, preserving the original 58,152-byte objects. In every pair's remaining middle, all **256 byte values** occur. The number of XOR bytes with high bit 1 is between 48.3% and 48.6% of the middle. Thus these particular byte differences cannot be the XOR of two unmodified **7-bit ASCII** messages, nor of two 0–28 GP-index byte streams, under any single reused pad: the XOR of two seven-bit inputs always has high bit zero.

| Original source scans | Matching prefix (bytes) | Matching suffix (bytes) | XOR middle (bytes) | Zero bytes inside middle | High-bit-set bytes inside middle | Middle entropy (bits/byte) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| **17 ↔ 21** | 1,417 | 1,953 | 54,782 | 737 | 26,589 | 7.983124 |
| **17 ↔ 43** | 1,417 | 1,953 | 54,782 | 1,060 | 26,463 | 7.971032 |
| **21 ↔ 43** | 2,004 | 2,228 | 53,920 | 738 | 26,222 | 7.983430 |
| **17 ↔ 57** (independent visual-chapter carrier) | 1,417 | 1,953 | 54,782 | 752 | 26,620 | 7.983854 |
| **57 ↔ 61** (p40 ↔ p44 framed carriers) | 1,521 | 2,315 | 54,316 | 443 | 26,601 | 7.992581 |
| **57 ↔ 65** (p40 ↔ p48 framed carriers) | 1,521 | 2,310 | 54,321 | 442 | 26,548 | 7.992084 |
| **61 ↔ 65** (p44 ↔ p48 framed carriers) | 1,554 | 2,310 | 54,288 | 396 | 26,733 | 7.993293 |

The deliberately *independent* source controls are original scans **57, 61 and 65**, selected from the chapter's 16 known common-frame images, without hypothesizing another secret message. Each reproduces the exact same false OutGuess header `ffffffff`, pseudo-seed **41,408**, and pseudo-length **58,152**. The original scan17-to-scan57 comparison preserves **the exact 1,417-byte beginning and 1,953-byte ending** previously taken to suggest a reused cryptographic pad. The unrelated controls demonstrate that these shared stretches arise naturally in source-cover extraction. They are **insufficient evidence for a three-message keystream reuse**.

The bitwise XOR of **all three** published pseudo-payloads has all 256 byte values and empirical byte entropy **7.996726 bits/byte**, with no recovered plaintext or recognizable continuation. A separate positive plant encrypts two real 128-byte ASCII messages under one shared synthetic pad; the same XOR operation recovers the second **128/128** bytes from the known first and yields no high-bit-set XOR values. This proves the proposed attack would recover an ordinary reused-pad text depth when one actually existed.

**Decision:** Retire the specific claim that these three default-key OutGuess pseudo-payloads constitute an exploitable *shared-pad ASCII/GP-text depth*. A jointly encrypted/compressed binary stream, a keyed non-OutGuess channel or deliberately embedded data with exactly the fake header is beyond this limited test, and the existing authentic OutGuess precedent remains valid. The new result is a negative cryptanalytic decision with a direct source-cover counterexample; **no LP2 plaintext, genuine key or destination was recovered**.

The [six-original-JPEG reproducibility script](../sims/lp2_outguess_xordepth_original_sft.py) uses the already calibrated `outguess_extract.py`, validates all six SHA-256 outputs and all three external Git blob identities, tests the stated XOR metrics and proves the planted reused-pad inversion. It makes no source writes.

## Reproduction and research decision

[Executable all-source SFT](../sims/lp2_outguess_universal_header_sft.py) · [reusable source-forced-header helper](../sims/outguess_extract.py) · [CI workflow](../.github/workflows/lp2-outguess-universal-header-manual.yml) · [passing original-source CI with classifier](https://github.com/FlareZ123/liber-primus/actions/runs/43492473076).

**Decision:** discard header-only `OutGuess` source-key hits, the three-pseudo-payload reused-ASCII-pad explanation, and apparent seed or length coincidences used to rank LP2 JPEGs or guessed passwords. Preserve the authentic 2014/2016 OutGuess extraction precedent and investigate independently selected carriers only when a recognizable payload is recovered. This is a decoder-level explanation for an otherwise costly false-positive family, and does not solve unknown LP2 ciphertext.
