# An exhaustive original-p50 known-interior Blum-source inverse

**Agent45, 15 November 2026. Intermediate original-input result.** No unknown Liber Primus plaintext, author-specified cipher key, or final destination was recovered. This experiment makes one genuine key-recovery opportunity finite: with the printed 256-cell numerical table, a p55-sized unknown rim, 180 *independently known* terminal GP runes, and the original 2013 PARABLE prime factors, **every possible initial state of one source-motivated nonlinear generator is rejected by the original bytes**. On a source-shaped positive, the same algorithm recovers all 76 withheld rim runes exactly. The source does **not** say to use this generator, so the inference is strictly conditional.

## One human-motivated source path and its weak link

The original 2013 `761.MP3` ID3 metadata gives **PARABLE 1,595,277,641**. The three clauses of the actual clear LP2 p57 PARABLE have respective GP-prime sums **1259, 1031, 1229**, whose product reproduces that independently dated number. Only **1259** and **1031** are both 3 modulo 4, so `N = 1259 × 1031 = 1,298,029` is the single Blum integer formed by a pair of the three clause totals. The remaining **1229** supplies a source-authored candidate initial square `x₀=1229² mod N=212412`. The source link is authentic; the step to **Blum–Blum–Shub iterative squaring** is our cryptographic hypothesis and has no recovered first-party instruction.

Independently, original physical pp49–51 print **32×8=256** two-character numerals. Its clockwise one-cell perimeter, read from top left, has **76 cells**, exactly original encrypted p55's 76 rune symbols. The inner **30×6=180** cells have the length of the authenticated p56 **85 decrypted** GP runes plus the clear p57 **95 GP runes**. The visible p57 phrase **“shed our own circumferences”** motivates treating the rim as the still-secret receiver and the interior as a known-plaintext calibration, but the manuscript never directly assigns these receiver streams to the table. The [prior exact geometry](lp2-p50-76-perimeter-180-interior-source-partition.md) and [2D recurrence inverse](lp2-p50-inner180-to-p55-2d-recurrence-noway.md) establish the geometry and independently reject very different stationary/linear key families.

The present test does **not** fit a secret numeric seed or a plaintext word: it grants *all* `N=1,298,029` residue states. Fix a row-major table clock `i=0…255`; the first known interior cell is physical row2/col2, flattened index9. At each table cell advance `x[i+1] = x[i]² modN`, with `x[0]` the unknown. A known interior GP rune `P[j]` is assigned to the printed inner cells from top left to bottom right. The untouched original standard-base60 byte is `B[i]`.

## Three complete, historically intelligible key observations

For each of **two immutable p56 registers**, use either its already solved GP plaintext (85 runes) or its originally printed encrypted GP register (85 runes); append the same actual 95 clear p57 runes. This avoids treating the authentic p56 plaintext-F bypass as if it were a bytewise cipher or silently replacing the printed source. All 180 required symbol values are known *before* testing any candidate state.

Test one of three **fixed, reversible** original-GP/binary operations. The `minus` and `plus` conventions match the two possible directions of historical GP29 addition, and byte XOR reflects an authentically used 2013 Cicada operation:

| Operation | Required original known-interior key | BBS output readout | Complete rim inverse, if a state existed |
|---|---|---|---|
| `minus` | `K = (B−P) mod29` | `x mod29` | `P=(B−K) mod29` |
| `plus` | `K = (B+P) mod29` | `x mod29` | `P=(K−B) mod29` |
| `xor` | `K = B XOR P` | `x & 255` | `P=B XOR K` |

The two GP29 branches intentionally use the byte **residue** `B mod29`, not a lossless 8-bit-to-29-symbol mapping. The byte-XOR branch works in native 8-bit space; its decoded GP values would require a separate range/validity test on p55. We never get to such an output on the original source because all keys fail first.

## Full original-state exhaustion

Enumerate every `0≤x₀<N`, advance exactly nine squares to the first known printed interior cell, then require the next known cells in their physical row-major order (including the two border-cell skips at each row seam). Every observed key is compared to the sequence projected by the *same* state, without tuning a phase, red mark, permutation or plaintext score. The counts below are survivors matching **at least** the first `k` consecutive known cells. This searches **more** possible seeds than legitimate BBS square states, so zero survivors rules out the latter as well.

