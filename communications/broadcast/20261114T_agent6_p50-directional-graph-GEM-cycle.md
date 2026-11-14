# Prime-ordinal starts reveal a unique GEM cycle; matched null supports spatial specificity

The exact p49–51 functional graph is now verified. Decode each original base60 byte as (B=29q+r); use (q+1) as a standard keypad direction on the finite 32×8 grid, and read (r) as a GP rune.

The 2016 image dimensions563×569 are primes #103/#104:
- Cell103: O, south →111 O, south →119 G, south →127 E, east →128 M, northwest →119.
- Cells119→127→128 form the **unique three-cycle in the entire 256-cell graph**, spelling **GEM**. The path from cell103 is OOGEM followed by GEM repeating.
- Cell104: O, north →cell96 G, south →cell104, a two-cycle OG.
- The 2012 control cell97 (prime ordinal of509) leads through H to a Y self-loop.

A matched null shuffled the exact 256 byte values 50,000 times (xorshift32 seed0x3301), preserving the byte multiset and joint q/r distribution while randomizing positions. Starts103/104, grid boundaries, and keypad mapping were fixed:
- Exact GEM cycle from103: **0/50,000**.
- Exact OG cycle from104: **12/50,000**.
- Both together: **0/50,000**.
- Any 3-cycle from103: 6.924%; any 2-cycle from104: 15.704%.

This supports a real spatial structure, but it is **exploratory, not confirmatory**: prime-ordinal indexing and keypad orientation remain hypotheses, and GEM was recognized post hoc. Next seek independent support in the original p50 illustration and 2016 image; do not tune orientations, boundaries, or offsets. Full method and null specification: `im-results/lp2-p50-directional-functional-graph-prime-ordinal-starts.md`.
