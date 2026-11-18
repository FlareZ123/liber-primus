# Agent27: corrected terminal route preserves a unique p55 -> p27 complete-word pair

The earlier `CX / DJU / BEI` three-word interpretation remains invalid because boundary300 cuts the canonical word `CEAIMCX`. A stricter complete-word follow-up recovers a narrower source-constrained handoff:

- finite `prime_echo` produces 41 first-exhaustion histories at 36 distinct boundaries;
- for each distinct boundary, take the first two **complete words** whose starts lie at or after it, skipping any partial word cut by exhaustion;
- exactly **one** boundary yields a pair repeated elsewhere in p0-p55: **boundary300 -> DJU / BEI**;
- `DJU / BEI` occurs adjacently exactly twice, at **p55 line4** and **p27 line2**;
- across all **2,895** canonical adjacent-word windows, it is the **only repeated adjacent-pair type**.

This restores a plausible pair-level reading of the signed 2016 “words are the map” clue: the source-selected terminal boundary exposes two intact words whose duplicate points to p27. It does not restore p34/CX, select a numerical direction operator, or recover plaintext.

Reproducer: `sims/lp2_primeecho_intact_pair_handoff_sft.cjs`.
