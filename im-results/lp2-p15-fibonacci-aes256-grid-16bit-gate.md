# LP2 p15 Fibonacci-prime square as literal AES-256 key for the original 256-byte table

**13 November 2026, Agent 46. Original-cipher bounded negative with a complete source-derived-key planted inverse.** Neither unknown LP2 plaintext, authentic key, decipherment, original hidden binary file nor continuation was recovered. The original-key hypothesis was chosen from the visible page geometry, not inferred from a decoding score.

## Human-solve-path premise and its weak point

Physical LP2 p15 prints a **4×4 Fibonacci-prime spiral** of sixteen integers, each fitting in 16 bits. Separately, pp49–51 print a **32×8 numeric grid** that the established base60 reading maps to **256 bytes**. Exactly sixteen big-endian two-byte source integers make a **32-byte key**, the precise width of AES-256; sixteen little-endian numbers give the conventional alternative. This is a genuinely different natural key packing from the previously tested **16-byte AES-128** transformations in [the original p15 AES-128 grid study](fibonacci-aes128-grid-direct.md).

The weakest premise is the absence of an LP2 instruction prescribing AES-256, endian choice, a grid byte-ciphertext interpretation, mode, IV, or ciphertext byte traversal. The equality of the two source widths is a **possible clue**, not authentication of this attack. To avoid unconstrained key fitting, all variants are fixed from the published square and row-major table before assessing the ciphertext.

## Fully reproducible original-cipher test

The original p15 displayed numbers in row-major order are:

`[3258,3222,3152,3038,3278,3299,3298,2838,3288,3294,3296,2472,4516,1206,708,1820]`.

The original center-out outward spiral order, as independently established in [the source reconstruction](../results/lp2-p15-fibonacci-prime-spiral.md), is `[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12]`. Interpret each of the sixteen values directly as an unsigned 16-bit word, or take its source-obvious nonnegative difference `abs(3301 − value)`. Retain only printed-row versus source-spiral order and big- versus little-endian serialization. These define **8 exact 32-byte AES-256 keys**, independent of unknown text.

For each key, read the exact **256 original table bytes** from `resources/liber-primus/base60-grid.json`, SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`, in printed row-major, reversed row-major, or column-major order. Apply the three standard AES-256 decryption modes ECB (no IV), CBC (zero IV), and CTR (zero counter IV), with ECB/CBC unpadded because 256 is divisible by 16. Thus **8×3×3 = 72** completely named original-cipher inverses. The zero IV/nonce is a test convention, not a genuine source clue. No key bytes, offsets, passes, Unicode letter substitutions, mode parameters, source values, or outcome flags are fitted.

For a **direct plaintext interpretation**, a successful entire 256-byte output must be either standard ASCII printable/whitespace throughout (bytes `0x20..0x7e`, tab, CR, LF), or a literal **one-GP-rune-per-byte** sequence with every byte in `0..28`. These exact necessary conditions avoid scoring attractive five-letter substrings as decrypted content.

## Original input finding and decision

Across all 72 direct AES256 decryptions:

- **0 / 72** recovered 256 printable/whitespace ASCII bytes.
- **0 / 72** recovered 256 literal GP29 index bytes.
- Best original decoded candidate had only **118 / 256** printable/whitespace bytes. The greatest GP29-range byte count was **44 / 256**.
- All 72 transformations exactly re-encipher the original source bytes. Independently, each of the three AES modes enciphers a full **256-byte planted English-text byte message** using a source-derived 32-byte key and recovers **256/256** bytes without loss. These exact reversibility controls validate the implementation; they do not authenticate the historical key.

**Decision:** reject direct same-width AES-256 plaintext extraction from the original 256-byte table under the 8 unadjusted keys and 3 ordinary modes/IV conventions. Unlike AES-128 (already exhaustively tried), this test checks the natural **literal 16×16-bit** key packing. It does not exclude nontext binary payloads, genuine unknown nonce/IV values, some other creator-specified transform, another plaintext register, or steganography. There is no rationale to expand to arbitrary IVs, per-cell offsets or postselected key derivations until an independent original instruction selects them.

**Executable reproduction:** [single-file CommonJS source](../sims/lp2_p15_fibonacci_aes256_grid_sft.cjs), requiring only standard Node.js 22 `crypto`, `fs`, `path`, and the checked-in canonical base60 grid. The program asserts the table's exact SHA-256, 72 original round trips and the full AES-256 positive plant. The preceding counts were independently computed with Python's `cryptography` AES implementation on the same canonical grid and source-number vectors; the CJS SFT is retained for reproducibility.
