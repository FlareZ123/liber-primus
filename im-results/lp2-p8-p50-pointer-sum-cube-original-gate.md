# Original p8 / 256-cell table: uniquely invertible pointer-sum and cubic model

**21 November 2026 — Agent49, independent original-clue research. Status: bounded negative on original p8 ciphertext.** Six exact, reversible GP29 original-source inversions recover no previously unknown text. This is a candidate mechanism test, not a Cicada-authenticated radix selector.

## Why this model was selected

Original physical p8 (25.jpg) has exactly **255 runes**, uniquely among the unknown rune-bearing pages. Original pages p49–p51 (66–68.jpg) print **256 two-character numeric tokens** in a 32×8 table. The immediately preceding physical p7 finishes with the red GP29 rune **M=19**, yielding one visually contiguous 256-rune input if that final rune is used as a leading initializer. As a rival boundary convention, append p9's first rune to p8 instead. This exact length pairing was previously tested by Agent16 as a raw byte XOR and as a conditional running-key pad; it had **not** been tested as a whole-graph neighbour-sum inverse.

The authenticated 2016 signed hint treats **numbers as direction**; this motivates a directed table-value-as-address *hypothesis*, though it does not actually specify a radix, address origin, ring graph or arithmetic. The original p8 first red word `XIXM` makes **19** visible, while the second word's GP29 index product is **3**. In GF29, 3×19≡1 (mod28), so exponent3 and its inverse19 are one fixed nonlinear alternative to a bare sum. They were previously identified as source arithmetic by other agents.

## Exact reversible hypothesis

Use the original table tokens in physical row-major order, zero-based addresses0…255; read two-character numeral values with either the declared base60 alphabet or the one-character-deleted base59 candidate. Define the resulting directed edge `f(i)=table[i]`.

The reported table-graph topology supplies a **new algebraic discriminator** for the simplest full-register mixing operation

`C[i] = P[i] + P[f(i)] mod29.`

For any functional graph, the GF29 linear transform `I+A_f` is invertible exactly when **all its directed cycles have odd length** (because 29 is odd). The base59 graph has a **single cycle, fixed point189**, and every node leads to that root. Its inverse is particularly simple:

1. `P[189] = 15*C[189] mod29` (15 is 2 inverse modulo29).
2. Recursively for each other cell, `P[i] = C[i] - P[f(i)] mod29`.

The base60 graph has an **11-cycle and a 2-cycle at 158↔249**. Along the two-cycle the plus-sum model requires `C[158]=C[249]`; both natural original-p8 alignments violate this equality. Base60 therefore cannot be directly inverted under this exact model. This is a structural property of the **assumed** neighbour-sum cipher, not an unconditional argument that the author intended radix59.

For the p8 Roman/cubic cue, also test the two frozen bijections

`C[i] = (P[i] + P[f(i)])³ mod29` and
`C[i] = (P[i] + P[f(i)])¹⁹ mod29`.

Invert by respectively raising original ciphertext symbols to19 and3 before using the same graph recursion. No language fitting, offset sweeps, missing-rune filler guesses, key search or extra substitutions are admitted. All six original inverses have exact full ciphertext forward replay; separately planted whole-register native GP29 clear-p57 controls invert exactly.

## Original-source results

| 256-input alignment | Linear P-body IoC | Cube P-body IoC | Cube-root P-body IoC |
|---|---:|---:|---:|
| p7 final M19 + p8 | 0.033942 | 0.035439 | 0.032922 |
| p8 + p9 first rune | 0.032752 | 0.034452 | 0.034180 |

Body means the 243 original black p8 rune positions after twelve red heading runes. All six values remain near the uniform-GP29 IoC of1/29≈0.034483; the original clear-p57 control has IoC≈0.062710. None yields a readable continuous plaintext in its original source order. Example of the cube inverse's first decoded 37 indices for the leading-p7 alignment, rendered as GP transliterations: `X X E O N G E T A N Y IA OE D P L AE G S H T IA A R P C F C TH B J U T U G U NG`. These are encoded outputs, not decoded English words.

The exact original source inputs, all cycle checks, both input alignments, three fixed operators, full forward re-encryption and solved-p57 synthetic plants are implemented in [the read-only Windows Node22 SFT](../sims/lp2_p8_p50_pointer_sum_cube_inverse_sft.cjs), executed successfully against the committed original corpus in [Windows Actions run 44949543398](https://github.com/FlareZ123/liber-primus/actions/runs/44949543398). No claimed decoding of the entire LP2 manuscript is made.

## Research decision

The link between p8's 255 runes, the original 256-cell table and the neighbouring M19 rune is a compact human-visible input hypothesis, and the odd-cycle inversion theorem gives a useful explanation of why **base59** permits one very simple reversible pointer operation where base60 does not. However, none of the six required untouched original-cipher readouts produces plaintext. **Retire this exact neighbour-addition/cubic family.** Future work should demand an authored pointer operation or a first-party clue to the value-to-address reading before introducing additional table phases, page fillers, graph powers or tuned symbol maps.

Related negatives: [p8 raw table-XOR gate](lp2-p8-p50-table-byte-xor-gate.md), [p7/p8 cubic five-tap inverse](lp2-p7-p8-roman-cuberoot-fivetap-original-gate.md) and [p7/p8 source red-field reconstruction](lp2-p6-p8-red-shamir-dh-fullstate-coverage.md).
