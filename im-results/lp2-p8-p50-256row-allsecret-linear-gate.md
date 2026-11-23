# No fixed GF29 row-matrix bridge between the original p8 256 runes and p50 256 numbers

**Decision (Agent10, 23 November 2026):** The manuscript uniquely supplies a 256-rune frame on physical p8→p9 (omit its first complete four-rune red heading word, carry p8's incomplete final printed word through p9's first five runes). A separate p49–51 object prints 256 numbers in exactly **32 rows of eight**, with 2014-era possible byte interpretation as base60. This motivates a common row-wise linear secret transfer, but **no fixed unknown 8×8 GF29 linear or affine transformation can map the actual original table to the 31 original black/carry rows**. This excludes a whole family without specifying, searching or tuning a matrix. No plaintext/key is recovered.

## Exact original receiver

- Original `resources/liber-primus/lp2-corpus.json`: p8 indices4..254 (251 runes) followed by p9 indices0..4 (five runes) =256 GP29 ciphertext entries. Row0 is exactly the eight-rune second red title word, which is *excluded from training*; rows1..31 are printed black rune material.
- Original 32×8 `resources/liber-primus/lp2-grid-256.json` row-major numeric table (scans 66–68), interpreted with its declared base60 byte values, reduced modulo29 per cell. Base60 is inferred from the table, not Cicada-authenticated.
- Two complete secret-map hypotheses: **linear** Y_r=X_r M mod29 for *any* 8×8 M, and **affine** Y_r=X_r M+b mod29 for any same M and eight-symbol b. These preserve the physically matching eight-column row frame, forbid free row clocks or changing maps, and allow unknown coefficients learned only from the natural earliest black rows. With 8 or 9 training rows respectively, GF29 elimination uniquely solves each unrestricted map.

## Out-of-sample and exact consistency

| 2014-historical source-frame candidate | Training | Held-out 31 black/carry rows | Red rubric prediction | Global exact consistency |
| --- | --- | --- | --- | --- |
| Arbitrary fixed **linear 8×8** | 64/64 GP rune outputs matched | **5/184** predictions matched | 1/8 | **23 contradictory rows** when all31 black rows are fitted together |
| Arbitrary fixed **affine 8×8 + 8 constants** | 72/72 GP rune outputs matched | **7/176** predictions matched | 0/8 | **22 contradictory rows** when all31 black rows are fitted together |

The 64 and72 training matches are guaranteed by invertible training input matrices; they are **not** evidence for either hypothesis. Actual novel information comes from the explicitly held-out rows and the full-data contradiction. Every candidate with a fixed row-map is included, regardless of how hidden matrix entries are chosen; the exact full-row systems `X M = Y` and `[X|1] [M;b]=Y` are inconsistent over GF29.

A genuine original-table **nontrivial invertible 8×8 planted map** and independently an affine planted map both produce full **256/256** exact outcomes through the same solver, including all 184/176 black holdout glyphs. These positive controls confirm that the rejection is a consequence of original data, not a matrix implementation flaw.

**Reproducer:** `sims/lp2_p8_p50_256row_allsecret_linear_sft.cjs`, Node22 CommonJS, no dependencies. Reads original two sources, performs full GF29 elimination, asserts predicted holdout counts, full contradictions and both exact 256-symbol planted positives. **Windows PASS:** https://github.com/FlareZ123/liber-primus/actions/runs/45251245443.

## Scope and next decision

The p8→p9 256-rune framing is a genuine geometric observation, while identifying it with the much later table remains an interpretation. This test rules out a broad static linear/affine **table-to-ciphertext mapping**. It says nothing about a nonlinear or stateful keyed cipher, an unprinted table traversal, a source-selected byte compression or a table intended for some other page. A further full decoder requires an authentic operator that selects the pairing and a typed transformation before inspecting unknown-language outputs; arbitrary new matrices cannot rescue the exact inconsistency. Compare prior direct-byte, red-four Hill, fixed stationary byte→rune and changing-ring constraints in `im-results/lp2-p8-p50-4plus256-original-frame-pad-gate.md`.

**No unknown LP2 plaintext is identified.**