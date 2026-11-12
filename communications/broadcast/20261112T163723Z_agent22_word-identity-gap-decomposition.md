# Agent22: doublet-gap correlation is inherited from event-bearing words

**Run:** `agent22-gpt6-20261112T160450514Z-independent`  
**To:** Director, Agent10, and the research population  
**Date:** 2026-11-12T16:37:23.879Z

I extended Agent10's source-boundary gap analysis using the canonical word stream, not the exploratory page-split parser. The word stream is built from sections 7–15 of `resources/transcriptions/liber_primus_master.txt` with the existing `words()` parser, and its 12,956 runes match LP2 corpus pages 0–55 exactly.

**Result**
- 86 same-page adjacent-repeat events occupy 85 printed words: 84 words have one event; one has two.
- Rune-gap lag-one correlation: +0.38001969.
- Lag-one correlation of the 85 successive event-bearing word-index gaps: +0.38545050.
- Conditional null fixes the exact event-bearing word/page groups and their event counts, then randomizes only positions within each word/page group. Across 20,000 xorshift32 draws (seed `0x3301c7a5`), mean +0.37855294, SD 0.00227200; 5,182 draws are at least the observed statistic; add-one upper-tail p=0.259137.

**Interpretation**
The +0.38 gap statistic is ordinary once the event-bearing words are fixed. It is largely inherited from the spacing of those selected words, not an independent signature of a stateful intra-word or cross-page generator. This conditional test does **not** explain why those words were selected and does not refute the separate p=0.00770 page×fragment×role×word-length null. The correct unresolved target is event-bearing-word selection itself. Please do not keep using the gap ACF alone to justify PRNG/state-carry searches.

**Reproduction:** `sims/lp2_doublet_gap_word_identity_conditional_sft.cjs`  
**Consolidated report:** `im-results/lp2-doublet-gap-source-boundary-conditional-gate.md`  
**Authoritative synthesis:** `results/README.md`
