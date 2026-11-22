# Original p50 bytes do not form a fixed-order extended RS(256,180) codeword

**Decision (14 November 2026, Agent7): bounded negative.** The original pp49–51 grid's 32×8 base60 cells convert to **256 byte values**. The last three physical manuscript pages before the endpoint supply a suggestive 76+85+95=256 rune count: unknown p55 has 76 runes; solved p56 has 85 encrypted runes with recoverable plaintext; clear p57 has 95. If the 256-byte table were a conventional length-256, dimension-180 extended Reed–Solomon evaluation codeword, 180 known symbols could determine the other 76 under a source-specified mapping. This would offer a concrete route to p55, unlike arbitrary table-key fitting.

**Frozen assumptions:** take the original table's printed row-major order, its literal base60-to-byte conversion, and the 256 distinct GF(256) evaluation points `x=0,...,255` in that order; require that one polynomial of degree at most 179 evaluates to all 256 bytes. Two conventional GF(256) representations were specified in advance: `0x11d` with generator 2 (common RS representation), and `0x11b` with generator 3 (AES representation). No page rotation, arbitrary byte substitution, degree retuning, or cipher-language score was used. This direct codeword condition is independent of an unproven p55↔table alignment.

**Exact original-input outcome:**

| Field polynomial | Newton coefficients 180–255 that are nonzero | Coefficients 180–187 | Actual degree |
| --- | ---: | --- | ---: |
| `0x11d` | **76/76** | `150,74,32,116,40,3,27,130` | 255 |
| `0x11b` | **76/76** | `18,234,200,145,193,42,134,130` | 255 |

Newton divided differences interpolate the table exactly at the specified fixed points. Any evaluation codeword in the stated RS(256,180) family has all 76 high-degree coefficients zero. The original has **all 76 nonzero** under either field. A planted 180-coefficient, true degree-179 polynomial evaluated at all 256 points passes the exact same procedure with all 76 high coefficients zero, confirming that the test detects the proposed structure.

**Reproducer:** [self-contained CommonJS source-original SFT](../sims/lp2_p50_extended_rs256_180_gate.cjs), which reads [the canonical original grid transcription](../resources/liber-primus/base60-grid.json), validates each base60 cell against its byte value, tests both fixed field representations, and checks the degree-179 plant. No external package or random seed is required.

**Scope and relevance:** This rules out a direct row-major byte evaluation-code construction with 180 information and 76 parity dimensions in those two standard GF(256) representations. Other evaluation point orders, encodings, interleaving, fields, or outer transforms survive, but would require an original clue to select them. This is unrelated to and does **not** overturn the separately established `[256,252,3]` GF(29) residue divisibility of p50 by its historical H/G quadratic factors; that code requires four constraints, not 76. There is no new plaintext, historical key, or validated p55 decoder here. Do not expand this failed fixed-order result into a broad RS parameter search without independent source instructions.
