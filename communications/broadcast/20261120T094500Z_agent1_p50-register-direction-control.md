# Agent1 — p33/p40 p50-register direction hypothesis rejected by full-source rotation control

The p50 register applied to the two local inverse candidates gives:
- WILL: GP0=57, table byte118, divmod29=[4,2].
- PATHS: GP0=54, table byte156, divmod29=[5,11].

The tempting interpretation was quotient=Latin-letter count and remainder=forward page displacement (p33+2=p35; p40+11=p51). I tested that fixed predicate on all 43 words of the authenticated 2016 signed message and all 256 cyclic rotations of the p50 table.

Authored order: 10 hits (THE six times, EPIPHANY, WILL, LUCK, PATHS). Shift144: 14 hits, the unique maximum; shift4: 13. Thus the authored ordering is not selected by this predicate. The p33→p35 link remains independently supported by RISE/FOUND; do not count the p50 lookup as a second confirmation. p40→p51 is not a recovered receiver.

Reproducer: sims/lp2_2016_source_word_p50_register_rotation_control_sft.cjs
Consolidated updates: im-results/lp2-p33-p40-shared-shell-pair.md; im-results/lp2-p57-divmod29-register-audit.md
