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


## Source-selected p0–p2 cross as the historical three-share OutGuess route (Agent31, 16 November 2026)

The original scans **17.jpg, 18.jpg and 19.jpg** are physical LP2 **p0, p1 and p2**. Their reused, 180°-opposed triple-bar cross artwork is independently established in [the original-image cross source-plate gate](lp2-p0-p2-orthodox-cross-source-plate-gate.md). Cicada's earlier 2014 puzzle used three equal-length OutGuess payload shares combined by bytewise XOR. A solver could therefore reasonably ask whether these three cross-framed images are the analogous three carriers. This is a concrete historical-mechanism transfer, not evidence that the crosses are share markers.

Use the historically demonstrated OutGuess **Default key**, calibrated by the authentic LP1 03.jpg extraction. All three LP2 images have the source-forced encrypted header ffffffff; under that key it decodes to c0a128e3, seed **41,408**, length **58,152**. The header is not evidence of embedded content: the universal-header proof above establishes why it is forced.

The exact original-byte results are:

| Physical page / original scan | Original JPEG SHA-256 | Complete default-key payload |
|---|---|---|
| p0 / 17.jpg | 197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e | **58,152 bytes**, SHA-256 cbf1ccddc6c4bb2fd96d449e0667eb5be6c2a542de4e0f43e7ca188df7f289b1 |
| p1 / 18.jpg | f804fae06a68315eb6206158a2b34f55fe157c7d663fa961639fbe8dfc52a39f | **Fails after 58,120 bytes**; 32 remain |
| p2 / 19.jpg | 74e955ebe248e6d7442e2d2cd3029951f258017987d5762f48e7897cf6611e34 | **Fails after 58,113 bytes**; 39 remain |

For p1 the adaptive OutGuess iterator reaches offset **686,973** in a bitmap of **687,226** eligible bits, leaving 253 bits; the calculated skip modulus becomes zero. For p2 it reaches offset **619,352** of **619,659**, leaving 307 bits; its skip modulus likewise becomes zero. The exact first failure and all header/seed/length values are asserted by the new source-original reproducer.

The original 2014 three-share operation requires three complete, equal-length payloads before their XOR can reconstruct the message. Under this fixed, historically calibrated password, only p0 completes; p1 and p2 do not. There is consequently no valid three-share XOR to perform, and truncating the failed shares or changing the password would add an unselected operation. The same-run positive control recovers the authentic **31,809-byte** original LP1 03.jpg PGP clear-signed OutGuess payload byte-for-byte under Default key.

**Decision:** the direct p0/p1/p2 three-share OutGuess transfer is negative under both tested source-motivated keys: Default key yields only one complete payload, while the LP1-derived candidate FIRFUMFERENFE yields three complete payloads whose XOR is high-entropy and has no recognizable message/file signature. This does not exclude a separately instructed different passphrase, another steganographic channel, or deliberately embedded data with the forced header; none is selected by the cross artwork or surviving signed source. Do not turn this negative into an unknown-password sweep.

**Reproduction:** [single-file original-JPEG SFT](../sims/lp2_p0_p2_outguess_cross_three_share_gate.py), using the existing calibrated outguess_extract.py and outguess_bitmap_dump.c. It pins all three JPEG hashes, the 2014 LP1 positive, the forced header, p0's complete payload hash, and the exact p1/p2 iterator failure states.


### LP1-derived FIRFUMFERENFE as a candidate OutGuess passphrase

The default-key gate above tests the source-authenticated OutGuess password. A second, independently motivated candidate is the exact 13-letter LP1 solved Vigenère key **FIRFUMFERENFE**: LP2 p57 says to “shed our own circumferences,” and the earlier solved material supplies this key. Its use as an OutGuess passphrase is a cross-round hypothesis, not an authenticated OutGuess instruction. The repeated p0–p2 cross art selects the same three carriers, while the 2014 Cicada round supplies the historical three-share bytewise-XOR precedent.

With OutGuess 0.4 and FIRFUMFERENFE, **all three** original images complete extraction. Each has the same source-forced encrypted header ffffffff; the decoded header is **2aa00225**, seed **41,002**, length **9,474**.

| Physical page / scan | Payload bytes | Payload SHA-256 |
|---|---:|---|
| p0 / 17.jpg | 9,474 | d9505f6f6d40c2099cad79963a16f2823f2e46f6aead83776c863c648815f6e6 |
| p1 / 18.jpg | 9,474 | ed5a3ced513c70c1f0e15cc3097af1173779fad7d2fbc994e763ba48393e9b15 |
| p2 / 19.jpg | 9,474 | 3e190a76b50c25c486a4f21ca80e86730e878e418ebcf7f5f076e05e5cc02712 |

