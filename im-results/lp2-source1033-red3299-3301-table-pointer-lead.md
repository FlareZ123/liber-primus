# A source-number address lead in the original 256-cell table: 1033→49, red 3299→49, 3301→00

**Agent35, 15 November 2026. Evidence class: novel exact cross-source lookup, but an *unselected* navigation operation. No decrypted LP2 rune, authentic cipher key or intended final destination.** This finding merits an explicitly discriminating source-selector investigation before any dependent decipherment. The exact lookup result is not evidence that the creator deliberately encoded it.

## First-party objects and one fixed, executable operation

The 2014 Onion7 original publication index names images `0.jpg` through `57.jpg`, including `49.jpg`, the **first page containing the numeric table** (original LP2 page49). The table spans p49–51, printed **32 rows × eight base-60-looking tokens**, with 256 printed cells. The earlier solved LP1 source carries two conspicuous **5×5 magic-square sums 1033 and 3301**; the LP2 original p15 4×4 Fibonacci-prime spiral highlights **3299 in red**, uniquely among its sixteen printed numbers. These three integers are independently present on source pages; no table output was used to calculate them.

A straightforward but **not manuscript-specified** interpretation of "their numbers are the direction" (the signed 2016 hint) is:

1. Number the table's 256 cells **zero-based in original row-major order**, as the 2014 onion JPGs are numbered from zero.
2. For a printed integer `n`, select cell `n mod 256`.
3. Read the two-character **literal printed token** at that cell as a potential pointer, without fitting any key, plaintext, alphabet, mask, rotation or phase.

This preserves the printed 32×8 layout, needs neither an invented 16×16 reshaping nor one GP29 decryption layer, and uses source-selected integers. The *missing source instruction* is that the original author never explicitly commands this modulo-256 lookup. Interpreting a token as a page filename rather than a byte is also conjectural.

## Exact original-source outputs

| Original source number | Cell `n mod 256` | Original table location | Printed token | Natural conditional destination |
| --- | ---: | --- | --- | --- |
| LP1 square sum **1033** | **9** | p49 row2 col2 | **49** | original Onion7 `49.jpg`, the table's opening page |
| LP2 p15 **red 3299** | **227** | p51 row6 col4 | **49** | original Onion7 `49.jpg`, the table's opening page |
| LP1 square sum **3301** | **229** | p51 row6 col6 | **00** | image index0 / first table cell0 |

The two adjacent-source numbers **3299 and 3301 differ by exactly 2**. Their zero-based table addresses **227** and **229** are separated by exactly one printed cell in the *same p51 row*. The two unambiguous output tokens are `49` and `00`, independent of whether the otherwise plausible table radix is read as base60 or base59. The third source number 1033 independently selects another `49` in p49, so the connection survives the page boundary. Physical source images `66.jpg` (LP2 p49) and `68.jpg` (LP2 p51) visibly print the relevant tokens, which require no I/l case adjudication.

**Independent highlighted-cell contrast:** the sixteen **printed** p15 spiral values yield literal output `49` **only for the unique red value 3299**; none yields `00`. The other fifteen values have different table tokens. A natural one-based lookup `(n−1) mod 256` instead produces `1W`, `1D`, `2O` for the three cited integers; that orientation does not have the same apparent filenames. This is an orientation-specific observation, not a reason to assert zero-based indexing was intended.

The entire table contains exactly **three** literal `49` tokens at zero-based indices **9,158,227**, each conventional base60 byte **249**, and exactly **two** `00` tokens at indices **192,229**, byte0. Under the simplest candidate byte-pointer operation `next(i)=byte[i]`, the three `49` indices all feed the already documented **two-cell 158↔249 cycle**. Source 1033 and red3299 are the **other two nodes** feeding into this same tiny four-cell connected component `{9,158,227,249}`, whereas 3301 maps to first cell0 and enters the other 11-cycle. This is a useful consistent description of the lookup structure, but earlier [direct byte-pointer experiments](lp2-p50-direct-byte-pointer-firstcell-cycle-gate.md) yielded no plaintext.

### Exact but conditional rarity

Freeze the three input positions **9, 227, 229**, the two target literal values **49, 00**, and the observed histogram with three copies of 49 and two of 00. Under a uniformly random permutation of the same 256 table bytes, the probability of the precise required ordered triple `[49,49,00]` is:

$
\frac{3\cdot 2\cdot 2}{256\cdot255\cdot254}=\frac{1}{1{,}381{,}760}.
$

**This is not a discovery-adjusted p-value.** We noticed the matching outputs during source-led investigation, and substantial preceding work has examined many numerals, data framings and page relationships. The 256-cell modulo rule, literal page-number targets and 2016 hint linkage were not all registered before table inspection. Therefore the above small conditional probability cannot by itself establish Cicada authorial design or a recovered key. Another alphabet, row count, seed list or arbitrary output could easily increase the effective search space. A real author instruction would be much stronger evidence than this coincidence, however visually striking.

## Next decision that could lead to plaintext

**Preserve the exact source lookup as a high-specificity clue candidate** and seek an **independent first-party selector** for (a) modulo-256 row-major addresses and (b) consuming the resulting two-character filename/byte pointer. The most promising independent test would reconstruct a human puzzle route starting from a *different, prospectively selected and historically salient* source numeral and predict an **unseen** table token or authentic prose fragment *before inspecting that target cell*. Reusing 1033,3299,3301 to fit more transformations is not such a test.

A successful independently forecast lookup could validate the table as navigation infrastructure. A decoder would still need an exact operation on original GP ciphertext and a full withheld plaintext prediction. Do not promote this to `results/` without those missing steps.

[Read-only standalone Node22 CommonJS SFT](../sims/lp2_source1033_3299_3301_grid_pointer_sft.cjs) checks original table positions, exact source tokens, red-cell uniqueness, 158↔249 cycle, reversed indexing contrast and combinatorial arithmetic. Uses `resources/liber-primus/lp2-grid-256.json` and original-index archive `resources/cicada2014-onion7-index.html`. No synthetic cipher recovery is claimed.
