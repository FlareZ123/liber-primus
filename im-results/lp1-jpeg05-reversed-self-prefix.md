# Source JPEG 05 contains a reversed copy of its own prefix

**Scope (16 November 2026):** A byte-level source observation on physical **LP1** `resources/liber-primus/05.jpg`, not a newly solved LP2 page, plaintext, key, or endorsed decryption method.

The 75 original JPEGs, `00.jpg` through `74.jpg`, contain one nonempty post-EOI trailer. JPEG `05.jpg` (SHA-256 `2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7`) is **673,066 bytes**. The final JPEG end marker `FF D9` occupies zero-based offsets **600,364–600,365**. After it are precisely **72,700 bytes**. In exact byte order, the reversed trailer equals the beginning of the *same file*, at offsets **0–72,699**. The other **74** source JPEGs contain **zero bytes after the final EOI**. The reverse image header reads as a 2,400×3,600 JFIF but is truncated, reproducing only a portion of the existing visible image. The 72,700-byte trailer is therefore fully redundant as source information.

## Significance for decipherment

This is a genuine, executable byte-level inversion in the supplied original source corpus. Its creator, date of attachment, intention, and relation to the LP2 cipher are **undetermined**. In particular the reverse prefix contains no independent rune sequence, cipher key, or recovered plaintext, and it does not authorize arbitrary reversal of LP2 runes or the p50 table. The result is worth retaining as a source-visible operation that a human using a hex editor could notice, while **excluding the trailer itself as missing plaintext**. Do not promote it into `results/` without an independently selected LP2 consumer or historical instruction.

## Reproduction

Run `node sims/lp2_jpeg05_reversed_prefix_sft.cjs` from any working directory with the repository's 75 original JPEGs present. The Node CommonJS script uses only core modules, pins the original 05.jpg SHA-256, checks all 75 end-marker suffixes, and demands an exact reversed byte-for-byte match. Original scan `05.jpg` is a source-native LP1 image containing a 5×5 numeric square; this is distinct from LP2 p5/scan22.
