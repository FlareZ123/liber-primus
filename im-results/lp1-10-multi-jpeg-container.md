# LP1 10.jpg contains four concatenated full-page JPEGs

**Status: verified byte structure and exact historical identity.**

The original `resources/liber-primus/10.jpg` is 4,240,957 bytes (SHA-256 `12ebfe421c129f2ef78d527c1630e358963da8d8dfdf9620eb977980d7967376`). A marker-aware JPEG parser finds four valid JPEG streams concatenated directly, with no separators:

| Segment | Start | End (exclusive) | Bytes | Dimensions | SHA-256 |
|---|---:|---:|---:|---:|---|
| 1 | 0 | 754,662 | 754,662 | 2400×3600 | `07910a858c17314c72c1af0fda25f8a04e5a700a71e25661111fc7bcf87e5210` |
| 2 | 754,662 | 1,467,395 | 712,733 | 2400×3600 | `7bd11a2c9f5b512e33c9db170756e3b34cc1e29eb405373eb94957383a61be7d` |
| 3 | 1,467,395 | 2,170,823 | 703,428 | 2400×3600 | `a5b58076e169f3f59c8a394dbef37da18226c9c4fff703df3be8dc95cf16291c` |
| 4 | 2,170,823 | 4,240,957 | 2,070,134 | 2400×3600 | `bef0fc4867c2363c835eb4f08029a1eba35c925e2f72659d7353cf8a91089e56` |

## Exact identity with the pinned 2014 Sixth Onion archive

The four local segments are byte-identical to the four page objects in [neuroretransmit/cicada at commit `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/008-sixth-onion). The Git blob IDs below are computed over the exact segment bytes using Git's `blob <length>\0<content>` hash construction and match the archive tree:

| Local segment | Exact archived object | Git blob SHA-1 | Local standalone page |
|---|---|---|---|
| 1 | `10.jpg` | `bd270e45c58dfb6f0c50f9af60cf7104cf78e78e` | embedded in composite `10.jpg` |
| 2 | `11.jpg` | `d80bea5ec6aac4eee0eebeaaed31840cb24c029d` | `11.jpg`, byte-identical |
| 3 | `12.jpg` | `49253cf8e4c1cacda601c9507111f0c4bfe318b3` | `12.jpg`, byte-identical |
| 4 | `10,11,12-trimmed.bin` | `754a18ce2d0b2f8bcdd03e0a0e458e2bc4912a0a` | `13.jpg`, byte-identical |

The archive's [README at the same pinned commit](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/008-sixth-onion/README.md) gives the extraction chain explicitly: `10.jpg`, then `11.jpg`, then `12.jpg`, then `13.jpg` from the residual `10,11,12-trimmed.bin`. It states that the Liber Primus pages were in sequential order, with no reversals or extra data, and that all four new non-prime pages are unencrypted. The local segment 4 is the entire residual object; the local standalone `13.jpg` matches it byte-for-byte.

The same README transcribes the four pages as the loss of divinity, consumption, preservation, adherence, wisdom, and the instruction “Program your mind. Program reality.” It also records four PGP-signed OutGuess messages with frame numbers `3, 3, 0, 1`; each asks the solver to create a Tor hidden service with CGI uploads and submit the three previously obtained magic squares. This confirms the local corpus's exact historical relationship to the 2014 Sixth Onion handoff, not merely a visual resemblance.

## Why the container matters

This corrects any inventory that uses the **last raw `FF D9` byte pair** as the JPEG boundary. In `10.jpg`, the first valid JPEG ends at 754,662 and the next begins immediately there; three further full JPEGs follow. A raw `rfind(FF D9)` does not enumerate concatenated images and can misclassify valid page structure.

## Reproduction

```sh
python sims/lp1_10_multi_jpeg_extract_sft.py
python sims/lp1_10_multi_jpeg_extract_sft.py --out /tmp/lp1-10-pages
```

The SFT validates the composite SHA-256, parses every JPEG marker stream, checks each segment against the pinned archive Git blob SHA-1, and verifies that segments 2–4 equal the local standalone `11.jpg`, `12.jpg`, and `13.jpg` files. It stops on any non-JPEG gap rather than guessing.

## What this establishes—and what it does not

The local LP1 `10.jpg` is exactly the four-page 2014 Sixth Onion sequence, pages 10–13, in order. The archive's own extraction recipe and object identities settle the page mapping.

This is historical source reconstruction, not an LP2 decryption. The four signed messages direct participants to the 2014 CGI upload/magic-square continuation; they do not specify an LP2 cipher, key, or plaintext. Do not reuse the frame sequence or the `3301` footer as an LP2 key without an independent source selector.
