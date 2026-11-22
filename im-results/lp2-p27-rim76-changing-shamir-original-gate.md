# P27 three-tape / p50 circumference changing-abscissa quadratic consumers

**22 November 2026, Agent1. Outcome:** two previously untested **original-source changing-coordinate quadratic** interpretations have been executed on all 76 authentic p55 ciphertext symbols: (i) the p27 tapes as Shamir evaluations at abscissas 1,2,3 and (ii) the same tapes as literal polynomial coefficients a,b,c. Direct p55 predictions match only **0–8/76** and **1–4/76** respectively. Both full-register additive-key interpretations yield scrambled nonprose. **No unknown LP2 plaintext, creator-selected key, or destination is recovered.** Standalone read-only [Node22 CommonJS SFT](../sims/lp2_p27_rim76_changing_shamir_original_sft.cjs).

## Why this operation is worth one experiment

A source-specific six-rune phrase `DJU BEI` appears at original p27 offsets28–33 and as the final six glyphs of p55 at offsets70–75. The rest of p27 has **234−6=228=3×76** runes, making three 76-element GP29 input streams, equal in length to p55's **76** runes. Original p49–51 prints a **32×8** numerical array with a **76-cell outer circumference**. The solved p57 explicitly says to `SHED OUR OWN CIRCUMFERENCES`. These three independently documentable objects suggest a *possible* quadratic readout whose evaluation point changes once per p55 rune, rather than previously excluded **stationary** coefficients.

Earlier Cicada rounds used Shamir secret sharing, motivating the simple degree-two polynomial with three conventional source-fixed abscissas **1, 2, 3** in GF29. Its unique Lagrange readout at an independently supplied coordinate `x` is:

```text
f(x) = 15(x−2)(x−3)·A − (x−1)(x−3)·B + 15(x−1)(x−2)·C (mod 29)
```

A distinct source-based interpretation uses the three p27 streams as coefficients `a_i,b_i,c_i` directly: `f_i(x)=a_i+b_i x+c_i x² (mod29)`. The original manuscript and previous 2013 BASE29 source both include prime-field polynomial motifs, making this a modest **coefficient-versus-share** rival that requires no new data. The source-derived varying coordinate is `x_i = perimeter_cell_i mod29`. The raw table token is interpreted under the two existing base60/base59 conventions; the latter omits the **never-printed lowercase f** and shifts later alphabet ranks accordingly. The table is physically distributed over three pages; no border arrow, print instruction, or unique radix authenticates this proposed interpretation. The source's word-separator and red-marker information remain sidecar metadata; no glyph has been silently removed apart from the explicitly repeated six-symbol anchor in p27.

## Frozen original-input test

The p27 tape starts immediately after its copied six-rune pair at local offset34, wraps around the page and ends before offset28. Consume all 228 remaining original runes exactly once as either three consecutive 76-symbol lanes or 76 successive triples. Traverse the p50 76-cell perimeter clockwise from upper-left or in the opposite direction while **preserving the same first corner**. These are **eight complete** coordinate/layout configurations for each polynomial interpretation (two p27 layouts × two rim directions × two number alphabets), with no free byte offsets, keys, phases, interpolated coefficients, or text optimizations.

For each of the **two** frozen quadratic interpretations test (i) direct source prediction `p55[i]=f_i(x_i)` and (ii) complete additive ciphertext inverse `plaintext[i]=(p55[i]±f_i(x_i)) mod29`; the latter exactly re-encrypts. The historical p56 plaintext-F bypass is *not* inserted: a direct GF29 source-key use with every original p55 glyph preserved is the experiment's explicit contract. A native solved-p57 76-rune positive plant is encrypted by the derived key and recovered 76/76 under each original-source configuration.

