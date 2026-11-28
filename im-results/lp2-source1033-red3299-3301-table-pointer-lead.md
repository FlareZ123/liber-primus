# Conditional LP2 numeric-table navigation: 1031→33, 1033→49, red 3299→49, 3301→00

**Agent35, 15 November 2026; Agent50 source-frozen extension, 28 November 2026. Evidence class: exact but unselected source-number lookup. No recovered unknown LP2 plaintext, authentic key, or destination.** The original three-cell coincidence is retained, with a new fourth input that produces a conditional two-hop page path. Neither the enlarged pattern nor its literal page-number reading establishes an author-issued modulo-256 instruction.

## First-party objects and one fixed, executable operation

The 2014 Onion7 original publication index names images `0.jpg` through `57.jpg`, including `49.jpg`, the **first page containing the numeric table** (original LP2 page49). The table spans p49–51, printed **32 rows × eight base-60-looking tokens**, with 256 printed cells. The earlier solved LP1 source carries two conspicuous **5×5 magic-square sums 1033 and 3301**; the LP2 original p15 4×4 Fibonacci-prime spiral highlights **3299 in red**, uniquely among its sixteen printed numbers. These three integers are independently present on source pages. A fourth historical number is **1031**, the exact GP-prime sum of the 30-rune middle sentence of solved LP2 p57, "WE MUST SHED OUR OWN CIRCUMFERENCES" (p57 indices37–66), and a factor of authentic 2013 audio metadata 1,595,277,641 = 1259×1031×1229. It is the lower twin prime of 1033; the other lower twin 3299 is visibly highlighted on p15. The earlier [twin-prime source study](lp2-p50-1031-checksum-quotient-and-original-paragraph-gate.md) had already documented both pairs and their contemporaneous April 2014 recognition. **The twin relationship itself is not new evidence.** The fixed modulo-256 lookup below previously covered only 1033, 3299 and 3301.

A straightforward but **not manuscript-specified** interpretation of "their numbers are the direction" (the signed 2016 hint) is:

1. Number the table's 256 cells **zero-based in original row-major order**, as the 2014 onion JPGs are numbered from zero.
2. For a printed integer `n`, select cell `n mod 256`.
3. Read the two-character **literal printed token** at that cell as a potential pointer, without fitting any key, plaintext, alphabet, mask, rotation or phase.

This preserves the printed 32×8 layout, needs neither an invented 16×16 reshaping nor one GP29 decryption layer, and uses source-selected integers. The *missing source instruction* is that the original author never explicitly commands this modulo-256 lookup. Interpreting a token as a page filename rather than a byte is also conjectural.

## Exact original-source outputs

| Original source number | Cell `n mod 256` | Original table location | Printed token | Natural conditional destination |
| --- | ---: | --- | --- | --- |
| Solved p57 middle-clause sum **1031** | **7** | p49 row1 col8 | **33** | conditional `33.jpg`, original LP2 p33 with the 1033 cuneiform number |
| LP1 square sum **1033** | **9** | p49 row2 col2 | **49** | original Onion7 `49.jpg`, the table's opening page |
| LP2 p15 **red 3299** | **227** | p51 row6 col4 | **49** | original Onion7 `49.jpg`, the table's opening page |
| LP1 square sum **3301** | **229** | p51 row6 col6 | **00** | image index0 / first table cell0 |

On the same previously fixed addressing rule, **1031 maps to the literal token `33`** at original top-row cell7. The table prints `33` twice, at zero-based cells7 and14; `33` is a legal original Onion7 filename/page index and physical LP2 p33 displays the original cuneiform number **1033**. The conditional path is therefore **solved p57 (1031) → p33 (1033) → p49 (table)**. This is an additional source-correspondence, not an independently blinded prediction: 1031 was already known as the lower twin of 1033 and the interpretation of `33` as a page pointer was chosen after looking at the printed token. As an alternative interpretation, radix60 `33` is simply byte183, with no page hop. Neither an original decoder nor a plaintext operand follows.

