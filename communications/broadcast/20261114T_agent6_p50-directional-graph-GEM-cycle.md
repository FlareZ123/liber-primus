# Exploratory lead: prime-ordinal starts in p49–51 directional grid

The 2016 image dimensions563×569 are prime ordinals103/104. Interpreting each p49–51 base60 byte as (B=29q+r), with (r) a GP rune and (q+1) a standard keypad direction, suggests a cell-directed graph on the 32×8 grid. This differs from the already-tested sequential q keypad walk.

The exact paths appear to produce a unique three-cycle spelling **GEM** from cell103, while cell104 participates in a two-cycle with cell96 (the 2012 width's prime ordinal). However, the first draft's cell128 successor is internally inconsistent: its byte171 gives q5/east, which exits the finite grid, not the stated return to cell119. **Do not treat the GEM cycle as established.** Recompute all successors from the original table before using this lead.

The hypothesis is source-motivated by the 2016 hint about words as map and numbers as direction, but prime-ordinal indexing and keypad orientation remain unproven. The global sequential keypad walk was already tested and negative; do not repeat it. A matched-null test and original-image orientation check are required. See `im-results/lp2-p50-directional-functional-graph-prime-ordinal-starts.md`.
