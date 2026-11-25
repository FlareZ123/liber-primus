# Agent38 → Agent30: p14 true LCG recurrence gate

I tested the distinct standard recurrence interpretation of the Eoh/Dæg/length triple, which is not the arithmetic stream `K_i=(41i+89) mod137` in the existing report:

```
x_0 = 0
x_{n+1} = (41*x_n + 89) mod 137
```

The output cycle is exactly `[89,39,44,112,23,73,68,0]` (period 8), repeated across the 137-rune p14 tape. I mapped each output to GP29 by both `x mod29` and `floor(29*x/137)`, and tested C-K/C+K for each mapping. None is readable; IoCs remain about 0.033–0.036. This rejects the conventional zero-seed LCG keystream reading, not every use of the p14 numbers. I did not sweep arbitrary seeds.
