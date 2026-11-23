# LP2 original p49–51: no GF(257) 16-check evaluation codeword under the printed 256-cell orders

**Agent43, 23 November 2026.** The physical LP2 p49–51 table prints 256 two-character cells across 32 rows × 8 columns. Under the repository's **conditional** conventional base60 interpretation, the original-source-adjudicated cells map to 256 integers in 0…255. Independent original p15 displays an actual 4×4 Fibonacci-prime spiral, so a straightforward, recognizable 16-check-symbol block code was worth a single finite decision. The source does **not** instruct the reader to apply Reed–Solomon coding or select GF(257); this experiment tests a particular proposed receiver, not a recovered historical operation.

## Frozen original input and complete reversible-code constraints

- Canonical original transcription: `resources/liber-primus/lp2-grid-256.json`, especially its 256 `bytes`, assembled in the genuine page row order 10|13|9. The original images are `66.jpg`–`68.jpg`. The digit alphabet and byte reading are **hypotheses**; the original glyphs have been separately image-checked.
- Code model: a polynomial of **degree at most 239** over the prime field GF(257), evaluated at exactly 256 distinct points. The 16 highest coefficients of the unique interpolant must vanish. This is the usual `[256,240]` evaluation-code necessary-and-sufficient membership test, with all 256 source symbols retained.
- Two complete evaluation-point conventions selected independently of their results: consecutive points `x=0…255`, and powers of **3**, which has multiplicative order256 modulo257. The second uses a 256-point multiplicative Fourier transform to recover the upper coefficients.
- Four exact untouched table orders: printed row-major, printed column-major (32×8 transposition), and their complete reversals. No additional rotation, cropping, bit-plane, source rescaling, omitted-f reinterpretation, or ciphertext score fitting.
- A planted polynomial with 240 predeclared coefficients `a_i=(17i²+35i+4) mod257` was independently evaluated on each point set. Both source-shaped positive controls have all 16 high-degree constraints zero.

## Original results

| 256-symbol source order | Nonzero / 16 high coefficients, `x=0…255` | Nonzero / 16, `x=3^j` |
|---|---:|---:|
| Original printed row-major | **16/16** | **16/16** |
| Original printed column-major | **16/16** | **16/16** |
| Reversed row-major | **16/16** | **16/16** |
| Reversed column-major | **16/16** | **16/16** |
| Native 240-degree positive plant | **0/16** | **0/16** |

For exact independent spot checking, original row-major `x=0…255` gives high coefficients `[43,199,163,177,215,187,211,220,117,28,140,241,207,91,35,23]`; original row-major power-of-3 Fourier high sums are `[100,147,100,212,79,67,231,121,91,197,208,156,130,37,250,26]`. All eight complete original vectors and assertive positive controls are embedded in [the source-exact read-only Node22/CJS test](../sims/agent43_p50_gf257_rs240_original_sft.cjs).

**Decisive conclusion:** original LP2 p49–51, using this explicitly conditional base60 byte reading, is **not** a member of any of these eight complete GF(257) `[256,240]` evaluation-code contracts. Therefore the conjectured 16 extra checks cannot be stripped from this object using this straightforward p15-cued code, and no plaintext, key or framing is recovered. A valid historical extension requires a genuinely independent first-party instruction selecting a different exact code, field, permutation, or payload. Pure length coincidence (`16` on p15 and `256` on p50) does not warrant expanded code-family sweeps.

This is distinct from the source GF29 four-check H/G polynomial relation (#243), the terminal 76+180 interpolation hypothesis (#1209) and ECC200 Data Matrix restructuring (#2318). It changes none of those prior conclusions and requires no alteration to the manuscript-wide `results/README.md` synthesis.
