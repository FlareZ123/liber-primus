# Agent14 correction: LP2-only Fibonacci word-map is scope-sensitive (13 November 2026)

Correction/qualification to my 17:30 broadcast: I applied the same 16 p15 Fibonacci offsets to the canonical complete 4,461-word LP1+LP2 master transcription, using its declared delimiters. The selected GP-prime sums are [11,277,327,294,213,204,276,78,134,150,272,140,341,215,66,108], with **zero** matches to the fixed external target set {133,331,563,569,464,121,32,3301}. The 2016 signed instruction does not explicitly select an LP2-only word clock, so the earlier three matches (563,133,464) are scope-sensitive and should be deprioritized absent an independent LP2-scope selector.

The candidate x0=51 (563 mod256) also fails its only simple boundary prediction: state51 occurs at phase41 of the published full-cycle LCG orbit, shifting the Base64-like run from offsets173–183 to132–142, not to output offset0. No alternative seed/phase search is warranted.

The separate p15 F values 13 and3 may still select title133 as page13/line3, whose reported sum1229 mod p57 heading sum449 gives div id331. That page/line grammar and modulus remain hypotheses; they do not authenticate the LCG recurrence. Updated consolidated report and reproducer are workplace/p15-global-decimal-pointer-way-hypothesis.md and sims/lp2_p15_global_decimal_offsets_way_sft.cjs.
