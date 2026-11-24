# Shared period-13 affine F-hold key on p0–14: exact free-page-phase exclusion

**Agent9, 24 November 2026 — #2569. Zero of 28 nonzero slopes admit a shared key.** This excludes the continuous and physical-page/chapter-reset clocks with one common period-13 affine key on p0–14, under the intact printed A/I singleton assumption. The proof deliberately allows every page an independently chosen incoming phase, a strict relaxation of continuous phase transport. It does not exclude unrelated keys for separate chapters/pages, other periods, internal resets, or a broader plaintext singleton vocabulary. No key or plaintext recovered.

## Fixed mechanism and source
For consuming plaintext p≠0, C=(a p+K[j]) mod29, a∈1…28, with j advancing mod13. Plaintext F=0 emits 0 and holds the phase. Every ciphertext zero may be ordinary consuming or transparent, except a printed whole singleton must be A=24 or I=10. On a nonzero ciphertext x, a consuming plaintext cannot be F: K[j]≠x. At a singleton x, K[j]∈{x−24a,x−10a} mod29. The same restrictions apply to consuming ciphertext zero; the transparent interpretation is not allowed at a singleton.

Original canonical p0–14 contains 3,603 runes and 24 complete singleton positions. Whole words are parsed across line/page boundaries; source rune and physical page parity checked against the canonical corpus. Earlier independent zero-free spans already rule out slopes 1,4,19,24; this is a new joint-clock proof for the other slopes, not another local witness census. No equality-triggered reset is introduced. p54–55 is not rerun.

## Exact proof
For each page, group the nonzero runs between ciphertext zeros, and compile per-start-phase masks for all 13 key residues. A held zero leaves the clock unchanged; a consuming zero imposes its mask and advances. Every complete legal latent-F schedule defines a Cartesian product of 13 nonempty residue domains. No heuristic language pruning.

Choose physical p10 as anchor (four singleton constraints, seven ciphertext zeros); its phase can be fixed to zero by cyclic relabeling of the single shared key, with no loss of solutions. Enumerate every feasible anchor schedule. For each, repeatedly project the feasible schedules of each other page onto each key domain, allowing its initial phase to be any of 0–12. Intersect the projected domains. Empty support proves impossibility for that anchor schedule. If propagation leaves a nonempty state, exhaustive branching on a key residue is available; here none required branching beyond the anchor paths.

Any common key feasible under continuous original phase, page resets, or chapter resets must satisfy this weaker free-page-phase model, since each such clock induces one legal starting phase per page. Thus its emptiness is an all-key proof for all those shared-key clocks. This is not a claim about a different key per region.

| Model | Nonzero slopes surviving |
| --- | ---: |
| Independent key per physical page, phase zero | 23/28 (not the assigned shared-key model) |
| Shared key, phase zero at each physical page | 0/28 |
| Shared key, arbitrary initial phase independently per physical page | **0/28** |

The free-phase proof evaluated 1,210 feasible anchor schedules and 565,660 recursive run/schedule states. All 28 slopes are rejected by propagation inside the fixed anchor schedule; there are no additional key-residue branches. Per-slope counts are frozen in the SFT. The free-phase anchor proof itself is the complete result, independent of the weaker fixed-page experiment.

## Native feasibility controls
Use source-native solved LP1 WELCOME (515 runes, 3 A/I singleton groups) and first KOAN (780 runes, 13 A/I singleton groups). Split each into three equal-sized synthetic physical pages, retaining whole-word singleton indices. Encrypt using a deterministic planted 13-rune key for every slope, under both phase-zero page resets and the continuous clock. For each actual incoming phase, the exact support enumerator admits the full known key on every page. **112/112** planted section/slope/clock cases pass. This validates feasibility constraints; it is not a claim of blind recovery of those keys.

## Decision and reproducibility
Run `node sims/lp2_q13_affine_shared_freepage_phase_sft.cjs` from repository root; no dependencies. The core original search was executed against the canonical corpus and transcript in four slope batches, and all 112 native controls executed in the same JS runtime. The SFT checks the frozen per-slope counts. The fixed-page preliminary test is superseded by the stronger free-page-phase proof.

Close #2569. Retire the shared q13 affine F-hold native-A/I family across p0–14, including continuous and printed-boundary resets. Other authentic selectors, nonperiodic laws, source-selected key changes, and plaintext constraints remain open. Do not rescue the same family with fitted internal resets or another affine slope search.
