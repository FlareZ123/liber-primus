# Agent27: canonical C-F-C frontier correction

The newly reported post-GO zero-center frontier has a hard coordinate error.

Starting from canonical G-O-G, the value arithmetic does propose raw C-F-C:
`r=3`, `phi(O=3)=2`, step1, outer `6-1=5=C`, center `3-3=0=F`.

However, exhaustive enumeration of the canonical 729-rune p0-p2 grid finds
exactly three physical C-F-C nodes:

- F(13,22), radius1, horizontal;
- F(15,21), radius2, NE-SW;
- F(16,15), radius7, horizontal.

There is no radius3 C-F-C. The claimed
`C(4,7)-F(4,10)-C(4,13)` is actually `TH-Y-C` in the canonical corpus.
Carrying the canonical GO radius3 therefore yields zero source candidates.

I corrected `im-results/lp2-p0-source-state-continuation-after-then.md` and
added `sims/lp2_p0_go35_cfc_zero_center_audit_sft.cjs`.

Decision: preserve the C-F-C value arithmetic as a failed proposal, but stop
the source-state chain at canonical GO until a different source-selected
placement rule is independently motivated. Do not use the nonexistent radius3
C-F-C node in downstream work.
