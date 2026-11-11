# P32 twin-BUD → HOME grid route: a provisional nine/thirteen-rune navigation

**Classification (11 November 2026): source-original, conditional navigation candidate; no unknown plaintext, authentic LP2 key, reversible cipher or destination.** The observation links a second readable **BUD** in the existing 11×11 p32 layout to the previously known **BUDS** and **HOME** rune substrings, the p32 red punctuation's 9-row/13-dot geometry, and the previously established p32 projective matrix. The path and arithmetic are reproducible on unaltered runes. The creator's intent is unproven because the word/path interpretation was developed while looking at the original.

## Human-visible source route

The authenticated 2016 Cicada image repeats the original p32 tree and says that the book's words are a map, their meaning the road and their numbers the direction. The original p32 contains **121 runes**. In its 11×11 row-major reflow, the first row and first column GP-prime sums are **563** and **569**, matching that image's exact width and height. The geometric layout and the horizontal four-rune **HOME** and **BUDS** runs are documented in the [existing signed-image study](lp2-tree121-signed2016-source-gate.md).

One further straight three-rune run is visible in this **same unchanged grid**: **BUD** occurs along the northwest diagonal from (row 10, col 9) to (8,7). That D is the **same source rune** as the D of horizontal BUDS at (8,5)..(8,8). This creates a two-branch junction with no inserted letters or independent cipher key.

**Terminology matters:** HOME starts an eleven-rune printed ciphertext word **HOMEXWDSLFD**, and BUDS is the four-rune suffix of the complete printed ciphertext word **MBUDS** (preceded by M within the same word and separated from BJ by a hyphen); neither is a complete whitespace-delimited source word or recovered plaintext. The additional BUD is a geometric three-rune occurrence. All coordinates are zero-based in the conceptual 11×11 row-major array, rather than the printed line coordinates.

| Exact source route | Cell sequence | Printed-rune reading | GP-prime total | Modulo 29 |
| --- | --- | --- | ---: | ---: |
| Horizontal HOME prefix of 11-rune HOMEXWDSLFD | (3,0)→(3,3) | H O M E | 168 | 23 |
| Horizontal BUDS suffix of 5-rune MBUDS | (8,5)→(8,8) | B U D S | 206 | 3 |
| Additional diagonal BUD | (10,9)→(9,8)→(8,7) | B U D | 153 | 8 |
| **Nine-cell BUDS-to-HOME path** | (8,5),(7,4),(6,3),(5,2),(4,1),(3,0),(3,1),(3,2),(3,3) | **B NG IA M B H O M E** | **547** | **25** |
| **Thirteen-cell twin-BUD-to-HOME path** | (10,9),(9,8),(8,7),(8,6), then the entire nine-cell route | **B U D U B NG IA M B H O M E** | **703** | **7** |

The nine-cell path leaves BUDS at its initial B, follows an unbroken northwest diagonal to the H of HOME, then traverses HOME eastward. The thirteen-cell path starts at the other BUD, follows it to the shared D, walks west through U/B of the first BUDS, then follows the nine-cell route. The latter is a continuous, non-self-intersecting 13-cell path. This is a connected-substring construction, although **nothing in the signed message explicitly instructs a solver to reverse one BUD arm**.

The p32 red terminal stencil has **13 dots in nine occupied rows** ([original-image geometry](tree-prime-canvas-partition.md)). Those are exactly the two candidate path lengths. They were noticed after inspecting the paths, so neither is an independently locked prediction.

## Two different source-matrix endpoints

The previously reconstructed p32 central 5×5 perimeter yields the corner-exclusive projectivity

\[
M_7=\begin{pmatrix}14&25\\25&28\end{pmatrix},\qquad f(x)=\frac{14x+25}{25x+28}\ \text{on }\mathbb P^1(\mathbb F_{29}).
\]

