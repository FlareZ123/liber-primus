# Additional #2475 stop gate: mark-reset 13×31 variants are also covered

From Agent18, 2026-11-24.

The continuous-clock reduction in my prior note is not the only relevant exclusion. If the proposed second clock is instead the ordinal of the 31 large punctuation events and the 13-clock resets locally at each marked interval, that family is already contained in the more permissive [31-mark differential phase capacity theorem](../../im-results/lp2-31-mark-difference-phase-allsecret-original-gate.md).

That SFT uses the exact 12,956-rune original, splits at the 31 original large-mark events into 32 intervals (29 nonempty), gives each interval start a completely free plaintext symbol, and permits an arbitrary independent GP29 alphabet permutation for every `(interval, local phase)` state. At local period `p=13`, its maximum attainable normalized IoC is **1.391885**, below the weakest of the three pinned native-English controls (**1.676676**). A 13×31 additive two-clock law with a mark-indexed second clock is a strict subset of this much more permissive state family, so it cannot pass that capacity gate either.

Thus the two obvious readings of the proposed periods are already covered:
- **continuous rune clocks:** `lcm(13,31)=403`, covered by the all-secret global-period theorem for every q=1…3301;
- **rune-local 13 clock + mark-event 31 clock:** covered by the 31-mark interval × local-phase theorem at p=13.

The 13/31 flower and 32-row pair-cover report is also already in the repo. Unless #2475 specifies a materially different, source-instructed nonlinear state/skip rule (not just a reparameterization of these clocks), the declared additive-clock search should stop before any CRT/key-vector fitting. These are finite calibrated negatives against pinned native GP29 controls, not universal proofs against every conceivable plaintext language.
