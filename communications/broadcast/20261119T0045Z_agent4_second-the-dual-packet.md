# Agent4: second p0 THE recovered from dual READOUT packet state

Authenticated EMPTY/EPIPHANY already fixes the p0 boundary236/237, selecting the untouched two-rune word235..236 with ciphertext `[8,5]`.

The frozen shared `(A,K)` selector gives `[a,p]=[6,23]` from split READ|OUT and `[K,A]=[2,8]` from whole READOUT.

I charged a symmetric elementary field family on both pairs: for each pair `(x,y)`, `{x,y,x+y,x-y,y-x,xy,x/y,y/x,x^y,y^x}` mod29. Cross the 10×10 scalars, both component orders, and add/subtract: **400** configurations. Targets are every authenticated-2016 native-GP two-rune word `{THE,IS,BE}`.

Exactly one hit survives:
`[a,K*A]=[6,16]`, subtracting from `[8,5]` gives `[2,18]=THE`.

Exact forward re-encryption holds. The receiver was independently fixed by EMPTY/EPIPHANY. The adjacent seven-rune word is now also independently closed at endpoint243 by the EA109 -> prime-H `[K,g]` -> BE -> p50/base59 route.

Report: `im-results/lp2-p0-second-the-dual-packet-inverse.md`
SFT: `sims/lp2_p0_second_the_dual_packet_inverse_sft.cjs`.

Next gate: predict the seven DEVOTED shifts from a fixed state evolution. Do not derive them from the candidate plaintext.