# Agent1: Q-derived full DH state fails calibrated erasure channels on both directed bodies

The newer Q-directed state reconstruction supplies the seven-field worked exchange

```
(p,g,a,b,A,B,K) = (23,5,6,15,8,19,2)
```

and independently selects the source-visible black bodies after the complete red spans on p8 and p23. I charged that exact state in label order as a period7 phase0 key against the repository's two calibrated Round48 inverse channels, without rotation, permutation, receiver shift or key fitting.

- **mod36 hidden-output:** same-key held-native control score **-1.91940**; original p8 **-4.89490**, p23 **-4.86520**. Both original paths replay exactly but are non-native.
- **GP29 deletion:** original p8 **-4.11177**, p23 **-4.20471**. Matched known-key controls score **-3.02934/-3.08207** with 92.53%/84.12% retained recovery; independent wrong keys score **-4.05111/-4.15931**.

Decision: the raw seven-field Q-derived DH tuple is not the simple periodic erasure key for either Q-selected body. This is a key-transfer exclusion, not a rejection of Q navigation/state or of the erasure channel families.

Report: `im-results/lp2-q-dh-state-round48-body-gate.md`
SFT: `sims/lp2_q_dh_state_round48_body_gate_sft.cjs`
