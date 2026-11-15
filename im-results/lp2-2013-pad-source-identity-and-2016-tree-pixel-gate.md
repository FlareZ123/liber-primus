# Original-artifact source-to-key gates: 2013 binary provenance and 2016 tree pixel strips

**13–15 November 2026, Agents 7 and 27. Classification: bounded original-input negatives.** The LP2 ciphertext remains unsolved. Neither test recovers a key, plaintext, historical endpoint or source-authenticated operation.

## 2013 source data reused verbatim in the p49–51 numerical grid?

The authentic 2013 CicadaOS file `DATA/560.13` is an attractive *source* of randomness because the 2013 round demonstrably used it as an XOR pad. The 2014 LP2 physical pp49–51 print exactly 32 rows of eight numeric tokens. Under the already established, **conditional** two-base60-digit parsing, they give 256 bytes (SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`).

A direct literal reuse hypothesis is unusually cheap to test and needs no speculative cipher: search for the **entire** printed 256-byte grid in row-major and column-major order and complete reversals, plus each of the **32 printed eight-byte rows** and **eight original 32-byte vertical columns**, each forward and reversed, inside the complete historical data file. That is **84 fixed source-shaped candidates**. All source byte offsets are granted: if copied unchanged, one must match.

The original file downloaded in CI has exactly **118,818,811 bytes** and SHA-256 `db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f`. **Zero of 84** candidates occur in it. Synthetic eight- and 32-byte planted copies at known offsets both succeed, demonstrating the test's exact-match power. [Self-contained CommonJS reproducer](../sims/lp2_grid_2013_pad_literal_overlap_sft.cjs), [source-downloading Windows workflow](../.github/workflows/lp2-grid-2013-pad-literal-overlap.yml), [successful CI log/run 43370674533](https://github.com/FlareZ123/liber-primus/actions/runs/43370674533).

**Decision:** the table cannot be an unchanged whole-block, physical row or physical column copied from this specific 2013 data source under the pinned base60 parse and source reading orders. This does **not** exclude table encryption, separated byte positions, a transformed copy, GP29 projection of the data file, other 2013 files, or the numeric table being a stand-alone cipher rather than a key.

## Exact printed motifs against three other original 2013 files (Agent 27, 15 November)

The previous whole-`DATA/560.13` test does not establish absence from the *other* surviving historical 2013 binaries. The first-onion and telephone challenge source records independently identify **`_560.00`** and **`560.17`** as actual 2013 pad files; the same year's independently archived **`761.MP3`** has a genuine Cicada title and Parable tag. All three are distinct exact source byte streams, rather than variants of the larger `560.13` pad. This gives a finite historical source-of-key retrieval gate: was **any unchanged original physical row, column, or entire 256-cell table** copied verbatim into any of these three known files?

Freeze the exact same **84 candidates** already defined for `560.13`: original 32×8 row-major and column-major complete 256 bytes and their reversals; all 32 original 8-byte rows and eight 32-byte columns in forward and reverse directions. Search each full original 2013 source for *every exact contiguous byte offset*, with no XOR, free phase, adjusted radix, inferred new transposition or language score. Each source object's archived SHA-256 and byte length are required to match before the test.

| Independently pinned 2013 original | Source bytes | Original SHA-256 prefix | Complete exact motif matches |
| --- | ---: | --- | ---: |
| CicadaOS `_560.00` | 3,992,970 | `a24051a87f0eb25c` | **0/84** |
| CicadaOS `560.17` | 1,183,811 | `d5676b1e01fd371c` | **0/84** |
| Original `761.MP3` | 4,010,732 | `83008217439110c3` | **0/84** |
| **Total** | **9,187,513** | three individually verified complete file hashes | **0/252** |

The actual original-file checks and source-motif comparisons ran on **Windows/Node.js 22**, with exact complete length and SHA-256 assertions, as successful [manual original-source run 43746441439](https://github.com/FlareZ123/liber-primus/actions/runs/43746441439). The program also plants and locates the full 256-byte table, a printed 8-byte row and a 32-byte column in a separate source-shaped buffer to establish exact-match sensitivity. The [single-file CommonJS reproducer](../sims/lp2_2013_smallpads_p50_literal_rows_sft.cjs) and [manual-only workflow](../.github/workflows/lp2-2013-smallpad-p50-motifs-manual.yml) are committed; the workflow downloads all three immutable archive revisions and does not persist large original binaries.

**Decision:** retire *unchanged contiguous physical-motif copying* from this finite set of **four** distinct 2013 binary sources, including the earlier `DATA/560.13` negative, under the conditional original table's conventional base60 byte reading. No full-table, row or column literal source identification was obtained, so no original LP2 deciphering key or new plaintext is supported. This does **not** exclude a transformed source key, other independently preserved source files, separately serialized numeral characters, a different table radix, or other uses of these earlier data. A new source motif test should name an independent authored selector rather than enlarge the historical-file census without a causal route to decipherment.

## A different direct source use for the 2016 signed tree image

The independently authenticated 2016 `4gq25.jpg` has unusual **563×569** pixel dimensions. Original LP2 physical p32 has **121 runes**; an unprinted **11×11** row-major reshape gives first-row GP prime weights totaling **563**, first-column weights totaling **569**. This p32-to-image relationship was previously documented; the present experiment introduces a different, literal possible consumer. If each of those first-row/column prime weights specifies the width/height of one image strip, they partition the original 563×569 image into **11×11 variable-size tiles**, with **100 interior tiles** corresponding to the **100 non-axis p32 runes**.

Freeze that geometry and read each interior tile's grayscale mean and fraction of pixels above 127. A direct brightness encoding would correlate original interior GP prime values with at least one image measurement. The two source-exact absolute Pearson correlations are only **0.0805545227** and **0.0846994068**, respectively. In **1,000 deterministic shuffled-rune controls**, **408** produce a maximum of these two abs correlations at least as large as the original, giving an adjusted add-one empirical **p=0.4085914086**. A synthetic 563×569 image whose tile intensities encode the original 100 GP primes recovers **r=1**, verifying the axis/measurement implementation.

[Python/Pillow original-image reproducer](../sims/lp2_p32_2016_prime_strip_pixel_sft.py), [Windows source-download workflow](../.github/workflows/lp2-p32-2016-prime-pixel-grid.yml), [successful CI run 43371439712](https://github.com/FlareZ123/liber-primus/actions/runs/43371439712). The runner retrieves the original historical image from the archival repository and prints its SHA-256 and exact dimensions. Unlike the table copy experiment, the pixel experiment is an *analyst-proposed decoder*: there is no authenticated 2016 instruction explicitly prescribing prime-width tiling, threshold 127, or a brightness-to-rune mapping. The test only retires these two simple direct measurements and leaves other image-steganographic or tree-navigation operations unresolved.

## Research decision

Both branches were plausible bounded *source-as-key* consumers, and both failed their original tests. Their diagnostic value is the exclusion of a direct, executable mechanism. Do not continue them by freely searching every byte transform, phase, image threshold, crop or rectangle size absent a new historical clue. The priority remains independently selected key material or a reversible operation that recovers a complete original LP2 passage, especially an authenticated missing final-stage source or a clue constraining its selection.