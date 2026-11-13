# LP1 10.jpg contains four concatenated full-page JPEGs

**Status: verified byte structure; page identity is a strong historical hypothesis, not yet proved.**

The original `resources/liber-primus/10.jpg` is 4,240,957 bytes (SHA-256 `12ebfe421c129f2ef78d527c1630e358963da8d8dfdf9620eb977980d7967376`). A marker-aware JPEG parser finds four valid JPEG streams concatenated directly, with no separators:

| Segment | Start | End (exclusive) | Bytes | Dimensions | SHA-256 |
|---|---:|---:|---:|---:|---|
| 1 | 0 | 754,662 | 754,662 | 2400×3600 | `07910a858c17314c72c1af0fda25f8a04e5a700a71e25661111fc7bcf87e5210` |
| 2 | 754,662 | 1,467,395 | 712,733 | 2400×3600 | `7bd11a2c9f5b512e33c9db170756e3b34cc1e29eb405373eb94957383a61be7d` |
| 3 | 1,467,395 | 2,170,823 | 703,428 | 2400×3600 | `a5b58076e169f3f59c8a394dbef37da18226c9c4fff703df3be8dc95cf16291c` |
| 4 | 2,170,823 | 4,240,957 | 2,070,134 | 2400×3600 | `bef0fc4867c2363c835eb4f08029a1eba35c925e2f72659d7353cf8a91089e56` |

Visual inspection shows four distinct rune manuscript pages, numbered/marked in red 1 and 2 on the first two pages; the fourth includes a cicada/moth illustration. The common 2400×3600 page format and four-page count strongly match the historical account that the 2014 Sixth Onion served four initial Liber Primus pages. Exact page-by-page identity with the archived Sixth Onion screenshots still needs comparison.

This is also a correction to any inventory that uses the **last raw `FF D9` byte pair** as the JPEG boundary. In `10.jpg`, the first valid JPEG ends at 754,662 and the next JPEG begins immediately there; the file contains three further full JPEGs. A raw `rfind(FF D9)` does not enumerate concatenated images and can misclassify valid payload structure.

## Reproduction

```sh
python sims/lp1_10_multi_jpeg_extract_sft.py
python sims/lp1_10_multi_jpeg_extract_sft.py --out /tmp/lp1-10-pages
```

The script validates the source SHA-256, parses each JPEG marker stream, reports offsets/dimensions/hashes, and optionally extracts the four images. It stops on any non-JPEG gap rather than guessing.

## Decisive next step

Compare the four extracted images against the four pages shown in the 2014 Sixth Onion walkthrough (described as loss of divinity, consumption, preservation, and adherence). If they match, inspect the page-border digits and the PGP-signed OutGuess messages described for those pages. This could establish the exact relationship between the local 75-image corpus and the 2014 handoff. Do not treat the visual resemblance alone as proof.
