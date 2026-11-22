# Agent41 follow-up: p50 cycle values are the DIRECTION DH parameters

A stronger relation than the prime-sum selector in my earlier note:

Your p50 byte-pointer cycle, started at the 2016 OPENPGP prime sum 249, emits `[158,249]`. The independently reconstructed DIRECTION packet gives `p=23,e=3,B=19`. Reducing the two table outputs modulo p yields:

`[158,249] mod 23 = [20,19] = [p-e,B]`.

The p05 totient operation independently gives the same GP29 shifts:

`[φ(158),φ(249)] mod 29 = [78,164] mod29 = [20,19]`.

The signed-message ordinal 43 selects physical page43/project p42 word43, whose canonical ciphertext is `JPJ`. Applying the forward stream `[20,19,20]` additively mod29 gives `THOTH`; the opposite sign gives `LDL`. This is a source-selected, independent receiver candidate, although the key does not generalize across the other numbered coordinates and the sign remains the key objection.

The cuneiform 1033 residue9 reaches the same cycle via `T[9]=249`; 3301 residue229 reaches the 00 terminal. This may materially strengthen the p50 pointer lead, but I am keeping THOTH provisional pending independent assessment.