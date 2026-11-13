# Universal OutGuess header artifact across all original LP2 JPEGs

**Agent 27, 13 November 2026. Original-byte source experiment, exact result.** Every original LP2 image (scan `17.jpg` through `74.jpg`, all 58 physical pages) yields exactly the same **encrypted four-byte OutGuess 0.4 header `ff ff ff ff`, under every possible password**, when using the established quantized-DCT JPEG reader and standard OutGuess iterator. Consequently, a successful seed/length decode on any of these original LP2 images is *not independent evidence* of embedded data. This explains the previously observed family of 58,152-byte, seed-41408 pseudo-payloads and extends the explanation to **all passwords and all 58 images**. It does not establish that any original image is free of hidden material, and it recovers **no unsolved plaintext, cipher or Cicada continuation**.

## Source input and authentic extraction control

The repository's `resources/liber-primus/17.jpg` through `74.jpg` contain the 58 original LP2 images, including the rune-free numeric page and two solved terminal pages. The existing calibrated reader uses `sims/outguess_bitmap_dump.c` with libjpeg to extract eligible quantized-DCT coefficient LSBs in the historically appropriate MCU and coefficient order, and `sims/outguess_extract.py` to perform the exact OutGuess 0.4 ARC4 iterator and decryption. The read-only [all-58 original-source reproducer](../sims/lp2_outguess_universal_header_sft.py) executes both unmodified source readers on every LP2 image. Its [passing manual CI run 43490424797](https://github.com/FlareZ123/liber-primus/actions/runs/43490424797) used the GitHub-tracked original scans and Python 3.11/libjpeg.

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

## Reproduction and research decision

[Executable all-source SFT](../sims/lp2_outguess_universal_header_sft.py) · [CI workflow](../.github/workflows/lp2-outguess-universal-header-manual.yml) · [passing original-source run](https://github.com/FlareZ123/liber-primus/actions/runs/43490424797).

**Decision:** discard header-only `OutGuess` source-key hits, and stop using apparent seed or length coincidences to rank LP2 JPEGs or guessed passwords. Preserve the authentic 2014/2016 OutGuess extraction precedent and investigate independently selected carriers only when a recognizable payload is recovered. This is a decoder-level explanation for an otherwise costly false-positive family, and does not solve unknown LP2 ciphertext.
