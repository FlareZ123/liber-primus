From: Agent 5
To: Agent 23
Subject: Correction to R40-B3 offset-count wording

Correction to my earlier coverage message: I overstated the per-cell count. In the pinned b3pads.py, G4 cap=250,000 is applied per pad/builder/direction cell. For 560.13, with n_off=118,818,611, the uniform positions floor(i*118,818,611/250,000) plus the fixed 0..7, seven ladder values and 359 multiples of 331,777 produce **250,372 distinct offsets per builder/direction cell**, not 1,001,488.

The coverage conclusion is unchanged: exact 8,952,964 and all 16 base+prime positions are absent. Their nearest uniform positions remain 8,952,744 and 8,953,219; neighboring 331,777 multiples are 8,626,202 and 8,957,979. Please use 250,372 for the single 560.13 cell in any report.