The direct three-way XOR is 9,474 bytes, SHA-256 **fca81a16753c21df3d5874224d666c2c963cd8a036e67f766fa64e5f9b5628c8**. It has Shannon byte entropy **7.9821516973 bits**, printable ASCII/whitespace fraction **0.3836816551**, and longest printable run **12**. It contains no PGP, ZIP, gzip, bzip2, PDF, PNG, CICADA, LIBER or 3301 signature. The three extracted payloads share an identical **293-byte prefix** and **323-byte suffix**; the three-way XOR necessarily preserves those common regions. This does not resemble the clear-signed plaintext recovered by the historical 2014 three-share XOR operation.

**Decision:** the direct p0/p1/p2 three-share OutGuess transfer is negative under all three tested source-motivated keys: Default key yields only one complete payload; the LP1-derived FIRFUMFERENFE and p57-derived DIVINITY candidates each yield three complete payloads whose direct XOR is high-entropy, dominated by large common prefix/suffix regions, and has no valid message/file signature. Neither candidate is authenticated as an OutGuess password. Do not truncate, trim common regions, treat the invalid gzip-like marker as data, or search alternate passwords without a new original selector. An encrypted second layer remains logically possible but has no source-selected consumer.

**Reproduction:** the [main original-JPEG SFT](../sims/lp2_p0_p2_outguess_cross_three_share_gate.py) tests Default key and FIRFUMFERENFE; the separate [DIVINITY-specific SFT](../sims/lp2_p0_p2_outguess_divinity_candidate_sft.py) tests the third candidate, its exact payload hashes, XOR statistics, common regions, and invalid gzip-like occurrence.


### DIVINITY as a source-visible OutGuess candidate passphrase

A third fixed candidate is the literal **DIVINITY** from the p57 parable (“find the divinity within”). The signed 2016 Cicada carrier independently establishes OutGuess as a tool in this puzzle family, and the same three cross-framed originals are the candidate carriers. DIVINITY is already source-motivated as an OpenPuff password in separate research; its use as an OutGuess passphrase is a distinct, bounded cross-tool hypothesis, not an authenticated OutGuess instruction.

OutGuess 0.4 completes all three original-image extractions under DIVINITY. Each has the forced encrypted header ffffffff; the decoded header is **ee5b43c7**, seed **23,534**, length **51,011**.

| Physical page / scan | Payload bytes | Payload SHA-256 |
|---|---:|---|
| p0 / 17.jpg | 51,011 | 772860c15ca24d4cbb41b60f7058caf3bb2a4557e9000a27adc1df8adce64eef |
| p1 / 18.jpg | 51,011 | bef2dcb6a0e8498ba6aa5ac24e21c7cd80ca1a0572f305b00f39ce8a4b815f30 |
| p2 / 19.jpg | 51,011 | 4f7c591533218bd47b354dbdfe76995b6cbffae80e116bfe412f592c2e3313bf |

The direct three-way XOR is 51,011 bytes, SHA-256 **62a287c6191693c7257f5958ba92e6136c992bfbcf8926ac6411bae1cd16c3dc**; entropy is **7.9968030801 bits/byte**, printable fraction **0.3824665268**, and longest printable run **10**. The extracted payloads share an identical **1,408-byte prefix** and **2,110-byte suffix**. The XOR has no PGP, ZIP, valid gzip, bzip2, PDF, PNG, CICADA, LIBER or 3301 signature. Its sole two-byte gzip-like occurrence is at offset **26,909**, but the following method byte is **BF**, not the required DEFLATE method 08; it is not a gzip header and does not decompress.

**Decision:** the direct p0/p1/p2 three-share OutGuess transfer is negative under DIVINITY as well: all three extractions complete, but their direct XOR is high-entropy, structurally dominated by a large common prefix/suffix, and has no valid message/file signature. This candidate is source-visible but is not authenticated as an OutGuess password. Do not treat the invalid 1f8b occurrence as a compressed payload or search arbitrary second layers.

**Reproduction:** [DIVINITY-specific original-JPEG SFT](../sims/lp2_p0_p2_outguess_divinity_candidate_sft.py), which imports the common OutGuess iterator and image-hash controls from the main p0–p2 SFT.

## Reproduction and research decision

[Executable all-source SFT](../sims/lp2_outguess_universal_header_sft.py) · [reusable source-forced-header helper](../sims/outguess_extract.py) · [CI workflow](../.github/workflows/lp2-outguess-universal-header-manual.yml) · [passing original-source CI with classifier](https://github.com/FlareZ123/liber-primus/actions/runs/43492473076).

**Decision:** discard header-only `OutGuess` source-key hits, the three-pseudo-payload reused-ASCII-pad explanation, and apparent seed or length coincidences used to rank LP2 JPEGs or guessed passwords. Preserve the authentic 2014/2016 OutGuess extraction precedent and investigate independently selected carriers only when a recognizable payload is recovered. This is a decoder-level explanation for an otherwise costly false-positive family, and does not solve unknown LP2 ciphertext.
