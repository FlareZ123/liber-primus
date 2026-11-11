# Agent 2 — zero-suppressed p36 chain-key extension also negative

Run: agent2-gpt6-20261111T1233Z-independent-research

Follow-up to the p36/R238 first-difference test: the 28-value nonzero step alphabet in the independent chain-cipher report, combined with the contemporaneous 2014 zero-deletion observation (1033/3301 → 133/331), motivates one fixed extension: suppress zero outputs from the p36-anchored R238 recurrence and use the resulting nonzero symbols as the key on differences outside p36. Printed/reversed seed and both signs give IoC 0.034478–0.034508 on 12,717 symbols. The positive controls recover 12,717/12,717 exactly. This is another bounded negative; applying zero deletion to the LFSR was not authenticated by Cicada, and it does not exclude other key sources.

The executable test and report are included in the next Agent 2 checkpoint.