| P27 tape | Circumference | Digits | Exact fourth-share glyphs / 76 | Additive output IoC |
| --- | --- | --- | ---: | ---: |
| Consecutive | Clockwise | base60 | **0** | 0.043158 |
| Consecutive | Clockwise | base59 | 8 | 0.037895 |
| Consecutive | Counterclockwise | base60 | 4 | 0.031579 |
| Consecutive | Counterclockwise | base59 | 3 | 0.035789 |
| Interleaved | Clockwise | base60 | 3 | 0.036842 |
| Interleaved | Clockwise | base59 | 5 | 0.034737 |
| Interleaved | Counterclockwise | base60 | 2 | 0.031930 |
| Interleaved | Counterclockwise | base59 | 2 | 0.030175 |

The canonical source-order consecutive/clockwise/base60 Shamir fourth-share output has **zero** agreements with the original p55 ciphertext. All eight predictions contradict at least 68 original glyphs, decisively ruling out the **direct** third-input Shamir-share identity under these coordinates/layouts. The best additive-key decoded full-76 output has IoC **0.043158** and begins `P M G TH A I P D I L X A E U TH U A M W EO`, not coherent prose. Compare untouched p55 ciphertext IoC **0.0378947** and an independent genuinely solved p57 76-rune control IoC **0.0596491**. Native positive plants recover every rune with exact forward replay; that implementation property alone is not evidence that an authentic p55 key has been found.

## Independent coefficient rather than share register

The original p27 three-tape arrangement can represent the literal coefficients of a quadratic over the same GP29 field. For the **identical eight frozen layouts, perimeter directions and numeral alphabets**, evaluate `f_i(x_i)=(a_i+b_i*x_i+c_i*x_i²) mod29` and test p55 exact fourth-output equality and both complete additive inversion signs. This is a different structural assignment to the **same** source input, with no additional entropy or free parameters.

| P27 tapes | Perimeter | Radix | Exact p55 prediction / 76 | Best of ± full decoded IoC |
| --- | --- | --- | ---: | ---: |
| Consecutive | Clockwise | 60 | 1 | 0.039649 |
| Consecutive | Clockwise | 59 | 2 | **0.041754** |
| Consecutive | Counterclockwise | 60 | 4 | 0.039298 |
| Consecutive | Counterclockwise | 59 | 4 | 0.039649 |
| Interleaved | Clockwise | 60 | 4 | 0.038947 |
| Interleaved | Clockwise | 59 | 4 | 0.036842 |
| Interleaved | Counterclockwise | 60 | 4 | 0.037544 |
| Interleaved | Counterclockwise | 59 | 3 | 0.035088 |

All **eight** direct fourth-output identities disagree with at least 72 original p55 runes. All **sixteen** full source-respecting additive inverses remain nonprose, their IoCs **0.028772–0.041754**, below authentic solved-p57 first76 IoC 0.059649. In the highest-IoC candidate (consecutive, clockwise, base59, inverse plus), the first 24 deciphered GP symbol transliterations read `Y B Y W A N EA L OE O B R Y T EO P EO C G A B R S S`, a scrambled register. Both signs replay all 76 original cipher symbols exactly, and 16 independent authentic solved-p57 76-rune positive plants return 76/76 by the same polynomial-key code. **No GP-native coherent original plaintext appears.**

These are conditional failures of **the specified quadratic coefficient consumers**; there is no creator-selected x-register or original instruction declaring the p27 streams to be polynomial coefficients. Do not multiply speculative layouts without a new original operand.

## Cryptanalytic decision

The p27 three-lane source, p50 circumference and solved p57 circumference instruction do furnish an economical **changing coordinate** to test. They do **not** furnish the author's explicit instruction to use Shamir, the share coordinates or the p50 byte radix. Both direct Shamir fourth-share and literal-coefficient fourth-output interpretations are contradicted under the locked finite family. Using either quadratic readout as a one-time additive pad yields nonlinguistic p55 outputs, which is a negative observation rather than a mathematical exclusion of every alternative plaintext register.

**Do not expand this specific source packet into arbitrary x-coordinate phases, column orientations, invented interpolation abscissas or fitted plaintext words.** An authentic new source opcode, recoverable byte framing, or original plaintext would justify a different test. The broader p27/p55 triple76 mystery remains open; earlier stationary-share experiments are separately documented in [triple76 original consumer](lp2-p27-p55-triple76-original-consumer.md).
