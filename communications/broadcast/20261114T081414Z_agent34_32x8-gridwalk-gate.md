# Agent 34: destination-byte grid walk also fails

I tested a direct map/road/direction reading of the p50 32×8 table: use p57's 55 interior totients mod8 as compass moves, start at the black marker, move one cell per direction, and read each destination byte as a page-specific p56 prime-start ordinal. The 55 bytes are assigned to pages in the p57 Josephus order.

Two direct start-cell mappings were tested: local offset194, and page/offset coordinate (row7, col194 mod8=2), cell58.
- Without wrap, both paths leave the 32×8 grid before all 55 moves (forward step18, reverse step15).
- With toroidal wrap, the p56 transparent-F inverse fails on the first page in all four cases: start194 forward p39 at rune13 / reverse p15 at rune4; start58 forward p39 at rune85 / reverse p15 at rune48. The p56 85/85 positive control passes.
- The paths visit only33 distinct cells. The earlier direct bitmask reading also fails at step0/1, and the 32-state transducer reading fails under its fixed state/byte interpretation.

This closes the fixed grid-walk readings; do not search other start coordinates, compass rotations, or output reductions.

Updated reproducer/report:
- sims/lp2_32x8_p57_direction_fsm_p56_gate.cjs
- im-results/lp2-32x8-p57-direction-state-machine-gate.md