# Source GF(29) distinct-root stream as a complete p55 transition key

**13 November 2026, Agent28. Classification: bounded failed original-cipher inverse. No new plaintext, authentic key, or page-59 destination.** The original root inventory gives an unusually precise *length agreement* with the last unsolved page. A direct reversible consumer motivated by the manuscript's near-nonrepeating ciphertext, the signed 2013 DH example, and that agreement has now been executed. It fails to recover GP-native prose, so the length agreement is not evidence of a solve.

## From original source to one frozen candidate

The existing [full-page GF(29) root inventory](lp2-crosspage-polynomial-root-frontier.md) treats the complete, unchanged GP29 indices of each *rune-bearing* physical LP2 p0–55 as descending polynomial coefficients. This gives **74 distinct root incidences** over 55 nonempty pages, or 78 counting multiplicities. Independently, the conditional standard-base60 interpretation of the original pp49–51 **256 cells** yields a polynomial with one **distinct** GF29 root, **24**, of multiplicity two. Thus taking each source object's *distinct* roots once, ordered by physical page and ascending root, followed by the table root, yields exactly **75 values**. The full original physical **p55 has 76 cipher runes and 75 within-page adjacent transitions**. Its own polynomial has no GF29 roots, making the key logically independent of the target page's local values (but still derived from the remaining ciphertext and the table).

These counts specify a cheap target for a direct decoder, without splitting the key by guessed period or shifting it to a favorable offset. They do **not** establish intentional design: polynomializing GP29 rune sequences, selecting distinct roots, appending the table's root, and choosing p55 as the consumer have no authenticated author-side instruction. The exact 75-symbol match was identified after extensive root and page-length investigations. Counting root multiplicities instead gives **80** symbols with the table, so this selection is also model-dependent.

## Original p55 inverse, fully specified

Use the complete 76 original source runes \(C_0,\ldots,C_{75}\) with \(D_i=(C_{i+1}-C_i)\bmod 29\), for \(i=0,\ldots,74\). The page has exactly **one** \(D_i=0\). In the previously investigated 29-symbol/no-repeat-register family, reserve GP rune **EA** (index28) for such a zero step. Otherwise take the discrete logarithm \(\log_g D_i\) in the 28-element multiplicative group of GF(29) and output

\[
P_i=\bigl(\log_g(D_i)\ \mathbin{\pm}\ K_i\bigr)\bmod28.
\]

The two fixed generator choices **8** and **15** originate in the independently recovered worked 2013 DH23 example: eight is the server's public share and 15 is the calculated client private exponent. Both happen to be primitive generators of the *different* field GF29. This cross-modulus transfer is a **hypothesis**, since the historical source uses modulus23 and supplies no LP2 GF29 exponent instruction. For each generator, the two signs are the complete direct family tested; no key phase, page cutoff, transposition, skip schedule, or extra plaintext mapping is fitted.

| Decoder on entire 75-step p55 body | GP29 index of coincidence | Interpretation |
|---|---:|---|
| \(g=8,\ \log D-K\bmod28\) | **0.0414414414** | Not readable |
| \(g=8,\ \log D+K\bmod28\) | 0.0349549550 | Not readable |
| \(g=15,\ \log D-K\bmod28\) | 0.0342342342 | Not readable |
| \(g=15,\ \log D+K\bmod28\) | 0.0345945946 | Not readable |

The independently solved, unencrypted p57 **first 75 source runes** have IoC **0.0594594595**. The candidate strings, emitted without abbreviation or postselection by the linked SFT, contain no complete GP-native grammatical passage. The best candidate's first GP transliterations are **FYIDFOEOESTHELJHOEAOEAEAEOOEBRONEHCPBIG...**. A three-rune accidental substring is not a success. All four original inverse outputs encode **exactly back to all 76 original p55 runes**; algebraic round-trip alone is expected for these chosen bijections.

## Reproduction and research decision

[One-file CommonJS source and planted control](../sims/lp2_original_roots75_p55_stepkey_sft.cjs) asserts the original complete 256-byte table SHA256, all 55 original rune-bearing page lengths, the 74+1 source-derived key-length identity, p55's 76 source runes and single adjacent repeat, and both GF29 generators' full logs. For every candidate it encrypts a native 75-rune solved-p57 control with one reserved EA marker and decodes all 75 symbols exactly; one changed key element must fail the plant. An original decode must likewise re-encode all 76 runes. The complete original and planted tests passed in [manual Node22 CI run 43388332675](https://github.com/FlareZ123/liber-primus/actions/runs/43388332675).

**Decision:** retire only this exact distinct-root sequence used as an additive GF29 multiplicative-step log key on p55. The length identity is now connected to a precise original-input inversion and gives **no unknown plaintext**. It should not motivate further generator, key order, offset, or clock searches unless an independently attributable Cicada clue chooses an actual operation. The separate anomalous full-book root count remains an observational statistic with a calibrated but not author-authenticated interpretation. The source pp49–51 polynomial and p39 red polynomial relation remain mathematical facts of the conditional base60 reading.
