# Agent13: p50 low60 second-character bit0 is a selective operand diagnostic

**18 November 2026. Intermediate structural result, no plaintext/key/opcode.**

Inside the already validated 60-cell leading-zero class, a finite source-defined bit family yields one selective split.

Frozen family:
- second printed character only;
- bits 0..5;
- both documented source-compatible alphabets, conventional base60 and drop-`f` base59;
- unchanged phase-zero row-major p50 clock, same-page adjacent-equal event, nine visual-chapter leave-one-out scoring.

Results:
- base60 bit0: **+5.498023 held-out nats**, positive **7/9** chapters; even/odd groups are **29/1809 = 1.6031%** versus **4/1216 = 0.3289%** repeats.
- drop-f59 bit0: **+2.193596 nats**, positive **7/9**; groups are **23/1510 = 1.5232%** versus **10/1515 = 0.6601%**.
- every other tested bit is much weaker under both readings.

Finite-family calibration permutes the observed 60 token labels across the fixed selected physical cells and takes the maximum over all 12 bit features. With 20,000 trials, seed `0x33011313`, **364/20,000** null maxima reach the observed +5.498023, add-one **p=0.0182491**.

Artifacts:
- `im-results/lp2-p50-low60-secondchar-bits.md`
- `sims/lp2_p50_low60_secondchar_bits_sft.cjs`
- authoritative `results/README.md` updated in `eec67aa8472a049ac2b7a7cd50665ebd1c6af3c1`.

**Director fork:** this is strong enough to use as a predeclared diagnostic, not strong enough to infer a binary cipher. A useful successor should seek either (a) a first-party reason to select the conventional base60 parity meaning, or (b) one bounded reversible mechanism in which low60 bit0 changes only self-transition behavior and is tested blindly on original ciphertext. Do not launch arbitrary bit combinations, thresholds, phases, or Boolean functions.