Its geometric corner convention is separately supported by p32 red-dot fixed-point residues and adjacent p33 cuneiform values; see [the complete matrix analysis](tree-prime-canvas-partition.md). This already established matrix has finite fixed points **22** and **25**, with a pole at **7**.

The **nine-cell path** gives 547 = 29×18 +25, hence f(547 mod29) = f(25) = 25: a source-matrix **fixed point**. The **thirteen-cell path** gives 703 = 29×24 +7, hence f(703 mod29) = f(7) = ∞: the **pole**. The difference is the four-rune branch extension **B U D U**, with GP-prime sum 61+3+89+3 =156 ≡11 mod29; thus 25+11 ≡7 mod29. The two output residues are consequently **dependent**: once the nine-path sum and second BUD have been chosen, the thirteen-path result follows arithmetically. Do not count the two residues as independent confirmations.

The signed 2016 words **“The path lies empty”** suggest an interpretation of the pole, since physical p50 is the only runeless page and holds the numerical 32×8 table. The source does **not** explicitly say “infinity means p50”, nor provide a table-cell address or decoding action. That continuation remains a hypothesis.

The earlier [p15/p32 318-degree image-bearing hypothesis](p15-p32-318-direction-sft.md) used the same BUDS-to-HOME diagonal and failed an original-JPEG directional-edge discriminator. This new source-only twin-BUD/M7 graph **does not repair** that pixel failure or license further image-ray tuning. Its distinguishing additional inputs are the independently visible second BUD branch, the p32 dot-count relation, and the established projective fixed-point/pole arithmetic.

### The same path as a 4–5–4 red-dot-column decomposition

The **actual red stencil**, inspected in the original p32 JPEG, has **four dots in its left column, five in its center and four on its right**, alongside the nine-row alternating occupancy. The source path of thirteen runes has a natural three-part segmentation in reverse spatial order:

| Path segment | Runes | GP-prime sum | Residue modulo 29 |
| --- | --- | ---: | ---: |
| Extra BUD branch up to the junction, excluding its return to BUDS B | **B U D U** (4) | 156 | 11 |
| Diagonal from BUDS B through the cell before HOME H | **B NG IA M B** (5) | 379 | 2 |
| The complete horizontal HOME substring | **H O M E** (4) | 168 | 23 |

Reading these three spatial segments from HOME toward the added BUD branch gives the residue vector **[23,2,11]**. The values **23** and **2** are the actual modulus and shared key in the earlier 2013 Cicada DH23 worked example, while **11** is the separately reconstructed minimal DH3301 client-exponent representative used in the project's p36 field tests. This is a possible human-recognizable cross-round numeric mnemonic, but **the source does not tell the solver to associate the dot columns with these path segments or to mix two different DH examples**. These three residues are simply the already reported 9/13 endpoint arithmetic decomposed into parts, so this does **not** constitute independent statistical evidence or provide an LP2 cipher key. In particular, the three values **cannot** be read together as the modulus 23, private exponent 11, and shared key 2 of one ordinary DH23 exchange: for every nonzero public share a modulo23, Fermat/Euler gives **a^11 ≡ ±1 (mod23)**, never 2. Any interpretation joining the two historically different DH examples needs a distinct, stated operation.

## Competing source-visible endpoint: extend to the **X** of HOMEX

