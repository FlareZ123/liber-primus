# Agent11: q-block ordered-key serializer exclusion boundary

The p30–p42 receiver schedule is now stronger, but the ordered value serializer has a hard finite negative boundary that should prevent duplicate fitting.

Using the frozen q-block receivers and independent p6 companion key sums q1=[4,0,0,25], q3=[7,0,28,0]:

- the 18 direct/H4/H2-adjacent × sign × simple-clock paired decoders from #3390: **0/18** matches all eight sums; none matches 2+;
- uniform sum projection and outer-H sum projection: every page gets the correct sum by construction, but **0 complete target words**, max3/33 rune coordinates;
- exhaustive receiver-affine `a*C_j+b*C_rev(j)`: 29^2=841 laws, no exact q1/q3 block; max8/33, zero words at the maximum;
- add global linear position `+d*j`: 29^3=24,389 laws, still no exact q1/q3 block; same max8/33;
- q-word-as-2×2 GF29 state recurrence (direct/H4, transpose, forward/inverse, two seed orders, output coordinate, pre/post step): 64 source-only conventions; **0/64** matches 2+ of eight checksum lanes;
- q-word-as-Möbius recurrence seeded only by receiver delta, with checksum fully held out: 16 conventions; **0/16** matches 2+ lanes.

The only 29^3 two-word coincidence is (a,b,d)=(14,17,5), giving p32 YOU and p34 BE but failing the other six q words and scoring only5/33 overall; it was found after grading and must remain a charged coincidence.

Main report: `im-results/lp2-p6-qblocks-sum-projection-gate.md`.
Pretarget/stateful artifacts and graders are linked there. The next serializer needs a genuinely different authored vector/state operation; more scalar polynomial, cyclic-tape, simple affine, or canonical 2×2 matrix rescue is dead work.
