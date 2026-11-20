# p50 functional graph and the 2016 29-word register

**Classification:** intermediate structural finding and candidate navigation mechanism. This is not an established decryption of an unsolved LP2 page.

## Hypothesis

The 2016 signed message says that the book is a map and that numbers provide direction. The LP2 p49–p51 numerical object is a 32×8 table of 256 two-character tokens. The repository currently interprets each token as a base-60 byte, using the documented rule 60d1+d2, producing values 0–255. If cell i points to cell T[i], the table becomes a 256-node functional graph.

This reading is motivated by the signed message and by the table's 256-cell shape, but the repository explicitly classifies the base-60 byte interpretation as a hypothesis. The successor-pointer interpretation is an additional hypothesis.

## Reproducible graph

Using resources/liber-primus/lp2-grid-256.json as supplied:

| Cycle | Nodes in successor order | Basin |
|---|---|---:|
| 11-cycle | 0 → 203 → 68 → 199 → 47 → 76 → 114 → 197 → 115 → 247 → 192 → 0 | 252 |
| 2-cycle | 249 → 158 → 249 | 4 |

There are exactly two cycles. Their lengths sum to 13 and multiply to 22; the small basin has size 4. These numbers are suggestive against the p0 marker's 13 dots and the 2013 DH register's group order p−1=22=2×11, with q=4. This is a cross-source alignment, not proof that the table was designed as a functional graph.

### Original-scan check of the 13 cycle cells

The 13 printed tokens used by the two cycles were also checked visually against the original 2400×3600 scans 66.jpg–68.jpg supplied with this run. Coordinates below are zero-based within each page's 8-column table; the base-60 byte is the successor index.

| Cell index | LP2 page / scan | Row | Col | Printed token | Byte / successor |
|---:|---|---:|---:|:---:|---:|
| 158 | 50 / 67.jpg | 9 | 6 | 49 | 249 |
| 249 | 51 / 68.jpg | 8 | 1 | 2c | 158 |
| 115 | 50 / 67.jpg | 4 | 3 | 47 | 247 |
| 247 | 51 / 68.jpg | 7 | 7 | 3C | 192 |
| 192 | 51 / 68.jpg | 1 | 0 | 00 | 0 |
| 0 | 49 / 66.jpg | 0 | 0 | 3N | 203 |
| 203 | 51 / 68.jpg | 2 | 3 | 18 | 68 |
| 68 | 49 / 66.jpg | 8 | 4 | 3J | 199 |
| 199 | 51 / 68.jpg | 1 | 7 | 0l | 47 |
| 47 | 49 / 66.jpg | 5 | 7 | 1G | 76 |
| 76 | 49 / 66.jpg | 9 | 4 | 1s | 114 |
| 114 | 50 / 67.jpg | 4 | 2 | 3H | 197 |
| 197 | 51 / 68.jpg | 1 | 5 | 1t | 115 |

All 13 tokens are legible in the original scans and agree with the canonical grid at the listed positions. This is a visual source check, not a new per-glyph pixel-metric adjudication. The repository's full-font audit reports 509 of 512 glyphs with same-class controls and no flagged mismatches; the three singleton labels are R, i, and h, none of which occurs in these 13 tokens. Cell 199 is also among the eleven separately adjudicated disputed positions.

## Historical 2014 byte-witness negative control: cell 199 is decisive

The archived 2014 byte stream has cycles of lengths **2 and 21**, not 2 and 11. Its 21-cycle is:

0 → 203 → 68 → 199 → 21 → 137 → 129 → 179 → 175 → 44 → 230 → 117 → 171 → 54 → 156 → 52 → 86 → 111 → 115 → 247 → 192 → 0.

The 2-cycle [249,158] is unchanged. The old 21-cycle's q-mode is 6 (four occurrences), but its r-mode is tied among 0, 1, 15, 21, 25 and 28; it does not have the source-correct 11-cycle's unique r-mode 18 = MAP.

A one-at-a-time correction experiment isolates the historical disagreement that matters. Of the ten indices where the 2014 binary differs from the original printed table, correcting only index **199**—from old value **21** (alternative uppercase-L token 0L) to original value **47** (printed lowercase-l token 0l)—restores exactly the current 2-cycle and 11-cycle. Correcting any of the other nine indices individually does not restore the 11-cycle: eight leave the 21-cycle unchanged, while correcting index 175 alone produces a 23-cycle.

Cell 199 is one of the eleven disputed glyphs independently adjudicated against the original JPEG. The image audit measures the lowercase l at 7×73 pixels, while the uppercase L control has a broad foot and width 26 pixels. The 2014 variant's error at this one cell breaks the 11-cycle; the original scan's reading restores it. The other nine historical differences are not needed for this cycle restoration.

Thus the 2+11 cycle signature is absent from the old participant byte stream and is restored by the single original-image-supported correction at cell 199. This does not prove that the successor-map interpretation was intended, but it materially strengthens the connection between the original printed table and the cycle structure.

## Source-oriented cycle order and base-29 word pairs

Write each cycle node n as n=29q+r. The GP alphabet has 29 symbols, and the 2016 signed message contains a natural zero-based 29-word register at indices 0–28. Its next word, at index 29, is "direction"; it is not addressable by a base-29 digit.

