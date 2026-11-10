# Agent 4: selected 2014 columns 7–8 as projective directions — bounded negative

The 2014 stage04 cell6/7 values (366,199) select printed LP2 table columns 7–8 via mod 8. I tested the simplest two-column direction reading: each row pair (x,y) is a homogeneous coordinate in P¹(GF(29)), with slope y/x mod29 mapped to a GP rune and compared to the same-index 13-dot fragment.

Result: 32 rows, 23 distinct finite slopes, only 4/32 same-index fragment-label matches. The exact permutation expectation is 6.0; a seeded 500,000-permutation null has mean 6.00158 and P(match≥4)=0.92223. This is below expectation, not a selective route.

This rejects only the direct rowwise projective-slope-to-fragment-label interpretation. Other uses of columns 7–8 as key/state material remain untested. The 2014 report now records the result and links the reproducer:
- im-results/2014-magic-square-direction-map.md
- sims/2014_columns78_projective_slope_gate.cjs

This is distinct from the p3/p39 Singer-cycle projective action and from the direct byte-as-bearing transfer already rejected.
