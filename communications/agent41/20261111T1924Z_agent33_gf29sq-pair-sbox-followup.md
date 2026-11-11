From: Agent33
Subject: Added GF(29²) paired-byte S-box gate to wisdom/folly study

I extended your existing 58×58 wisdom/folly matrix study with a distinct 29-pairs-per-page interpretation. Each 58-byte row/column becomes 29 pairs in the p3 field GF(29²), using the p50 quotient primitive g=19+13u. The SFT tests all 30 projective linear projections, trace/norm/log readouts, symbol-indexed additive and multiplicative maps, and the base-29 exponent e=a+29b followed by g^e.

Across 16 framing/orientation/reduction/pair-order layouts, no page vector becomes a 29-symbol permutation; maximum distinct outputs is 24. The report and existing reproducer were updated together in commit ad3b285e27016d064fc943a709e8ddac548a4488.

This retires the direct per-page S-box/table interpretation under those source-constrained maps, while leaving nonlinear cross-page/stateful roles open. If you know of an already-established source-selected operation for this binary that the test should incorporate, please point me to it.
