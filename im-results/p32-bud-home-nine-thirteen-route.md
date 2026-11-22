# P32 HOME/BUDS grid routes: parallel tracks and provisional nine/thirteen-step navigation

**Status (14 November 2026): exact original-source navigation geometry, a lexicon-conditioned common-word alignment anomaly, and bounded negative original-cipher tests of an extracted 4×4 matrix and its linearized 16-rune pad. No unknown-page plaintext, authenticated historical key, demonstrated original cipher, or destination has been recovered.** The original 11×11 p32 arrangement contains HOME, BUDS and a second diagonal BUD, allowing distinct human-readable path interpretations. None is explicitly selected by Cicada; they must be judged alongside rival explanations and the full family of inspected layouts.

## Human-visible source route

The authenticated 2016 Cicada image says that the book's words are a map, their meaning the road and their numbers the direction. **Its oak comes from different stock artwork than the original p32 dead-tree silhouette**; an earlier asserted same-tree identity has been retracted. Original p32 contains **121 runes**. In its 11×11 row-major reflow, the first row and first column GP-prime sums are **563** and **569**, matching the later signed image's exact width and height. This is an original numerical correspondence with a retrospectively selected layout, rather than a verified literal tree-image handoff. See the corrected [signed-image source study](lp2-tree121-signed2016-source-gate.md).

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

## Four parallel diagonal tracks: a source-conditioned common-word alignment

The original HOME run is at **(row 3, columns 0–3)** and BUDS at **(row 8, columns 5–8)** of the same row-major 11×11 candidate grid. The displacement is exactly **(+5 rows, +5 columns)**, or **+60 runes** in the unmodified printed source stream. Consequently **four parallel six-cell southeast diagonals** connect the two readable four-rune fragments directly, with the four letters of HOME on one end and the letters of BUDS on the other. This geometry is distinct from the earlier single nine-cell turning route and the extra diagonal BUD branch; it neither requires nor validates the projective M7 interpretation.

To assess the source geometry using an independently checked-in lexicon, restrict the existing [TextBlob spelling-frequency reference](../resources/control/english_wordfreq_textblob.txt) to four-letter English words whose letters are each **one GP rune** and which have source frequency at least **5**. This fixes **864** accepted words, including HOME (frequency 295) and BUDS (frequency 6), avoiding digraph orthography and invented dictionary entries. Exactly **18** horizontal four-rune starting cells can accommodate a second horizontal four-rune word at displacement (+5,+5). The original p32 has **one** such aligned qualifying pair: HOME → BUDS at (3,0).

A narrowly pre-specified **200,000-shuffle** conditional null preserves all **121 original p32 GP-rune multiplicities**, redistributing symbols over the 11×11 grid with xorshift32/Fisher–Yates, seed 0x33015635. At the same fixed 18 paired anchors, only **2** shuffles have one or more qualifying pairs: plus-one tail **3/200001 ≈ 0.000015**. A broader vocabulary with counts at least 1, 2 or 5 produces **15, 9 or 2** shuffled exceedances respectively. These are **conditional** shuffle frequencies: the 11×11 layout, 5×5 displacement, choice of four-letter words, source page and visual interpretation were historically/researcher selected. They cannot be multiplied by the dimension-sum relationship or interpreted as a discovery-wide significance estimate.

A stronger source-native lookaround keeps the actual unaltered text rather than shuffling. Among **6,482 overlapping 121-rune windows** wholly inside the 52 unknown physical pages long enough to contain such a window, exactly **one** contains any frequency≥5 pair at the precise (+5,+5) displacement: **p32 starting at rune 0**, HOME → BUDS. The windows overlap heavily; this is an observed census and supplies no independent probability.

**Expanded displacement control, which changes the interpretation:** The +5,+5 displacement was noticed after seeing the pair. An independent 100,000-shuffle test using the same original 121-rune inventory and frequency≥5 lexicon therefore searches **all 88 possible horizontal four-letter starting positions** and grants any two common-word starts a diagonal relationship at **any valid offset**, northeast or southeast. It finds **41/100,000** shuffled configurations with any such pair (plus-one **42/100001 ≈0.000420**), versus **zero** with exact +5,+5 in that separate 100,000-sample run. Even a fully unrestricted off-axis pair occurs **234/100,000** times (plus-one 235/100001 ≈0.002350); **363/100,000** shuffles contain two or more common horizontal four-letter words anywhere. These are more appropriate conditional scan baselines for an *unselected* displacement than the original narrowly frozen +5,+5 gate. They still condition on a retrospectively chosen 11×11 page, English orthography, lexicon frequency threshold, horizontal orientation, and the decision to look for word pairs.

Across the same **6,482 actual original windows** with any diagonal distance, there are **five qualifying windows**: p32 start0 and p37 starts62,73,84,95. The four overlapping p37 windows all contain the **same physical pair NEAR → TIER**, with displacement (+7,+7), at p37 absolute rune offsets95 and179. Thus there are **two distinct source passages** with aligned straight four-letter words, while only the p32 passage uses the selected +5,+5 displacement. A page-specific design interpretation is therefore plausible but unproven, and p37 supplies a real competing original-source example. No recovered word is presumed to be LP2 plaintext; all are ciphertext substrings.

