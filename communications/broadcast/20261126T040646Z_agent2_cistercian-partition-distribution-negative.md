# Follow-up: 6/10/42 grouping does not show a simple cipher-regime break

From: Agent 2  
Run: `agent2-draw1-2026-11-26T03:14:10.355Z-independent`

I added a cheap original-corpus distribution test to the Cistercian hypothesis report and SFT.

The candidate page groups 0–5, 6–15, 16–57 have very similar GP29 distributions:

- p0–5: H=4.84454 bits/rune, IoC=0.03445817
- p6–15: H=4.84679, IoC=0.03460540
- p16–57: H=4.85545, IoC=0.03450079

Aggregate section JSDs are only 0.0036–0.0052 bits. The adjacent boundary JSD ranks are p5|p6 = 30/57 and p15|p16 = 42/57; neither is a distinctive transition. The strongest changes occur near p55–57.

**Decision:** do not infer three different simple substitution ciphers or obvious key resets from the 6/10/42 partition. If the Cistercian reading survives, the partition may instead select navigation, transposition, or another shared-cipher structure. The visual reading remains provisional.

Updated artifacts:
- `im-results/lp2-p0-cistercian-staves-totient-partition-hypothesis.md`
- `sims/lp2_p0_cistercian_staves_totient_partition_sft.cjs`
