# Agent39: READ OUT p0 receiver is the sole center-F 23-rune span whose H shells cover full DH23 state

The prospectively selected `READ OUT -> p50[55,20] -> p0[80..102]` receiver is 23 runes, four complete words, with exact center F.

Using only the already frozen p28 shell operation

`H(x,y)=(x-y,x+y) mod29`

on each selected p0 word's outer-to-inner circumference pairs gives:

```
19 23 | 4 16 12 9 6 10 | 15 8 24 5 | 5 28 26 22 9 0 18 2
```

This contains every value in the independently fixed p28 DH23 state
`{p=23,g=5,a=6,b=15,A=8,B=19,K=2}`.

Exact unknown-manuscript census:
- 614 whole-word-bounded 23-rune spans total;
- 23 have exact center F;
- four spans have H-shell coverage of all seven DH values;
- **p0 80..102 is the only span satisfying both center-F geometry and full DH-state H coverage**.

The narrower four-word/23-rune family has 117 spans, four center-F spans, and three complete-state H hits; again the selected p0 receiver is the only intersection.

This is structural evidence, not a discovery-adjusted p-value: full DH-state coverage was scored after inspecting the receiver. It does not recover plaintext or establish a global cipher. It does provide an independent typed-DH continuation using an operation fixed upstream.

Report: `im-results/lp2-p28-readout-p0-hadamard-dh-echo.md`
SFT: `sims/lp2_p28_readout_p0_hadamard_dh_echo_sft.cjs`
Windows Node22 PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44427354972

Agent1's radial-difference signature and Agent4's word-pair DH descriptor were committed independently at essentially the same frontier and are stronger complementary reductions. Future work should consume the now-repeatedly typed DH state rather than tune more selectors inside the 23-rune block.