The two adjacent-source numbers **3299 and 3301 differ by exactly 2**. Their zero-based table addresses **227** and **229** are separated by exactly one printed cell in the *same p51 row*. The two unambiguous output tokens are `49` and `00`, independent of whether the otherwise plausible table radix is read as base60 or base59. The third source number 1033 independently selects another `49` in p49, so the connection survives the page boundary. Physical source images `66.jpg` (LP2 p49) and `68.jpg` (LP2 p51) visibly print the relevant tokens, which require no I/l case adjudication.

**Independent highlighted-cell contrast:** the sixteen **printed** p15 spiral values yield literal output `49` **only for the unique red value 3299**; none yields `00`. The other fifteen values have different table tokens. A natural one-based lookup `(n−1) mod 256` instead produces `26`, `1W`, `1D`, `2O` for 1031,1033,3299,3301 respectively; that orientation does not have the same apparent filenames. This is an orientation-specific observation, not a reason to assert zero-based indexing was intended.

The entire table contains exactly **two** literal `33` tokens at positions **7,14**, **three** literal `49` tokens at zero-based indices **9,158,227**, each conventional base60 byte **249**, and exactly **two** `00` tokens at indices **192,229**, byte0. Under the simplest candidate byte-pointer operation `next(i)=byte[i]`, the three `49` indices all feed the already documented **two-cell 158↔249 cycle**. Source 1033 and red3299 are the **other two nodes** feeding into this same tiny four-cell connected component `{9,158,227,249}`, whereas 3301 maps to first cell0 and enters the other 11-cycle. The new source input1031 instead addresses cell7; it is the **literal page-number** interpretation of its `33` output—not the conventional byte-pointer successor183—that conditionally enters the p33→p49 route. This is a useful consistent description of the lookup structure, but earlier [direct byte-pointer experiments](lp2-p50-direct-byte-pointer-firstcell-cycle-gate.md) yielded no plaintext.

### Exact but conditional rarity

Freeze the three input positions **9, 227, 229**, the two target literal values **49, 00**, and the observed histogram with three copies of 49 and two of 00. Under a uniformly random permutation of the same 256 table bytes, the probability of the precise required ordered triple `[49,49,00]` is:

$
\frac{3\cdot 2\cdot 2}{256\cdot255\cdot254}=\frac{1}{1{,}381{,}760}.
$

**This is not a discovery-adjusted p-value. It measures only the three original selected cells: the later 1031→33 observation was not prospectively registered, and no fourth-target null probability is admissible as authorial evidence.** We noticed the matching outputs during source-led investigation, and substantial preceding work has examined many numerals, data framings and page relationships. The 256-cell modulo rule, literal page-number targets and 2016 hint linkage were not all registered before table inspection. Therefore the above small conditional probability cannot by itself establish Cicada authorial design or a recovered key. Another alphabet, row count, seed list or arbitrary output could easily increase the effective search space. A real author instruction would be much stronger evidence than this coincidence, however visually striking.

## Next decision that could lead to plaintext

**Preserve the exact source lookup as a high-specificity clue candidate** and seek an **independent first-party selector** for (a) modulo-256 row-major addresses and (b) consuming the resulting two-character filename/byte pointer. The conditional p57→p33→p49 chain is now fully spelled out, but no source says that literal two-character numerals are page indices instead of base60 bytes or what operation the selected page contributes to decryption. A serious next decision requires a new, independently legible instruction that selects this navigation grammar and yields an original **GP29 operand and receiving ciphertext interval**, frozen before those runes are scored. Additional retrospective number-to-token coincidences are not such an instruction.

A successful independently forecast lookup could validate the table as navigation infrastructure. A decoder would still need an exact operation on original GP ciphertext and a full withheld plaintext prediction. Do not promote this to `results/` without those missing steps.

[Read-only standalone Node22 CommonJS SFT](../sims/lp2_source1033_3299_3301_grid_pointer_sft.cjs) checks original table positions, the newly added authentic p57 1031 GP-prime sum and `1031→33` at cell7, exact source tokens, red-cell uniqueness, 158↔249 cycle, reversed indexing contrast and combinatorial arithmetic. Uses `resources/liber-primus/lp2-grid-256.json` and original-index archive `resources/cicada2014-onion7-index.html`. No synthetic cipher recovery is claimed.
