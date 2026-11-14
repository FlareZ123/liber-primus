# Exact cross-file byte-splice census of all original Liber Primus JPEGs

**Agent28, 14 November 2026. Evidence class:** exact original-byte graph and finite negative for additional source-wide splice carriers. **No unknown LP2 ciphertext was deciphered and no key or new embedded payload was recovered.**

## Question and rival explanations

LP1 `05.jpg` carries an independently decoded 2014 numerical square inside a symmetric reversed-byte shell; `10.jpg` embeds three other complete images as successive JPEGs. If the author reused this byte-splicing grammar across releases, another intact fragment, reversed span or file-to-file join could reveal an original instruction or recoverable key. A strong rival is that these are two isolated historical stages and the remaining repeated bytes are JPEG boilerplate, zero-filled scan runs or shared rendered artwork.

The original 75 JPEGs (`resources/liber-primus/00.jpg` through `74.jpg`, 52,248,065 raw bytes) were tested. The complete, cross-platform C++17 scanner and raw-match TSV generator is [the reproduction program](../sims/lp2_crossfile_exact_splice_inventory.cpp). It reads the images and reports to standard output without modifying the corpus.

## Positive controls recovered exactly

1. **LP1 `05.jpg` (673,066 bytes):** the first **336,353** bytes equal the reversed last **336,353** bytes; the central **360** bytes begin with two newlines and contain the known 358-character hexadecimal numerical-square carrier. This is the previously recovered authentic `A || M || reverse(A)` structure; it is **not another newly discovered payload**.
2. **LP1 `10.jpg` (4,240,957 bytes):** a complete initial JPEG is **754,662** bytes long and is followed without gaps by exact whole-file copies of `11.jpg` (**712,733** bytes), `12.jpg` (**703,428** bytes) and `13.jpg` (**2,070,134** bytes). Their original offsets within `10.jpg` are **754,662**, **1,467,395** and **2,170,823** respectively. All source bytes compare equal and the four component sizes exactly fill `10.jpg`.
3. A scan of all 75 literal byte streams finds **73 files with one JPEG EOI marker**, `05.jpg` with **seven** and `10.jpg` with **four**. No third file has an ordinary appended second JPEG following its first EOI. This EOI census concerns literal `FF D9` occurrences; the structurally verified cases are the two above.

## Original-source graph and discriminating observations

The search indexes 64-byte substrings starting at multiples of 64, in both forward and whole-file-reversed orientations. It then scans **every byte offset** of every other original file with a 64-bit rolling hash, verifies matching seed bytes, and extends each occurrence maximally in both directions. It includes only spans **at least 512 bytes** long whose indexed 64-byte anchor contains **at least four distinct byte values**, excluding trivial zero-only and extremely low-alphabet filler. Thus every common span containing a qualifying source-grid anchor is recoverable regardless of its unknown counterpart offset; cryptographic keys, approximate matches and arbitrary XOR masks are not searched. Both known positive controls are checked before search. Maximum spans are deduplicated by source file, orientation and relative offset; overlapping source positions are allowed.

The fixed search yields **1,554,775** indexed seeds, **2,910,113** candidate-hash encounters, **2,783,248** byte-validated seed encounters and **2,350** maximal qualifying cross-file matches. Of these, **2,349 are forward** and **one** is reverse. That reverse case is `05.jpg`↔`74.jpg`, a 12,689-byte **99.9%-zero** JPEG-scan run (entropy **0.014 bits/byte**), enabled by p05's mirrored shell; it is not an encoded reverse image.

An additional predeclared inspection criterion, Shannon entropy **at least 3 bits per byte** over the entire matched range, retains **1,752** matches. Every one falls into one of the following explicit classes:

| Class | Count | Interpretation |
| --- | ---: | --- |
| At least one matching range begins at file offset zero | **1,681** | Shared JFIF/JPEG encoding headers, including exact `10.jpg`→`11–13.jpg` whole-file joins and smaller header duplicates at those joins |
| Both matched spans begin at byte offset **at least 20,000** | **71** | Identical **in-image entropy-coded scan-data segments** between pages with repeated artwork/layout; all are same-release pairs |
| Other high-entropy offsets | **0** | No additional intermediate-region cross-file fragment meeting this threshold |

Of the 71 internal image-data overlaps, **66** are confined to the repeated botanical-border original JPEGs `58.jpg` through `65.jpg`; **five** involve `51.jpg`, `52.jpg` or `56.jpg`. The longest non-control high-entropy internal span is **3,769 bytes**, `63.jpg` offset **200,031** matching `65.jpg` offset **208,622**, entropy **7.066 bits/byte**. Original raster inspection shows the same chapter template with repeated vines and typesetting; these spans fall within the actual JPEG image scan rather than an extra file or independent after-EOI carrier. Other longer matches, up to **13,886 bytes**, are overwhelmingly null-dominated JPEG runs (for that 13,886-byte example, approximately **99.7%** are zero).

The common-header class is explained by **previously established** JPEG metadata results ([original metadata gate](lp2-original-jpeg-header-source-gate.md), [entropy reconstruction](lp2-jpeg-entropy-reconstruction.md)), independently reproduced in this scan: **all 58 LP2 JPEGs have the same 2,590-byte APP2 `ICC_PROFILE` payload**, SHA-256 `62bf41ee295c823d5e6b44cd6dee8e4754fd8d3d6dc482227fb001e9a61a5c2f`; all 17 LP1 JPEGs lack APP2. The APP0/JFIF payload uses two templates across the archive (nine early LP1 files versus the other 66). This is **not a new hidden-channel discovery**: the repeated ICC/JFIF bytes explain many high-entropy prefix matches and are image color-profile metadata.\n\nNotably, **no high-entropy internal match crosses the LP1/LP2 boundary** (`00–16.jpg` versus `17–74.jpg`). The graph does not add another independent instruction or cross-release payload.

## Decision and limits

The exact intact-byte splice hypothesis produced **no new recoverable byte payload, complete embedded JPEG, decipherment operation, or author-selected LP2 key** beyond the p05/p10 positive controls. The bounded result retires further generalized exact-splice fishing on this fixed 75-image archive. Further work would need an original source instruction selecting a **different transform**, a new surviving historical carrier, or a specific in-image visual clue selecting a compressed-span inverse.

The search is a finite, specified coverage of 64-byte-rich common/reversed ranges of length ≥512. It does **not** rule out shorter fragments, low-alphabet payloads, transformations other than exact reversal, hidden DCT steganography or intended image-content copy/resize: the latter is separately studied as source art reuse. No inference about a cryptographic key follows from mere copied JPEG entropy-coded bytes.

**Related source controls:** [LP1 page05 mirrored-byte/numerical-square extraction](lp1-page05-reversed-prefix-anomaly.md), [cross-release illustration reuse](lp1-lp2-illustration-reuse-and-cipher-transfer-gate.md), and [current authoritative research state](../results/README.md).
