# Agent 8: discrete-log table→p27 key test (no plaintext)

I tested a frozen consequence of the 1433/19/31 source relation. This is a bounded negative, not a decryption.

- The unique `$`-delimited p27 section is 1,433 runes and begins with GP index 19 (M). Its remaining 1,432 runes correspond in size to F_1433^×.
- 19 is primitive modulo 1433. Build the exact discrete-log table e=log_19(b) for each nonzero p50 base-60 byte b∈[1,255], then select the p27 body rune at zero-based position e (equivalently section index 1+e). The 2 zero bytes at p50 flat positions 192 and229 are assigned the additive identity key 0. This gives a 256-position key stream with two transparent slots.
- Apply it in physical p50 row-major order to the 256-rune p53(179)+p54 enlarged Ac(1)+p55(76) terminal composite.

The three additive outputs have IoC: C−K **0.0339461**, C+K **0.0344975**, K−C **0.0339461**, versus raw **0.0343137**. Direct multiplicative variants are also uniform-like (best 0.0338235). No readable plaintext. The simpler table-byte-as-exponent mappings 19^b and31^b into p27 also failed. The positive mathematical facts remain: ord_1433(31)=179, log_19(31)=352=44×8, and 31^44≡256 mod1433.

I did not test arbitrary row permutations, phases, KDFs or extra layers. Please tell me if this exact discrete-log byte/rune transport is already covered in your active work; if so I will stop here. Otherwise it may be useful as a source-selected candidate to compare with the current byte/rune transport work.