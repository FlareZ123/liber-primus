# LP2 p15 Fibonacci square as a literal AES key for the 256-byte numerical panel

**Decision (22 November 2026; Agent16).** The exact original p15 4×4 printed number square and the exact original p49–51 256-byte panel create a mechanically testable 16-cell → 16/32-byte AES key → 16-block candidate. **Four source-literal AES-ECB inverses yield no recognizable plaintext or conventional payload headers.** No unknown LP2 text, key, or authentic cipher mechanism is recovered. No larger KDF/salt/mode search is justified by this result.

## Independent original operands and reason to test

- Physical p15 scan resources/liber-primus/32.jpg prints sixteen four-digit numerals with red center 3299 and an infinity sign. Printed row-major: 3258 3222 3152 3038 / 3278 3299 3298 2838 / 3288 3294 3296 2472 / 4516 1206 0708 1820. Established center-out Fibonacci/prime spiral: 3299 3298 3296 3294 3288 3278 3258 3222 3152 3038 2838 2472 1820 0708 1206 4516. The source supplies a spiral start and a simple two-byte BCD representation per four-digit numeral.
- Physical p49–51 has 256 printed two-character entries in a 32×8 panel. Independently adjudicated radix60 serialization is precisely 256 bytes, SHA-256 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290.
- The shapes do **not** themselves prove a Cicada instruction to apply AES, ECB, BCD or either read order. This is a bounded candidate with unrelated-source objects as its rival.

## Exact frozen original-input experiment

Read the 256 bytes from resources/liber-primus/lp2-grid-256.json in original printed order. For each numeral order (spiral or printed row-major), form (A) 32 key bytes by packing each four-digit decimal numeral as two BCD bytes; (B) 16 key bytes by reducing each numeral modulo256. Decrypt the unchanged 256-byte source register using AES-256-ECB or AES-128-ECB without padding. Both source orderings and key serializations are fixed without fitting output. On each of four candidates, a planted 256-byte English positive control decrypts exactly, and forward encryption reconstructs all 256 source bytes.

| Number order | Key | Decrypted SHA-256 | Printable ASCII/control bytes among 256 |
| --- | --- | --- | ---: |
| Spiral | AES256 packed BCD | 9533939ec4efd387238051f2412b62df2dec4d52a27b17d0bf1dde6662cfb40f | 103 |
| Spiral | AES128 integers mod256 | a7134f88306701dab94e10ab68f4fa250a42001d3f1c0cc0e4d69dc8bdcff970 | 90 |
| Printed | AES256 packed BCD | b1f53f1488c657d831782e9e44ed7e7220a949d18c1e59c7f72f1fe010222e08 | 96 |
| Printed | AES128 integers mod256 | 34d1a2d05dabba57d0f170958b9c3ea76958d28fbcd64e97c70d5066fa631526 | 104 |

The outputs begin, respectively, 072610529f05481a0bee02c194ca4843; d5c6d61cb6691b4c49ef4b4734d7c59b; d9ad3f90d31c69dab9d66ea5ae5c49bc; fcdf9b83c8f7e1b08183ff4c52bf3e42. These are binary-looking and provide no independently verifiable instruction, English phrase, recognizable file magic, or Cicada address. Exact reencryption alone is expected for every wrong-key bijection.

**Reproducer:** [read-only original-source Node22 SFT](../sims/lp2_p15_fibonacci_grid_aes_256byte_original_sft.cjs). It pins the original grid SHA-256, both printed-number registers, exact decrypted digests, positive controls and exact original ciphertext replay. [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45043297342).

**Interpretation:** Retire these four AES consumers only. A broader p15→p49–51 relation requires a first-party clue specifying key serialization and cryptographic operation. This negative test does not change the authoritative no-plaintext status.
