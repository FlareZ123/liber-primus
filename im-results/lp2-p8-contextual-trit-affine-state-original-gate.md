# P8 243-rune hypothesis: reversible contextual trit channels and an affine-state no-go theorem

**Agent4, 22 November 2026. Classification: finite source-typed original-cipher exclusions plus a general algebraic theorem. No recovered LP2 unknown plaintext, genuine key, intended register or destination.** This narrows [Director #2196](https://github.com/FlareZ123/liber-primus/issues/2196) without treating 243=3⁵ as author-authenticated cipher evidence.

## Source-visible premise and strongest rival

Physical LP2 p7 ends in five red words, whose Gematria Primus (GP29) index products are exactly **[11,26,8,15,2]**. The next physical p8 has **12 heading runes in red followed by 243 black runes**, and a visibly drawn tree/branch design. Since **243=3⁵**, a reader might suspect the full sequence of five-trit states is being enumerated. The black text nevertheless appears as normal punctuated manuscript text. No original instruction identifies a ternary state-register operation, a key clock, a node-label alphabet or a method of extracting plaintext from five-trit states. The rival is that the word count and artwork are incidental to ordinary encrypted prose.

Prior [exact static-class SMT](lp2-p7-p8-243-trit-nonlinear-original-consumer.md) already proves every single fixed 29-rune-to-three-trit mapping fails to turn p8's 243 black runes into a complete order-five ternary de Bruijn cycle. It does not test **context-dependent, ciphertext-recoverable trit labels**, whose meaning can change each time the same rune appears. Nor does it rule out an evolving register that is nonlinear in its state.

## Two fully reversible, ciphertext-recoverable contextual readouts

Freeze two innovations, both readable by a human with the printed GP29 chart. For each p8 black position `i=12,...,254`, use the actual earlier p8 ciphertext runes, including all 12 original heading runes as initial state:

1. **Historical-style GP29 predecessor subtraction:** `D_i = (C_i - C_(i-1)) mod 29`. The original solved p56 establishes GP29 modular subtraction as a valid past Cicada operation, though not this new p8 ciphertext-feedback transfer.
2. **Source-p7 five-word polynomial:** `D_i = (C_i - 11*C_(i-1) - 26*C_(i-2) - 8*C_(i-3) - 15*C_(i-4) - 2*C_(i-5)) mod29`. The five coefficients are the five actual preceding red-word GP29 products, frozen before any language scoring. This fifth-order combination is a conjectural consumer.

Extract `T_i=D_i mod3`, preserving `Q_i=floor(D_i/3)` along with the trit. **The pair (Q,T) is bijective with each GP29 innovation D**, so no original runes are lost. For either recurrence, once the genuine preceding original ciphertext runes are known, `C_i=(D_i+sum a_k*C_(i-k)) mod29` reconstructs every source rune exactly. The 243 trits alone are a deliberately partial state projection; calling them plaintext would be unjustified.

A complete cyclic ternary B(3,5) sequence requires that each of the 243 cyclic five-trit windows appears **once**. Testing this fixed property needs no guessed English, secret static rune map, cycle rotation or trained cipher.

| Contextual original trit projection | Distinct cyclic length-five windows in p8 black243 | Literal trit counts 0/1/2 | Disjoint p9 first243 control windows | Exact recovered source |
| --- | ---: | --- | ---: | ---: |
| GP29 predecessor difference | **164/243** | 74 / 83 / 86 | **160/243** | 243/243 |
| GP29 fifth-order p7-product feedback | **155/243** | 104 / 69 / 70 | **153/243** | 243/243 |
| Required complete ternary de Bruijn | **243/243** | 81 / 81 / 81 | n/a | n/a |

The disjoint p9 control consumes p9's first243 actual ciphertext runes after the **last five original p8 runes** as preceding state, with unchanged coefficients and no independently fitted IV. Both p8 results violate the required all-five-tuples condition. The second p8 model also fails necessary trit balance. The p9 values are descriptive holdout controls, not a source prediction that p9 contains a second codebook.

A **constructive historical-heading-seeded positive** feeds an exact standard ternary B(3,5) (FKM construction) as 243 GF29 innovations into each same recurrence, initialized using the untouched actual p8 red12. The decoder recovers every source trit and all **243 unique cyclic windows**, then forward-reconstructs the entire 255-rune planted page. Thus the failure on real p8 is discriminatory for these named full-state-cycle contracts. The planted ciphertext is an implementation control only, not a claim about manuscript plaintext.

## All-secret affine five-trit update is structurally impossible as a 243-cycle

A stronger exclusion needs **no** assumption about the printed p8 rune values. Suppose an ordinary affine register over five trits, with any secret coefficients and offset, advances by

`s_(i+1) = A*s_i + b` in `GF(3)^5`.

A complete order-five ternary de Bruijn cycle must visit **all 243 distinct five-trit states in one cycle**. Such an affine state permutation would have order divisible by `243=3^5`. But every affine five-dimensional transformation embeds as a linear **6×6** matrix `B=[[A,b],[0,1]]` over `GF(3)`. For any invertible such matrix, its 3-power-order part is unipotent `I+N` with `N^6=0`. In characteristic three, `(I+N)^9=I+N^9=I`. Therefore the 3-power part of the order of **every** such affine transform divides **9**, far below 243. If A were singular, the transformation could not permute all243 states to begin with.

**Conclusion of theorem:** no fixed five-trit *linear or affine* feedback shift register, even with arbitrary hidden coefficients, offset, state seed or state-basis change, can itself traverse all243 five-trit states in one cycle. A true complete ternary B(3,5) must use some nonaffine update (e.g. nonlinear feedback) or a distinct external input clock/state extension. This theorem is a necessary structural constraint under the de Bruijn interpretation; it does **not** establish that the original p8 was meant to be such a cycle.

## Decision and reproducibility

The two source-visible **contextual** 29→3 readouts fail on the original p8, complementing the already-complete static-map UNSAT without repeating that expensive search. The affine no-go closes an entire hidden-key register family before proposing a key. Do not extend these negatives to arbitrary trit substitutions, free coefficients, selected bit positions, or newly tuned ciphertext orderings. The remaining de Bruijn hypothesis needs an **independent first-party rule** selecting a nonlinear feedback update, state observation and source-to-plaintext operation; none is visible in the tested artifacts. Without this input the stronger, simpler explanation remains ordinary enciphered prose of length243.

Reproducer: [original-source Node.js 22 CommonJS SFT](../sims/lp2_p8_contextual_trit_reversible_sft.cjs). It asserts the complete original p7 final red14, p8 red12/black243, p9 length, exact original GF29 reinversion on both pages, frozen observed trit/window counts and complete positive B(3,5) planted recovery. The original-input test **passed Windows Node.js 22** with all deterministic source and planted-positive assertions: [Actions run 45002726332](https://github.com/FlareZ123/liber-primus/actions/runs/45002726332). No new input asset or correction to `results/README.md` is warranted.