The original *five-rune prefix* at p32 offsets 33–37 is **HOMEX**, with GP indices \`[8,3,19,18,14]\`. The **complete printed ciphertext word** is in fact **HOMEXWDSLFD**, with eleven GP runes. The route above stops on **E**, immediately before **X** in that word. Since X is a conventional map marker, **continuing one more horizontal step to X is another possible but still *partial-word* stop, not an independently dictated word boundary** as stopping at E. This alternative must be recorded rather than silently treated as a failed variant.

| Same geometric branch, endpoint changed from E to X | Source runes visited | GP-prime sum | Residue | Existing M7 output |
| --- | ---: | ---: | ---: | ---: |
| Horizontal BUDS B → full HOMEX X | **10 cells / 9 edges** | **594** | 14 | **18 = 1033 mod29** |
| Diagonal BUD B → shared D → full HOMEX X | **14 cells / 13 edges** | **750** | 25 | **25 (fixed point)** |

The fifth rune X has GP prime value **47 ≡18 mod29**. Hence the X-inclusive residues are algebraically forced from the earlier E-stop residues: \`25+18 ≡14\` and \`7+18 ≡25\`. The first value14 agrees with a previously documented *different* p32 source selector, the first punctuated clause residue14 that the same M7 sends to the immediately following p33 cuneiform value \`1033 mod29 =18\`. The second value25 is an M7 fixed point. These matches are **not independent** of the original route sums, and they do **not** separately authenticate a next-page cipher rule. However, the original stencil's **nine occupied rows and thirteen dots** now correspond to **actual edge counts 9 and13** rather than vertex counts 9 and13. This is a defensible competing reading of what a solver would count.

Because the original source provides no explicit instruction to stop at E, X, or the end of the full eleven-rune printed word, or to count visited cells rather than path steps, the two interpretations must remain parallel. The prior conditional permutation counts are **exactly unchanged** for the X-inclusive version, since X is among the same frozen source cells: the X-inclusive 10-cell residue14 event is equivalent to the earlier nine-cell residue25 event. **Do not report those identical counts as a second statistical replication.** An independently source-selected stopping rule is now a prerequisite for continuing either proposed route.

## Source-conditioned falsification calibration

Freeze **43 distinct original cells**: the complete p32 top row/left column defining the 563×569 image axes, the 16-cell central-perimeter ring defining M7, and horizontal HOME and BUDS substrings. Shuffle the remaining **78** rune labels among their original cells, preserving their exact multiset. On every shuffle, count:

1. Whether the fixed nine-cell route sums to **25 mod29**, M7's fixed point.
2. Whether **any additional straight three-cell B-U-D path** (eight compass directions) terminates at the fixed D of BUDS, distinct from its horizontal BUD; seven geometrically eligible paths.
3. Their conjunction, which licenses the thirteen-cell route and residue7 by the addition above.

A deterministic 200,000-shuffle Fisher–Yates/xorshift32 experiment (seed 0x03213569) gives:

| Retrospectively specified test | Original | Null hits / 200,000 | Plus-one frequency |
| --- | --- | ---: | ---: |
| Nine-cell sum is fixed point25 | Yes | 6,107 | 0.03053985 |
| Secondary BUD ending at same D | Yes | 3,173 | 0.01586992 |
| Both together | **Yes** | **84** | **0.00042500** |

These tails **only quantify the conditional experiment just defined**. HOME, BUDS, path geometry, prime sums, projectivity and 9/13 length association were all selected or interpreted after viewing p32 and prior results. This experiment does not adjust for that selection, alternative substrings, routes, layouts, pages or number formulas. Its joint rarity is **not a discovery-wide probability** and cannot authenticate Cicada's intended procedure.

## Research decision

This is a new *candidate human navigation*, because it uses tree-related rune substrings and an existing source-established map with no freely chosen ciphertext key. Further dependent work needs an **independent** manuscript or signed-source instruction selecting the BUD-to-HOME turn convention, or specifying a testable p50 table address. Arbitrary path/word/shift searches would destroy the discrimination.

No LP2 ciphertext symbol has been decrypted, no ciphertext-to-plaintext inverse is specified, and the physical p50 destination remains unverified. Existing p32 prime-axis/image partitions and competing 13-rune/M7 correspondences remain relevant.

**Reproduce:** [standalone CommonJS SFT](../sims/p32_bud_home_branch_route_sft.cjs) reads the canonical [numeric corpus](../resources/liber-primus/lp2-corpus.json), asserts all source coordinates and path sums, runs the conditioned original-multiset permutation experiment and checks exact deterministic counts.
