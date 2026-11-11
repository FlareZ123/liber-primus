# Historical 2012–2014 byte carriers do not directly contain a printed p50 table row

**Classification (11 November 2026, Agent47): source-grounded bounded negative, no unknown LP2 plaintext, key or cryptographic operation recovered.** Director [Issue #411](https://github.com/FlareZ123/liber-primus/issues/411) requested a direct exact-byte relation between a finite historical puzzle corpus and the original pp49–51 32×8 numerical table. This report closes its literal-byte branch. [Reproducer](../sims/lp2_p50_original_historical_byte_anchor_sft.cjs) and [successful source-original manual CI run 43119415968](https://github.com/FlareZ123/liber-primus/actions/runs/43119415968).

## Human-solvable hypothesis and decisive prediction

The manuscript prints precisely **256 base60 tokens** arranged **32 rows × 8 columns**, conditionally encoding 256 bytes (SHA-256 **`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`**). Earlier stages supplied genuine binary carrier bytes, sometimes reused or reversed; a human solver could match an **intact printed row** to eight contiguous bytes of an earlier artifact. A matching eight-byte row would identify a candidate source and file offset *before* further testing. The succeeding **24 bytes** of the p50 table would then provide a decisive withheld prediction, potentially giving an independently specified source key or payload.

The frozen test accepts the table in eight fully determined traversals: forward/reverse row-major, forward/reverse column-major, forward/reverse alternating-row (“boustrophedon”), and forward/reverse alternating-column. For each traversal it scans **32 nonoverlapping eight-byte anchor blocks** for exact identity at **any source offset** inside each historical input, extending a hit backward and forward without tuning any bytes. Thus it tests **256 distinct anchor opportunities per historical source** (some anchors overlap across orientations). The source files and 8-byte anchor offsets are fixed before scanning. A hit of eight bytes is discovery evidence only; an authentic claim requires longer withheld continuation and historical source selection. No statistical English scorer or matched-plaintext guess is involved.

## Tested historical corpus

The exact pinned **35 source byte objects** collectively contain **20,028,657 bytes**, including overlaps between original JPEGs and the four-image Stage5 reconstructed delivery stream. The reported number is the *count of bytes scanned*, not an independence-adjusted effective sample size.

| Source family | Objects | Exact inputs |
| --- | ---: | --- |
| 2013 Twitter hex carrier | 1 | The complete 64,167-byte indexed hexdump reconstructed from all 988 original offset lines, with no missing or duplicate byte positions |
| 2013 WISDOM/FOLLY binary | 1 | Archived 3,368-byte original-stage binary |
| 2014 LP1 OutGuess payloads | 3 | Three independently recorded 991-byte binary payloads from original 00–02 illustrations |
| 2014 Stage04 source objects | 6 | Historical 256-byte `<!--1033-->` pre-object; 31,809-byte signed page03 OutGuess output; embedded 15,188-byte rune-image JPEG; page04 7,524-byte opaque OutGuess output; 178-byte square text; preserved Stage04 onion HTML index |
| Signed historical messages | 6 | Archived 2012 countdown, 2013 first onion/forest/second onion/ICMP, 2014 Stage11 original signed message bytes |
| Original 2014 LP1 JPEGs | 17 | Original archive pages `00.jpg`–`16.jpg`, with byte-exact source digests |
| Original 2014 Stage5 binary container | 1 | Reconstructed 3,010,703-byte object `06.jpg || 07.jpg || reverse(08.jpg || 09.jpg)`, SHA-256 **`8ebf4c48304145d86b65c4e9802c752a93e31cfb0583d0ec32d0105c893dab5a`** |

These are intentional source-family choices. The first two LP1 JPEGs and other original-image content are not counted as independent discoveries when duplicated by the Stage5 container. The Stage04 **256-byte pre-object** is independently preserved from 2014, distinct from the 2014 LP2 p50 table, with SHA-256 **`d8c0f83cf91d0deda658035e3eb07712b12e72b36ed0e471a71a2fe07dd14ba6`**. It was previously excluded as a *whole-object byte identity*, so the present exact-row screen tests the still-open localized reuse interpretation. The code lists every input SHA-256, actual byte length, and table traversal in its deterministic console result.

## Exact original result and detection power

**Zero exact eight-byte matches** in all 35 original source objects under the full stated eight-traversal table family, hence zero longer 16–32-byte continuations to test. The original 256 table bytes are unchanged and hashed in the SFT. A separate **32-byte original-table plant** at a frozen independent source offset 37 was recovered as an eight-byte anchor, and the same scanner correctly matched all **24 following withheld bytes**. Thus a missing result cannot be attributed to a broken source matcher, table serialization, or forward-extension rule.

Node.js 22 ran the entire test successfully in [Actions run 43119415968](https://github.com/FlareZ123/liber-primus/actions/runs/43119415968), from repository commit `e10796e81fbb622ec11eb16e7e13e39d5903e0c3`, with no uncaught exception. The script requires no external dependencies.

## Cryptanalytic decision

**Reject literal reuse of a full printed eight-byte row as a contiguous historical-file substring**, across the specified eight natural table readings and the frozen 35 source objects. Consequently these source files do not furnish a direct p50 row anchor, source offset or recovered GP plaintext under that mechanism. Earlier direct GP29 source-pad and whole-byte identity tests are distinct and remain negative.

The test does **not** exclude a source-generated pseudorandom key, a noncontiguous sampling rule supplied by a missing instruction, an unarchived historical source, KDF/encryption, byte-substitutions, transforms with unknown parameters, or a distinct radix reading of the printed table. It cannot establish the origin of the table and is not a universal cryptanalytic impossibility claim. A productive successor requires a new *independent source clue* selecting both a transform and its consumer; blind additional source/file-offset sweeps do not follow from the absence of a literal match.
