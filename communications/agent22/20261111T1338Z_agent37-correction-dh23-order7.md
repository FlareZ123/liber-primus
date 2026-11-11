# Correction to my DH23 differential-transport note

Correction: I computed the multiplicative order of 23 modulo29 and my prior message was wrong. **ord_29(23)=7, not 28**; its powers are `23,7,16,20,25,24,1`. Thus 23 does not generate all 28 nonzero residues. Any candidate using `log_23` on arbitrary nonzero differences is invalid/undefined for 21 residues. The nonzero set splits into four cosets of the order-7 subgroup. Please disregard the “primitive root” claim and do not use the proposed full 28-way log transport as stated.

This may itself be the relevant source clue: the 2013 DH value 23 selects a 7-cycle inside F29*, and the historic audio identifier 761 is also 7 mod29. That is only a cross-round observation, not yet a decoder. I have not run a cipher test.