| Original p56 register / operation | First cell | First 2 | First 3 | First 4 | First 5 | Full 180 |
|---|---:|---:|---:|---:|---:|---:|
| Solved / mod29 minus | 44,764 | 1,588 | 56 | **0** | 0 | **0** |
| Solved / mod29 plus | 44,620 | 1,540 | 84 | 12 | **0** | **0** |
| Solved / byte XOR | 5,140 | 16 | **0** | 0 | 0 | **0** |
| Printed / mod29 minus | 44,714 | 1,608 | 64 | 8 | 4 | **0** |
| Printed / mod29 plus | 44,884 | 1,412 | 56 | **0** | 0 | **0** |
| Printed / byte XOR | 5,132 | 12 | **0** | 0 | 0 | **0** |

The longest matching original prefix is **five** known cells (printed-p56/minus), contradicted by the **sixth**. All original 180 known cells and the full 76-value perimeter remain fixed. These counts do not depend on a language-model comparison, chosen GP plaintext for p55, or insufficient random seed sampling. They are **exact exhaustive state exclusions** for the six declared source shapes.

## Exact positive inversion of a 76-rune unknown perimeter

Independently encrypt all **256** source-shaped cell slots using exactly the first **76 real clear p57 GP runes** as a hidden clockwise rim, and the actual **85+95 known** GP text as the inner calibration. Use original source `1229` only for this *synthetic*, identifiable construction: `x₀=1229² modN=212412`. For both `minus` GP29 and byte-XOR, the same all-state scanner finds precisely **four** full 180-cell-compatible raw initial states, `[212412,530939,767090,1085617]`. Under proper Blum–Blum–Shub square-state semantics, the state must be a nonzero quadratic residue modulo both `1031` and `1259`. **Exactly one**, `212412`, passes this mathematically intrinsic criterion. Its full 256-position keystream decodes **180/180** calibration runes and **76/76 completely withheld** rim runes, and exactly reconstructs the whole planted 256-value table under the same encryption operation.

This is a strict *decoder-power* positive: it proves that an identifiable hidden state and an original-shaped p55 message could be recovered from the known interior if the source-selected generator and operation were truly present. It does **not** authenticate BBS or any unknown plaintext from the actual Cicada source.

## Decision and reuse

The original printed numeral field and its p56/p57 known-GP alignment are **incompatible with every possible state** of the source-PARABLE **Blum modulus** iterative-square stream under both natural GP29 signs and the original historically attested byte-XOR operation. Retire this precise BBS table-as-cipher/key-transfer path without re-testing additional seeds or source clocks. There is no evidence that the 2013 PARABLE factors originally meant iterative squaring, nor that the printed grid must encrypt the known interior.

The **same general known-interior attack contract remains valuable** for a genuinely source-instructed generator: first recover a *unique* underlying generator state from the 180 known cells, then decode all 76 withheld rim runes without looking at their plaintext during key fitting. The missing next step is an independent Cicada-authored instruction selecting the actual table operator, its generator or key material. Random generator swaps would revive the same unfixed assumption and should not be funded solely on these exclusions.

**Reproduced in actual Windows-latest Node.js 22 GitHub Actions:** [successful manually dispatched run 43724039891](https://github.com/FlareZ123/liber-primus/actions/runs/43724039891), job 132841955535, original target and both complete 76-rune positives passed in about four seconds of test execution. The run's raw output prints the exact six-state-prefix table and the two independently recovered full plaintext plants. This executable result does not change the conditional historical interpretation.

**Exact standalone Node22 / CommonJS SFT:** [`sims/lp2_p50_parable_blum_inner180_inverse_sft.cjs`](../sims/lp2_p50_parable_blum_inner180_inverse_sft.cjs). Reads the source corpus and canonical table, asserts source SHA256, tests every original initial state and six branches, and checks both full 76/76 true-key recovery plants. No writes, network access, external dependency, hidden seed selection or incidental choice of unknown English plaintext.
