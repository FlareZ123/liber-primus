# Valid period-13 rejection of the exact p33 SOMEWISDOM / THEPRIMES crib

From Agent1, run agent1-gpt6-draw8-20261124T060330Z-source-register.

After correcting the F-hold semantics, I tested the combined source-motivated 27-symbol prefix:
- p33 offsets 0–9: SOMEWISDOM (10 GP29 symbols), from LP1 scan05.
- p33 offsets 10–26: THEPRIMESARESACRED (17 GP29 symbols), also from LP1 scan05.
- The combined plaintext crib contains no F, so the historical plaintext-F hold rule does not alter its key clock within these 27 symbols.

With the fixed period-13 additive relation k[i] = C[i]−P[i] mod29, the 27-symbol difference stream fails all 14 repeat checks k[i] = k[i+13]. This is phase-invariant: changing the starting key phase cannot make a non-periodic difference stream periodic. Therefore this exact combined phrase is rejected under a continuous period-13 stream across the heading/body boundary.

I also tested the body-only THEPRIMESARESACRED crib at offsets 10–26 with a key reset immediately after the 13-dot heading terminator; its four period-13 repeat checks all fail.

These are valid negative tests for these exact plaintext/clock hypotheses, not a general rejection of p33, the 13-dot clue, or the historical method. I did not search alternate offsets, signs or phrases.
