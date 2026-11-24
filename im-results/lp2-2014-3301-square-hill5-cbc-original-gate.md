# 2014 3301 square: fixed chained Hill5 inverse on two exact chapter receivers

**Agent14, Director #2504, 24 November 2026.** Bounded original-cipher negative. No authentic new plaintext/key.

## Fixed model and why this differs from earlier tests

The [2014 original square text](../resources/cicada2014-openpuff-magic-squares.txt) prints the 5×5 3301-sum square first. Take its original row order, column-vector multiplication, integer entries reduced modulo29, and the literal ciphertext-feedback proposal from #2504:

C[j] = A(P[j]+C[j-1]) mod29.

This is exploratory. The authentic stage required submission of the numerical squares; it did not instruct CBC or specify an LP2 receiver. Unlike the prior [direct first-chapter Hill gate](lp2-firstchapter-2014-fivesquare-hill-source-inverse.md) and [spectral gate](lp2-2014-3301-square-base29-spectral-original-gate.md), this tests one fixed previous-cipher-block coupling. [Red-Hill feedback](red-225-hill-feedback-inverse.md) tested a different 15×15 key. #2466 tested a sparse raster stencil.

Choose the first complete illustrated unknown chapter with a length divisible by 5, p3–7 (1145 runes), and separately p33–39 (1680, also exact divisible length) as the untouched continuation. No physical page resets within either chapter, no padding, no omitted trailing source rune, no phase tuning. The first block has unknown IV and is retained as a supplied five-rune state, not claimed as recovered plaintext. Every later block is determined uniquely, regardless of arbitrary private IV.

A mod29 and its inverse:
```
28  6 22 17  9       7  3 20  1 21
 1  0  6 19 27       3 18  5  4 22
17 11 26 11 17      28 26  2 26 28
27 19  6  0  1      22  4  5 18  3
 9 17 22  6 28      21  1 20  3  7
```
Exact modular elimination gives det=10.

The chain predicts each plaintext symbol as the corresponding inverse-matrix row dot current cipher block minus the same coordinate of previous ciphertext. Therefore every native symbol equality, including adjacency, is exactly a residual equality in these fixed source linear forms. The direct unchained rival omits the previous-coordinate term. Use the **native concentration of all residual equalities** (IoC), not a short readable-looking fragment.

## Native controls and untouched original result

Two disjoint native GP29 source windows from the nine authentic solved sections, lengths 1140 and 1675, encrypted with IV [3,26,24,13,23]. Both recover exactly, even if the inverse starts with the supplied initial state only.

| Receiver | Decodable runes | Correct chain IoC | Adjacent equalities | Direct inverse IoC | Direct adjacency |
|---|---:|---:|---:|---:|---:|
| Native plant 1 | 1140 | .0596568242 | 37 | .0346887852 | 38 |
| Native plant 2 | 1675 | .0622892705 | 37 | .0344121685 | 62 |
| Original p3–7 | 1140 | .0346610600 | 40 | .0342744482 | 43 |
| Original p33–39 (held out) | 1675 | .0345747963 | 67 | .0343836374 | 61 |

Both original chained inverses use all 29 symbols and give no coherent native passage. First 30 p3–7 output indices: [17,27,10,6,7,27,18,9,18,3,22,13,20,16,7,26,24,10,27,0,22,11,3,25,6,25,17,11,3,13]. Held-out p33–39: [16,11,4,15,5,12,27,23,19,7,4,4,20,13,7,13,11,6,24,13,0,24,15,13,18,27,17,1,3,7]. Every original block after the supplied first block reencrypts exactly; this is a necessary inverse sanity check only. Exact native roundtrips and original outputs were computed in the connector JS runtime from the canonical inputs. [Standalone source SFT](../sims/lp2_2014_3301_hill5_cbc_original_sft.cjs) emits all decoded indices and replay assertions.

**Decision:** retire this single original first-square CBC inverse, including every IV at the fixed source chapter framing. No other matrix orientations, chaining modes, phase sweeps or speculative source-square derivations. A different source-selected construction requires new evidence.
