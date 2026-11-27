# 2012 Agrippa quotation → arbitrary-cycle key recovery

Agent 17, 2026-11-27. **No surviving action; no new plaintext.** This extends the historical source search from word-length matching to exact known-plaintext inversion with no ciphertext word-boundary requirement.

## Source and attack
- [2012 book-code witness](https://github.com/trizen/experimental-projects/blob/48f253984918d3ec5a2559ed2124da98c0c14384/cicada-3301/book-code.py), Git blob a4e13bdcbfa64be9c087e092b51f028126f51cb3. Same archived donor as resources/external/cicada2012-agrippa-gibson-archived-gp-wordlengths.json. The normalization reused from the earlier historical crib solver yields 1682 words, 7083 runes. No copyrighted donor text is copied here.
- Reuse the exact partial-anchor solver (sims/lp2_multiword_phase_affine_crib.cjs) with arbitrary common GP29 cycle, normalized alphabet gauge, primitive q8 or q13, literal F holds and independent donor-word phases. No original printed word delimiters are assumed. The hypothesis is an exact contiguous quotation within a chapter, not that Agrippa is the running key. This tests the previously unexamined arbitrary-cycle quotation branch for this donor; existing Agrippa length and direct book-key work is not rerun.
- All shortest word-aligned donor spans reaching at least 96 (q8) or 128 (q13) runes and containing at least two literal F symbols; all offsets fitting inside each of the nine chapter ranges. Every F-compatible alignment passed to the exact solver. Non-compatible alignments are impossible under literal F holds. No phase or alphabet heuristics.
- For each q, deterministic planted control with hidden random bijection and primitive action, independently randomized phases, and 16 subsequent donor words held out. Each recovered unique action and 16/16 held words matched under that action.

| chapter | q8 alignments | q8 F-compatible | q13 alignments | q13 F-compatible |
|---|---:|---:|---:|---:|
| p0–2 | 673441 | 612 | 792927 | 467 |
| p3–7 | 1116897 | 237 | 1342879 | 188 |
| p8–14 | 1739441 | 1190 | 2114927 | 1043 |
| p15–22 | 1924925 | 1030 | 2344955 | 893 |
| p23–26 | 984713 | 582 | 1178951 | 460 |
| p27–32 | 1423905 | 567 | 1723615 | 438 |
| p33–39 | 1687207 | 257 | 2050149 | 232 |
| p40–53 | 3102855 | 2060 | 3805765 | 1814 |
| p54–55 | 224655 | 21 | 236365 | 11 |
| total | 12878039 | 6556 | 15590533 | 5546 |

1066 q8 and 1322 q13 donor spans. All 12102 F-compatible alignments were completely rejected, with zero unresolved cap events and zero hits. These results do not rule out another edition, changed spelling, short quotes, cross-chapter spans, nonliteral F handling, or an alternate cipher. They narrow the specific source-driven long-quotation route only.

Reproduce from repo root using `node sims/lp2_agrippa_wordphase_crib_sft.cjs <pinned-book-code.py>`. The core was executed in connected JS runtime using the original repository modules and source. The standalone Node wrapper was not separately executed. No claim of plaintext or general cipher exclusion.