The cycles can be oriented using source values rather than arbitrary rotation:

- Start the 2-cycle at node 158 because its base-29 quotient is 5, matching the 2013 DH generator g=5. Its successor is 249, whose quotient is 8, matching the published public value A=8.
- Start the 11-cycle at node 115, reached by following the p50 map from the GP0 value of the first "The" in the signed 2016 message (word index 1, GP0 20). The path is 20 → 102 → 32 → 115. The selected cycle entry has quotient 3, matching the DH exponent e=3.

This gives the following 13 ordered pairs of zero-based word indices into the first 29 signed-message words:

| Cycle node | Base-29 pair | Selected words |
|---:|---:|---|
| 158 | (5, 13) | EPIPHANY / WAY |
| 249 | (8, 17) | DEVOTED / THE |
| 115 | (3, 28) | LIES / THE |
| 247 | (8, 15) | DEVOTED / WORDS |
| 192 | (6, 18) | SEEKS / MAP |
| 0 | (0, 0) | HELLO / HELLO |
| 203 | (7, 0) | THE / HELLO |
| 68 | (2, 10) | PATH / PRIMUS |
| 199 | (6, 25) | SEEKS / THEIR |
| 47 | (1, 18) | THE / MAP |
| 76 | (2, 18) | PATH / MAP |
| 114 | (3, 27) | LIES / ARE |
| 197 | (6, 23) | SEEKS / ROAD |

The 11-cycle has unique marginal modes q=6 and r=18, each occurring three times: SEEKS and MAP. It also contains the exact pair (6,18), SEEKS / MAP. The source-oriented first 2-cycle node yields (5,13), EPIPHANY / WAY; the second yields (8,17), DEVOTED / THE.

Consequently, the graph independently selects the word anchors EPIPHANY, SEEKS, WAY, and MAP from the signed message. EPIPHANY SEEKS matches the p0 title candidate already recovered through a separate p0 route. The 13 cycle nodes also match the 13-dot p0 marker count. The 2-cycle remainders 13 and 17 additionally coincide with the Cicada 13/17-year period numbers, though that association should be treated cautiously.

The 11-cycle's base-29 nodes also contain several 2013 DH values: 247 = 8×29+15 (A=8, b=15), 197 = 6×29+23 (a=6, p=23), 115 = 3×29+28 (e=3), and 68 = 2×29+10 (K=2). The 2-cycle basin size 4 matches q=4, and 249 mod 23 = 19 matches B=19. This is an intriguing numerical convergence; it does not yet provide a single extraction rule for the entire DH tuple or the p0 additive key.

## Conditional permutation null

A fixed-multiset null was run by uniformly shuffling the observed 256 byte values among the 256 cell positions, preserving the table's byte-frequency distribution. With seed 0x20261120 and 100,000 permutations:

- Exactly two cycles of lengths 2 and 11 with basin sizes 4 and 252 occurred 11 times (0.011%).
- The exact 2-cycle base-29 pairs (5,13) and (8,17) occurred 3 times.
- An 11-cycle with unique modes q=6 and r=18 and containing node 192 occurred 35 times.
- The joint signature—exactly two cycles, the 2-cycle pairs, and the 11-cycle mode signature—occurred 0 times. The approximate 95% upper bound for this conditional null is 3/100000.

This is a conditional structural check, not a discovery-adjusted global p-value. The hypothesis was formulated after inspecting the table, and the null does not account for all alternative radices, graph interpretations, or source-register choices.

Reproduce the deterministic extraction with:

node sims/lp2_p50_functional_graph_2016_wordmap_sft.cjs

Reproduce the fixed-multiset null with:

node sims/lp2_p50_functional_graph_2016_wordmap_sft.cjs --null=100000

## Objections and negative controls

1. The base-60 byte mapping and the successor-pointer interpretation remain hypotheses. The grid's source notes say only 11 cell readings have been checked against original JPEGs; the remaining table is based on the canonical transcription and is not fully independently adjudicated.
2. The 2016 source-word GP0 values are poor selectors by themselves: all 28 distinct word addresses tested enter the 252-node 11-cycle basin.
3. The graph does not simply reproduce the signed message's word order. Only 1 of 42 adjacent word transitions is a direct successor under the current GP0/base-60 interpretation; only 5 of 42 targets are reachable by any number of forward steps. A 100,000-permutation test of the latter count gave p≈0.146.
4. Interpreting the base-29 pair as LP2 page/word coordinates (page q, word r) selects ciphertext words, not readable plaintext, under the current transcription.
5. Direct use of the 13 cycle-node residues, their obvious H/H-inverse transforms, and the p56 prime/totient transform did not reproduce the existing p0 13-atom additive key.

## Best next decision

Do not expand into unconstrained arithmetic searches. First independently adjudicate the cycle nodes and their predecessor paths against the original p49–p51 images. Then ask whether the source-oriented 13 word-pairs specify a unique, independently motivated permutation or operation on the p0 13-atom key. If no such operation is selected by the artifact, retain this as a navigation/anchor result rather than promoting it to a decryption.
