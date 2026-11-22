# P54 nine-red kernel and terminal 23×13 cyclic inverse

**Agent3, 17 November 2026. Classification: source-motivated complete original-cipher negative, without any unknown plaintext or historical operator authentication.**

## The independent source constraints

Physical p54 begins with exactly nine red GP29 runes, in printed order `[24,19,21,23,27,2,14,10,19]`, followed by a red thirteen-dot separator. Its black body holds **223** GP29 runes, continued directly into physical p55's **76** runes, including a word that carries over the page turn. Their uninterrupted post-separator receiver is **299 = 23×13** runes. The numbers 13 and 23 each appear independently in authentic Cicada sources: large original thirteen-dot punctuation and the signed 2013 example's working modulus 23. A reader could tentatively reshape the terminal 299 glyphs as a rectangle and use the distinctive nine-rune rubric as a 3×3 value-changing kernel.

This motivates one inexpensive original-input inversion experiment, but **the manuscript supplies no instruction to do cyclic convolution**. The historical p54 red9 had already been tested as an ordinary *blockwise 3×3 Hill key* on the first 297 post-header runes, with no prose [here](lp2-p54-red9-hill3-terminal-original-gate.md). The present operation is independently different: it mixes **adjacent rows and columns**, models a **single 299-cell torus**, and needs no fabricated padding.

## Frozen reversible operation

Let the original red heading form the row-major GF(29) kernel:

```
24 19 21
23 27  2
14 10 19
```

For a candidate 23×13 plaintext rectangle `P`, define each ciphertext cell
`C[r,c]=sum(K[u,v]*P[(r+u-1) mod23,(c+v-1) mod13]) mod29`,
for `u,v = 0,1,2`. Read the original 299 rune values in physical order, top to bottom, row-major, and invert this fixed full linear system over GF29. In the independent orientation check, swap only the row/column dimensions to 13×23, keeping the identical original key, unchanged source rune stream and mathematical operation. These are the two natural divisibility orientations; there is no key fitting, crib, keystream search, rune insertion, or optimization.

The [source-native CommonJS SFT](../sims/lp2_p54_red9_terminal_23x13_torus_sft.cjs) asserts the original p54 9/223 and p55 76 lengths, exact key values, **full GF29 rank299**, and exact forward re-encryption of all **299/299** original ciphertext runes under each orientation. Each candidate is independently compared with literal clear p57 GP rune frequency. To test actual recovery rather than circular reencryption, the SFT constructs an independent 299-rune native-GP plaintext plant from original clear p57, encrypts it under the same 299×299 matrix, and recovers **299/299** symbols exactly in both orientations.

## Source-original outcome

| Receiver orientation | GF29 matrix rank | Original decrypted GP29 IoC | Complete reencryption | Native prose plant |
| --- | ---: | ---: | ---: | ---: |
| 23 rows × 13 columns | 299 | **0.03512827995** | 299/299 | 299/299 |
| 13 rows × 23 columns | 299 | **0.03418554017** | 299/299 | 299/299 |

The independently clear source p57 has GP29 IoC **0.0627099664**. The original 23×13 inverse opens `B D L J M I O AE X L NG D X M A G H AE AE M P NG I M I E D W`; the opposite orientation begins `G J Y M W F N Y X T OE U O O EO X EO E J AE M C X AE I`. Both are flat, nonlinguistic outputs rather than a new readable page or decoded original key.

## Decision

The original 23×13 rectangle and red9 kernel permit a mathematically complete, uniquely invertible value-changing experiment. **Neither fixed natural toroidal orientation recovers genuine GP29 prose.** The real 2014 cipher is still unknown; all 56 unsolved LP2 pages remain unsolved. No author-selected cyclic boundary rule, coordinate order, key operation or independent terminal holdout was recovered. Do not expand into arbitrary kernels, unseen traversals or nonlinear neighbor updates without a first-party selector. Preserve this bounded result apart from already exhausted 3×3 Hill block tests.

[Original source](../resources/liber-primus/lp2-corpus.json) · [Read-only single-file original-cipher reproducer](../sims/lp2_p54_red9_terminal_23x13_torus_sft.cjs) · [Manual Windows Node22 verification](https://github.com/FlareZ123/liber-primus/actions/runs/44124130613).
