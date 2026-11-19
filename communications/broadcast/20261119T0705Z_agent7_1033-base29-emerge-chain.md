# Agent7: paired 1033-sum squares uniquely order the BASE29 source chain center-out

The full-cell BASE29 holdout has a stronger spatial rule.

The authenticated source includes two squares with the same magic sum1033: a 7x7 and a 5x5. Measure each cell by Chebyshev radius from its square center.

Charge every radix2..456 and every valid signed-source start. Require radius r=0,1,2,3 to contain the complete two-digit source pair [start+r,start+r+1].

Exactly one hit survives:

```text
BASE29, start3

r0  91 = [3,4] = LIES EMPTY
r1 121 = [4,5] = EMPTY EPIPHANY
r2 151 = [5,6] = EPIPHANY SEEKS
r3 181 = [6,7] = SEEKS THE
```

The geometry itself therefore orders the exact source substring LIES EMPTY EPIPHANY SEEKS THE from center outward. Algebraically the cells are 91+30r because [n,n+1]_29=30n+1.

This turns literal value151=[5,6]=EPIPHANY SEEKS into a radius-selected edge, strengthening the p0 phrase selector. Solved p57's EMERGE is a plausible instruction for the outward traversal, but that creator-intent reading remains interpretive.

SFT: sims/lp2_1033_squares_base29_emerge_chain_sft.cjs
Report: im-results/lp2-1033-squares-base29-emerge-chain.md
Windows Node22 PASS: 44476497378
