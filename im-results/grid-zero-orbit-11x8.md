# Zero-anchored byte-state cycles in the LP2 numerical grid

**Agent 50, 11 November 2026. Evidence class: exact source arithmetic, exploratory cross-page clue and bounded negative original-cipher inversion.** No unknown LP2 plaintext, authentic key, or historical mechanism has been recovered. This is a candidate for a *source-visible instruction* that merits independent historical scrutiny, rather than an established decryption.

## Candidate operation and printed dimensions

The 256 base60-transcribed bytes printed as a 32×8 table on physical LP2 pp49–51 can be read as an unsigned-byte transition table: start with state 0 and repeatedly follow **next state = table[current state]**, treating a state as a zero-based byte index. This operation is deterministic, requires no key guess, and uses every byte in its original printed order. The starting state zero is source-natural but is not explicitly indicated as a pointer instruction.

The **printed row-major** table gives a complete 11-cycle:

    0 → 203 → 68 → 199 → 47 → 76 → 114 → 197 → 115 → 247 → 192 → 0

The only other functional-graph cycle is 249 ↔ 158, of length two. Thus the complete row-major 256-state graph has exactly two cycles, with the other states feeding into their basins.

A second geometrically natural traversal concatenates the three *separately printed* page-local column-major tables, respecting their original 10-, 13-, and 9-row page heights. The same zero pointer is an 8-cycle:

    0 → 203 → 159 → 56 → 171 → 65 → 199 → 234 → 0

These periods correspond to the separately visible **11×11 rune square on physical p32** and **eight columns of the numerical table**. The latter relationship is particularly easy to generate accidentally from a table having eight printed columns; the former is a prompt for a possible human solve path. Neither printed artifact explicitly instructs the reader to treat values as pointers, and using two different traversals is an additional interpretation.

Among the six conventional literal table views (row/column/page-local-column, each forward and reversed), the zero state's pure-cycle periods, with **0 denoting a nonzero transient**, are:

| Printed byte view | Row | Reversed row | Global columns | Reversed global columns | Page-local columns | Reversed page-local columns |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Zero-return period | **11** | 0 | 0 | 0 | **8** | 0 |

## Source-multiset comparison and selection caveat

To quantify whether the two exact periods are at least unusual under a *specified* simple null, we shuffled the actual 256-byte source multiset using Fisher–Yates and deterministic xorshift32 seed3301, with rejection sampling on each bounded draw. The source multiset, including repeated bytes, remains fixed. **250,000** distinct algorithmic draws were evaluated. An add-one tail estimator includes the observed source as a potential extreme.

| Event | Matching shuffles | Add-one rate |
| --- | ---: | ---: |
| Original directed pair: forward row = 11 **and** forward page-local column = 8 | 8/250,000 | **9/250,001 = 0.00003600** |
| Allow reverse direction independently within the row/page-local-column families | 41/250,000 | **42/250,001 = 0.00016800** |
| Permit the periods 11 and 8 in any two of the six geometric views, in either order | 322/250,000 | **323/250,001 = 0.00129200** |

The exact source graph and finite shuffle counts are reproducible in the [single-file script](../sims/lp2_grid_zero_orbit_source_sft.cjs). These figures are **conditional descriptive null rates, not discovery-corrected probabilities of deliberate design**. We noticed the periods and their apparent p32/column parallels after looking at the source. The source has been repeatedly searched for numerical coincidences by many agents, and the procedure can be extended to other seeds, page arrangements and lengths. Those additional human selection degrees of freedom are not reflected in these numbers.

**Original-artifact check.** The two orbit traces depend on exactly 18 distinct printed lookup cells, at zero-based global table indices **[0,46,47,53,68,76,87,94,114,115,192,194,197,199,203,229,233,247]**. All 18 two-character readings were checked directly against the matching cells of original source images **66.jpg, 67.jpg, 68.jpg** and agree with the canonical numeric transcription. Thus these two exact byte cycles do not depend on an unexamined ambiguous transcription at their lookup positions. The other 238 numeric cells are not claimed to have received a new image-wide audit.

The exact graph should therefore be retained as a source fact, while the cross-artifact interpretation remains provisional.

## Tested original-cipher use: lossless stateful inverse

Treat the table as a source-specific 256-state register, starting at either **0** or the independently enlarged **Ac=24**. For each original ciphertext rune C, decode

\[
P=(C+\varepsilon(s\bmod29))\bmod29,\qquad \varepsilon\in\{-1,+1\}.
\]

Then advance the register by state update s' = table[(s + X) mod256] or s' = table[s XOR X], with X the published ciphertext C or the just-recovered plaintext P. Use row-major or page-local column-major table, continuous/book clock or reset at each physical rune page. This is **64 exact, lossless, reversible models**, using only source-derived seeds and literal operations. A recovered P determines the original C uniquely from the prior state; both ciphertext and plaintext feedback are supported without any hidden per-rune decisions. The script verifies exact full original re-encryption for all variants and full blind recovery of a separate 12,956-rune planted stream.

To avoid choosing a model on the same material used as evaluation, the first 28 physical pages p0–27 select the highest plaintext index-of-coincidence (IoC); p28–55 (omitting the runeless p50) remain held out. Both groups are original ciphertext, not synthesized language.

| Material | Training IoC, 6,761 runes | Frozen held-out IoC, 6,195 runes |
| --- | ---: | ---: |
| Original ciphertext, undecoded | 0.03451881 | 0.03444636 |
| Train-selected model | **0.03460558** | **0.03450844** |
| Uniform 29-symbol reference | 0.03448276 | 0.03448276 |

The training winner is row-major, seed0, additive **plaintext feedback**, page resets, positive inverse sign. Across all 64 alternatives, the held-out IoC ranges **0.03442630–0.03460111**, all near the 1/29 uniform baseline and far from source-native GP English IoC (around 0.06 in independent repository controls). The winner does not reveal prose, and minor IoC improvements are insufficient evidence for a cipher. Source-derived direct additive pads using each 11-/8-cycle also remained ciphertext-like in exploratory checks; the source graph itself is the principal result.

This excludes **only** the 64 exact direct-GP29 register laws stated here; it does not exclude a related byte-state machine with unknown plaintext codec, alternate marked-state transition, nonadditive emission, or source-specified output map.

## Decision

A human-facing solve-path candidate is now precisely stated: *read the base60 grid as byte pointers, start at zero, notice its 11-cycle, and seek whether the p32 11×11 rune square explains the next operation; then account for an independent 8-cycle under the other printed-page traversal.* No authenticated instruction or readable intermediate currently links these observations. The next productive step is an **independent rule** identifying how to use one cycle as an original-cipher key or square traversal, preferably with a source-fixed plaintext prediction before scoring LP2; additional arbitrary pointer operations would magnify the selection problem.

Source: [canonical numeral table](../resources/liber-primus/lp2-grid-256.json), [original rune ciphertext](../resources/liber-primus/lp2-corpus.json), [p32 11×11 square and historical-tree audit](lp2-tree121-signed2016-source-gate.md), [research decision contract](../workplace/integrated-original-inversion-challenge.md).
