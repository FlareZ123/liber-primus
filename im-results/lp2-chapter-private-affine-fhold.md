# Chapter-private affine phase rows with the authentic latent-F clock

**24 November 2026, Agent10. No unknown plaintext or authentic key recovered.** This is a different, weaker model than the previously excluded book-wide shared phase permutations: each of the nine physically defined chapters can have its own completely independent affine row at each of q8/q13 phases. It combines historical independent section keys/lengths with a broader arithmetic row family; no author instruction selects arbitrary affine rows. The native GP27 and intact A/I singleton restrictions are explicit assumptions, not facts about unknown plaintext.

## Lossless inverse and exact feasibility

For each consuming P, C=(a_j P+b_j) mod29, with 1<=a_j<=28, and j advances mod q. Literal plaintext F emits C=0 and does not advance. A ciphertext F can instead be consuming. The alphabet support observed in nine solved sections excludes EO and OE (indices 12,22); consuming P therefore excludes 0,12,22. Each intact printed singleton must be A/I (24/10). For each observation the allowed rows form an exact 812-bit mask, intersected for all consuming runes assigned the same phase. Nonzero runs have a fixed clock once their entry phase is fixed. Every zero permits the hold branch or consuming branch except at a singleton, where only the latter is legal. Empty row domain prunes; any complete nonempty set of row domains gives independent affine row choices, hence a mathematical inverse. A chapter's starting phase is fixed to 0 WLOG by relabeling its private rows. No resets inside a chapter.

| Original physical pages | Runes | q8 | q13 |
|---|---:|---|---|
| 0–2 | 729 | infeasible (92,811 nodes) | witness (145,703) |
| 3–7 | 1,145 | infeasible (2,008) | infeasible (23,547) |
| 8–14 | 1,729 | infeasible (15,073) | infeasible (478,819) |
| 15–22 | 1,903 | infeasible (4,110) | infeasible (686,723) |
| 23–26 | 1,021 | infeasible (9,985) | infeasible (832,938) |
| 27–32 | 1,433 | infeasible (32,614) | cap (2,500,001) |
| 33–39 | 1,680 | infeasible (1,727) | infeasible (35,801) |
| 40–53 | 3,008 | infeasible (46,842) | cap (2,500,001) |
| 54–55 | 308 | witness (10) | witness (7) |

Six source-native controls (WELCOME, first KOAN, LOSS OF DIVINITY, independently planted q8 and q13 phase rows) retain the actual known rows and a legal full path. This is feasibility calibration, distinct from the blind inverse below. The p0–2 q13 witness has row-domain sizes 1,2,1,8,2,2,1,1,1,1,3,3,1 for its **first** legal clock only; no unique key is implied. Capped cells are unresolved, not excluded.

## Actual ciphertext-only inverse: p54 training, p55 held out

Frozen q8 model, 232 fitting runes on physical p54 and 76 prediction runes on p55. Independent phase rows selected by a source-native smoothed trigram objective, without target plaintext, using exact schedule enumeration up to a 20,000-leaf cap, ranking by best independent row unigram score, top24 clocks, 12 deterministic seeded coordinate restarts, 10 sweeps. Target-excluded language models for controls. The 308-rune native excerpts and split length match the original experiment; random phase keys are sampled from all 812 rows.

| Native control | Clock leaves | Exact fitting runes | Exact rows | Frozen suffix | Suffix nats/rune |
|---|---:|---:|---:|---:|---:|
| WELCOME | 20,000 (cap) | 207/232 | 0/8 in fixed labels | 76/76 | −2.550517 |
| First KOAN | 2,003 | 232/232 | 8/8 | 76/76 | −2.319554 |
| LOSS OF DIVINITY | 2,048 | 232/232 | 8/8 | 76/76 | −2.859049 |

All recovered native suffixes and full candidate paths replay exactly. WELCOME's prefix differs and fixed-label rows are not recovered; a possible phase equivalence is not asserted. This is a finite calibrated predictive method, not general cryptanalytic identification.

Original p54 has exactly six legal clock paths after native support and singleton constraints; all were ranked. The best prefix was nonprose at −4.1931221513 nats/rune with held zeros at local offsets 41,195 and rows (a,b)=[(13,10),(26,22),(4,17),(21,27),(1,16),(17,14),(1,22),(8,3)]. No legal p55 continuation exists with that frozen key, phase, and native register. The holdout was not used for selection. The original 232-rune candidate replays exactly, which only validates the inverse implementation.

## Exact cyclic trigram maximum

The fitting-clock ambiguity can be exhausted without enumerating every key tuple. Under a fixed legal clock, each plaintext position is either a known literal F or a function of one private phase row. A trigram depends on at most three consecutive consuming phases. Aggregate all language terms into q cyclic factors indexed by the last consuming phase and its two predecessors. Rotate the phase enumeration to minimize cost, fix the first two row choices, maximize the remaining chain by pair-state dynamic programming, and add the two wraparound factors. Backtracking gives the actual key; direct score and original replay are checked. This computes the combinatorial maximum of the floating-point trigram objective, not a theorem about natural language.

| Holds (p54 local offsets) | Best prefix nats/rune |
|---|---:|
| 41,195 | −4.1931221513 |
| 41 | −4.2327968453 |
| 65,195 | −4.2771901235 |
| 65 | −4.3434412267 |
| 195 | −4.2665635889 |
| none | −4.3091845232 |

Exact search reproduces the coordinate-selected key and the failed prospective continuation. This rules out improvement of the **fixed prefix MAP objective** as a rescue for this original q8 transfer; not every feasible original q8 key is excluded, nor is q13. Do not tune key or clock using p55 to claim prospective plaintext.

## Reproduce

From repository root:
- `node sims/lp2_chapter_private_affine_fhold_sft.cjs`
- `python sims/lp2_chapter_private_affine_rank.py . --original`
- `python sims/lp2_chapter_private_affine_exact_map.py .`

Python requires NumPy (local execution used 2.3.5). Exact feasibility ran on connector-fetched canonical data in V8; the language experiments used an exact compact transfer of the 308 original rune indices and all 2,979 solved native runes into the local Python runtime, with original byte-index SHA256 `0c8d7017fd43b681a9e6400cfa863875e354600877775ef84f2e73fcc10a19a3`. The repository entry points read the canonical source directly. No CI run claimed.

**Next decision:** q13 p0–2 is a genuinely feasible scope under native support. Its complete prefix/suffix key search is a higher-value target than broadening q8. Distinguish the q13 capped regions from the exact five infeasible ones. No authenticated LP2 affine row selector is available; a fit without independent continuation is not a solution.
