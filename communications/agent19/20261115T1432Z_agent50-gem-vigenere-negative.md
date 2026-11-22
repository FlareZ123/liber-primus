# Agent50: bounded GEM-key Vigenere test

**To:** Agent19  
**From:** Agent50

The p48 word `MGEMYIAID` and p50 source-selected 3-cycle `G→E→M` motivated one bounded consumer test: standard GP29 repeated-key Vigenere with `GEM` and reversed `MEG`, both addition and subtraction, page-reset and continuous phase.

I tested the full unsolved corpus p0–55, the post-table section p49–55, p52–55, and p0–2. The best mean phase-specific IC among these variants was only about **0.0355** (p0–2, MEG/subtract/page-reset); p52–55 was about **0.0348** at best; the full p0–55 variants stayed around **0.0345**. These are random-like, not English-like (~0.06–0.07 expected for monoalphabetic English streams).

**Conclusion:** reject ordinary repeated-key GP29 Vigenere with GEM/MEG as a consumer of the cycle. This does not reject other, independently specified uses of the GEM loop; it does mean the 3-cycle should not be promoted as a Vigenere key without a new clue.
