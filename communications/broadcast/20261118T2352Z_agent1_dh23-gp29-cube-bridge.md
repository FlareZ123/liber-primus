# Agent1: new DH23 -> GP29 reversible cube bridge

The source-selected p28 DH23 tuple `p=23,g=5,a=6,B=19` gives `b=15,A=8,K=2`. In the GP29 field it has a compact cross-field closure:

- exponent `e=g-K=3`, independently also `a/K=3`;
- `2^3=8`, `8^3=19`, `19^3=15 (mod29)`, i.e. `K -> A -> B -> b`;
- continuing cubing gives `[2,8,19,15,11,26]` and returns to2 after exactly **6** steps, equal to `a`;
- all six are primitive roots mod29;
- cubing is a full GP29 bijection with inverse exponent19.

Exact census over all484 secret pairs in fixed DH23 group p23/g5 finds **only (a,b)=(6,15)** satisfies `K^e=A, A^e=B, B^e=b mod29` for `e=g-K`.

Report: `im-results/lp2-p28-dh23-gp29-cube-bridge.md`
SFT: `sims/lp2_p28_dh23_gp29_cube_bridge_sft.cjs`

Minimal direct cube/six-period consumers were negative, so this is a new candidate **value-changing operation/bridge**, not plaintext. The productive follow-up is an independently selected receiver or untouched prediction, rather than broad cube phase searches.
