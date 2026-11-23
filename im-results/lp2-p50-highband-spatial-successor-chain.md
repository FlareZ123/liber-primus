# Original p50 numerical-panel high-band spatial successor chains

**Agent38, 23 November 2026. Classification: a new original-image structural observation with a finite, selection-aware spatial null; exploratory clue, not an authenticated key, decryption or destination. The manuscript's 56 unknown LP2 pages remain encrypted.**

## Human-visible original anomaly

Across three 2014 Liber Primus JPEG pages **66.jpg, 67.jpg, 68.jpg** (physical LP2 p49, p50, p51), exactly **256 printed two-character numeric tokens** form a continuous **32×8 grid**; the page breaks fall after rows 9 and 22, using zero-based grid rows. In the ordinary alphanumeric base60 interpretation recorded by \`resources/liber-primus/base60-grid.json\`, each token becomes a byte. This digit alphabet is a plausible reconstructed convention, **not an author-signed base60 instruction**; the source's printed character sequence is more fundamental.

Within **the highest sixteen conventional byte values 240–255**, 17 source cells have values in that range. Seven of the grid's **906 horizontal, vertical or diagonal neighboring cell pairs** contain two adjacent consecutive numeric values entirely within this sixteen-value band. They are spatially concentrated on the first two independent physical image pages:

| Original scan | Original zero-based grid coordinate | Neighbouring source tokens | Ordinary base60 byte values |
| --- | --- | --- | --- |
| 66.jpg / p49 | (6,0) → (7,0) | \`4D → 4E\` | 253 → 254 |
| 66.jpg / p49 | (7,0) → (8,1) | \`4E → 4F\` | 254 → 255 |
| 67.jpg / p50 | (17,4) → (18,4) | \`45 → 46\` | 245 → 246 |
| 67.jpg / p50 | (19,5) → (20,6) | \`4B → 4A\` | 251 → 250 |
| 67.jpg / p50 | (19,6) → (19,7) | \`49 → 48\` | 249 → 248 |
| 67.jpg / p50 | (19,6) → (20,6) | \`49 → 4A\` | 249 → 250 |
| 67.jpg / p50 | (19,6) → (20,7) | \`49 → 48\` | 249 → 248 |

Thus the printed token tape itself has connected increasing paths **\`48 → 49 → 4A → 4B\`** (four cells, three edges) and **\`4D → 4E → 4F\`** (three cells, two edges). The value **252, printed token \`4C\`**, occurs zero times in the entire grid. As a *separate optional interpretation*, those source tokens also happen to be literal two-digit hexadecimal representations of ASCII **H I J K**, and **M N O**, separated by missing **L**. Nothing in the source instructs the reader to use hexadecimal ASCII here, and these letters are **not recovered LP2 plaintext**. The source values are independent of choosing a plaintext language, cipher key or decryption threshold.

## Controls against a random table layout

To check whether such neighboring numeric runs occur simply by chance, preserve the **exact original multiset of all 256 printed bytes**, the 32×8 geometry and the true physical page boundaries. Deterministically shuffle cells **only within each original JPEG**, preserving separately the first 80, middle 104 and last 72 numerical tokens. For each reshuffled panel count all neighbor pairs of consecutive source-byte values that lie in the **same one of sixteen fixed 16-byte bands** \`[0,15]\`, \`[16,31]\`, …, \`[240,255]\`. Rather than test only the post hoc favorable last bin, use the **maximum count over all 16 bins** as the primary statistic.

| Test on untouched original panel | Original | Page-preserving inventory shuffle, 200,000 runs | Conservative plus-one tail |
| --- | ---: | ---: | ---: |
| Maximum neighboring consecutive pairs in any of 16 numeric bands | **7**, in bin240–255 | **2** shuffled panels reach 7 | **3 / 200001 ≈ 0.000015** |
| Consecutive neighbor pairs in predesignated bin240–255 only | **7** | **1** shuffled panel reaches 7 | **2 / 200001 ≈ 0.000010** |

Original per-band edge counts are exactly \`[0,0,0,2,0,1,0,1,0,2,0,0,1,0,0,7]\`. With seed \`0x33013301\`, the fixed, deterministic Fisher–Yates page-level null produces maximum-value frequencies \`{0:466,1:81511,2:98774,3:17489,4:1608,5:139,6:11,7:2}\`. The latter is a conditional *layout* comparison, assuming exchangeability within page, rather than a calibrated probability that Cicada intentionally encoded an instruction. Other feature definitions were considered after seeing the data; the maximum-over-16 control covers the choice of numeric band and still cannot correct for every exploratory choice of distance metric, traversal, cryptographic register or earlier investigation.

A second **stricter** null preserves the original full **32 rows** individually and shuffles only the eight cells **within each original printed row**. For the seven high-band neighbor-pair count, **43 / 200,000** fixed-seed \`0x4a4b4d4f\` shuffled panels meet or exceed original, plus-one **44/200001 ≈ 0.000220**. This suggests the original high-band pattern also depends on intra-row ordering, beyond merely clustering large values into adjacent rows. None of these descriptive tails establishes authorship or supplies a plaintext decoder.

**Radix caveat:** Some earlier work considers a 59-symbol alphabet omitting lowercase \`f\`. Under that alternative all printed \`4D/4E/4F\` and \`48/49/4A/4B\` values shift but their consecutive ordering and **the exact same seven neighbor pairs** persist. The source printed token paths are therefore robust across those two reasonable digit alphabets. However, the specific assignment to numeric bin240–255 depends on conventional base60, so the 16-band permutation probability remains conditional on that original register choice.

## What changes and what does not

This is a bounded, **potentially informative visual clue** in the actual manuscript grid: two physically separated printed-page regions contain source-preserving, neighboring ascending token sequences, and their concentration is rare under the declared fixed-inventory controls. It is materially different from purely numerical equalities or decryptions selected after language scoring. The first-page chain spans three rows, while the second-page four-value chain is interwoven within two rows. The source-image positions can be checked by a reader without calculating a candidate LP2 plaintext.

The authentic [2016 Cicada OutGuess signed text](../resources/historical/cicada2016-4gq25-outguess.asc) explicitly frames Liber Primus as a path whose “numbers are the direction.” That broad, historically subsequent hint makes a numeric **navigation** hypothesis understandable to a human solver, yet does not select a high-byte subset, neighboring-successor movement or a particular ciphertext receiver. The independent signed hint therefore motivates attention, without authenticating the extracted ASCII alphabet paths.

The strongest rival explanation is a nonuniform/structured process used to generate the original numeric panel, possibly unrelated to an intended hidden instruction. The current test cannot discriminate accidental structure, generic table construction, a small embedded watermark or an actionable cipher hint. No source-authored instruction tells the reader **which high-value group to select, where to start, how to traverse branched paths, what missing \`4C\` means, or how to turn any sequence into a key or GP29 inverse**. There is no original unknown-page plaintext or externally authenticated destination. Consequently no free-parameter additive/decryption search is justified on these strings, and this observation remains **intermediate**; do not promote it to \`results/README.md\` as a decipherment.

A useful future decision would identify, independently of these favorable output symbols, a **creator-era operation that uses neighboring sequential printed tokens**, plus a unique receiver and a held-out original-rune consequence. The original paths and the clear missing \`4C\` then become finite predictions rather than opportunities to tune a decoder.

**Reproducer:** [read-only Node22 CommonJS original-input SFT](../sims/lp2_p50_high16_spatial_successor_sft.cjs); [completed Windows Node22 original-input PASS, run 45135389864](https://github.com/FlareZ123/liber-primus/actions/runs/45135389864); [manual Windows workflow](../.github/workflows/lp2-p50-high16-spatial-original-manual.yml). Input is the unchanged [source transcribed 32×8 grid](../resources/liber-primus/base60-grid.json), cross-checked character by character against the decoded byte rows, with original JPEGs 66–68 available alongside it. Run prints all high-value coordinates, all seven edges, both 200,000-shuffle null outputs, seeds, band means and maxima histogram.
