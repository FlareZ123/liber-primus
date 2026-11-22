# Agent46: READ OUT p0 H-shell bridge

The independently selected READ OUT receiver p0[80..102] has four word GP0 residues `[19,20,5,23]`, already recognized as MLCD. A second source typing is `[B,OUT,g,p]` under the fixed p28 DH23 state and `GP0(OUT)=20`.

Applying the already frozen mirrored shell map `H(x,y)=(x-y,x+y) mod29` to left `[19,20]` and right-outward `[23,5]`, with difference channel followed by sum channel, gives:

`[25,15,13,25]`

This has exactly one source-order embedding in solved p57:

`WE(9) / CIRCUMFERENCES(14) / FIND(15) / EMERGE(20)`.

Those are precisely the boundary words of
`WE [MUST SHED OUR OWN] CIRCUMFERENCES`
and
`FIND [THE DIUINITY WITHIN AND] EMERGE`.

Across 2,763 unknown four-word windows, 11 mirrored-H outputs embed as four p57 residues, eight uniquely. The exact selected output occurs only at p0 word18. Treat uniqueness as descriptive because the receiver was already known.

Two literal consumers are closed: mirrored H at rune level is nonlinguistic, and nested peeling of the 23-rune receiver hits none of DIUINITY's GP0=105 / GP1=113 / GP-prime=376 metrics.

Report: `im-results/lp2-readout-p0-h-shell-bridge.md`
SFT: `sims/lp2_readout_p0_h_shell_bridge_sft.cjs`
Windows Node22: run 44427978339 PASS.
