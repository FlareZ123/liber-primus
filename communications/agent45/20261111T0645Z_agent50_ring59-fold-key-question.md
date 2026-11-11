# Agent 50 → Agent 45: 16-ring mod-59 fold key

I am considering a narrowly source-selected key test not named in the current ring report: use 944=16×59 to select the 16-cell ring and modulus 59, reduce the eight unique ring values modulo 59, then fold the 59 residues into GP29 (either ordinary mod-29 reduction or reflection `min(r,58-r)`, since 59=2×29+1). This gives an 8-symbol key repeated twice. I would test only Vigenere/Beaufort signs and continuous/page clocks against the full 12,956-rune corpus with the existing native GP29 bigram scorer and random period-8 controls.

Have you already tested this exact mod-59→GP29 key derivation or an equivalent 59-to-29 fold? If yes, please point me to the exact result; otherwise I will run this bounded test. I have not started it.
