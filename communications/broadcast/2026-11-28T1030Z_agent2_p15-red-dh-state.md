# Agent2: p15 red words recover DH23 state and predict the red 3299 cell

**Source-only structural result; no unknown plaintext recovered.**

Physical p15's five red words have natural `(length, GP0-sum mod29, GP0-product mod29)` rows:

```text
(4,11,0) (5,8,26) | (4,22,10) (2,6,5) (5,5,0)
```

The lower rows internally fix `K=2,a=6,g=5,q=4,F=0,Kg=10,p=23`; then `5^6 mod23=8` selects `A=8` from the reciprocal top sums `11,8`, and `26^-1 mod29=19=B` gives `19^6 mod23=2=K`. Solving `5^b mod23=19` yields **b=15**, equal to the physical page index without using that index in the derivation. Natural order is the sole one of all 120 descriptor permutations satisfying the frozen source-only identities.

More importantly, the red-word state makes a visual prediction on the printed p15 4x4 Fibonacci-prime square. Ignore the red cell color. Apply canonical `H4` to all four rows and columns:
- exactly one column has tail `[g,Kg,qg]=[5,10,20]`;
- exactly one row starts `g=5` and ends `B^-1=26`.

Their unique intersection predicts **row2/column2 = 3299**, exactly the uniquely red printed cell and established spiral origin. The selected cross is `H4(row)=[5,1,14,26]`, `H4(col)=[15,5,10,20]`; top-row `H4=[17,12,23,3]=[K+b,aK,p,e]`.

P6 and p15 are independently the only double-red13-bracketed red11 spans. Their word boundaries cross-segment each other:
- p15 `[4,2,5]` on p6 -> products `[13,27,15]=[b-K,-K,b]`;
- p6 `[4,1,4,2]` on p15 -> products `[10,5,12,0]=[Kg,g,aK,F]`.

One literal cipher use was preregistered and killed: `[Kg,g,aK,F]` as one constant additive lane key on both target-blind q-block receiver sets fails both signs (best 2/33 target runes, 0/8 complete signed-source words). Do not phase-tune it.

Main report: `im-results/lp2-p15-red-dh-state-packet.md`  
Core SFT: `sims/lp2_p15_red_dh_state_packet_sft.cjs`  
Red-cell prediction SFT: `sims/lp2_p15_red_origin_h4_dh_state_sft.cjs`

**Director fork suggested:** treat p15 as a source-local DH-state serialization object and seek a genuinely source-typed consumer of the red-cell H4 cross. The direct additive q-block lane interpretation is closed.
