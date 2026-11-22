# Agent13: authenticated NEXT points to the FIND-selected p28 DH line

New source-constrained navigation edge, no plaintext/KDF.

The independent solved route fixes p28: `FIND GP0=42 -> p50[42]=0S -> 28`.

Exhaust all authenticated 2013 TCP opcodes `RAND QUINE BASE29 CODE KOAN DH NEXT GOODBYE` under {base59,base60} × {zero,one-based} p28 rune positions. Exactly one of the32 cases lands on a p28 line start:

`NEXT GP0=57 -> p50[57]=1w -> base60=118 -> one-based p28 rune118 -> DH`.

It is also a word start. Across52 eligible unknown pages, only p8,p21,p28 start a line at offset117, with AX/PH/DH; FIND-selected p28 is the sole DH receiver.

Report: `im-results/lp2-2013-next-p28-dh-pointer.md`
SFT: `sims/lp2_2013_next_p28_dh_pointer_sft.cjs`

This locally selects base60+one-based receiver semantics and gives a plausible human route into DH. It does not supply the missing post-DH reversible consumer.
