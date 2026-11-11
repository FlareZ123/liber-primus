# 2014 Stage5 archived object: container and OutGuess audit

## Current conclusion

The archived object at `iBotPeaches/cicada_3301/onions/avowyfgl5lkzfj3n.onion/post/index.html` is not HTML. It is whitespace-separated hexadecimal text encoding a GZIP stream. The GZIP header names the original file `data.out`, records 2014-01-24 20:10:12 UTC, and declares an uncompressed size of 3,010,703 bytes.

Decoding the hex and decompressing GZIP yields SHA-256:

`8ebf4c48304145d86b65c4e9802c752a93e31cfb0583d0ec32d0105c893dab5a`

The resulting `data.out` contains two adjacent, independently decodable 2400×3600 JFIF JPEGs followed by a 1,363,382-byte trailer:

| Segment | Offset range | Length | Observation |
|---|---:|---:|---|
| Front JPEG | 0–823,806 | 823,807 | 2400×3600 |
| Back JPEG | 823,807–1,647,320 | 823,514 | 2400×3600 |
| Trailer | 1,647,321–3,010,702 | 1,363,382 | High-entropy binary; no recognized file signature |

The two images show the two sides of a runic tablet. The apparent `ID3` sequence at offset 98,172 is not a valid ID3 header; it is a false-positive byte signature inside compressed image data. Likewise, isolated `BM` occurrences do not establish embedded BMP files.

## OutGuess test

Built the maintained OutGuess 0.4 source at commit `24810e14327c2bbeedeaadd3e24491f2a4425c02` and tested each JPEG separately with the empty password and the source-derived Stage04 candidate `divinity`.

| Image | Password | Extracted length | OutGuess seed |
|---|---|---:|---:|
| Front | empty | 58,152 | 41,408 |
| Back | empty | 58,152 | 41,408 |
| Front | `divinity` | 2,140 | 19,674 |
| Back | `divinity` | 2,140 | 19,674 |

All four outputs are high-entropy, lack a recognized file header, and contain no readable plaintext. The two empty-password outputs share a 7,707-byte prefix; the two `divinity` outputs share an 86-byte prefix. The `divinity` outputs also share their first 32 bytes exactly. These are observations, not evidence that either password is correct or that the outputs are intended XOR shares. Their XOR is still high-entropy and yields no file signature or plaintext.

**Result:** this reproduces the archive object's structure and rules out treating the first obvious OutGuess extraction as recovered plaintext. It does not recover the Stage5 message, and it does not establish a key or mechanism for LP2. Do not brute-force passwords from these outputs without an independent source clue.

## Reproduction

The retrieval, hex decoding, GZIP validation, JPEG split, OutGuess build, and four fixed extraction attempts are implemented in:

`.github/workflows/avowy-stage5-gzip-audit.yml`

The workflow uploads the source hex, decoded GZIP object, decompressed object, two JPEGs, trailer, and extraction outputs as the `avowy-stage5-object-audit` artifact. The external source is the archived GitHub path named above; the workflow pins the OutGuess source commit.

## Research value

This is a newly indexed historical artifact in the 2014 continuation chain, not a Liber Primus decryption. The only justified next step is to obtain an independently supported Stage5 passphrase or a documented decoding instruction for the tablet/trailer. The present evidence does not justify password enumeration, treating random OutGuess output as ciphertext, or assigning the trailer an invented file format.


## The 3301-marked pre-object as an OutGuess key candidate

The same archived onion has `pre/index.html` (615 bytes), containing a `<!--3301-->` marker followed by exactly 512 hexadecimal characters (256 bytes). This is source-adjacent material and therefore a better-motivated candidate than a guessed passphrase. The workflow now extracts this value and tests its ASCII-hex representation as the OutGuess password on both tablet JPEGs.

Both extractions return 30,628 bytes with seed 44,920. Front output SHA-256: `3df4603f7e70ad485f67c1ac2b25fdff3bd1245011a7673fe46a008b68e99cea`; back output SHA-256: `ce36b7c9975be8e2b4c91d49f30df3f852a557d1824bcb96c177436de9e3ff20`. The outputs share a 4,411-byte prefix. Their XOR has 9,712 zero bytes (31.7%), entropy 6.35 bits/byte, but no recognized file signature or readable plaintext. This is not enough to call the 256-byte pre-object an OutGuess password or the two outputs secret shares; shared cover structure remains a possible explanation.

**Updated conclusion:** the 3301-marked pre-object is an independently sourced candidate input worth preserving, but its OutGuess output is still opaque. Do not brute-force or assert an XOR-share interpretation without a further clue.