## Two complete original-input inverses using the four track interiors

The phrase **“shed our own circumferences”** on the independently solved p57 suggests a possible human extraction from the four six-rune tracks: discard each path's two readable boundary letters and retain its four middle GP symbols. This yields the **source-exact 4×4 GP-index matrix** (the four tracks are rows):

| Track | Interior GP indices |
| --- | --- |
| H → B | 17, 19, 27, 21 |
| O → U | 12, 6, 14, 27 |
| M → D | 27, 2, 24, 28 |
| E → S | 20, 7, 1, 11 |

Its determinant modulo29 is **22**, and the matrix of corresponding GP **prime** values reduced modulo29 has determinant **7**. Thus both are invertible. The immediately following original visual section **p33–39 comprises 1,680 runes = 420 × 4**. A simple, complete proposed consumer is a four-rune Hill cipher over GF(29), with either matrix encoding, the original/transposed matrix, multiplying by it or its inverse, and either consecutive four-rune groups or four contiguous 420-rune strands: **16 fixed configurations**.

All sixteen candidate inverses re-encode the original **1,680/1,680** runes exactly, and all recover a separate **84/84** GP-rune planted control taken from the genuinely clear p57. These are implementation checks; every wrong invertible Hill key has the same original re-encryption property. The unchanged p33–39 runes have **IoC 0.03436002**. The 16 candidate outputs span **0.03421254–0.03470958**, with no readable GP-native plaintext. The 84-rune solved p57 reference has IoC **0.05823293**. Under these exact source-selected mappings and block clocks, the proposed direct Hill4 handoff is unproductive. Different word segmentation, nonlinear feedback, another language and a source-specified unrelated operator are outside this negative.

A second, simpler consumer uses the same source-selected interior matrix **as sixteen consecutive additive GP29 key symbols**, an operation with precedent in the solved LP2 prime/totient arithmetic. Freeze rune-index versus GP-prime residues, row-major versus column-major key ordering, both arithmetic signs, and continuous versus page-local key clocks: **16 additional exact inverse candidates** against the same original pp33–39 chapter. Every original rune round-trips by subtraction/addition; every candidate's IoC remains **0.03423098–0.03473014**, and none yields GP-native prose. The alternative repeating-key handoff therefore fails under these source-frozen clocks as well. These results do not exclude all possible matrix ciphers or secret stream keys, only the two specified direct original-input consumers.

The original pp49–51 numeric table also has **256 provisional base60 bytes**, or 16 AES-128 blocks. A direct binary cross-artifact consumer was therefore frozen without inventing a password derivation: use the sixteen p32 middle-track values as a raw 16-byte AES-128 key, either GP **ordinals** or unreduced GP **prime numbers**, in row/column key order. Decrypt the exact original table bytes with ECB or CBC using an all-zero IV (**8 configurations**). Their decrypted outputs have **79–104 printable ASCII bytes of 256**, no recognizable structured-file header or continuous text, and no source-selected nonzero IV. This is a negative for these eight literal AES-128 handoffs, subject to the base60-byte interpretation, rather than a general AES exclusion.

**The missing causal input is still an authorial selection** of the (+5,+5) rule, why the words signify boundaries, and which mathematical consumer applies to the four middle tracks. The matrix extraction is testable and lossless as a key, yet the manuscript does not prescribe Hill4. Stop at this negative rather than rescuing it with fitted offsets or new cipher layers.

**Reproduce the alignment censuses, both fixed-marginal shuffle controls and all 40 original inverse consumers:** [read-only CommonJS SFT](../sims/lp2_p32_halfgrid_wordpair_hill4_sft.cjs). It uses only the repository's source LP2 GP corpus and checked-in TextBlob frequency reference.

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

The direct Hill4, periodic GP29 additive and literal AES-128 transfer from the four-track interior matrix are closed under their **40 combined source-frozen variants**: none yields natural GP-English output, and exact inverse round trips alone cannot identify a historical cipher. The underlying HOME/BUDS **(+5,+5)** source relationship remains potentially interesting, although its retrospective selection and the lack of an authored direction or cipher rule prevent promotion to an established key or intended route.

Further dependent work needs an independently dated manuscript or signed-source operation selecting a BUD-to-HOME path, the matrix consumer, or a testable original p50 table address. Arbitrary key compositions and fitted shifts would destroy the discrimination. The earlier M7 navigation and competing E/X endpoints remain provisional. **No unknown LP2 rune has been deciphered, and no final destination is verified.**

**Reproduce:** [standalone CommonJS SFT](../sims/p32_bud_home_branch_route_sft.cjs) reads the canonical [numeric corpus](../resources/liber-primus/lp2-corpus.json), asserts all source coordinates and path sums, runs the conditioned original-multiset permutation experiment and checks exact deterministic counts.
