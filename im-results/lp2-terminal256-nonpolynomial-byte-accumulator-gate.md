# Terminal 32×8 table: nonpolynomial GP29 byte-accumulator inverse gate

**Original-input experiment, Agent28, 16 November 2026.** This is an exact negative for a defined family of *reversible, byte-valued cumulative operations*, with a completely secret 29-entry alphabet and all 512 independent inner-ring orientations. It recovers **no unknown LP2 plaintext or authentic key**. It does not refute a different authored layout, variable-state operation, external key, or purpose for the 256-byte table.

## Original clue, rival and frozen register

Physical LP2 p50 prints 32×8 two-character numeric cells, conventionally parsed as 256 bytes. The terminal pages have exactly 76 original encrypted p55 runes, 85 printed p56 runes decryptable with the authentic prime-totient/plaintext-F bypass, and 95 original clear p57 PARABLE runes: 76+85+95=256. P57 asks the reader to shed circumferences and emerge from within. The 32×8 rectangle has four conventional perimeter lengths **76, 68, 60 and 52**. The only additional plausible historical operation used here is bytewise XOR, employed during separately solved 2014 Cicada stages. Modular byte addition is included as a near-neighbor alternative.

The strongest rival is that the numerical equality and parable are thematic, with no author-selected byte/rune coupling. Crucially, the first of the p55 76 runes is a carried `NG` completing a p54 word; this 256-register does not align exactly to 256 complete terminal-text runes.

Freeze two source-authenticated 180-rune registers, with identical segmentation:

1. **Solved:** genuine 85-rune p56 plaintext, recovered by subtracting consecutive prime-minus-one GP29 shifts while transparent plaintext F at original p56 local index56 consumes no prime, followed by p57's original 95 clear GP29 runes.
2. **Printed:** original 85 printed p56 ciphertext runes, unchanged, followed by p57's 95 clear runes.

Source files: [original 2014-equivalent LP2 corpus](../resources/liber-primus/lp2-corpus.json), [original-byte grid](../resources/liber-primus/base60-grid.json), [original JPEG archive and indexing](../resources/liber-primus/README.md). The proposed terminal mapping and operation are hypotheses. **No p55 rune participates in any fit.**

## Reversible model, exact all-secret criterion

Let `B_i` denote original grid bytes visited around the three **inner** physical rings of lengths 68, 60 and 52, and `P_i` the above known authentic GP29 rune. The literal reversible encoders tested are:

```text
XOR accumulation:   B_i = B_(i−1) XOR M[P_i]
Addition:           B_i = (B_(i−1) + M[P_i]) mod 256
```

The codebook `M[0..28]` is **completely unrestricted**: 29 arbitrary byte outputs; no assumption about Caesar, primes, monoalphabetic order or injectivity is needed for the necessary-condition rejection. One version shares `M` through the whole inner suffix. The more generous version allows a **different unrestricted map in each inner ring**, resetting the codebook at each shell. The first inner cell is omitted because its preceding byte would lie on the withheld outer ring; in the shell-local model the first byte of *every* ring is omitted. Original bytes and genuine known symbols then fix every byte difference `D_i`; all repeated occurrences of any one rune under the same map **must have the identical observed difference**. A single unequal pair is a proof of impossibility for every possible secret codebook.

All eight natural traversals (four corners × two directions) are tested separately and independently on each of the three inner rings: **8³=512 layouts** per register/byte operation/clock model. No plaintext scoring, fitted rune weights, or selected alphabet assumptions enter the check.

| Known 180-rune source | Operation | Map clock | Best contradictions | Checked byte differences | Best inner orientations | Exact fits |
|---|---|---|---:|---:|---|---:|
| Authentic p56 plaintext + clear p57 | XOR | One 29-byte map | **153** | 179 | [0,0,0] | **0/512** |
| Authentic p56 plaintext + clear p57 | XOR | Re-key each inner ring | **117** | 177 | [0,3,4] | **0/512** |
| Authentic p56 plaintext + clear p57 | Modulo-256 addition | One map | **154** | 179 | [1,0,1] | **0/512** |
| Authentic p56 plaintext + clear p57 | Modulo-256 addition | Re-key each inner ring | **119** | 177 | [0,0,0] | **0/512** |
| Printed p56 cipher + clear p57 | XOR | One map | **148** | 179 | [0,3,2] | **0/512** |
| Printed p56 cipher + clear p57 | XOR | Re-key each inner ring | **105** | 177 | [6,5,4] | **0/512** |
| Printed p56 cipher + clear p57 | Modulo-256 addition | One map | **147** | 179 | [0,2,0] | **0/512** |
| Printed p56 cipher + clear p57 | Modulo-256 addition | Re-key each inner ring | **106** | 177 | [0,7,0] | **0/512** |

These **4,096 exact original-input tests** rule out the declared byte-accumulator architecture even with unknown alphabet/codebook and independently chosen ring winding. The first contradiction appears at known offset3 for the solved register, offset10 for printed. Every tested register, winding and reset remains inconsistent. The contradiction count is the number of duplicate-symbol lookups inconsistent with first-occurrence assignments, and **is not** an optimized Hamming edit distance or cryptographic p-value. Relative to the source-authored GP alphabet, the best shared solved-register fit learns only 23 codebook entries; the printed-register fit learns 29.

### Calibrated decoder/forward positive

The [standalone original-source Windows Node22 SFT](../sims/lp2_terminal256_byte_accumulator_codebook_sft.cjs) also constructs two complete source-shaped *positive controls*, one for XOR and one for modular addition. It maps the authentic p56 plaintext+clear p57 through an unknown injective 29-to-256 byte table `M[j]=(37j+13) mod256`, encloses them with a withheld, original-source-like 76-rune p57 sample, serializes all 256 bytes through precisely the four physical original ring geometries, and uses only the known 180-rune suffix to recover the map. In each control, the independently withheld **76/76** symbols are decoded and the forward-generated bytes are reconstructible exactly. These plants validate the full recovery procedure and its boundary convention, without demonstrating an LP2 key.

## Decision for the terminal puzzle

A direct inward/outward shell byte accumulator is historically understandable and mathematically able to recover a 76-rune withheld prefix when the printed table is actually generated that way. **The original pp49–51 table is incompatible with this complete proposed family against independently known p56/p57 runes**, including generous secret lookup variants. A merely similar new family with free state per position would lose this falsifiability.

The original parable selects the qualitative idea of removing circumferences; it does **not** specify a byte combination operator, a start corner, a per-ring or page clock, the p56 printed-vs-decoded source register, or a GP29-to-byte receiver. The 256 length match and 180 known symbols alone cannot choose these missing instructions. Without a new original clue explicitly supplying a value-changing operation, further variations on this byte accumulator or already retired secret matrix, polynomial, RS, Shamir and static-state families have no causal route to plaintext. [Issue #1306](https://github.com/FlareZ123/liber-primus/issues/1306) retains the open question of a genuinely selected *different* nonpolynomial terminal receiver, and [Issue #41](https://github.com/FlareZ123/liber-primus/issues/41) remains waiting for a complete externally testable decoder.

**Reproduce:** `node sims/lp2_terminal256_byte_accumulator_codebook_sft.cjs` on the unmodified repository. All original input checks and both source-shaped positives are asserted; a wrong numeral/rune or winding convention fails loudly.
