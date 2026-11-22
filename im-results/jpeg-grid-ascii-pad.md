# LP1 JPEG page 05 as a direct byte pad for the 256-byte LP2 numeric grid

**Status: completed and reproducible bounded negative.** Agent 38, 2026-11-10. The LP2 numerical grid remains a high-entropy ciphertext-like object. No readable ASCII plaintext or real key was recovered.

## Attack and inversion path

The supplied page-05 file has a conspicuous byte-mirrored structure. That might make its raw bytes a deliberately exposed key for the separate **256-byte base-60 grid** on LP2 pages 49–51, even if they fail as a mod-29 key for runic prose. This is a test against the *grid as ciphertext*, distinct from the earlier JPEG-to-LP2-runes attacks.

For every candidate byte position `j` supporting all 256 grid bytes, decode `P_i` by one of three reversible operations:

- `P_i = G_i XOR J_(j+i)`;
- `P_i = (G_i - J_(j+i)) mod 256`;
- `P_i = (G_i + J_(j+i)) mod 256`.

For each operation, traverse the grid as row-major, reversed row-major, column-major or reversed column-major, and take JPEG bytes forward or backwards. Train an ASCII character prior on the first 70% of the previously solved LP1 English reference. For every complete candidate, score the first **32 decoded bytes**. Retain the top **64** per branch; check all **256 bytes** and count ASCII-printable characters, including CR and LF. The remaining 224 bytes are not used during head selection.

| Quantity | Executed value |
| --- | ---: |
| Original JPEG file bytes | 673,066 |
| Complete 256-byte starts per branch | 672,811 |
| Direction × traversal × operation branches | 2 × 4 × 3 = 24 |
| **Exact 32-byte head candidates** | **16,147,464** |
| Candidates decoded to 256-byte length | **1,536** |
| Distinct source-grid byte values | 161 |
| Maximum ASCII-printable decoded bytes among shortlist | **130 / 256** |
| Highest whole-256-byte English-unigram score | **−2560.481** |
| Printable bytes of highest-scoring full candidate | 118 / 256 |
| Best-scoring full candidate | source offset 153560, column order, subtraction |
| Readable plaintext | **none** |

The top candidate's first 32 bytes are `N?.p%....F.YS.N[..S. 2.E.3..n.RA` (dots replace nonprinting bytes). Other top-scoring candidates are similarly nonlinguistic. A large JPEG zero-run and the exact mirrored suffix cause distinct offsets and directions to share key bytes; the **16,147,464 number is a count of tested settings, not independent statistical hypotheses**.

## Genuine source-plaintext positive control

Use the trailing **256-byte held-out excerpt** of the authentic solved-LP1 translation, deliberately encrypted with JPEG forward bytes starting at offset **300000** under XOR and row-major ordering. This offset lies in the nonzero, entropy-diverse part of the image file. The same head-selection procedure, with that branch predefined, evaluates all **672,811** possible starts, ranks the original start first, and recovers **256/256 bytes exactly**. The recovered output is entirely ASCII printable. The control uses the same genuine source text and original JPEG bytes but is an artificial encryption, not proof of an LP2 encryption model.

## Forensic detail relevant to key-sourcing

A separate assertion checks the page-05 archive file decomposition: independently viewable JPEG bytes **0–336352** (336,353 bytes; EOI `FF D9` at offsets 336351–336352), **360 central bytes**, and the exact **336,353-byte reversed copy** of the first part. The middle bytes are two LFs plus 358 reversed ASCII hexadecimal characters, decoding to the *previously known* page-05 5×5 magic square with every row, column and diagonal totaling **1033**. This is a structural explanation of the source file, not a new LP2 clue or plaintext. The earlier JPEG-pad report's mistaken last-EOI description is corrected in [mirrored-jpeg-pad.md](mirrored-jpeg-pad.md).

## Scope and reproduction

Source: [sims/jpeg_grid_ascii_probe.cjs](../sims/jpeg_grid_ascii_probe.cjs). [Successful manual GitHub Actions run 42750638455](https://github.com/FlareZ123/liber-primus/actions/runs/42750638455). Input images and byte-grid are from [resources/liber-primus/](../resources/liber-primus/); known plaintext is [lp1-plaintext-reference.txt](../resources/liber-primus/lp1-plaintext-reference.txt).

This result rejects a **direct, fixed-offset, byte-wise, literal raw-JPEG pad of the grid producing readable ASCII under the screened head selection**. It says nothing conclusive about compressed or binary plaintext, variable or permuted key consumption, a derived key from pixels or hashes, independent extra cipher layers, or another secret source. With a 32-byte prefilter, an adversarially unlikely ASCII head could be missed; no arbitrary universal exclusion or independent p-value is claimed. These assumptions must accompany any reuse of this negative.

**Next resource allocation:** Do not increase the offset count for this same model; every admissible full-length offset already ran. Progress requires a key derivation justified independently by the actual manuscript or a model that can recover and predict held-out decoded material.
