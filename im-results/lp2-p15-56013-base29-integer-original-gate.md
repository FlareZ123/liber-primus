# LP2 p15 full-register BASE29 integer + actual 2013 DATA/560.13 XOR

**13 November 2026, Agent26. Original-cipher, complete historical-file negative.** No unknown LP2 plaintext, actual key, cipher or destination recovered.

## Fixed original-source operation

The original p15 nine-rune red heading GP indices `[0,1,20,19,24,28,26,22,24]` form **29,553,734,724** as one positional BASE29 integer. Division by authentic 2013 BASE29 modulus **3301** yields quotient **8,952,964** and remainder **560**. The previously documented p15 Fibonacci-prime square selects historical CicadaOS dataset suffix **13**, hence the candidate `DATA/560.13` at byte offset 8,952,964. The complete source file is 118,818,811 bytes (SHA-256 `db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f`).

**New bounded test:** take the exact following original **1,894 rune GP29 digits** (p15 local9 through p22 end), convert them as one full positional BASE29 integer to **minimal unsigned big-endian bytes**, and XOR those bytes against historical `DATA/560.13` from offset8,952,964. The signed 2013 BASE29 operation and its historically applied DATA-byte XOR operation motivate this composition. The manuscript itself **does not** supply a verified instruction to connect them. Direct rune-wise XOR/addition/five-bit/rank28 tests at this precise source offset were already negative ([earlier report](lp2-p15-base29-56013-selector-gate.md)); this tests a genuinely different byte register.

## Executed original result

The [actual Windows GitHub Actions run 43422400076](https://github.com/FlareZ123/liber-primus/actions/runs/43422400076) completed successfully on the authentic hash-verified complete DATA file. The exact [CommonJS reproducer](../sims/lp2_p15_56013_base29_integer_xor_sft.cjs) asserts the title arithmetic and source.

| Metric | Original BASE29 bytes | XOR-decoded candidate |
| --- | ---: | ---: |
| Length | 1,151 | **1,151** |
| Printable ASCII bytes | 429 | **410** |
| English alphabetic bytes | 247 | **235** |
| Spaces | 4 | **1** |
| Longest contiguous printable run | 8 | **6** |
| Named file-header signatures | 0 | **0** |
| First 16 bytes (hex) | `01661c4cb765b4c62b738b8bdd28ba89` | `7f00232758f4f9de652541980288a7ef` |

The 1,151-byte XOR output has no at-start gzip, PNG, PDF, ZIP, JPEG, bzip2, xz, 7z, PGP armour, SQLite, OGG, RIFF or Zstandard signature, and contains no contiguous readable English. Its SHA-512, SHA3-512 and BLAKE2b-512 digests each differ from the exact solved p56 512-bit deep-web hash. A separate **1,140-byte synthetic native-English sentence payload** was encoded and XOR-encrypted with the same authentic key bytes in the same full 1,894 GP29-rune container; the exact inverse recovered **all 1,140/1,140 original bytes**, confirming a powered deterministic positive control.

**Decision:** This specific source-specified integer-byte-XOR combination is not a straightforward plaintext or p56 preimage. It does not exclude another instructed frame, a different protected data format, an unknown prior/later cipher layer, or another historical source. Do not expand neighboring byte offsets or arbitrary byte phases solely to rescue this candidate. An authorial selector is needed for a successor.

Source context: [2013 signed protocol](../resources/external/2013-tcp-server-signed-source.md), [p15 original file-offset arithmetic and previously failed transfer](lp2-p15-base29-56013-selector-gate.md).