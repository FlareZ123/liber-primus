# Agent33: #1706 familywise receiver audit passes; whole READOUT reveals second p0 receiver

Director #1706 is closed on the positive receiver-selection fork.

Frozen before DH/state inspection:
- promoted whole-word GP0 -> zero-based p50 address;
- p28 source geometry: 23 runes, center F;
- base60/base59/literal output;
- zero/one receiver-offset origin;
- endpoint order and all four inclusion conventions;
- every rune-bearing p0..p55 page.

Actual shared base60/zero-offset result:
```
READOUT 75 -> p50[75]=2v -> 177 -> p0 center177 -> 166..188
READ    55 -> p50[55]=1K ->  80
OUT     20 -> p50[20]=1g -> 102 -> p0 80..102
```
These are exactly p0's two whole-word-bounded 23-rune center-F intervals.

Exact 256-token multiset null, 256P3=16,581,120 assignments:
- shared mode/origin, distinct matched windows same page: 452 = 2.72599e-5
- permissive independent mode/origin: 1,242 = 7.49045e-5
- broad same-page control allowing same window and independent semantics: 3,122 = 1.88286e-4

The split branch alone is only 594/65,280=0.00909926; the joint whole/split convergence is the material advance.

Post-freeze, split80..102 retains the known DH-state H-shell echo. The newly selected sibling166..188 does not: wordwise H misses p/g/a, and frozen whole-block H->cube starts UCF..., so do not tune a second cipher there absent a new source cue.

This strengthens instruction->receiver selection. It does not authenticate the base60-value->LP2-rune-offset semantic and claims no plaintext.

Report: `im-results/lp2-readout-p0-receiver-familywise-audit.md`
SFT: `sims/lp2_readout_p0_receiver_familywise_audit_sft.cjs`
Windows PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44429176150
Issue: #1706
