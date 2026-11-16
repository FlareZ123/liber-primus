# Original p15 16-state operation versus all 256 p49–51 values

**Agent40, 16 November 2026. Evidence class: exact original-transcription mathematical obstruction plus one frozen source-derived matrix construction. No unknown LP2 plaintext, key or destination recovered.** This addresses Director [#1225](https://github.com/FlareZ123/liber-primus/issues/1225), distinct from the earlier p15→table geometry-only [#1154](https://github.com/FlareZ123/liber-primus/issues/1154) and from the p15/p39 quotient nonlinear state study [#1173](https://github.com/FlareZ123/liber-primus/issues/1173).

## Original objects and prior assumptions

The source p15 scan `resources/liber-primus/32.jpg` prints exactly this numerical 4×4, with red 3299 as the spiral origin:

```text
3258 3222 3152 3038
3278 3299 3298 2838
3288 3294 3296 2472
4516 1206  708 1820
```

All 16 numbers are already explained by `abs(3301−prime(F_distinct(n)+1))` along the source-visible square spiral ([established reconstruction](../results/lp2-p15-fibonacci-prime-spiral.md)). The independently printed p49–51 object is **32 rows of eight two-character tokens** (page lengths **80, 104, 72**). It carries no source-visible 16-column overlay: the p50→p51 page break is halfway through a hypothetical 16-cell row. All calculations below use the existing canonical `resources/liber-primus/lp2-grid-256.json`; in particular, base60 byte interpretation is an **extra hypothesis**, not an authenticated instruction.

## Exact obstruction to a literal 16-state Cayley table

A binary operation `*: S×S→S` with **16 states** has at most **16 output states**, whether the operation is associative, commutative, nonlinear, or noncommutative. Under any fixed one-token-per-output-state serialization `e:S→tokens`, the 256 entries of its 16×16 table therefore have at most **16 different printed tokens**. This is invariant under all row/column reorderings and relabelings.

The 256 authentic table tokens have **161 distinct token spellings** (also **161 distinct numeric bytes** under canonical base60). Hence the original table **cannot** be a direct serialized multiplication/transition-output table of a sixteen-element magma, quasigroup, noncommutative group, or other stationary 16-state binary operation. The contradiction is **161 > 16**, requiring no ciphertext scoring or proposed secret key.

A construction with a byte-valued *auxiliary output*, a position-dependent encoder, or a pair `(next_state, emitted_byte)` can evade this bound, but it is a materially different transducer. Neither p15 nor the table currently supplies such an extra encoding/update instruction. A 256-cell S-box with arbitrarily invented entries would also evade the bound at the cost of 256 unsourced values.

## One frozen nonlinear operation actually derivable from the 4×4 square

The straightforward matrix-algebra lift from a displayed 4×4 to a 16×16 is its **Kronecker self-product**, `M⊗M`. This candidate consumes all sixteen *printed p15 values* without a fitted key and makes a single 256-entry prediction. Granting the unselected base60-as-byte and folded 16-column conventions, its byte projection is

```text
P[16r+c] = ( M[4 floor(r/4)+floor(c/4)]
            × M[4 (r mod 4)+(c mod 4)] ) mod 256
for 0 ≤ r,c < 16.
```

It predicts the first printed-folded row as

```text
36 252 32 76 252 228 224 20 32 224 0 96 76 20 96 132
```

whereas the authentic first sixteen decoded cells are

```text
203 231 167 186 97 237 126 183 92 249 156 222 247 4 183 212.
```

The full exact prediction agrees at **2/256** positions, consistent with chance. The native generated self-product passes its implementation check, and changing the red 3299 value by one changes the generated table. This test rejects that precise unsourced lift; it cannot reject every possible stateful PRF or mixing function.

Two independent invariants of the *same hypothetical fold* strengthen the limited conclusion: the sixteen rows have distinct-value counts **[15,16,15,16,16,16,15,15,16,16,15,15,16,16,16,16]**, so they cannot all be bijective remappings of one fixed 16-value column tape; **0/120** opposite-position off-diagonal pairs agree, excluding a plain symmetric encoded binary operation in that fixed coordinate interpretation. These constraints depend on the unlicensed 16-column fold and must not be promoted to a manuscript-wide prohibition.

## Complete p15 matrix-power tape test (independent source-derived alternative)

The infinity ornament following p15's numeric 4×4 suggests iterating its matrix, producing sixteen 4×4 matrices = 256 coefficients. Before viewing the p49–51 table, fix actual matrix row-major order, one of the only two source-representations (printed unsigned or the Fibonacci-generator-restored signed pair), either power M^0 or M^1 as origin, and the only two typed output rings GF29 (table bytes reduced mod29) or bytes Z/256Z (table bytes unchanged). This defines eight exact 256-value predictions without a secret or fitted parameter.

| Matrix representation | Modulus | Powers begin at | Exact matches / 256 |
|---|---:|---|---:|
| Printed unsigned | 29 | identity | 11 |
| Printed unsigned | 29 | M | 7 |
| Printed unsigned | 256 | identity | 1 |
| Printed unsigned | 256 | M | 0 |
| Fibonacci-restored signed | 29 | identity | 2 |
| Fibonacci-restored signed | 29 | M | 8 |
| Fibonacci-restored signed | 256 | identity | 2 |
| Fibonacci-restored signed | 256 | M | 1 |

All eight literal matrix-power generators fail on the entire original table; none yields evidence of a creator-selected operation or unknown GP29 plaintext. These finite negatives do not forbid another source-specified serialization or stateful transducer, which would need its own independent instruction. The existing source-native [SFT](../sims/lp2_p15_tensor_grid256_sft.cjs) now asserts all eight results. This is a separate natural matrix-power lift from the earlier Kronecker self-product gate, without any arbitrary matrix or key search.

**Windows Node22 execution verified:** the complete source-native CJS SFT passed in [manual workflow run 43846010989](https://github.com/FlareZ123/liber-primus/actions/runs/43846010989), including the original 256-cell exact comparisons, generated control and wrong-source control.

## Reproducer and research decision

[`sims/lp2_p15_tensor_grid256_sft.cjs`](../sims/lp2_p15_tensor_grid256_sft.cjs) reads the unchanged 256-token canonical source, checks the original page splits, distinct counts, all 256 tensor predictions, printed first-row agreement, source-native plant, wrong-p15-value control and row invariants. It is a standalone Node22 CommonJS test with no extra dependencies.

**Decision for #1225:** a direct 16-state operation table is **mathematically incompatible** with the printed output diversity; the natural source-derived tensor-byte operation fails the full original prediction. The p15 Fibonacci-prime formula is genuinely reconstructed, but there is still no first-party cue selecting a p15→p49 state/byte generator, an auxiliary emission format, or a GP29 receiver. Therefore do not build a nonlinear decoder on 16² alone. Revisit only if an authentic 2014-readable instruction supplies an extra 8-bit emission law and its 32×8 row convention; then test all 256 original cells before consuming any unknown GP29 ciphertext.