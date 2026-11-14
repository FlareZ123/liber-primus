# The historical p13–p21–p34–p55 Fibonacci page route: two 21×21 QR panels and an all-secret finder obstruction

**Agent 3, 14 November 2026. Classification:** a new exact original-cipher size relationship and bounded original QR-decoder negative. The 2015 page-selection claim is participant-authored and remains unauthenticated. No LP2 unknown plaintext, original key, or destination recovered. Reproducer: [single read-only Node22 SFT](../sims/lp2_2015_fibonacci4_21square_qr_allsecret_sft.cjs). [Initial source-derived panel run 43624230583](https://github.com/FlareZ123/liber-primus/actions/runs/43624230583), [final combined page-pair and panel Windows run 43624431309](https://github.com/FlareZ123/liber-primus/actions/runs/43624431309).

## A specific first-hand 2015 page route

The historical first-hand solver assertion indexed in [Director #919](https://github.com/FlareZ123/liber-primus/issues/919) says to follow the original p15 Fibonacci spiral through **physical LP2 p13, p21, p34 and p55**, allegedly producing Base64 and a binary object. The corresponding original wiki revision has not been recovered, and the quoted account contains **no actual coordinates, cipher program, key, image serialization, or reproduced binary**. The route might be an unverified participant story rather than a Cicada instruction; current research should not promote it to authenticated plaintext.

Those four original printed pages have **272, 273, 261 and 76 GP29 rune symbols**, respectively, if their numbers refer to the original zero-index physical JPEG pages. Their exact concatenated length is

[
272+273+261+76=mathbf{882}=2	imes441=2	imes21^2.
]

The four source-selected page numbers form consecutive Fibonacci numbers **13, 21, 34, 55**. The **21×21 square** is independently the mandatory module dimension of a standard Version 1 QR Code, a historically available Cicada-familiar barcode format. Thus this source-selected four-page route can be reshaped into **two exact 21×21 runic panels** using **all 882 source runes**, or into **441 consecutive two-rune cells** with no padding or deletion. This relationship was noticed retrospectively; neither the original page images nor the 2015 claim says "QR", selects a rune-to-bit codebook or fixes which of these two partitions is intended.

For a small source-only comparison, among all six consecutive four-page Fibonacci tuples using physical page numbers 1,2,3,5,8,13,21,34,55, the original rune totals are **947, 936, 1007, 1063, 1061, 882**. Only the terminal 13–21–34–55 tuple is twice a perfect square. This is a finite descriptive count under the already selected Fibonacci family, **not** a discovery-corrected chance probability or a cryptographic proof of intent. In particular, p55's short 76-rune page explains much of the size drop.

## Necessary QR Version 1 finder under all possible 29→bit maps

A standard 21×21 QR has **three exact 7×7 black-white finder patterns**, situated at top-left, top-right and bottom-left corners; the fourth is absent. The fixed 7×7 pattern has a dark border, a light inner ring and dark center. The **147 mandatory finder pixels** can be checked without guessing any payload, mask pattern, error-correction mode, text, version bits, or Reed–Solomon data. Allow the source to be rotated/reflected, amounting to **all four choices of the omitted corner**.

Test two natural source-preserving ways of producing the pair of 441-rune panels:

1. **Contiguous halves:** first 441 printed runes and last 441 printed runes.
2. **Interleaved two lanes:** alternating original runes into the even-index and odd-index 441-rune panels.

For **each panel separately**, grant an entirely unknown, unrestricted stationary rune-to-binary mapping, covering all **2²⁹** possible assignments *analytically*. At each finder site collect the required black and white counts of the original GP rune appearing there. The exact minimum wrong pixels over any mapping is `sum_rune min(requiredBlack,requiredWhite)`; contradictory black/white requirements on one rune cannot be resolved by any secret codebook.

| Original 21×21 panel | Missing TL | Missing TR | Missing BL | Missing BR |
| --- | ---: | ---: | ---: | ---: |
| Contiguous first 441 runes | 42 | 42 | **40** | 43 |
| Contiguous final 441 runes | 42 | 42 | 42 | 45 |
| Even-index rune lane | 45 | 43 | 46 | 45 |
| Odd-index rune lane | **40** | 45 | 42 | 43 |

Every direct single-rune binary bitmap has **at least 40 of 147 finder pixels necessarily incorrect**, even granting a different 29-bit mapping separately to each panel and the best orientation. An exact printed QR Version1 finder is impossible in this entire fixed-codebook family. A planted 21×21 two-rune-color QR finder yields **zero forced mismatches** using the identical analysis.

## Literal two-rune modules: equality and any two stationary XOR codebooks

The other obvious original-length readout combines each consecutive original **pair of runes** into one of 441 pixels. A literal equality marker has exactly **3 equal adjacent-pair cells** in the 441 source pairs, at zero-based pixel positions **215, 283, 432**. A standard three-finder frame requires **99 black and 48 white** of its 147 fixed pixels. The equality-based panel therefore has **99 mismatched mandatory finder pixels** for each of the four corner orientations, or **48** if the binary sense is reversed. Both fail outright.

Allow a dramatically more flexible *hidden* pairing:
[
B_i=f(C_{2i})oplus g(C_{2i+1}),
]
where **f and g are independently arbitrary unknown 29-symbol-to-bit maps**, giving 58 secret binary codebook entries. Each exact finder pixel gives one parity equation between a left-rune and a right-rune codebook variable. A parity union-find checks the full system without enumerating any of its **2⁵⁸** possible assignments. In the original 441 pairs, the four orientations have respectively **45, 40, 40, 39 contradictory cycle closures** in the fixed finder-site processing order. Any positive contradiction proves no exact global solution exists; these closure counts depend on equation order and must **not** be mistaken for minimum edit distances. A source-sized planted QR two-rune-pair XOR structure has **zero contradictions**, proving a real positive is detectable.

## Decision and continuation

**Retire direct QR Version 1 raster decoding of the historically named Fibonacci-page runes under any stationary per-rune binary codebook, literal paired-rune equality, or two fully secret stationary lane-XOR codebooks.** The exact **882=2×21²** relationship remains a source-conditioned exploratory observation, worth retaining in the historical 2015 claim index, especially because it uses only exact printed page lengths. It cannot by itself establish the purported Base64, select a nonstationary or arbitrary 29² pair-codebook, or authorize an invented raster traversal. Alternate page numbering, external source objects, or an actual author-provided decoding instruction would be independent new premises; if recovered, they should be tested against original pixels or a reproducible binary rather than calibrated to the 21-square coincidence.

All measurements use the canonical untouched [LP2 physical-page GP29 corpus](../resources/liber-primus/lp2-corpus.json) with printed page-boundary order retained, no rune additions, skips or fitted visual thresholds. The Windows CI assertions check source lengths, every 7×7 finder constraint, all 16 original panel/orientation minima, paired equalities and all-secret graph contradictions, plus source-sized positive controls.
