# LP2 p15 decimal-grid direct AES-256 test on the pp49–51 table

**Agent 3, 13 November 2026. Evidence class: exact original-input conditional negative. No unknown plaintext or key recovered.**

## Specific human-plausible route and its unsupported step

The original physical p15 has a visibly distinct 4×4 array of **16 decimal integers**, whose authentic Fibonacci-indexed prime spiral is already completely reconstructed in [the established p15 result](../results/lp2-p15-fibonacci-prime-spiral.md). Each printed integer fits in **16 bits**. Concatenating all sixteen as 2-byte unsigned integers therefore constructs exactly **32 bytes**, the width of a standard **AES-256 key**. The only other large original byte object, the physical pp49–51 32×8 table, contains **256 bytes**, exactly 16 AES blocks. This suggests one inexpensive concrete possibility for the otherwise undecoded numerical table: the p15 image supplies a symmetric key to decrypt it.

**The decisive gap:** neither p15 nor pp49–51 says “AES”, chooses a byte order/mode/IV, or identifies the table as ciphertext. The width match makes the test affordable; it does **not** authenticate the construction or justify a broader parameter hunt. Previously documented [AES-128 using a different sixteen-byte quotient/prime sample](lp2-p15-base29-56013-selector-gate.md) and assorted source-key AES-CTR/ChaCha output screens are separate mechanisms, not positive evidence for this one.

## Frozen original-cipher experiment

The [single-file CommonJS SFT](../sims/lp2_p15_16bit_aes256_grid_original_sft.cjs) reads `resources/liber-primus/base60-grid.json`, requiring the source row-major 256 bytes' SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Its independently derived **base59** interpretation (omitting the original unused lowercase `f`) hashes to `511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79`. The original p15 values are exactly those in the established source table, using both visible row-major and the source-fixed red-3299 outward spiral orders.

The complete **48** declared decryptions are the Cartesian product of:

- two table radices: literal **60** and candidate **59**;
- two key orders: printed **row-major** and recovered **Fibonacci prime spiral**;
- two 16-bit conventions: big-endian or little-endian;
- two encrypted-table orders: row-major or eight full vertical columns;
- three standard AES-256 direct modes: **ECB**, **CBC with sixteen zero IV bytes**, and **CTR with sixteen zero counter bytes**.

No private key, word list, learned alphabet, fitted phase or source-rune replacement is used. All 48 originals are 256 bytes long and encrypt back exactly under the same fixed settings; that roundtrip is a software invariant, not evidence of a historical cipher.

## Outcome and bounded decision

**No original candidate yields direct readable ASCII or a byte-per-rune GP29 stream.** Across the 48 outputs, the maximum number of ASCII printable or conventional text-spacing bytes is **118/256**, with no more than **8 contiguous** such bytes. The maximum number of values in the exact original 29-rune index alphabet (0–28) is **46/256**, with no more than **4 contiguous** such bytes. These data are consistent with accidental short printable segments in binary output; no original-source plaintext has been recovered. In contrast, using the same source key and the unmodified decoder, an independently prepared source-topic ASCII message is recovered **256/256 bytes** under CBC, and a separate GP29-index message is recovered **256/256 bytes** under CTR. The exact source data, every model and both plants are asserted in the SFT.

**Decision:** retire the **direct p15 16×uint16 → AES-256 → original pp49–51 table → plaintext ASCII/GP29** interpretation under these frozen radices, orders and standard no-IV/zero-IV modes. The table might contain binary ciphertext, compressed material, keyed state, or a different historical representation. None of these is selected by this experiment. Require an authored instruction or independent key/IV or payload header before expanding this AES branch. Nothing here changes the unresolved-book research synthesis or the p15 spiral decipherment.
