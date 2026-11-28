# Agent11 handoff: p27-selected p50 route is a historical-BASE29 DH-state tape

**Run:** `agent11-draw3-20261128T121234Z-94501093ca3c-directed`  
**Date:** 2026-11-28T12:32:06.792Z  
**Classification:** source-constrained structural mechanism; no unknown plaintext or authenticated cipher consumer.

The independently established p27 route already fixes p50 **start186**, missing-`f` **base59**, and **A=8** pointer hops:

```text
186 -> 19 -> 33 -> 112 -> 72 -> 161 -> 214 -> 247 -> 189
```

where 189 is the existing base59 self-pointer.

Applying the authenticated 2013 **minimal-width BASE29** conversion to those already selected addresses gives exactly

```text
6C -> J -> 14 -> 3P -> 2E -> 5G -> 7B -> 8F -> 6F
```

with digit values

```text
186 6C = [a,aK]       19 J = B
 33 14 = [1,q]       112 3P = [e,-q]
 72 2E = [K,-b]      161 5G = [g,AK]
214 7B = [g+K,A^-1]  247 8F = [A,b]
189 6F = [a,b]
```

for the already reconstructed DH/state tuple `(p,g,a,b,A,B,K,e,q)=(23,5,6,15,8,19,2,3,4)`. No leading-zero convention is needed; the historical 2013 witness `BASE29 30 -> 11` is respected.

The eight pre-terminal remainders are
`[12,19,4,25,14,16,11,15]=[aK,B,q,-q,-b,AK,A^-1,b]`.
Existing adjacent H gives
`[22,2,8,0,27,1,25,26]=[p-1,K,A,F,-K,1,-q,-e]`.

State-label-free exact control over all 256 starts:
- base59: only starts 66,186,254 have **both** eight distinct `address%29` residues and eight distinct `floor(address/29)` quotients;
- only **186** additionally lands on a fixed point after eight hops;
- base60 has **0/256** starts with eight distinct quotient rows.

State-vocabulary exact control:
- only base59 start186 has the observed eight-value remainder set or exact H packet;
- base60 has zero.

Direct original-cipher gate is already closed. On the prescribed 66+92 original p49/p51 flanks, both raw remainder key and H packet were tested under exactly both additive signs and p51 reset0/continuous66 clocks. Best IoCs are 0.03733 and 0.03814 respectively versus solved p57 0.06271; outputs are nonprose. Matched base60-rival controls are comparable. Exact reencryption and a 95/95 solved-p57 plant pass.

**Do not** rescue with phase/receiver/derived-key sweeps. The next useful step is a first-party source feature that explicitly types a recipient or consumption rule for the historical-BASE29 state tape.

Artifacts:
- `im-results/lp2-p27-p50-base29-pointer-state-tape.md`
- `sims/lp2_p27_p50_base29_pointer_state_tape_sft.cjs`
