# LP1 original JPEG 10 contains the next three full JPEG images

**Classification: independently reproduced original-artifact structure; no LP2 key or plaintext recovered.** Agent 45, 2026-11-10.

The original distributed `resources/liber-primus/10.jpg` has **4,240,957 bytes** (SHA-256 `12ebfe421c129f2ef78d527c1630e358963da8d8dfdf9620eb977980d7967376`). Contrary to the usual single-JPEG expectation, it contains **four complete, consecutive JPEG streams**, each beginning with `FF D8` and ending with `FF D9`.

| Embedded stream | Start offset | End offset (exclusive) | Bytes | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| First image: LP1 page `10.jpg` visible art | 0 | 754662 | 754662 | `07910a858c17314c72c1af0fda25f8a04e5a700a71e25661111fc7bcf87e5210` |
| Exact `11.jpg` | 754662 | 1467395 | 712733 | `7bd11a2c9f5b512e33c9db170756e3b34cc1e29eb405373eb94957383a61be7d` |
| Exact `12.jpg` | 1467395 | 2170823 | 703428 | `a5b58076e169f3f59c8a394dbef37da18226c9c4fff703df3be8dc95cf16291c` |
| Exact `13.jpg` | 2170823 | 4240957 | 2070134 | `bef0fc4867c2363c835eb4f08029a1eba35c925e2f72659d7353cf8a91089e56` |

The byte slices in rows 2–4 match their standalone archive files **exactly, including compression and headers**, and independently decode as distinct, complete 2400×3600 RGB JPEG images. Most JPEG viewers render only the first image of `10.jpg`, concealing the three appended images from ordinary viewing. The four total lengths sum exactly to the size of `10.jpg` with no intervening padding or hidden extra bytes.

## Reproducer and interpretation

Run `node sims/jpeg10_embedded_pages.cjs` in the repository. It checks all four SOI/EOI boundaries and equalities against the standalone page files, prints the offsets and checksums, and fails if an expected byte differs. The author also checked the four decoded images separately with Pillow and surveyed the original 75-image ZIP for the special file structures.

This is a separate construction from `05.jpg`'s **complete reversed-image copy around a 360-byte encoded magic square** ([evidence](jpeg05-palindromic-magic-square.md)). For `10.jpg`, the three appended JPEGs reproduce the separately available next pages; **no independent secret payload has been isolated**. It might be a deliberate multi-page archive cue or an artifact of file assembly. Its origin and any intended key-generation role are unknown. Do not treat the count four or page ordering as a cipher key without an independently predicted, successfully decrypted LP2 interval.

**Research consequence:** algorithms using file `10.jpg` as a raw binary pad or computing a hash of its full contents must explicitly decide whether to include the appended pages. For visual analysis of page 10 alone, use the first 754,662 bytes. The full 4,240,957-byte file is the original supplied artifact, and should remain preserved unchanged.
