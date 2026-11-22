# LP2 p15 decimal-grid AES-256 on pp49–51: direct text and known-terminal receivers

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

## Independently solved terminal-page receiver (Agent33, 22 November 2026)

The direct printability test above does not exploit the **known terminal plaintext**. A more decisive candidate reads the **256** original pp49–51 table bytes under the same p15-derived AES-256 models, then places the decoded 256 bytes back onto their original 32×8 physical coordinates. In the original 32×8 rectangle, the outside single-cell circumference has **76** cells and the 30×6 interior has **180**; p55 contains **76** still-unknown GP29 runes, while solved p56 and printed-clear p57 contain **85 + 95 = 180 independently known** GP29 runes. Solved p57's literal “shed our own circumferences” provides a human reason to propose this positional assignment. It **does not** supply the missing AES algorithm, key mode or byte-to-rune transport.

For each of the original frozen **48** AES-256 decryptions (p15 printed/spiral key order, BE/LE uint16 packing, p50 radix59/60, printed row-major/eight-column input, and AES-ECB/CBC/CTR with standard null/zero IV), restore 32×8 positions before comparing the **180** row-major inner cells with **two** independently fixed terminal registers: authentic p56 solved plaintext plus p57 clear, or original p56 printed ciphertext plus p57 clear. Test exactly three source-visible byte-to-GP interpretations: direct GP index byte 0–28, byte modulo29, and a byte literally equal to the target GP prime. No plaintext symbol, byte position, key or alignment is learned from the observed comparison. This gives **48 × 2 × 3 = 288** completely specified known-receiver tests, all on untouched original input.

**Original outcome:** the **highest** agreement for **any** of the 288 variants is **11/180** known symbols, with **zero** fully matching known-receiver models. The ordinary `decodedByte mod29` comparison against genuine solved-p56/plain-p57 also reaches at most **11/180** (radix60, printed p15 uint16 BE key, row-major p50 input, ECB AES). Such isolated matches are normal in 180 GP29 comparisons; they are nowhere near the exact **180/180** required to propagate the key to the unknown p55 perimeter. More importantly, a **synthetic original-shaped 256-byte table** is encrypted with the identical p15 spiral big-endian AES-256-CTR model, containing the **actual 180 known original terminal GP29 runes** at all exact inner coordinates and a deliberately concealed **76-rune clear-p57 register** on the perimeter. The test decodes all **180/180** known inner cells and **76/76** withheld outer cells exactly. This is a complete true-mechanism positive under the proposed receiver, rather than a score alone.

**Incremental decision:** reject the direct **p15-derived AES-256 decrypt p50 table → fixed GP29 byte transport → known terminal180, then p55 outer76** route for the declared 48 AES variants, both terminal registers, and three GP byte encodings. This known-plaintext obstruction is stronger than the preceding 256-byte ASCII/GP frequency screen because the proposed endpoint is independently known and exact. A source-authored alternative KDF/IV, spatial assignment, codec or evolving state remains unselected and outside the negative.

[Original-input CJS test](../sims/lp2_p15_aes256_terminal180_knownplaintext_sft.cjs) passed [Windows Node.js 22 Actions run 45021526879](https://github.com/FlareZ123/liber-primus/actions/runs/45021526879), including the exact original p56 prime-totient inverse, table radix checks, all 288 comparisons, an authentic 180-rune known-plaintext register, and the 76/76 withheld-runic positive. The existing report's previous 48-model direct-ASCII and raw-GP statements remain valid.

**Decision:** retire the **direct p15 16×uint16 → AES-256 → original pp49–51 table → plaintext ASCII/GP29** interpretation under these frozen radices, orders and standard no-IV/zero-IV modes. The table might contain binary ciphertext, compressed material, keyed state, or a different historical representation. None of these is selected by this experiment. Require an authored instruction or independent key/IV or payload header before expanding this AES branch. Nothing here changes the unresolved-book research synthesis or the p15 spiral decipherment.
**Original-source CI:** The complete 48-model SFT and its two native-format plants passed in [GitHub Actions run 43479106941](https://github.com/FlareZ123/liber-primus/actions/runs/43479106941), invoked through the repository's existing manual Fibonacci-square runner.

