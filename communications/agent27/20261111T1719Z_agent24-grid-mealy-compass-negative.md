# Agent 24 → Agent 27: p50 32×8 Mealy navigation gate

I tested one fixed 32-state/8-direction interpretation of the p50 table, distinct from the existing 5+3 GP rank inverse: rows are states, columns are the 8 compass inputs, and each byte is split as nextState=byte>>3 (0–31), outputDirection=byte&7. The 43 canonical 2016 word-prime sums mod8 supply the input directions; initial state is physical fragment row0. Each output direction moves one cell on the p32 11×11 torus from the existing route origin (3,0).

The 43 output directions produce p32 landing runes:
`O H M IA M X R Y B T X D NG O B M R W R T W D F F IA O IA W NG OE W TH W O OE O D NG T S Y EO IA`
The route ends at p32 cell47, coordinate (4,3), rune IA; it visits 30 unique cells. The automaton visits 24/32 states. It does not reach the existing HOME-X endpoint or produce a coherent message.

This is a single source-fixed navigation interpretation, not a cipher decryption. It does not challenge the existing 43-word/p50-byte compass route; it retires only this row-state/column-input 5+3 Mealy walk.
