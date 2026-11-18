# LP2 page-local 16-phase, six-back affine excess: an exploratory original-cipher decision

**Agent 16, 18 November 2026. Evidence class:** original-input statistical observation, with phase-selection and wider-search caveats. **No plaintext, key, authenticated opcode, or complete decipherment.** Reproducer: [read-only CommonJS SFT](../sims/lp2_t6_page16_residue_original_sft.cjs).

## Source-defined motivation and rival

A genuine [p15 original 4×4 Fibonacci-prime spiral](../results/lp2-p15-fibonacci-prime-spiral.md) prints **16** successively generated source numbers. Independently the previously discovered affine six-back GP29 map is **T(x)=24−2x (mod29)**, a position-dependent ciphertext motif with earlier finite controls ([lag-six conditional predictor](lag5-lag6-heldout-conditional-prediction.md)). The two source-derived objects motivate checking whether the exact T map has any **page-local 16-phase alignment** rather than launching new affine-key sweeps.

The rival is a selected random alignment or original typography/word geometry. Crucially, **p15 marks spiral step zero** in red, whereas the candidate concentration is at **residue 14**, which was identified from the source ciphertext, not selected by the red step or any signed instruction. The map was itself originally discovered through a broad prior search. This is therefore exploratory and cannot be described as a pre-registered independent prediction.

## Exact original-input calculation

Read all p0–55 canonical GP29 rune arrays directly from `resources/liber-primus/lp2-corpus.json`. Physical p50 is numeric-only; **55** pages provide **12,956** unknown runes. For each page and each page-local offset `i>=6`, record whether `C[i] = T(C[i−6])` and bin by `i mod 16`. Reparse original `resources/lp2-transcription.txt` with its actual hyphen/period word separators; **all 57 textual physical pages including solved pp56–57 match the canonical rune arrays exactly**, and the 55 unsolved rune pages are used for inference. A six-back comparison crossing any printed word boundary is called *cross-word*, although the current rune itself need not start or end a word.

| Scope | All matches / eligible | Residue 14 matches / eligible | Other-residue matches / eligible |
|---|---:|---:|---:|
| All page-local six-back windows | **466 / 12,626** | **47 / 790** | 419 / 11,836 |
| Six-back crosses a printed word boundary | **389 / 11,359** | **41 / 716** | 348 / 10,643 |
| Six-back stays within the same word | **77 / 1,267** | **6 / 74** | 71 / 1,193 |

The all-window phase14 rate **5.949%** exceeds its other-phase rate **3.540%**. The cross-word phase14 rate is **5.726%**, compared with **3.270%** elsewhere. **The within-word component does not show a comparable phase14 concentration.** This means the new page-phase observation differs from the previously studied *within-word* affine six-back excess. Page halves p0–27 and p28–55 have respectively **21/413** and **26/377** phase14 matches, but both halves were inspected after the phase was selected.

There is no simple single-page artifact: **33 distinct pages** contribute at least one phase14 match. Removing the first 32 page-local runes retains **41/680** phase14 matches against **420/11,196** total, so this is not explained solely by first-line headings. These are descriptive sensitivity checks on the same data.

## Exact phase-preserving control

Hold **every original rune, all source words, and every page's own sixteen-bin hit and opportunity vectors fixed**. Independently circularly rotate the phase origin of each entire page's sixteen-bin vectors using deterministic xorshift32, without changing any actual local T6 event. This tests whether independent pages accidentally align those real events to the same page-start phase. It is intentionally conservative about all intra-page statistical and graphic structure.

- **All positions**, 100,000 rotations, seed `0x16053301`: the actual *maximum* over all sixteen standardized phase bins is **3.36708** at residue14; **786/100,000** trials attain at least this maximum; add-one upper tail **0.00786992**. The residue14-only upper tail is **0.000389996**, but the residue was postselected, so the sixteen-bin maximum is the relevant number.
- **Word-crossing vs same-word**, 100,000 jointly rotated pages, seed `0x16c03301`: cross-word maximum over 16 phases **3.38657** at residue14, with **624/100,000** equal-or-higher controls, upper tail **0.00624994**. Within-word maximum is **1.70433** and nonexceptional (**61,293/100,000**). The family maximum across **both strata and all 16 phases** has **2,382/100,000** control exceedances, add-one tail **0.02382976**.
- A planted 55-page, 16-phase GP29 source-shaped positive forces `C[i]=T(C[i−6])` at residue14, and the reproducer detects that planted residue exactly. All original source lengths, word-alignment and case totals are asserted in the linked program.

For scale, **this investigation also inspected twelve other period choices** (2,3,4,5,6,7,8,13,14,29,32,55) and both physical-page and continuous clocks before focusing on 16. A rough Bonferroni correction for these 13 candidate periods alone turns **0.00787** into an upper familywise bound of about **0.1023**; including other exploratory choices further weakens the inference. The separate rank inspection found T(x)=24−2x is the highest-count phase14 map among **812** nonzero-slope affine GP29 maps (47 matching sites), but that map-and-phase comparison was performed *after seeing* the same phase14 effect and is not independent replication. The map ranks only **56th of 812** by its total lag-six matches, underscoring phase specificity and the search-selection issue.

## Decision for solving

The **data-level page-phase 16 alignment is real**, conditional on the specified source arrays and computations. Its **cryptographic interpretation remains unsupported**. A fixed page-local 16-phase substitution key over GP29 is already excluded against strong native-English controls ([prior period-16 all-secret test](lp2-p15-period16-allsecret-source-gate.md)); an occasional six-back match neither inverts the ciphertext nor identifies which positions carry recoverable plaintext. The printed p15 spiral gives no source-selected phase14, six-back feedback instruction, key clock, or reversible complement for other symbols.

Preserve this as a **low-priority exploratory statistic**. Do not commission a new 16-phase key search or claim a plaintext marker from the 47 sites. Reopen this possibility only if an independent authentic source supplies the *phase selection and a complete reversible operation*, or if a genuinely prospective original plaintext/key recovery independently predicts this specific phase14 pattern. No unknown LP2 plaintext was obtained.
