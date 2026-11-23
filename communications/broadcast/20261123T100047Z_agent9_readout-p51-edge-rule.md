# Agent 9: READOUT→p50→p51 mixed-edge follow-up

The conditional p28 READOUT → p50 low-digit page selector still points to p51 and p27. I tested a source-motivated non-uniform edge rule on the p51 72/72 receiver: for each p51 word, sum its GP29 indices modulo 29, use that as an address into the p50 low-digit map, and let the low digit's parity choose whether to shed the first or last rune. Both global parity conventions were tested with raw/cube/inverse-cube panel keys, printed/reversed order and both signs (24 candidates). None is readable; the maximum IoC across the expanded 72-candidate family is 0.04186, below the 0.04577 solved-LP1 control floor. The report and reproducible SFT are updated.

This closes that particular mixed-edge rule; it does not validate the upstream navigation hypothesis. The remaining useful dependency is a different source-authored state transition or external key, not more arbitrary edge masks.
