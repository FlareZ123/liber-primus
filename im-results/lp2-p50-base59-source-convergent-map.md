# Original p49–51 numeral field: source-missing-f base59 self-map

**Agent20, 16 November 2026, Director Issue #1256. Classification: provisional original-source structural finding with no plaintext/key.**

## Complete 256-cell original input and executable interpretation

The source [32×8 printed table](../resources/liber-primus/base60-grid.json) spans physical p49 (10 rows), p50 (13 rows), p51 (9 rows), exactly scans 66.jpg through 68.jpg. All **256** cells have two characters, with the conventional 60-symbol alphabet formed from digits 0–9, uppercase A–Z and lowercase a–x. **Precisely lowercase f is missing from every original cell. Every other base60 character occurs.** This is an already documented original-artifact fact in the repository's [prior base60 directional-graph report](lp2-p50-directional-functional-graph-prime-ordinal-starts.md); the new observation here is the globally convergent **literal address→value graph** under that 59-symbol parse, distinct from the previous mod29/quotient keypad model. Removing that one source-absent character produces a unique 59-digit ordered alphabet covering every printed token. It is a plausible competing numeral basis, although the original authors do not explicitly identify a base.

For either base B=60 or B=59 (remove f, preserve the order of all other symbols), decode each token as high-digit times B plus low-digit, giving values 0–255 in both cases. Let the value at row-major address i be V[i]. The frozen directed map has **next(i)=V[i]**, with all 256 possible addresses. The six source-identified starting positions are first 0, last 255, and the physical table page-seam endpoints **79,80,183,184**. Traverse each until first repeated address. This is a fully executable directed map without a guessed key.

A canonical complete reverse-tree readout was also frozen: sort directed cycles by minimum address; begin each cycle at that minimum and follow its actual outgoing edges; visit each cycle member and its noncyclic incoming descendants depth-first in increasing numeric address order. This produces exactly 256 different address positions without choosing a convenient path.

## Actual original graph

| Feature | Base60 conventional | Base59 missing only original-absent f |
|---|---|---|
| Unique decoded values | 161 / 256 | 161 / 256 |
| Directed cycles | Length 11 (minimum 0); length 2 (minimum 158) | **Single length-1 fixed point 189** |
| Largest cycle's attraction basin | 252/256 addresses | **256/256 addresses** |
| Six starting-path lengths | 11, 16, 22, 32, 16, 23 | 26, 17, 30, 31, 30, 18 |
| All six source seeds enter same basin | Yes | Yes |

**Base59 exact fixed-point identity:** global address **189** is the one-based **24th row, sixth column** (p51's first numeric row). Its original printed cell is **3C**, which numerically equals **3×59+12 = 189**, so it points to itself. Every other original address eventually reaches 189, with maximum depth **38** (addresses98 and134). The entire 256-vertex graph is a single directed in-tree feeding that self-loop. It has exactly 95 leaves (indegree0), with indegree frequencies 0:95, 1:92, 2:49, 3:14, 4:6. The unusual missing-f base59 choice was selected from the original symbol inventory, not tuned by trying arbitrary deleted digits.

The original p51 image (scan68.jpg) was inspected. Its first numeral line is **28 2a 0J 1L 0c 3C 2o 0X**, with the fixed-point cell in ordinary black type. There is no printed highlight, direction instruction or plaintext receiver tied visibly to this cell.

## Matched graph null and actual typed readout

The [complete original SFT](../sims/lp2_p50_base59_base60_selfmap_sft.cjs) shuffles the **exact original multiset of 256 decoded values** 30,000 times separately for each base, preserving collisions and limiting the comparison to its specified hypothesis.

- In the **base59** fixed-multiset null, **108/30,000 (0.0036)** maps have **one cycle consisting of one fixed point attracting all 256 addresses**, as the original does. This is an uncommon structural feature in the prespecified base59 branch, but the numeral base and multiple graph features constitute a wider exploratory decision; the number is not a familywise historical authorship probability. **Independent competing evidence favors base60:** an earlier [conditional p15/p39/H-source polynomial syndrome analysis](lp2-p50-hg-single-residue-correction.md) showed that the original base60 table satisfies its four GF29 error-locator syndromes while the missing-f base59 values fail. Those syndromes are a retrospective hypothesis, not an authenticated table-reader instruction, but their exact original-source arithmetic must remain part of the assessment of the base59 alternative.
- In the **base60** null, **4,685/30,000 (0.15617)** maps have a basin of at least the original 252 addresses; **11,571/30,000 (0.38570)** put all six seam seeds in the same basin. These are ordinary enough to undermine a standalone base60 directed-map claim.

The canonical reverse-tree permutation read as original numeric *byte values* is no authenticated message. For base60 its byte tape has **103/256 printable ASCII bytes**, a longest printable span of six, and begins in hexadecimal **CB 00 E5 44 C7 44 2F C7 2E 2E 8D 8D 85 1F 6A 6A**. Neither base's canonical byte stream begins with a tested PNG, PDF, ZIP, gzip, ELF, GIF, or RIFF file header, and neither is a complete readable typed text. A 256-position permutation cannot repair this byte histogram. No cipher key, plaintext or authenticated file emerges from the canonical readout.

## Causal interpretation and explicit limitation

The missing-f 59-digit alphabet creates one exact **global destination cell at address189**, potentially useful if a player was intended to use the 256 values as directions. Its attraction-basin feature is independent of the earlier *keypad* graph; it remains opposed by the existing base60 quadratic-syndrome result. The root and its full convergence are new concrete original-data properties. Their original authorial meaning is unresolved: no Cicada source yet tells a reader **which reverse branch to follow, what visited addresses mean as GP29/bytes, or which LP2 ciphertext page should consume them**. The signed 2016 message about words, meanings, numbers and direction does not independently choose the 59-digit radix, depth-first child order or plaintext receiver. The six source seeds provide no independent confirmation because a single basin forces their convergence.

**Research decision:** preserve this bounded base59 self-addressing anomaly as a candidate source-selected address mechanism requiring an independent recipient and readout clue. Retire the naive complete reverse-tree byte-stream decoder and base60 giant-basin argument. Do not multiply traversal variants to force a word. No unknown LP2 plaintext, full cipher or destination is established.

[Reproducible Windows/Node22 source-native run 43883633662](https://github.com/FlareZ123/liber-primus/actions/runs/43883633662), including exact original 256-cell assertions, both bases, six paths, full graph coverage and deterministic matched-null frequencies.
