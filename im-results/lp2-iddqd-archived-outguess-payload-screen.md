# LP2 archive OutGuess-output screen: no independent decoded key surfaced (13 November 2026)

## The research decision

Prior Cicada rounds used unkeyed OutGuess on JPEGs. Before spending resources deriving keys from `rtkd/iddqd/lp_outguessed/`, inspect its already-extracted file contents. The historical image namespace is 00–74; the 58 LP2 Stage11 scans occupy JPEGs **17–74**, corresponding to physical p0–p57. This is a scan of **archived outputs**, not a fresh authenticated OutGuess build or a universal steganography exclusion.

## Source-exact inventory

I retrieved every `rtkd/iddqd/lp_outguessed/{17..74}.txt` through the connected GitHub file-content API using **base64** (the binary files are not UTF-8), and classified the decoded byte lengths and prefixes.

* **42/58 files are empty**, all with Git blob SHA-1 `e69de29bb2d1d6434b8b29ae775ad8c2e48c5391`.
* Exactly **16/58 files are nonempty**: global image indices **17, 21, 43, 57–65, 68–71**. All sixteen have *exactly 58,152 decoded bytes*, each a distinct Git blob; all begin with the same binary prefix `c0 a1 28 e3 46 d2 35 72 fe 62 82 2e` rather than PGP armor or a clear file signature.
* Every one of these sixteen blobs agrees with the 17.txt blob for the first **1,889 base64 digits**, guaranteeing a byte-identical prefix of **at least 1,416 bytes**. The very next base64 digit differs for each other tested blob. This repeated prefix plus identical output size is an important discriminator against treating the 16 binary artifacts as 16 independent signed author messages.
* Genuine-looking controls in the **separate LP1 portion of the same archive** differ categorically: `lp_outguessed/00.txt` (Git blob `d0a2ac971fd21ebba249b502a6ece4094de6dcdc`) and `03.txt` (blob `2a355d1bf14d37041384f09d8700e2ee274a13e6`) begin with `-----BEGIN PGP SIGNED MESSAGE-----`. Their GPG signatures were not checked in this screen.
* A stronger **false-extraction behavior control** exists in the LP1 portion: the independent archived outputs `06.txt`, `07.txt`, and `09.txt` are **also exactly 58,152 bytes** and begin with the *same first 70 base64 characters* as every nonempty LP2 binary. Their respective pairwise common-prefix lengths are **10,276 base64 characters** for 06/07 and **2,094 characters** for 06/09 and 07/09, despite distinct files. This same-size, long-prefix artifact pattern therefore predates the LP2 images in the archive, unlike the genuine readable/signature-bearing LP1 outputs. It is consistent with deterministic extraction of repeated blank/decorative image material rather than three or sixteen independent secret documents.

The nonempty LP2 blob SHA-1s, to pin this observation independently:

| Image | Git blob SHA-1 |
| --- | --- |
| 17 | `dcd47827eb02f3d5c7cbfc6259868621bc1ee7b6` |
| 21 | `58ba0c966954f2a02964995613a6ba93fca57425` |
| 43 | `e4c94e1d285aff041276bf5c7bb1c265e987d93d` |
| 57 | `b00935afad47dcf6a687098d365c42656c9f3c3e` |
| 58 | `08242eee904452540ddfc8e5f2d064e45a70d544` |
| 59 | `0f269351c2f91db1a9a1b58b1977175b5a3f1b98` |
| 60 | `0166808cc5ec0a3f81c907cd677e24569f405eb0` |
| 61 | `189b682d1823ebcb9f9f6799e53ea12a182a432c` |
| 62 | `0446ef20772bc60180ae2015006dbb13431f4f33` |
| 63 | `c0def8be97258b235fd3a0e7bf13f476223d50c9` |
| 64 | `6dd88515c9d08b12ca1abca39f7fbe886909c881` |
| 65 | `ae09c1494c63f6be1a3ea1e42d5d3273a2bf79ed` |
| 68 | `20af8411753785b061b3e5b7d482a3c3f1c339d1` |
| 69 | `2aa10935af2d21d65b4fa2984a767bf11579cf62` |
| 70 | `8bb6d636f1943cfc7387aec2ee50b75b12694e94` |
| 71 | `11467c4ca193bdb06f10af982f0277aaead0fa60` |

## Direct check against the solved p56 target (13 November 2026)

The signed-unverified archive's **19 binary, fixed-58,152-byte outputs** (sixteen LP2 and three earlier LP1 image controls 06/07/09) are independently testable as exact candidates for the original p56 printed 512-bit digest's missing file. A Windows Node.js 22 single-file test retrieved all 19 from the frozen archival source revision `f2267b0c2f1e1d2662806b90b9c3a2953b3a7023` and verified **all 19 original Git blob SHA-1 hashes** before hashing any candidate. Their exact bytes were tested against the p56 target under **SHA-512 and BLAKE2b-512**: **zero of 38** digest comparisons matches. Each output has 58,152 bytes, and all retrieval/identity assertions and hash computations passed on the original files. This exact negative does not rule out further decompression/decryption or an unknown historical hash algorithm. [Reproducer](../sims/lp2_outguess_archive_p56_hash_sft.cjs) · [passing Windows source run](https://github.com/FlareZ123/liber-primus/actions/runs/43403989950).

## Distinguishing a carrier clue from a cover artifact

On the 58 original 2400×3600 JPEGs in the maintainer's source mirror, the group with archived nonempty extraction has a median JPEG size **778,405.5 bytes** versus **550,763.5** for the empty group. The two-sided Mann–Whitney statistic is **U=670/672, p=6.5538514×10⁻⁹**, corresponding to size-only AUC **0.9970**. The two size ranges overlap only narrowly: nonempty minimum **661,727**, empty maximum **667,716**. After downsampling each image to at most 400×600 grayscale pixels and thresholding at intensity below 150, nonempty pages have median dark-pixel fraction **0.09812** versus **0.06890** for empty pages (two-sided Mann–Whitney p **3.60549×10⁻⁷**). This strong cover-density dependence, fixed payload length and shared initial binary bytes are consistent with an extraction false-positive driven by JPEG cover content. They are not a proof that a message cannot be encrypted somewhere in the images.

The archive's `43.txt` is one of these same-sized binary outputs. Its nonemptiness alone does **not** establish an actionable LP2 source message or cipher key. The LP1 same-length controls substantially strengthen the false-positive interpretation, but an exact decoder or intentionally embedded common prefix has not been excluded. The document has **no unknown plaintext or decipherment**; do not promote it to `results/README.md` as a solve. If a new password or explicit authored selector arises, perform a **password/source-selected** OutGuess extraction on the original JPEGs and assess the signature/format of recovered bytes. Otherwise avoid repeated unkeyed full-book passes.
