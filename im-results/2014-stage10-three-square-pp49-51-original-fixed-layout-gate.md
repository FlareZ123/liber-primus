# Original 2014 Stage10 three-square contract versus LP2 pp49–51

**Decision (12 November 2026; Director #489):** The source-fixed one-square-per-original-page proposal fails. Natural top-left 5×5/7×7/5×5 blocks on physical pp49/50/51 do **not** have the three historical magic sums 3301, 1033, 1033. No plaintext, cipher, missing server handler or independent key emerges.

## Historical source and original artifact

The contemporaneous original Onion6/Stage10 `/cgi-bin/squares` participant form identifies fields **`53301` (order five, sum 3301), `71033` (order seven, sum 1033), `51033` (order five, sum 1033)**. The signed instructions authenticate the requests; neither the client form nor its static confirmation reveals the Cicada-side validator. This **Stage10 challenge preceded the Stage11 release of Liber Primus**. [Source/handler boundary](2014-stage10-squares-cgi-source-boundary.md).

Original manuscript images `66.jpg`, `67.jpg`, `68.jpg` are physical pp49, 50, 51. I visually inspected their original-image layouts and first 5/7 printed rows against [the canonical source transcription](../resources/liber-primus/lp2-grid-256.json). The pages contain exactly **10, 13, 9 rows**, each with eight two-character tokens, respectively 80, 104 and 72 cells. The source's 60-character alphabet is `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`. For this conditional fixed test alone, a token `QR` maps to `60×index(Q)+index(R)`, reproducing the canonical bytes. The historically unresolved radix59/60 interpretation is not resolved by this test.

The original p33 cuneiform header prints the two numbers **1033 and 3301**, which motivates an independent check, but gives no original selection of cell coordinates or a page-to-square mapping.

## Locked original-page calculation

Test physical p49→5×5/3301, p50→7×7/1033, p51→5×5/1033. On each page use only rows 1–n and columns 1–n (not a 16×16 reshape), preserving the physical order. Sum every row, every column and both diagonals. No offset/rotation/column permutation/alternate radix search was performed.

| Original page and label | Top-left row sums | Column sums | Two diagonal sums | Pass? |
|---|---|---|---|---|
| p49 `66.jpg`, `53301`, n=5 | 884, 966, 473, 655, 519 | 640, 994, 708, 505, 650 | 546, 647 | No |
| p50 `67.jpg`, `71033`, n=7 | 906, 1054, 822, 664, 920, 615, 968 | 1013, 1050, 871, 915, 742, 857, 501 | 798, 1131 | No |
| p51 `68.jpg`, `51033`, n=5 | 422, 579, 655, 369, 626 | 437, 779, 541, 358, 536 | 611, 653 | No |

Exact decoded top-left matrices, in source physical row order:

```text
p49:              p50:                           p51:
203 231 167 186  97    142  58 201 193 173  28 111    128 156  19  81  38
 92 249 156 222 247    211 220 198  49 236  84  56      0 155 159  89 176
121 202  15  33 102    222 150  72  34  83 229  32    110  74 209  68 194
109 198 173  25 150    122  63  31 218  14 184  32     57 175   6  61  70
115 114 197  39  54     73 143 197 247  54 171  35    142 219 148  59  58
                         42 237  86  54  13  20 163
                        201 179  86 120 169 141  72
```

**Stronger p49 bound:** all conventional source tokens encode bytes 0–255. Thus **any five source cells, no matter where selected, sum to at most 5×255=1275**, strictly below 3301. No page-local permutation can rescue the order-five/3301 square under this numeric domain. This does not exclude other, source-specified non-byte semantics.

## Reproducer and controls

[CommonJS original-input SFT](../sims/lp2_stage10_three_square_pp49_51_sft.cjs) loads the full 256-cell canonical source and asserts that every token matches its source byte under the frozen alphabet. It verifies page image names, printed row counts, the locked block positions, all row/column/diagonal sums and the p49 upper bound. It constructs independent genuine order-five and order-seven magic squares (sum 65 and 175) by the Siamese method and confirms that perturbing a cell breaks the magic-square predicate. The source-block arithmetic and positive/negative control calculations were independently executed in the JavaScript tool runtime.

**Disposition:** retire the exact Stage10 square→LP2 natural-page transfer. A further square extraction requires an **independent contemporary rule selecting the exact cells and a compatible numeric domain**. The 2014 historical squares remain valid clues in their own Stage10 context, with the missing Cicada-side validator reserved for #494. No result here authenticates a cipher for the 56 unsolved LP2 pages.
