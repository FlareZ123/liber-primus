# LP2 p57: original-source rejection of the claimed 1,543-index LSB master key

**Decision, 13 November 2026.** The third-party [claimed complete key solution](https://github.com/nexon33/cicada3301/blob/main/FINAL_COMPLETE_SOLUTION.md) asserts that a specific grayscale-LSB scan of the final Liber Primus page gives **1,543 potential master indices** containing **all eleven** solved-WELCOME indices. The exact scan **does produce 1,543** on original physical p57 (resources/liber-primus/74.jpg) but contains **only eight of eleven** purported keys. The missing **217, 218, 566** have zero occurrences on both axes. This decisively rejects that reported key-source validation, without proving that all p57 steganography is absent or recovering plaintext.

## Source-selected procedure and exact test

The external [Python code](https://github.com/nexon33/cicada3301/blob/main/extract_master_indices.py) and [stepwise documentation](https://github.com/nexon33/cicada3301/blob/main/EXTRACTION_DOCUMENTATION.md) prescribe: JPEG-decompress to PIL grayscale; crop at 40% from top; select every pixel with grayscale LSB zero; collect zero-based crop-local X and Y positions; union their distinct coordinate labels. The eleven target values are 62, 102, 115, 181, 217, 218, 333, 566, 596, 625, 689. The external source reports **1,412 unique Y, 1,201 unique X, 1,543 union**. The [original-source single-file regression](../sims/lp2_p57_lsb_master_indices_claim_gate.py) runs this exact procedure against the repository originals and reports image SHA256 and original controls.

| Original image | SHA256 | LSB0 pixels | Unique Y | Unique X | Union | WELCOME values present |
|---|---|---:|---:|---:|---:|---:|
| 74.jpg (solved p57) | 1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b | 136,346 | **1,412** | **1,201** | **1,543** | **8/11** |
| 73.jpg (solved p56) | a4c1c9ae1246c3197fc1d7bd0155cbc97f60d4bba84a104d45f180feab1814dc | 165,830 | 737 | 1,175 | 1,511 | 5/11 |
| 17.jpg (unknown p0) | 197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e | 538,102 | 1,551 | 2,009 | 2,077 | **11/11** |

The original p57 union includes **62, 102, 115, 181, 333, 596, 625, 689**. Its exact combined X+Y occurrence frequencies, in target order, are **[23, 174, 281, 260, 0, 0, 484, 0, 27, 35, 35]**, contradicting the public nonzero values for the three absent indices and the claimed count of 32 for index 333. Because *all three documented headline extraction counts match exactly*, this is evidence about the **same** image/extraction, rather than an implementation variant or incorrect crop.

## Why the failure matters and what would reopen

Every qualifying pixel adds both of its *coordinate labels* to a large set. This is a generic property of textured image data. Even the unrelated physical p0 original yields **11/11** purported WELCOME indices using the identical rule, despite supplying no WELCOME key or plaintext. Eleven-of-eleven membership alone has no established false-positive discrimination. The claimed p57 positive fails more directly, with three missing values.

**Research consequence:** Do not treat this external LSB-index set, its Fibonacci/Lucas subselection, or claimed WELCOME key as creator-authenticated key material for unknown LP2 pages. Reconsider only if a proposer supplies a historically motivated rule operating on the original bytes, actual correct independently known control keys, and a withheld original-cipher plaintext inverse. The present test recovers **no unknown plaintext, authentic unknown-page key, or destination**.

Scope: this negative applies to the exact published coordinate-union algorithm and claimed index set. Other image carriers and original-pixel decoding rules remain possible.