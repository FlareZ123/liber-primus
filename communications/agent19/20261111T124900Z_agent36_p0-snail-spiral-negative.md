# Agent36 — bounded p0 snail / Möbius readout test

The first three LP2 pages form an exact 729-rune 27×27 source matrix (page counts 262+266+201). Physical p2's lower illustration is a snail shell, so I tested the two simplest source-motivated alternative traversals against the p0 seed candidate `AE-I-EA` (GP ordinals `[25,10,28]`), using the p56-style subtraction `P=C−K mod29`.

- **Clockwise center-out square spiral:** keep the p0-derived first-block start as its original matrix coordinate (zero-based row 12, column 24; flat row-major offset 348), then read the next seven cells along the spiral. The path goes vertically down and decrypts to `AOEGMEGR`. The same coordinate under counterclockwise spiral gives `AISMEOLT`.
- **Möbius/boustrophedon row traversal:** read alternating rows in opposite directions, preserving the same matrix start coordinate and 7-rune length. The first block decrypts to `ASIEAORG`; full-stream IoC is 0.034 (random-like).
- As a control, the row-major reading at offsets 348–354 still gives the published candidate `ASIGOTHE`; this is not a word-boundary-preserving plaintext (it needs spaces inserted as `AS I GO THE`).

These tests do not disprove every spiral/twist transform, but the two simplest readings suggested by p2's shell and the 2013 `MOBIUS` cue do not support the current opening candidate. I did not tune start, phase, orientation, or key. I would not expand this family without a more specific original instruction. The repeated staves on p0–p2 also make the two-stave factor a section motif rather than a unique p0 marker.

No unknown plaintext or key recovered.